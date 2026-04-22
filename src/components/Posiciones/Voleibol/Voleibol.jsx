import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../../config/config.js";
import "./Voleibol.css";

import { useParams } from "react-router-dom";

const Voleibol = () => {
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
      console.log("respuesta", response.data);
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
      className="voleibol-card bg-white shadow-lg rounded-lg overflow-hidden mb-6"
      key={groupName}
    >
      <div className="card-header bg-blue-500 px-6 py-4">
        <h2 className="text-xl font-bold text-white">{groupName}</h2>
      </div>
      <div className="voleibol-table-container">
        <table className="min-w-full divide-y divide-gray-200 volleyball-table">
          <thead className="bg-gray-50">
            <tr>
              <th
                rowSpan="2"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Equipo
              </th>
              <th
                rowSpan="2"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                PJ
              </th>
              <th
                colSpan="2"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                PG
              </th>
              <th
                colSpan="2"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                PP
              </th>
              <th
                rowSpan="2"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                PTS
              </th>
              <th
                colSpan="3"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                SET
              </th>
              <th
                colSpan="3"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                PUNTOS
              </th>
            </tr>
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                2 - 0
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                2 - 1
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                2 - 0
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                2 - 1
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                G
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                P
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ratio
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                F
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                C
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ratio
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
                  {/* {position.participant.Institution.abrev} */}
                  {position.participant.Institution.name}
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {position.pj}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {position.pg2_0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {position.pg2_1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {position.pp2_0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {position.pp2_1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {position.pts}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {position.setG}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {position.setP}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {position.ratioSet === "99.999" ? "Max." : position.ratioSet}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {position.pf}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {position.pc}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {position.ratioPuntos === "99.999"
                    ? "Max."
                    : position.ratioPuntos}
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
      <div className="posiciones_sports">
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

        <div className="space-y-6 px-4 voley">
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

export default Voleibol;
