// src/Gemini.js
import React, { useState } from 'react';
import './Gemini.css';

function Gemini() {
    const [prompt, setPrompt] = useState('');      // User's optional prompt
    const [image, setImage] = useState(null);      // File to be uploaded
    const [response, setResponse] = useState('');  // Response from the API
    const [loading, setLoading] = useState(false); // Loading state for submission

    // Handle file selection
    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Ensure an image is selected
        if (!image) {
            alert("Please upload an image!");
            return;
        }

        setLoading(true);
        setResponse('');

        const formData = new FormData();
        formData.append('prompt', prompt);  // Optional prompt text
        formData.append('image', image);    // Image file

        try {
            const apiUrl = process.env.NODE_ENV === 'production'
                ? '/upload-image'          // Production URL
                : 'http://localhost:5000/upload-image'; // Local URL

            const res = await fetch(apiUrl, {
                method: 'POST',
                body: formData, // FormData handles file and text data together
            });

            const data = await res.json();
            setResponse(data.response);
        } catch (error) {
            console.error(error);
            setResponse('Error: Unable to get response from the AI.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="App">
            <div className="container">
                <h1>AI Image Generator</h1>
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter an optional prompt..."
                    />
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Processing...' : 'Upload Image'}
                    </button>
                </form>
                {response && (
                    <div className="output">
                        <strong>Response:</strong>
                        <p>{response}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Gemini;
