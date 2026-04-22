import React from "react";

const Bandera2 = ({ src, alt }) => {
  return (
    <div
      className="absolute"
      style={{
        top: "-12px", // Desplaza hacia arriba
        right: "-26px", // Desplaza hacia la derecha
        width: "45px",
        height: "30px",
        transform: "scale(0.5)", // Ajusta este valor para hacer el rectángulo proporcional
        overflow: "hidden",
      }}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
};

export default Bandera2;
