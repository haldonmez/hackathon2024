import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import './ResponsePage.css';

const ALANLAR = [
    "Türk Dili ve Edebiyatı",
    "Tarih",
    "Coğrafya",
    "Matematik",
    "Geometri",
    "Fizik",
    "Kimya",
    "Biyoloji",
    "Felsefe",
    "Mantık",
    "Sosyoloji",
    "Psikoloji",
    "Din Kültürü ve Ahlak Bilgisi"
];

function ResponsePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const response = location.state?.response || [];

    // Görünür olacak alanı belirlemek için kullanılan bir state
    const [visibleAlan, setVisibleAlan] = React.useState(null);

    // İlk renderda kontrol et
    React.useEffect(() => {
        const alanFromResponse = response.find(item => ALANLAR.includes(item.alan));
        if (alanFromResponse) {
            setVisibleAlan(alanFromResponse.alan); // Eğer varsa, alanı ayarla
        }
    }, [response]);

    return (
        <div className="uygulama">
            <Navbar /> {/* Navbar bileşeni ekleniyor */}
            <h2 className="baslik">Analiz Sonuçları</h2>
            {response.length > 0 ? (
                <div className="kutu-container">
                    {response.map((item, index) => (
                        <div key={index} className="yanit-alani">
                            <ul>
                                <li><strong><span className="alan-label">Alan:</span></strong> {item.alan}</li>
                                <li><strong>Alt Alan:</strong> {item.altAlan}</li>
                                <li><strong>Alt Alt Alan:</strong> {item.altAltAlan}</li>
                                <li><strong>Teorem:</strong> {item.teorem}</li>
                                <li><strong>Temel Bilgi:</strong> {item.temelBilgi}</li>
                            </ul>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No response available.</p>
            )}
            {visibleAlan && ( // Eğer bir alan belirlenmişse butonu göster
                <div className="alan-button-container"> {/* Buton için ayrı bir alan */}
                    <button className="alan-button">{visibleAlan}</button>
                </div>
            )}
            <button className='b' onClick={() => navigate(-1)}>Geri Dön</button>
        </div>
    );
}

export default ResponsePage;
