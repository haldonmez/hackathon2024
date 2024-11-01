import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    // Function to handle button click and navigate to /exam
    const handleStartClick = () => {
        navigate('/exam');
    };

    return (
        <div className="home-container">
            <div className='navbar-container'>
                <Navbar />
            </div>
            <header className="hero-section">
                <h1>Geleceğini İnşa Et!</h1>
                <p>Gemini yapay zekasıyla başarı yolculuğuna çık. Hedeflerine ulaşmak için ilk adımı at!</p>
                <button className="cta-button" onClick={handleStartClick}>Hemen Başla</button>
            </header>
            <section className="motivational-section">
                <div className="motive-card">
                    <h2>Bilgi Güçtür</h2>
                    <p>Eğitim yolculuğunuzda doğru bilgiyi edinin ve kendinizi geliştirin.</p>
                </div>
                <div className="motive-card">
                    <h2>Gelecek Seninle</h2>
                    <p>Her sınav bir adım, her adım bir başarı. Sen de geleceğe yön ver!</p>
                </div>
                <div className="motive-card">
                    <h2>Yapay Zeka ile Başarı</h2>
                    <p>Eksiklerinizi analiz ederek ilerlemenizi hızlandırın.</p>
                </div>
            </section>
        </div>
    );
};

export default Home;
