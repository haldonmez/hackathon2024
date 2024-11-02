const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const fileManager = new GoogleAIFileManager(process.env.API_KEY);
const app = express();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
    if (!req.file) {
        console.log("No file uploaded");
        return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const promptTemplate = `Sen PDF dosyasında yer alan görselleri analiz eden bir yardımcı asistansın.
        PDF içinde bulunan her sayfanın görseldeki sorularını veya ifadelerini ayrı ayrı analiz ederek, her birinin hangi konu alanına ve ilgili alt dallarına ait olduğunu tespit etmektir.

        Görevinin adımları:
        1. PDF'deki her sayfa sırayla analiz edilecek ve her sayfanın numarası verilecek.
        2. Her sayfadaki her soruyu veya ifadeyi sırayla analiz ederek soru numarasını belirt.
        3. Her soru için şu bilgileri ver:
            - **Sayfa Numarası**: Hangi sayfada yer aldığı.
            - **Soru Numarası**: Sayfadaki sırası.
            - **Alan**: Hangi temel konuya ait? (Örneğin: Türk Dili ve Edebiyatı, Tarih, Matematik)
            - **Alt alan**: Belirlenen konunun hangi alt dalına ait? (Örneğin: Matematik -> Üçgenler, Analitik Geometri)
            - **Alt alt alan**: Daha spesifik bir alt başlık varsa belirt. (Örneğin: Trigonometri, Fonksiyonlar)
            - **Teorem**: Sorunun çözümü için gerekliyse kullanılan teoremi belirt. (Örneğin: Sinüs Teoremi, Pythagoras Teoremi).
            - **Temel bilgi**: Soruyu çözmek için bilinmesi gereken temel bilgi veya formülü belirt. (Örneğin: Üçgenlerin iç açılar toplamı, Fonksiyon tanımı).

        **Sayfa Numarası**: {PAGE_NUMBER}

        Bu adımları dikkatle izleyerek PDF'deki her sayfa ve her soru için kapsamlı ve detaylı analiz yap.
    `;

    const pdfPath = req.file.path;
    let combinedResponse = [];

    try {
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const numPages = pdfDoc.getPageCount();

        console.log(`PDF contains ${numPages} pages.`);

        for (let i = 0; i < numPages; i++) {
            console.log(`Processing Page ${i + 1}...`);

            const singlePagePdf = await PDFDocument.create();
            const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [i]);
            singlePagePdf.addPage(copiedPage);
            const singlePagePdfBytes = await singlePagePdf.save();
            const singlePagePath = `uploads/page_${i + 1}.pdf`;

            fs.writeFileSync(singlePagePath, singlePagePdfBytes);
            console.log(`Saved single-page PDF for Page ${i + 1}: ${singlePagePath}, Size: ${singlePagePdfBytes.length} bytes`);

            const uploadResponse = await fileManager.uploadFile(singlePagePath, {
                mimeType: 'application/pdf',
                displayName: `Page ${i + 1}`,
            });
            const fileUri = uploadResponse.file.uri;
            console.log(`Uploaded Page ${i + 1} with URI: ${fileUri}`);

            const prompt = promptTemplate.replace('{PAGE_NUMBER}', i + 1);

            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash"
            });

            const result = await model.generateContent([
                { fileData: { mimeType: 'application/pdf', fileUri } },
                { text: prompt },
            ]);

            const text = result.response.text();
            console.log(`Raw response for Page ${i + 1}:\n`, text);

            const parsedResponse = parseResponseToJSON(text);
            console.log(`Parsed JSON for Page ${i + 1}:`, JSON.stringify(parsedResponse, null, 2));
            combinedResponse.push({ page: i + 1, content: parsedResponse });

            fs.unlinkSync(singlePagePath);
            await delay(2000);
        }

        fs.unlinkSync(pdfPath);

        console.log("Final response sent to client:", JSON.stringify(combinedResponse, null, 2));
        res.json({ response: combinedResponse });
    } catch (error) {
        console.error("Error in processing PDF:", error);
        res.status(500).json({ error: 'Failed to process PDF.' });
    }
});

// Helper function to parse response text into JSON format
function parseResponseToJSON(text) {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const responseObj = [];
    let currentPage = null;
    let currentQuestion = null;

    lines.forEach(line => {
        line = line.trim();
        
        if (line.startsWith('**Sayfa Numarası**:')) {
            if (currentPage) {
                if (currentQuestion) currentPage.sorular.push(currentQuestion);
                responseObj.push(currentPage);
            }
            
            currentPage = {
                sayfaNumarasi: line.split(':')[1].trim(),
                sorular: []
            };
            currentQuestion = null;
        } else if (line.startsWith('**Soru Numarası**:')) {
            if (currentQuestion) currentPage.sorular.push(currentQuestion);
            currentQuestion = {
                soruNumarasi: line.split(':')[1].trim()
            };
        } else if (line.startsWith('**Alan**:')) {
            currentQuestion.alan = line.split(':')[1].trim();
        } else if (line.startsWith('**Alt alan**:')) {
            currentQuestion.altAlan = line.split(':')[1].trim();
        } else if (line.startsWith('**Alt alt alan**:')) {
            currentQuestion.altAltAlan = line.split(':')[1].trim();
        } else if (line.startsWith('**Teorem**:')) {
            currentQuestion.teorem = line.split(':')[1].trim();
        } else if (line.startsWith('**Temel bilgi**:')) {
            currentQuestion.temelBilgi = line.split(':')[1].trim();
        }
    });

    if (currentQuestion) currentPage.sorular.push(currentQuestion);
    if (currentPage) responseObj.push(currentPage);

    return responseObj;
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
