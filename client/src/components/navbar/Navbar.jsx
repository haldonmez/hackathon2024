import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; 
import './Navbar.css';

const Navbar = () => {
    const [scrolling, setScrolling] = useState(false);

    const handleScroll = () => {
        if (window.scrollY > 50) {
            setScrolling(true);
        } else {
            setScrolling(false);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <nav className={`navbar ${scrolling ? 'scrolled' : ''}`}>
            <div className="navbar-logo">
            <h1 className="navbar-title">Sınavını Paylaş!</h1>
            </div>
            <ul className="navbar-links">
                <li><Link className="nav-link" to="/">Ana Sayfa</Link></li>
                <li><Link className="nav-link" to="/exam">Sınavını Paylaş</Link></li>
                <li><Link className="nav-link" to="/whoareus">Biz Kimiz?</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;
