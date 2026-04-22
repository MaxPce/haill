import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom"; // Importar useSearchParams
import axios from "axios";
import API_BASE_URL from "../config/config.js";
import HeaderSection from "../components/FormatoPrint/HeaderSection/HeaderSection.jsx";
import ResultadosTable from "../components/FormatoPrint/ResultadosTable/ResultadosTable.jsx";
import PosicionesTable from "../components/FormatoPrint/PosicionesTable/PosicionesTable.jsx"; // Importar el componente de posiciones
import moment from "moment";
import "moment/locale/es"; // Asegúrate de tener el idioma español cargado en moment.js
import "../components/FormatoPrint/ResultadosTable/Resultados.css";

const FechaSection = () => {
  const { idevent, idsport, nrofecha } = useParams();
  const [matches, setMatches] = useState([]);
  const [searchParams] = useSearchParams(); // Obtener los parámetros de búsqueda (query params)
  const idtypephase = searchParams.get("fase") || "1"; // Por defecto, idtypephase es 1 (Fase de Grupos)
  const isPosiciones = searchParams.get("posiciones") === "1"; // Verificar si el parámetro posiciones está presente

  // Mapeo de deportes a colores
  const sportColors = {
    3: "#ED7D31",
    4: "#009688",
    16: "#FFC107", // Vóleibol Damas
    17: "#00BCD4", // Vóleibol Varones
    6: "#C41D0F",
    7: "#0A599E",
    5: "#8BC34A",
    42: "#BB4F94",
  };

  // Obtener el color según el deporte actual
  const headerColor = sportColors[idsport] || "#000000"; // Color por defecto si no está en el mapeo

  // Función para traer los partidos
  const getMatches = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/getmatchesperiod`, {
        idevent: idevent,
        idsport: idsport,
        nro_fecha: nrofecha,
        idtypephase: idtypephase, // Añadir el filtro de fase
      });
      console.log("matches", response.data);
      let fetchedMatches = response.data;

      // Ordenar los partidos por `time_match`
      fetchedMatches = fetchedMatches.sort((a, b) => {
        const timeA = a.time_match ? moment(a.time_match, "HH:mm") : null;
        const timeB = b.time_match ? moment(b.time_match, "HH:mm") : null;
        if (!timeA || !timeB) return 0;
        return timeA.isBefore(timeB) ? -1 : 1;
      });

      setMatches(fetchedMatches);
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  };

  useEffect(() => {
    getMatches();
    setTimeout(() => {
      window.print();
    }, 1000);
  }, [idevent, idsport, nrofecha, idtypephase]); // Añadir idtypephase como dependencia

  const grupos = [
    { letra: "A", grupoId: 1 },
    { letra: "B", grupoId: 2 },
    { letra: "C", grupoId: 3 },
    { letra: "D", grupoId: 4 },
    { letra: "E", grupoId: 5 },
    { letra: "F", grupoId: 6 },
  ];

  const matchesPorGrupo = (grupoId) =>
    matches.filter(
      (match) =>
        match.idgrupo === grupoId && match.Participant1 && match.Participant2
    );

  const getFirstDate = () => {
    const firstMatchWithDate = matches.find((match) => match.date_match);
    if (firstMatchWithDate) {
      return moment(firstMatchWithDate.date_match).format("dddd D [de] MMMM");
    }
    return "Sábado 28 de septiembre";
  };

  return (
    <div className="contenedor-principal">
      {!(Number(idsport) === 16 || Number(idsport) === 17) && (
        <HeaderSection
          title={isPosiciones ? "TABLA DE POSICIONES" : "RESULTADOS"} // Cambiar el título si es posiciones
          subtitle={
            isPosiciones
              ? "POSICIONES - FASE DE GRUPOS"
              : `RESULTADOS - ${
                  idtypephase === "2" ? "FASE ELIMINATORIA" : "FASE DE GRUPOS"
                }`
          }
          color={headerColor}
        />
      )}

      <div className="fecha-container">
        <p>
          <strong>
            Fecha {nrofecha} <br />
            {getFirstDate()}
          </strong>
        </p>
      </div>

      {isPosiciones ? (
        <PosicionesTable
          idevent={idevent}
          idsport={idsport}
          color={headerColor} // Pasar el color a la tabla de posiciones también
        />
      ) : idtypephase === "1" ? (
        grupos.map((grupo, index) => {
          const grupoMatches = matchesPorGrupo(grupo.grupoId);
          return (
            grupoMatches.length > 0 && (
              <ResultadosTable
                key={index}
                grupo={grupo}
                matches={grupoMatches}
                color={headerColor} // Pasar el color a la tabla
                idsport={idsport} // Pasar idsport para manejar periodos en voley
              />
            )
          );
        })
      ) : (
        <ResultadosTable
          grupo={{ letra: "FASE ELIMINATORIA" }}
          matches={matches}
          color={headerColor}
          idsport={idsport}
        />
      )}
    </div>
  );
};

export default FechaSection;
