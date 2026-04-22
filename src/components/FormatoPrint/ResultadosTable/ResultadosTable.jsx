import React from "react";

const ResultadosTable = ({ grupo, matches, color, idsport }) => {
  // Función para renderizar periodos y sets en deportes de Vóleibol
  const renderSetsAndPeriodsForVoley = (periods, sets1, sets2) => {
    return (
      <>
        <div className="resultado-puntos resultado-puntos-left">
          {periods.map((period, index) => {
            // Condición para no mostrar el tercer periodo si ambos son 0
            if (index === 2 && period.puntos1 === 0 && period.puntos2 === 0) {
              return null; // No renderizar el tercer periodo si ambos puntajes son 0
            }
            return <span key={index}>{period.puntos1}</span>;
          })}
        </div>
        <span className="resultado">{sets1}</span>
        <span className="vs">vs</span>
        <span className="resultado">{sets2}</span>
        <div className="resultado-puntos resultado-puntos-right">
          {periods.map((period, index) => {
            // Condición para no mostrar el tercer periodo si ambos son 0
            if (index === 2 && period.puntos1 === 0 && period.puntos2 === 0) {
              return null; // No renderizar el tercer periodo si ambos puntajes son 0
            }
            return <span key={index}>{period.puntos2}</span>;
          })}
        </div>
      </>
    );
  };

  return (
    <div className="fecha-container">
      <div className="fecha-header" style={{ backgroundColor: color }}>
        <span className="fecha-title">GRUPO {grupo.letra}</span>
      </div>
      <table className="resultados-table">
        <tbody>
          {matches.map((match, index) => (
            <tr key={index}>
              <td className="equipo">
                {match.Participant1
                  ? match.Participant1.Institution.name
                  : "Por Definir"}
              </td>
              <td className="puntuacion">
                <div className="resultado-wrapper">
                  {/* Si es vóleibol, mostrar los sets y los periodos */}
                  {Number(idsport) === 16 || Number(idsport) === 17 ? (
                    <>
                      {renderSetsAndPeriodsForVoley(
                        match.periods,
                        match.sets1,
                        match.sets2
                      )}
                    </>
                  ) : (
                    <>
                      <span className="resultado">{match.resultado1}</span>
                      <span className="vs">vs</span>
                      <span className="resultado">{match.resultado2}</span>
                    </>
                  )}
                </div>
              </td>
              <td className="equipo">
                {match.Participant2
                  ? match.Participant2.Institution.name
                  : "Por Definir"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultadosTable;
