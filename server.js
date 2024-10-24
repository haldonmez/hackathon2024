const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const express = require('express');
const cors = require('cors');
const path = require('path'); // Import path module for serving static files

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const app = express();

// Allow cross-origin requests
app.use(cors());

// Middleware to parse incoming JSON
app.use(express.json());

// API Endpoint to get AI response
app.post('/generate', async (req, res) => {
    const { prompt } = req.body;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        res.json({ response: result.response.text() });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate content' });
    }
});

// Serve the React app (for production)
if (process.env.NODE_ENV === 'production') {
    // Serve static files from the React frontend app
    app.use(express.static(path.join(__dirname, 'client/build')));

    // Serve the React app for any unknown route (i.e., all GET requests not handled by the API)
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
