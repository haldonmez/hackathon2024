// ResponsePage.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ResponsePage.css';

function ResponsePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const response = location.state?.response || "No response available.";

    // Parsing response into a JSON structure keyed by Alan values
    const parseResponseToJson = (responseText) => {
        const sections = responseText.split(/(?=Alan: )/);
        return sections.reduce((acc, section) => {
            const alanMatch = section.match(/Alan: (.+?)(?:\n|$)/);
            if (alanMatch) {
                const alan = alanMatch[1].trim();
                if (!acc[alan]) acc[alan] = [];
                
                // Add structured data (other lines in the section)
                acc[alan].push(section.trim());
            }
            return acc;
        }, {});
    };

    const structuredData = parseResponseToJson(response);
    const [selectedAlan, setSelectedAlan] = useState(Object.keys(structuredData)[0]);

    return (
        <div className="App">
            <h2 className="examh2">Analysis Results</h2>
            <div className="sidebar">
                {Object.keys(structuredData).map((alan, index) => (
                    <button key={index} onClick={() => setSelectedAlan(alan)}>
                        {alan}
                    </button>
                ))}
            </div>
            <div className="content">
                {structuredData[selectedAlan]?.map((entry, idx) => (
                    <p key={idx} className="alan-entry">{entry}</p>
                ))}
            </div>
            <button onClick={() => navigate(-1)}>Geri Dön</button>
        </div>
    );
}

export default ResponsePage;
