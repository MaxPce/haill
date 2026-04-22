import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/config.js";
import { useParams } from "react-router-dom";
import { formatearNombreCompleto } from "../../utils/formatName.js";

const TablaGoleadores = () => {
  const { idevent, idsport } = useParams();
  const [goleadores, setGoleadores] = useState([]);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const getGoleadores = async () => {
      const response = await axios.post(`${API_BASE_URL}/getgoleadores`, {
        idevent: Number(idevent),
        idsport: Number(idsport),
      });
      setGoleadores(response.data);
    };

    const getConfig = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/config_category`, {
          idevent: Number(idevent),
          idsport: Number(idsport),
        });
        setConfig(response.data);
      } catch (error) {
        console.error("Error fetching config", error);
      }
    };

    if (idevent && idsport) {
      getConfig();
      getGoleadores();
    }
  }, [idevent, idsport]);

  const getEtapaLabel = (idtypephase, nro_fecha) => {
    if (idtypephase === 1) {
      return `${nro_fecha}° FECHA`;
    } else if (idtypephase === 2) {
      if (config.nro_etapas_final === 2) {
        return nro_fecha === 1 ? "SEMIS" : "FINAL";
      } else {
        const etapas = ["Octavos", "Cuartos", "Semis", "Final"];
        return etapas[nro_fecha - 1] || "";
      }
    }
    return "";
  };

  const generateTableHeader = () => {
    if (!config) return null;
    const headers = ["N°", "SIGLAS", "NOMBRE"];

    for (let i = 1; i <= config.nro_fechas_grupo; i++) {
      headers.push(getEtapaLabel(1, i));
    }

    for (let i = 1; i <= config.nro_etapas_final; i++) {
      headers.push(getEtapaLabel(2, i));
    }

    headers.push("TOTAL");
    return headers;
  };

  const generarFilasGoleadores = () => {
    const goleadoresMap = {};

    goleadores.forEach((goleador) => {
      const idacreditacion = goleador.idacreditation;

      if (!goleadoresMap[idacreditacion]) {
        goleadoresMap[idacreditacion] = {
          siglas: goleador.institution.abrev,
          name: goleador.accreditation.persona,
          fechas: {},
          etapasFinales: {},
        };
      }

      const label = getEtapaLabel(goleador.idtypephase, goleador.nro_fecha);

      if (goleador.idtypephase === 1) {
        goleadoresMap[idacreditacion].fechas[label] = goleador.puntos;
      } else if (goleador.idtypephase === 2) {
        goleadoresMap[idacreditacion].etapasFinales[label] = goleador.puntos;
      }
    });

    const goleadoresArray = Object.values(goleadoresMap).map((goleador) => {
      const totalFechas = Object.values(goleador.fechas).reduce(
        (acc, puntos) => acc + puntos,
        0
      );
      const totalEtapasFinales = Object.values(goleador.etapasFinales).reduce(
        (acc, puntos) => acc + puntos,
        0
      );

      goleador.total = totalFechas + totalEtapasFinales;
      return goleador;
    });

    return goleadoresArray.sort((a, b) => b.total - a.total);
  };

  const calcularTotalColumna = (label) => {
    return generarFilasGoleadores().reduce((total, goleador) => {
      const puntos =
        goleador.fechas[label] || goleador.etapasFinales[label] || 0;
      return total + puntos;
    }, 0);
  };

  return (
    <div className="container mx-auto mt-1">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-black">Tabla de Goleadores</h2>
      </div>

      {config ? (
        <div className="overflow-x-auto mt-3">
          <table className="min-w-full bg-white shadow-md rounded-lg text-sm table-fixed">
            <thead>
              <tr>
                {generateTableHeader()?.map((header, index) => (
                  <th
                    key={index}
                    className="bg-blue-600 text-white px-4 py-2 whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {generarFilasGoleadores().map((goleador, index) => (
                <tr
                  key={index}
                  className="bg-gray-100 border-b hover:bg-gray-200 text-sm"
                >
                  <td className="px-4 py-2 text-center whitespace-nowrap">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2 text-center whitespace-nowrap">
                    {goleador.siglas}
                  </td>
                  <td className="px-4 py-2 max-w-xs truncate text-left">
                    {formatearNombreCompleto(goleador.name)}
                  </td>

                  {Array.from({ length: config.nro_fechas_grupo }, (_, i) => (
                    <td
                      key={i}
                      className="px-4 py-2 text-center whitespace-nowrap"
                    >
                      {goleador.fechas[getEtapaLabel(1, i + 1)] || ""}
                    </td>
                  ))}

                  {Array.from({ length: config.nro_etapas_final }, (_, i) => (
                    <td
                      key={i}
                      className="px-4 py-2 text-center whitespace-nowrap"
                    >
                      {goleador.etapasFinales[getEtapaLabel(2, i + 1)] || ""}
                    </td>
                  ))}

                  <td className="px-4 py-2 text-center font-bold bg-gray-200">
                    {goleador.total}
                  </td>
                </tr>
              ))}

              <tr className="bg-gray-300 font-bold">
                <td colSpan="3" className="px-4 py-2 text-center">
                  Total
                </td>
                {Array.from({ length: config.nro_fechas_grupo }, (_, i) => (
                  <td key={i} className="px-4 py-2 text-center bg-gray-200">
                    {calcularTotalColumna(getEtapaLabel(1, i + 1))}
                  </td>
                ))}
                {Array.from({ length: config.nro_etapas_final }, (_, i) => (
                  <td key={i} className="px-4 py-2 text-center bg-gray-200">
                    {calcularTotalColumna(getEtapaLabel(2, i + 1))}
                  </td>
                ))}
                <td
                  className="px-4 py-2 text-center bg-gray-400"
                  style={{ fontSize: "20px" }}
                >
                  {generarFilasGoleadores().reduce(
                    (total, goleador) => total + goleador.total,
                    0
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-2xl font-semibold">CARGANDO GOLEADORES...</p>
        </div>
      )}
    </div>
  );
};

export default TablaGoleadores;
