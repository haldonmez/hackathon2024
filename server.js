const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const express = require('express');
const cors = require('cors');
const multer = require('multer'); // For file uploads
const fs = require('fs');
const axios = require('axios'); // For HTTP requests to Flask
const { PDFDocument } = require('pdf-lib'); // Import pdf-lib
const path = require('path');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const fileManager = new GoogleAIFileManager(process.env.API_KEY);
const app = express();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Helper function to introduce a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// API Endpoint to handle PDF uploads and interact with Gemini model
app.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
    if (!req.file) {
        console.log("No file uploaded");
        return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    // Define the prompt for text extraction without images
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
        // Step 1: Read and split the PDF into individual pages
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const numPages = pdfDoc.getPageCount();

        console.log(`PDF contains ${numPages} pages.`);

        for (let i = 0; i < numPages; i++) {
            console.log(`Processing Page ${i + 1}...`);

            // Create a new PDF containing only the current page
            const singlePagePdf = await PDFDocument.create();
            const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [i]);
            singlePagePdf.addPage(copiedPage);
            const singlePagePdfBytes = await singlePagePdf.save();
            const singlePagePath = `uploads/page_${i + 1}.pdf`;

            // Save this single page as a temporary file
            fs.writeFileSync(singlePagePath, singlePagePdfBytes);
            console.log(`Saved single-page PDF for Page ${i + 1}: ${singlePagePath}, Size: ${singlePagePdfBytes.length} bytes`);

            // Step 2: Upload the single-page PDF to GoogleAIFileManager
            const uploadResponse = await fileManager.uploadFile(singlePagePath, {
                mimeType: 'application/pdf',
                displayName: `Page ${i + 1}`,
            });
            const fileUri = uploadResponse.file.uri;
            console.log(`Uploaded Page ${i + 1} with URI: ${fileUri}`);

            // Step 3: Customize the prompt for each page
            const prompt = promptTemplate.replace('{PAGE_NUMBER}', i + 1);

            // Step 4: Use Gemini Flash model to process the prompt and PDF URI
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash"  // Using Gemini Flash for faster processing
            });

            const result = await model.generateContent([
                { fileData: { mimeType: 'application/pdf', fileUri } },
                { text: prompt },
            ]);

            const extractedText = result.response.text();
            console.log(`Extracted text for Page ${i + 1}:\n`, extractedText);

            // Send extracted text to Flask for further processing
            try {
                const flaskUrl = process.env.FLASK_URL || 'https://rag-request-flask-a93b7745ce49.herokuapp.com/rag-process';
                const flaskResponse = await axios.post(flaskUrl, {
                    page: i + 1,
                    text: extractedText
                });
                
                // Log the response from Flask
                console.log(`Flask response for Page ${i + 1}:\n`, flaskResponse.data);

                combinedResponse.push({ page: i + 1, content: flaskResponse.data });
            } catch (flaskError) {
                console.error(`Error sending data to Flask for Page ${i + 1}:`, flaskError.message);
            }

            // Clean up the single-page PDF file
            fs.unlinkSync(singlePagePath);

            // Add a short delay before processing the next page
            await delay(2000); // 2 seconds
        }

        // Clean up the original uploaded PDF file
        fs.unlinkSync(pdfPath);

        // Send the combined response back to the client
        res.json({ response: combinedResponse });
    } catch (error) {
        console.error("Error in processing PDF:", error);
        res.status(500).json({ error: 'Failed to process PDF.' });
    }
});

// Serve static files from the React app's build folder
app.use(express.static(path.join(__dirname, 'client/build')));

// Catch-all route to serve React app for any unknown path
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
