// Arrow.js
import React from 'react';

const Arrow = ({ className, style, onClick }) => {
    return (
        <div
            className={className}
            style={{
                ...style,
                display: "block",
                background: "gray",
                borderRadius: "50%",
                height: "30px",
                width: "30px",
                color: "white",
                textAlign: "center",
                lineHeight: "30px",
                fontSize: "20px",
                zIndex: 1,
            }}
            onClick={onClick}
        >
            {className.includes("slick-next") ? "→" : "←"}
        </div>
    );
};

export default Arrow;
