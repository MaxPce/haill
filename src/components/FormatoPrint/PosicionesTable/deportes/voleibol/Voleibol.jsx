import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../../../../config/config.js";
import "./Voleibol.css";

import { useParams } from "react-router-dom";

const Voleibol = () => {
  const [posiciones, setPosiciones] = useState([]);
  const { idevent, idsport } = useParams();

  useEffect(() => {
    const getPosiciones = async () => {
      const response = await axios.post(`${API_BASE_URL}/getposiciones`, {
        idevent: idevent,
        idsport: idsport,
      });
      setPosiciones(response.data);
    };
    if (idevent && idsport) {
      getPosiciones();
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
    <div className="voleibol-card" key={groupName}>
      <div className="voleibol-table-container">
        <table className="volleyball-table">
          <thead>
            <tr>
              <th rowSpan="2" colSpan="2" style={{ fontSize: "20px" }}>
                {groupName}
              </th>
              <th rowSpan="2">PJ</th>
              <th colSpan="2">PG</th>
              <th colSpan="2">PP</th>
              <th rowSpan="2">PTS</th>
              <th colSpan="3">SET</th>
              <th colSpan="3">PUNTOS</th>
            </tr>
            <tr>
              <th>2-0</th>
              <th>2-1</th>
              <th>2-1</th>
              <th>2-0</th>
              <th>G</th>
              <th>P</th>
              <th>Prom</th>
              <th>F</th>
              <th>C</th>
              <th>Prom</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position, index) => (
              <tr key={index}>
                <td className="nro">{index + 1}</td>
                <td>{position.participant.Institution.name}</td>
                <td>{position.pj}</td>
                <td>{position.pg2_0}</td>
                <td>{position.pg2_1}</td>
                <td>{position.pp2_1}</td>
                <td>{position.pp2_0}</td>
                <td className="resaltado pts">{position.pts}</td>
                <td>{position.setG}</td>
                <td>{position.setP}</td>
                <td>{position.ratioSet}</td>
                <td>{position.pf}</td>
                <td>{position.pc}</td>
                <td>{position.ratioPuntos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="voleibol">
      {/* Renderizado de las tablas */}
      {Object.entries(
        posiciones.reduce((groups, position) => {
          const groupName = getGroupName(position.idgrupo);
          if (!groups[groupName]) {
            groups[groupName] = [];
          }
          groups[groupName].push(position);
          return groups;
        }, {})
      ).map(([groupName, positions]) =>
        renderTable(
          positions.sort((a, b) => a.posicion - b.posicion),
          groupName
        )
      )}
    </div>
  );
};

export default Voleibol;
