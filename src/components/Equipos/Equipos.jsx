import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/config.js";
import { useParams } from "react-router-dom";

const Equipos = () => {
  const { idevent, idsport } = useParams();
  const [participantes, setParticipantes] = useState([]);
  const [regionMap, setRegionMap] = useState({});
  const [configCtg, setConfigCtg] = useState(null);

  useEffect(() => {
    const getConfigCategory = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/config_category`, {
          idevent: Number(idevent),
          idsport: Number(idsport),
        });
        setConfigCtg(response.data);
      } catch (error) {
        console.error("Error fetching config category:", error);
      }
    };
    if (idevent && idsport) {
      getConfigCategory();
    }
  }, [idevent, idsport]);

  useEffect(() => {
    if (configCtg && configCtg.separacionData) {
      console.log("separacion data", configCtg.separacionData);
      setRegionMap(configCtg.separacionData);
    }
  }, [configCtg]);

  useEffect(() => {
    const getParticipantes = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/getparticipants`, {
          idevent: Number(idevent),
          idsport: Number(idsport),
          idtypephase: 1,
        });
        console.log("Participantes:", response.data);
        setParticipantes(response.data);
      } catch (error) {
        console.error("Error fetching participants:", error);
      }
    };
    if (idevent && idsport) {
      getParticipantes();
    }
  }, [idevent, idsport]);

  // Estructura para almacenar las instituciones por región
  const regiones = {};

  // Distribuir las instituciones en sus respectivas regiones
  participantes.forEach((participant) => {
    const regionInfo = regionMap[participant.idseparacion];
    if (regionInfo) {
      if (!regiones[regionInfo.name]) {
        regiones[regionInfo.name] = [];
      }
      regiones[regionInfo.name].push({
        ...participant,
        img_path: regionInfo.img_path,
        abrev: regionInfo.abrev,
      });
    } else {
      if (!regiones["INSTITUCIONES PARTICIPANTES"]) {
        regiones["INSTITUCIONES PARTICIPANTES"] = [];
      }
      regiones["INSTITUCIONES PARTICIPANTES"].push(participant);
    }
  });

  // Filtrar regiones vacías y ordenar según regionMap
  const orderedRegions = Object.keys(regionMap).map(
    (key) => regionMap[key].name
  );
  const nonEmptyRegions = orderedRegions.filter(
    (region) => regiones[region] && regiones[region].length > 0
  );

  const isSingleRegion = nonEmptyRegions.length === 1;

  return (
    <div
      className={`p-4 grid gap-4 ${
        isSingleRegion
          ? "grid-cols-1 justify-center"
          : "grid-cols-1 md:grid-cols-2"
      }`}
    >
      {nonEmptyRegions.map((region) => (
        <div
          key={region}
          className={`bg-white rounded-lg shadow-md p-4 overflow-x-auto ${
            isSingleRegion ? "mx-auto max-w-lg" : ""
          }`}
        >
          <h2 className="text-center text-xl font-bold mb-2">{region}</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="bg-white divide-y divide-gray-200">
              {regiones[region].map((participant, index) => {
                let imagePath = participant.Institution.image_path;
                if (
                  participant.Institution.tipo === 1 ||
                  participant.Institution.tipo === 2
                ) {
                  imagePath = `https://sismaster.perufedup.com/writable/uploads/${imagePath}`;
                }

                return (
                  <tr key={index}>
                    <td className="px-2 py-1 whitespace-nowrap relative">
                      <img
                        src={imagePath}
                        alt="Logo"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div
                        className="absolute bg-gray-300"
                        style={{
                          width: "30px",
                          height: "20px",
                          transform: "scale(0.5)", // Ajusta este valor para hacer el rectángulo proporcional
                          top: isSingleRegion ? "-5px" : "-2px", // Desplaza hacia arriba
                          right: isSingleRegion ? "-6px" : "-3px", // Desplaza hacia la derecha
                        }}
                      >
                        <img
                          src={participant.Institution.country.img_path}
                          alt="imagen"
                        />
                      </div>
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      {participant.Institution.name}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      {participant.Institution.abrev}
                    </td>
                    <td className="px-2 py-1 whitespace-nowrap">
                      {participant.abrev}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Equipos;
