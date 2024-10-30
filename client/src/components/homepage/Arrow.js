import React from 'react';

const Arrow = ({ direction, onClick }) => {
    return (
        <div
            style={{
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
                position: "absolute",
                top: "35%",
                transform: "translateY(-50%)",
                left: direction === "prev" ? "10px" : "auto",
                right: direction === "next" ? "10px" : "auto",
                cursor: "pointer",
            }}
            onClick={onClick}
        >
            {direction === "next" ? "→" : "←"}
        </div>
    );
};

export default Arrow;
