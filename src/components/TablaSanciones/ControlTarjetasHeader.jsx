// components/ControlTarjetasHeader.jsx
import React from "react";

// Leyenda de abreviaturas y colores según idTarjeta
const legendItems = [
    { abrev: "A", name: "Tarjeta Amarilla", color: "#FFFF00" },
    { abrev: "R", name: "Tarjeta Roja", color: "#FF0000" },
    { abrev: "S", name: "Suspendido", color: "#000000" },
    { abrev: "H", name: "Habilitado", color: "#92D050" },
    { abrev: "*", name: "Descanso de la Institución", color: "#A9957B" },
    { abrev: "RE", name: "Roja a Evaluar", color: "#FF9F11" },
];

export default function ControlTarjetasHeader() {
    return (
        <div className="mb-6">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">
                CONTROL DE TARJETAS Y SANCIONES
            </h2>
            <div className="flex flex-wrap gap-4">
                {legendItems.map((item) => (
                    <div key={item.abrev} className="flex items-center gap-2">
                        <span
                            className="inline-block w-6 h-6 rounded-full border border-gray-300"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-gray-700">
                            <strong>{item.abrev}</strong> — {item.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}