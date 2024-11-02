import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Gemini.css';

function Gemini() {
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
    
        setLoading(true);
    
        const formData = new FormData();
        formData.append('pdf', selectedImage);
    
        try {
            const apiUrl = process.env.NODE_ENV === 'production'
                ? '/upload-pdf'
                : 'http://localhost:5000/upload-pdf';
    
            const res = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
            });
    
            if (!res.ok) {
                throw new Error(`Server error: ${res.status}`);
            }
    
            const data = await res.json(); // Attempt to parse JSON only if the response is successful
            navigate('/response', { state: { response: data.response } });
        } catch (error) {
            console.error("Error in client processing:", error);
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
                    {loading ? 'Analiz Yapılıyor...' : 'Analize Başla'}
                </button>
                <div className="line"></div>
            </div>

            {/* Hidden file input for PDF selection */}
            <input 
                type="file" 
                accept="application/pdf" 
                style={{ display: 'none' }} 
                ref={fileInputRef}
                onChange={handleImageChange}
            />  
        </div>
    );
}

export default Gemini;
