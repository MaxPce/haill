import React, { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../../../config/config.js";
import { useParams } from "react-router-dom";
import Basquet from "./deportes/basquet/Basquet.jsx";
import Voleibol from "./deportes/voleibol/Voleibol.jsx"; // Agrega otros deportes según tu necesidad
import Futbol from "./deportes/futbol/Futbol.jsx";

const PosicionesTable = () => {
  const { idevent, idsport, nrofecha } = useParams();
  const [posiciones, setPosiciones] = useState([]);

  useEffect(() => {
    if (idevent && idsport && nrofecha) {
      getPosiciones();
    }
  }, [idevent, idsport, nrofecha]);

  const getPosiciones = async () => {
    // const response = await axios.post(`${API_BASE_URL}/getposicionesbydate`, {
    //   idevent: Number(idevent),
    //   idsport: Number(idsport),
    //   nro_fecha: Number(nrofecha),
    // });
    const response = await axios.post(`${API_BASE_URL}/getposiciones`, {
        idevent: Number(idevent),
        idsport: Number(idsport),
      });
    console.log("posiciones", response.data);
    setPosiciones(response.data);
  };

  // Renderiza el componente correspondiente según el idsport
  const renderPosiciones = () => {
    switch (parseInt(idsport, 10)) {
      case 3: // Basquetbol
      case 4:
        return <Basquet posiciones={posiciones} />;
      case 16: // Voleibol
      case 17:
        return <Voleibol posiciones={posiciones} />;
      // Añadir otros casos para diferentes deportes
      case 5:
      case 42:
      case 6:
      case 7:
        return <Futbol posiciones={posiciones} />;
      default:
        return <div>Deporte no soportado</div>;
    }
  };

  return <div>{renderPosiciones()}</div>;
};

export default PosicionesTable;
