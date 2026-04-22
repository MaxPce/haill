import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../../config/config.js";
import { resultMatch } from "../../../utils/resultMatch.js";
import "./Basquetbol.css";

import { useParams } from "react-router-dom";

const Basquetbol = ({ useDI }) => {
  const [posiciones, setPosiciones] = useState([]);
  const { idevent, idsport } = useParams();
  const [fechas, setFechas] = useState([])
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const getPosiciones = async () => {
      const response = await axios.post(`${API_BASE_URL}/getposiciones`, {
        idevent: idevent,
        idsport: idsport,
      });
      setPosiciones(response.data);
    };
    const getConfigCategory = async () => {
      const response = await axios.post(`${API_BASE_URL}/config_category`, {
        idevent: idevent,
        idsport: idsport,
      });
      const fechasArray = Array.from(
        { length: response.data.nro_fechas_grupo },
        (_, i) => String(i + 1)
      );
      setFechas(fechasArray);
    }

    if (idevent && idsport) {
      getPosiciones();
      getConfigCategory();
    }
  }, [idevent, idsport]);

  const getGroupName = (idgrupo) => {
    switch (idgrupo) {
      case 1:
        return "GRUPO A";
      case 2:
        return "GRUPO B";
      case 3:
        return "GRUPO C";
      case 4:
        return "GRUPO D";
      case 5:
        return "GRUPO E";
      case 6:
        return "GRUPO F";
      default:
        return `GRUPO ${String.fromCharCode(64 + idgrupo)}`;
    }
  };

  const renderTable = (positions, groupName) => (
    <div
      className="card bg-white shadow-lg rounded-lg overflow-hidden mb-6"
      key={groupName}
    >
      <div className="card-header bg-blue-500 px-6 py-4">
        <h2 className="text-xl font-bold text-white">{groupName}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Equipo
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
              >
                PJ
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                PG
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                PP
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                CF
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
              >
                CE
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                DC
              </th>
              {
                useDI && (
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    DI
                  </th>
                )
              }
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                PTS
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
              >
                Resultados
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {positions.map((position, index) => (
              <tr
                key={position.idposicion}
                className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                  <span className="mr-2 text-gray-500">{index + 1}.</span>
                  <img
                    src={`${position.participant.Institution.path_base}${position.participant.Institution.image_path}`}
                    alt={position.participant.Institution.abrev}
                    className="w-6 h-6 mr-2 rounded-full"
                  />
                  {position.participant.Institution.abrev}
                  {position.direccion === 1 && (
                    <span className="ml-2 w-3 h-3 bg-gray-400 rounded-full"></span>
                  )}
                  {position.direccion === 2 && (
                    <span className="ml-2 text-green-500">▲</span>
                  )}
                  {position.direccion === 3 && (
                    <span className="ml-2 text-red-500">▼</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                  {position.pj}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {position.g}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {position.p}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {position.pf}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                  {position.pc}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {position.dp}
                </td>
                {
                  useDI && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {position.di}
                    </td>
                  )
                }
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {position.pts}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm hidden sm:table-cell">
                  <div className="flex space-x-1">
                    {[...Array(position.fechas_total)].map((_, i) => {
                      const result = resultMatch(position[`f${i + 1}`]);
                      return (
                        <span
                          key={`${position.idposicion}-${i}`}
                          className={`px-2 py-1 rounded-full text-xs font-bold ${result.color}`}
                        >
                          {result.label === "N" ? (
                            <>
                              <span className="invisible"> N </span>
                            </>
                          ) : result.label === "W" ? (
                            <span
                              style={{ fontSize: "0.53rem", color: "#ffffff" }}
                            >
                              {" "}
                              W{" "}
                            </span>
                          ) : (
                            result.label
                          )}
                        </span>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const handleSelectDate = async (fecha) => {
    setSelectedDate(fecha);
    try {
      const response = await axios.post(`${API_BASE_URL}/getposicionesbydate`, {
        idevent: Number(idevent),
        idsport: Number(idsport),
        nro_fecha: Number(fecha)
      })
      console.log("Posiciones by date", response.data)
      setPosiciones(response.data)
    } catch (error) {
      console.error("Error", error)
    }
  }

  return (
    <>
      <div className="posiciones_sport">
        <div className="flex justify-center mb-2 space-x-2">
          {fechas.map((fecha) => (
            <button
              key={fecha}
              // className="fechas_button"
              className={`fechas_button ${selectedDate === fecha
                ? "selected_date"
                : "unselected_date"
                }`}
              // onClick={() => setSelectedDate(fecha)}
              onClick={() => handleSelectDate(fecha)}
            >
              <span className="tag_fecha">Fecha</span> {fecha}
            </button>
          ))}
        </div>

        <div className="space-y-6 px-4">
          {Object.entries(
            posiciones.reduce((groups, position) => {
              const groupName = getGroupName(position.idgrupo);
              if (!groups[groupName]) {
                groups[groupName] = [];
              }
              groups[groupName].push(position);
              return groups;
            }, {})
          )
            .sort(([groupNameA], [groupNameB]) =>
              groupNameA.localeCompare(groupNameB)
            )
            .map(([groupName, positions]) =>
              renderTable(
                positions.sort((a, b) => a.posicion - b.posicion),
                groupName
              )
            )}
        </div>

      </div>
    </>
  );
};

export default Basquetbol;
