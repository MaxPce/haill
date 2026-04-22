import React, { useState, useEffect } from "react";
import API_BASE_URL from "../../config/config.js";
import axios from "axios";
import { useParams } from "react-router-dom";

const BracketResumido = () => {
  const { idevent, idsport } = useParams();
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const getMatchesFaseFinal = async () => {
      const response = await axios.post(`${API_BASE_URL}/getmatches`, {
        idevent: idevent,
        idsport: idsport,
        idtypephase: 2,
      });
      const filteredMatches = response.data.filter(
        (match) => match.track_match_final !== 0
      );
      setMatches(filteredMatches);
    };
    if (idevent && idsport) {
      getMatchesFaseFinal();
    }
  }, [idevent, idsport]);

  const findMatchByCode = (code) => {
    return matches.find((match) => match.codigo_match === code);
  };

  const renderTeamLogo = (institution) => {
    if (institution?.image_path && institution?.path_base) {
      return (
        <div className="flex flex-col items-center">
          <img
            src={`${institution.path_base}${institution.image_path}`}
            alt={institution.abrev || "Logo"}
            className="w-10 h-10 rounded-full mb-1"
          />
          <span className="text-xs text-gray-500">{institution.abrev}</span>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500">
            {institution?.abrev || "Team"}
          </span>
        </div>
      );
    }
  };

  return (
    <div className="flex justify-center items-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-7xl">
        <div className="grid grid-cols-7 gap-4">
          {/* Octavos (Lado Izquierdo) */}
          <div className="flex flex-col justify-between items-center">
            <h2 className="text-sm font-bold text-center">Octavos</h2>
            {["oct1", "oct8", "oct5", "oct4"].map((code, index) => {
              const match = findMatchByCode(code);
              return (
                <div key={index} className="flex items-center my-4">
                  {renderTeamLogo(match?.Participant1?.Institution)}
                  <div className="mx-2 text-xs">vs</div>
                  {renderTeamLogo(match?.Participant2?.Institution)}
                </div>
              );
            })}
          </div>

          {/* Cuartos (Lado Izquierdo) */}
          <div className="flex flex-col justify-between items-center">
            <h2 className="text-sm font-bold text-center">Cuartos</h2>
            {["cua1", "cua4"].map((code, index) => {
              const match = findMatchByCode(code);
              return (
                <div key={index} className="flex items-center my-10">
                  {renderTeamLogo(match?.Participant1?.Institution)}
                  <div className="mx-2 text-xs">vs</div>
                  {renderTeamLogo(match?.Participant2?.Institution)}
                </div>
              );
            })}
          </div>

          {/* Semifinal (Lado Izquierdo) */}
          <div className="flex flex-col justify-between items-center">
            <h2 className="text-sm font-bold text-center">Semifinal</h2>
            {["sem1"].map((code, index) => {
              const match = findMatchByCode(code);
              return (
                <div key={index} className="flex items-center my-20">
                  {renderTeamLogo(match?.Participant1?.Institution)}
                  <div className="mx-2 text-xs">vs</div>
                  {renderTeamLogo(match?.Participant2?.Institution)}
                </div>
              );
            })}
          </div>

          {/* Final */}
          <div className="flex flex-col justify-center items-center">
            <h2 className="text-sm font-bold text-center">Final</h2>
            {["fin1"].map((code, index) => {
              const match = findMatchByCode(code);
              return (
                <div key={index} className="flex items-center my-20">
                  {renderTeamLogo(match?.Participant1?.Institution)}
                  <div className="mx-2 text-xs">vs</div>
                  {renderTeamLogo(match?.Participant2?.Institution)}
                </div>
              );
            })}
          </div>

          {/* Semifinal (Lado Derecho) */}
          <div className="flex flex-col justify-between items-center">
            <h2 className="text-sm font-bold text-center">Semifinal</h2>
            {["sem2"].map((code, index) => {
              const match = findMatchByCode(code);
              return (
                <div key={index} className="flex items-center my-20">
                  {renderTeamLogo(match?.Participant1?.Institution)}
                  <div className="mx-2 text-xs">vs</div>
                  {renderTeamLogo(match?.Participant2?.Institution)}
                </div>
              );
            })}
          </div>

          {/* Cuartos (Lado Derecho) */}
          <div className="flex flex-col justify-between items-center">
            <h2 className="text-sm font-bold text-center">Cuartos</h2>
            {["cua2", "cua3"].map((code, index) => {
              const match = findMatchByCode(code);
              return (
                <div key={index} className="flex items-center my-10">
                  {renderTeamLogo(match?.Participant1?.Institution)}
                  <div className="mx-2 text-xs">vs</div>
                  {renderTeamLogo(match?.Participant2?.Institution)}
                </div>
              );
            })}
          </div>

          {/* Octavos (Lado Derecho) */}
          <div className="flex flex-col justify-between items-center">
            <h2 className="text-sm font-bold text-center">Octavos</h2>
            {["oct2", "oct7", "oct6", "oct3"].map((code, index) => {
              const match = findMatchByCode(code);
              return (
                <div key={index} className="flex items-center my-4">
                  {renderTeamLogo(match?.Participant1?.Institution)}
                  <div className="mx-2 text-xs">vs</div>
                  {renderTeamLogo(match?.Participant2?.Institution)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BracketResumido;
