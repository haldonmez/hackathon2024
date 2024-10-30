// Gemini.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Gemini.css';

function Gemini() {
    const [image, setImage] = useState(null); // Selected image file
    const [loading, setLoading] = useState(false); // Loading state
    const navigate = useNavigate();
    const fileInputRef = useRef(null); // Reference to the hidden file input

    // Trigger file input when clicking "Start Analysis" button
    const handleAnalyzeClick = () => {
        fileInputRef.current.click(); // Open file selector
    };

    // Handle file selection
    const handleImageChange = async (e) => {
        const selectedImage = e.target.files[0];
        if (!selectedImage) return;

        setImage(selectedImage);
        setLoading(true);

        // Create form data for the image upload
        const formData = new FormData();
        formData.append('image', selectedImage);

        try {
            const apiUrl = process.env.NODE_ENV === 'production'
                ? '/upload-image'          // Production URL
                : 'http://localhost:5000/upload-image'; // Local URL

            const res = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            navigate('/response', { state: { response: data.response } }); // Pass data to new page
        } catch (error) {
            console.error(error);
            alert("Failed to get response from the AI.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="App">
            <div className="container">
                <div className="line"></div>
                <button onClick={handleAnalyzeClick} disabled={loading}>
                    {loading ? 'Processing...' : 'Start Analysis'}
                </button>
                <div className="line"></div>
            </div>

            {/* Hidden file input for image selection */}
            <input 
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }} 
                ref={fileInputRef}
                onChange={handleImageChange} // Handle image selection
            />
        </div>
    );
}

export default Gemini;
