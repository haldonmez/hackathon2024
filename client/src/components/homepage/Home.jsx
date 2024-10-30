import React from 'react';
import Navbar from '../navbar/Navbar';
import Slider from 'react-slick';
import Arrow from './Arrow';
import './Home.css';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css"; 

const Home = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        nextArrow: <Arrow direction="next" />,
        prevArrow: <Arrow direction="prev" />,
        autoplay: false,
    };

    return (
        <div className="home-container">
            <Navbar />
            <div className="slider-wrapper">
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
            <h2>DERS ANALİZİ</h2>
            <p>Derslerini Gemini yapay zeka teknolojisi ile analiz edelim. Eksikliklerini gider, doğrularını arttır.!</p>
        </div>
    );
};

export default Home;
