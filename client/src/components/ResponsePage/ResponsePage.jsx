import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const [response, setResponse] = useState([]);
    const [visibleAlan, setVisibleAlan] = useState(null);
    const navigate = useNavigate();

    // PDF analiz sonuçlarını almak için API'ye istek atma
    useEffect(() => {
        const fetchData = async () => {
            try {
                const formData = new FormData();
                formData.append('pdf', /* PDF dosyanız */);

                const response = await fetch('http://localhost:5000/upload-pdf', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();
                console.log("API yanıtı:", data); // Gelen veriyi konsola yazdırıyoruz

                // Yanıt yapısını kontrol et
                if (data && Array.isArray(data.content)) {
                    setResponse(data.content); // Yanıtı state'e kaydediyoruz
                } else {
                    console.error("Beklenmedik yanıt yapısı:", data);
                    setResponse([]); // Yanıt beklenmedik yapıda ise boş dizi olarak ayarla
                }
            } catch (error) {
                console.error("API çağrısında hata oluştu:", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        console.log("Gelen yanıt verileri:", response); // response güncellendiğinde yanıtı yazdırıyoruz

        // Yanıtta belirli alanları kontrol etme
        const alanFromResponse = response
            .flatMap(page => page.sorular || [])
            .find(question => ALANLAR.includes(question?.alan));
        
        if (alanFromResponse) {
            setVisibleAlan(alanFromResponse.alan);
        }
    }, [response]);

    return (
        <div className="uygulama">
            <Navbar />
            <h2 className="baslik">Analiz Sonuçları</h2>
            {response.length > 0 ? (
                <div className="kutu-container">
                    {response.map((page, pageIndex) => (
                        <div key={pageIndex} className="yanit-alani">
                            <h3>Sayfa Numarası: {page.sayfaNumarasi || "N/A"}</h3>
                            {(page.sorular || []).length > 0 ? (
                                (page.sorular || []).map((question, questionIndex) => (
                                    <ul key={questionIndex} className="bilgi-grubu">
                                        <li className="alan">
                                            <strong>Soru Numarası:</strong> {question.soruNumarasi || "N/A"}
                                        </li>
                                        <li className="alt-alan">
                                            <strong>Alan:</strong> {question.alan || "N/A"}
                                        </li>
                                        <li className="alt-alan">
                                            <strong>Alt Alan:</strong> {question.altAlan || "N/A"}
                                        </li>
                                        <li className="alt-alan">
                                            <strong>Alt Alt Alan:</strong> {question.altAltAlan || "N/A"}
                                        </li>
                                        <li className="alt-alan">
                                            <strong>Teorem:</strong> {question.teorem || "N/A"}
                                        </li>
                                        <li className="alt-alan">
                                            <strong>Temel Bilgi:</strong> {question.temelBilgi || "N/A"}
                                        </li>
                                    </ul>
                                ))
                            ) : (
                                <p>No questions available for this page.</p>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p>No response available.</p>
            )}
            {visibleAlan && (
                <div className="alan-button-container">
                    <button className="alan-button">{visibleAlan}</button>
                </div>
            )}
            <button className='b' onClick={() => navigate(-1)}>Geri Dön</button>
        </div>
    );
}

export default ResponsePage;
