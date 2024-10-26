import React from 'react';
import { Link } from 'react-router-dom'; // react-router-dom eklenmeli
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <h1>Sınavını Paylaş!</h1>
            </div>
            <ul className="navbar-links">
                <li>
                    <Link to="/home" className="nav-link">Ana Sayfa</Link>
                </li>
                <li>
                    <Link to="/share" className="nav-link">Sınavını Paylaş</Link>
                </li>
                <li>
                    <Link to="/whoareus" className="nav-link">Biz Kimiz?</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
