import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "@mui/joy/Button";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import BackupTableIcon from "@mui/icons-material/BackupTable";
import { TbCardsFilled } from "react-icons/tb";

import "./Estadistica.css"; // Archivo CSS adicional para estilos personalizados

import Futbol from "../Posiciones/Futbol/Futbol";
import Voleibol from "../Posiciones/Voleibol/Voleibol";
import Basquetbol from "../Posiciones/Basquetbol/Basquetbol";

import { formatIdSport } from "../../utils/formatIdSport.js";

const Estadistica = () => {
  const [activeTab, setActiveTab] = useState("posiciones");

  const { idevent, idsport } = useParams();
  const navigate = useNavigate();

  const handleToggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const handleClick = (tipoLink) => {
    navigate(`/torneos/186/sports/5/sport/${tipoLink}`);
  };

  const formattedSport = formatIdSport(parseInt(idsport));

  return (
    <div className="estadistica-container font-quickSand">
      <div className="buttons-container">
        {/* {formattedSport === 1 ||
          (formattedSport === 2 && (
            <Button
              component="a"
              startDecorator={<SportsSoccerIcon />}
              onClick={() => handleClick("goleadores")}
              className={`toggle-button ${
                activeTab === "goleadores" ? "active" : ""
              } hover:text-white`}
            >
              <span className="stt font-quickSand">Goleadores</span>
            </Button>
          ))} */}

        <Button
          component="a"
          startDecorator={<BackupTableIcon />}
          onClick={() => handleToggle("posiciones")}
          className={`toggle-button ${
            activeTab === "posiciones" ? "active" : ""
          }`}
        >
          <span className="stt font-quickSand">Posiciones</span>
        </Button>
        {/* {formattedSport === 1 ||
          (formattedSport === 2 && (
            <Button
              component="a"
              startDecorator={<TbCardsFilled style={{ fontSize: "24px" }} />}
              onClick={() => handleClick("sanciones")}
              className={`toggle-button ${
                activeTab === "sanciones" ? "active" : ""
              } hover:text-white`}
            >
              <span className="stt font-quickSand">Sanciones</span>
            </Button>
          ))} */}
      </div>

      <div className="content-container">
        {activeTab === "goleadores" && (
          <div className="content">Contenido de Goleadores</div>
        )}
        {activeTab === "posiciones" && (
          <div className="content">
            {formattedSport === 1 && <Futbol />}
            {formattedSport === 2 && <Futbol />}
            {formattedSport === 5 && <Futbol />}
            {formattedSport === 3 && <Voleibol />}
            {formattedSport === 4 && <Basquetbol />}
          </div>
        )}
        {activeTab === "sanciones" && (
          <div className="content">Contenido de Sanciones</div>
        )}
      </div>
    </div>
  );
};

export default Estadistica;
