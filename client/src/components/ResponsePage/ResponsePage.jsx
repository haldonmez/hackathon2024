import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import './ResponsePage.css';

function ResponsePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const response = location.state?.response || [];

    // Log the full location state and response for debugging
    console.log("Location state:", location.state);
    console.log("Response received:", response);

    return (
        <div className="uygulama">
            <Navbar />
            <h2 className="baslik">Sayfa Bazında Analiz Sonuçları</h2>
            {response.length > 0 ? (
                <div className="kutu-container">
                    {response.map((page, pageIndex) => (
                        <div key={pageIndex} className="sayfa-alani">
                            <h3>Sayfa Numarası: {page.page}</h3>
                            <p>{page.content}</p>
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
