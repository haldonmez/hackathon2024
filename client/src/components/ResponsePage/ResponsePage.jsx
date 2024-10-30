// ResponsePage.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ResponsePage.css';

function ResponsePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const response = location.state?.response || "No response available.";

    return (
        <div className="App">
            <h2 className="examh2">Analysis Results</h2>
            <div className="response-output">
                <p>{response}</p>
            </div>
            <button onClick={() => navigate(-1)}>Back</button>
        </div>
    );
}

export default ResponsePage;
