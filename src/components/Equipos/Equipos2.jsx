import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/config.js";
import { useParams } from "react-router-dom";

const Equipos2 = ({ onInstitutionClick }) => {
  const { idevent, idsport } = useParams();
  const [participantes, setParticipantes] = useState([]);
  const [useBandera, setUseBandera] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1) Obtener participantes
        const [resPart, resConfig] = await Promise.all([
          axios.post(`${API_BASE_URL}/getparticipants`, {
            idevent: Number(idevent),
            idsport: Number(idsport),
            idtypephase: 1,
          }),
          axios.post(`${API_BASE_URL}/config_category`, {
            idevent: idevent,
            idsport: idsport,
          }),
        ]);
        setParticipantes(resPart.data);
        setUseBandera(resConfig.data.useBandera);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los participantes.");
      } finally {
          setLoading(false);
      }
    };

    if (idevent && idsport) {
      fetchData()
    };
  }, [idevent, idsport]);

  if (error) {
    return (
      <div className="p-4 text-red-500 text-center">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Cargando Participantes...
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse bg-white rounded-lg shadow-lg p-4 space-x-4"
            >
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div className="flex-1 py-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }


  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {participantes.map((participant, index) => (
        <div
          key={index}
          className="relative flex items-center bg-white shadow-lg rounded-lg p-4 transform transition-transform duration-300 hover:scale-105 cursor-pointer"
          onClick={() =>
            onInstitutionClick(participant.Institution.idinstitution)
          }
        >
          {/* Imagen del país */}
          {useBandera && (
            <img
              src={participant.Institution.country.img_path}
              alt={`Bandera de ${participant.Institution.country.name}`}
              className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full border-2 border-white shadow-lg"
            />
          )}

          {/* Imagen de la institución */}
          <img
            src={`${participant.Institution.path_base}${participant.Institution.image_path}`}
            alt={participant.Institution.name}
            className="w-16 h-16 rounded-full"
          />

          {/* Información de la institución */}
          <div className="ml-4">
            <h2 className="text-lg font-bold">
              {participant.Institution.name}
            </h2>
            <p className="text-sm text-gray-500">
              ({participant.Institution.abrev})
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Equipos2;
