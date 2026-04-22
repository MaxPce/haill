import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './Medallero.css'; // Importa el archivo CSS

const Medallero = () => {
    const { idevent, idsport } = useParams();
    const encodedIdsport = btoa(idsport);

    return (
        <div className='medallero_indi'>
            <div className="container">
                {/* <h2 className="medallero-header">Medallero</h2> */}
                {/* Embeber iframe debajo del encabezado */}
                <div className="flex justify-center my-4">
                    <a
                        href={`https://sistema.hayllis.com/public/medals/${encodedIdsport}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-6 py-2 text-2xl font-medium text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                    >
                        Ver Medallero del Deporte
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Medallero;
