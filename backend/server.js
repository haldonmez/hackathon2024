const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const { request } = require('undici'); // Import undici

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Provide the undici fetch implementation to GoogleAIFileManager
const fileManager = new GoogleAIFileManager(process.env.API_KEY, { fetch: global.fetch });

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

async function makeRequestToFlask(page, extractedText) {
    try {
        const postData = JSON.stringify({ page, text: extractedText });
        const { statusCode, body } = await request({
            origin: process.env.FLASK_URL || 'http://flask:8000', // Use env variable or default
            path: '/rag-process',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: postData,
        });

        if (statusCode !== 200) {
            const errorBody = await body.text();
            throw new Error(`Flask returned ${statusCode}: ${errorBody}`);
        }

        return await body.json();
    } catch (error) {
        console.error("Error in makeRequestToFlask:", error);
        throw error;
    }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const promptTemplate = `
        Sen PDF dosyasındaki her sayfanın sadece metin içeriğini çıkaran ve her bir soruyu ayrıntılı analiz eden bir asistansın.
        Görselleri veya grafik öğeleri yok sayarak metni çıkar, her soruyu analiz et ve aşağıdaki bilgileri ekle:

        Görevinin adımları:
        1. PDF'deki her sayfayı sırayla analiz et ve her bir sayfanın numarasını belirt.
        2. Her sayfadaki her soruyu veya ifadeyi belirle ve aşağıdaki yapıda analiz et:
            - **Sayfa Numarası**: Hangi sayfada yer aldığı.
            - **Soru Metni**: Sorunun tam metni.
            - **Ana Konu**: Hangi temel konuya ait? (Örneğin: Türk Dili ve Edebiyatı, Tarih, Matematik).
            - **Alt Konu**: Belirlenen konunun hangi alt dalına ait? (Örneğin: Matematik -> Geometri, Analitik Geometri).
            - **Kazanımlar**: Bu soru veya ifade ile ilgili öğrenme kazanımları nelerdir? (Örneğin: Üçgenlerin özelliklerini anlama, Fonksiyonların davranışlarını analiz etme).
            - **Anahtar Kavramlar**: Soruyu anlamak veya çözmek için gerekli temel kavramlar ve teoriler nelerdir? (Örneğin: Sinüs Teoremi, Pythagoras Teoremi).

        **Sayfa Numarası**: {PAGE_NUMBER}

        Analiz edilen metin ve bilgiler:
    `;

    const pdfPath = req.file.path;
    let combinedResponse = [];

    try {
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const numPages = pdfDoc.getPageCount();

        for (let i = 0; i < numPages; i++) {
            try {
                const singlePagePdf = await PDFDocument.create();
                const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [i]);
                singlePagePdf.addPage(copiedPage);
                const singlePagePdfBytes = await singlePagePdf.save();
                const singlePagePath = `uploads/page_${i + 1}.pdf`;
                fs.writeFileSync(singlePagePath, singlePagePdfBytes);

                const uploadResponse = await fileManager.uploadFile(singlePagePath, {
                    mimeType: 'application/pdf',
                    displayName: `Page ${i + 1}`,
                });
                const fileUri = uploadResponse.file.uri;

                const prompt = promptTemplate.replace('{PAGE_NUMBER}', i + 1);

                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const result = await model.generateContent([
                    { fileData: { mimeType: 'application/pdf', fileUri } },
                    { text: prompt },
                ]);

                const extractedText = result.response.text();

                const flaskResponse = await makeRequestToFlask(i + 1, extractedText);
                console.log(`Flask response for Page ${i + 1}:\n`, flaskResponse);
                combinedResponse.push({ page: i + 1, content: flaskResponse });

                fs.unlinkSync(singlePagePath);
                await delay(2000);
            } catch (innerError) {
                console.error(`Error processing page ${i + 1}:`, innerError);
                combinedResponse.push({ page: i + 1, error: innerError.message }); // Add error to response
            }
        }

        fs.unlinkSync(pdfPath);
        res.json({ response: combinedResponse });
    } catch (error) {
        console.error("Error in processing PDF:", error);
        res.status(500).json({ error: 'Failed to process PDF.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});