import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import axios from 'axios';
import './ResponsePage.css';

function ResponsePage() {
    const navigate = useNavigate();

    // State to store response data
    const [response, setResponse] = useState([]);
    const [collapsedPages, setCollapsedPages] = useState([]);
    const [loading, setLoading] = useState(true);  // For loading state
    const [error, setError] = useState(null);  // For error handling

    useEffect(() => {
        // Fetch data from Flask backend
        const fetchData = async () => {
            try {
                const result = await axios.get(`${process.env.REACT_APP_FLASK_API_URL}/rag-process`);
                setResponse(result.data.response || []);
                setCollapsedPages(Array(result.data.response.length).fill(true));
            } catch (error) {
                console.error("Error fetching data from Flask:", error);
                setError("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    const toggleCollapse = (index) => {
        setCollapsedPages(prev => {
            const newCollapsed = [...prev];
            newCollapsed[index] = !newCollapsed[index];
            return newCollapsed;
        });
    };

    const parseContent = (content) => {
        const questionBlocks = content.split("**Sayfa Numarası**").filter(q => q.trim() !== "");
        return questionBlocks.map((questionText, index) => {
            const soruNumarasiMatch = questionText.match(/\*\*Soru Numarası\*\*:\s*(\d+)/);
            const anaKonuMatch = questionText.match(/\*\*Ana Konu\*\*:\s*([^*]+)/);
            const altKonuMatch = questionText.match(/\*\*Alt Konu\*\*:\s*([^*]+)/);
            const kazanımlarMatch = questionText.match(/\*\*Kazanımlar\*\*:\s*([^*]+)/);

            const soruNumarasi = soruNumarasiMatch ? soruNumarasiMatch[1].trim() : "N/A";
            const anaKonu = anaKonuMatch ? anaKonuMatch[1].trim() : "N/A";
            const altKonu = altKonuMatch ? altKonuMatch[1].trim() : "N/A";
            const kazanımlar = kazanımlarMatch ? kazanımlarMatch[1].trim().split(',') : [];

            return (
                <li key={index} className="question-item">
                    <p><strong>Soru Numarası:</strong> {soruNumarasi}</p>
                    <p><strong>Ana Konu:</strong> {anaKonu}</p>
                    <p><strong>Alt Konu:</strong> {altKonu}</p>
                    <p><strong>Kazanımlar:</strong></p>
                    <ul>
                        {kazanımlar.map((kazanım, kazanımIndex) => (
                            <li key={kazanımIndex}>{kazanım.trim()}</li>
                        ))}
                    </ul>
                </li>
            );
        });
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="uygulama">
            <Navbar />
            <h2 className="baslik">Sayfa Bazında Analiz Sonuçları</h2>
            {response.length > 0 ? (
                <div className="kutu-container">
                    {response.map((page, pageIndex) => (
                        <div key={pageIndex} className="sayfa-alani">
                            <div className="card-header" onClick={() => toggleCollapse(pageIndex)}>
                                <h3>Sayfa Numarası: {page.page}</h3>
                                <span className="toggle-icon">
                                    {collapsedPages[pageIndex] ? '+' : '-'}
                                </span>
                            </div>
                            {!collapsedPages[pageIndex] && (
                                <div className="card-content">
                                    <ul className="question-list">
                                        {parseContent(page.content)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p>No response available.</p>
            )}
            <button className="b" onClick={() => navigate(-1)}>Geri Dön</button>
        </div>
    );
}

export default ResponsePage;
