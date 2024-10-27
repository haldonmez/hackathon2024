// server.js
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const express = require('express');
const cors = require('cors');
const multer = require('multer'); // For file uploads
const path = require('path');
const fs = require('fs');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const fileManager = new GoogleAIFileManager(process.env.API_KEY);
const app = express();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// API Endpoint to handle image uploads and interact with Gemini model
app.post('/upload-image', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
    }

    const prompt = req.body.prompt || "";
    const mimeType = req.file.mimetype;
    const imagePath = req.file.path;

    try {
        // Step 1: Upload the image file using GoogleAIFileManager to get a file URI
        const uploadResponse = await fileManager.uploadFile(imagePath, {
            mimeType,
            displayName: req.file.originalname,
        });
        const fileUri = uploadResponse.file.uri;

        // Step 2: Use the file URI and text prompt in the generateContent request
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([
            { fileData: { mimeType, fileUri } },
            { text: prompt },
        ]);

        // Get the generated content from the response
        const text = result.response.text();

        // Clean up the uploaded image file after processing
        fs.unlinkSync(imagePath);

        // Send the response text back to the client
        res.json({ response: text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate content from image and text.' });
    }
});

// Serve the React app (for production)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
