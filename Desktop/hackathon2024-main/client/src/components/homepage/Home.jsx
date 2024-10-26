// Home.js
import React from 'react';
import Navbar from '../navbar/Navbar';
import Slider from 'react-slick';
import Arrow from './Arrow'; // Arrow bileşenini içe aktarın
import './Home.css'; // Slider stillerini özelleştirmek için bir CSS dosyası ekleyebilirsiniz.

const Home = () => {
    // Slider ayarları
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        nextArrow: <Arrow className="slick-next" />,
        prevArrow: <Arrow className="slick-prev" />,
        autoplay: false, // Otomatik kaydırmayı kapat
        // autoplaySpeed: 2000, // Bu ayarı kaldırın ya da false yapın
    };
    


    return (
        <div>
            <Navbar />
            <div>
            <h1>YKS Sonuçlarını Analiz Edelim!</h1>
            <p>YKS Sonuçlarını analiz etmek için Gemini yapay zekası ile birlikte ortaklaşa yaptığımız işin sonucunda tüm kullanıcılarımıza gerçek bir deneyim sunmanın keyfini yaşıyoruz.!</p>
            </div>
            <div className="slider-container">
                <Slider {...settings}>
                    <div>
                        <img src="https://eskisehir.meb.gov.tr/meb_iys_dosyalar/2024_05/22113941_21173432_yyksye_doyru_2024y_turkyye_genely_cevrym_ycy_deneme_sinavi_yapilacak1.jpg" alt="Slide 1" />
                    </div>
                    <div>
                        <img src="https://atabeyy.com/wp-content/uploads/2019/04/deneme-sinavi-sonuc-incelemesi-nasil-yapilir.jpg" alt="Slide 2" />
                    </div>
                    <div>
                        <img src="https://www.ozeldersalani.com/images/blogs/42999-deneme-analizi-nasil-yapilir.jpg" alt="Slide 3" />
                    </div>
                </Slider>
            </div>
            
        </div>
    );
};

export default Home;
