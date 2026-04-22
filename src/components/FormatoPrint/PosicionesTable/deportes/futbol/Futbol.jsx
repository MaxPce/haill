import React from "react";
import "./Futbol.css"; // Estilos específicos para básquet

const Futbol = ({ posiciones }) => {
  // Función para convertir el id de grupo en letra
  const getGroupLetter = (idgrupo) => {
    return String.fromCharCode(64 + idgrupo); // Convierte 1 => A, 2 => B, etc.
  };

  const renderTable = (positions, groupName) => (
    <div className="tabla-posiciones-container" key={groupName}>
      <table className="posiciones-table">
        <thead>
          <tr>
            <th colSpan="2">{groupName}</th>
            <th>PTS</th>
            <th>PJ</th>
            <th>PG</th>
            <th>PE</th>
            <th>PP</th>
            <th>CF</th>
            <th>CE</th>
            <th>DC</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position, index) => (
            <tr key={index}>
              <td className="nro">{index + 1}</td>
              <td>{position.participant.Institution.name}</td>
              <td className="pts-resaltado">{position.pts}</td>{" "}
              {/* Clase para resaltar */}
              <td>{position.pj}</td>
              <td>{position.g}</td>
              <td>{position.e}</td>
              <td>{position.p}</td>
              <td>{position.pf}</td>
              <td>{position.pc}</td>
              <td>{position.dp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const groupedPosiciones = posiciones.reduce((acc, pos) => {
    const groupName = `GRUPO ${getGroupLetter(pos.idgrupo)}`; // Convierte el número de grupo a letra
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(pos);
    return acc;
  }, {});

  return (
    <div className="contenedor-principal futbol">
      {Object.entries(groupedPosiciones).map(([groupName, positions]) =>
        renderTable(positions, groupName)
      )}
    </div>
  );
};

export default Futbol;
