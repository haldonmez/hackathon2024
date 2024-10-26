// Arrow.js
import React from 'react';

const Arrow = (props) => {
    const { className, onClick } = props;
    return (
        <div className={className} onClick={onClick}>
            {className.includes('slick-next') ? '→' : '←'} {/* Ok simgeleri */}
        </div>
    );
};

export default Arrow;
