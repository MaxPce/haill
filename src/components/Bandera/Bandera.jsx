import React from "react";

const Bandera = ({ src, alt }) => {
  return (
    <div
      className="absolute bg-gray-300"
      style={{
        top: "-8px", // Desplaza hacia arriba
        right: "-14px", // Desplaza hacia la derecha
        width: "30px",
        height: "20px",
        transform: "scale(0.5)", // Ajusta este valor para hacer el rectángulo proporcional
        overflow: "hidden",
      }}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
};

export default Bandera;
