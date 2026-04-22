// src/sections/ListSportsSection.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/config.js";
import { Link, useParams } from "react-router-dom";

import CardSport from "../components/Cards/CardSport/CardSport";

const ListSportsSection = () => {
  const [sports, setSports] = useState([]);
  const [nameEvent, setNameEvent] = useState("Nombre del Evento");
  const [eventBanner, setEventBanner] = useState("");
  const [subTitleSport, setSubTitleSport] = useState("DEPORTES");
  const [typeDimension, setTypeDimension] = useState(1);

  const { idevent } = useParams();

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/categories/?idevent=${idevent}`
        );
        console.log(response.data);
        setSports(response.data);

        let nameEvent = await axios.get(
          `${API_BASE_URL}/championship/?idevent=${idevent}`
        );

        setNameEvent(nameEvent.data ? nameEvent.data.name : "Evento");
        setSubTitleSport(
          nameEvent.data && nameEvent.data.subTitleSports
            ? nameEvent.data.subTitleSports
            : "DEPORTES"
        );
        setTypeDimension(
          nameEvent.data && nameEvent.data.typeDimension
            ? nameEvent.data.typeDimension
            : 1
        );
        setEventBanner(nameEvent.data.event_banner);
      } catch (error) {
        console.error("Error fetching sports", error);
      }
    };

    if (idevent) {
      fetchSports();
    }
  }, [idevent]);

  return (
    <>
      <div
        className="flex flex-col items-center w-full"
        style={{ marginTop: "75px" }}
      >
        <div className="text-center mb-4 flex flex-col justify-center items-center">
          {eventBanner && (
            <div className="w-full flex justify-center">
              <img
                src={eventBanner}
                alt="Banner"
                className="w-full sm:w-full md:w-9/10 lg:w-9/10 xl:w-9/10 h-auto"
                style={{ objectFit: "cover", width: "92%" }}
              />
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 my-2">
            {nameEvent}
          </h2>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mt-4">
            {subTitleSport}
          </h3>

          {+idevent === 16 && (
            <a
              href="https://storage.googleapis.com/fedup_info/logos/clubs/Bases_Generales_COPA_ENERGIA_Y_PASION_2025_final.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
            >
              Descargar Bases
            </a>
          )}

          {+idevent === 80 && (
            <a
              href="https://storage.googleapis.com/fedup_info/images/puntuacion_general.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
            >
              Descargar Puntuación Final
            </a>
          )}

          {(+idevent === 214 || +idevent === 215 || +idevent === 216 || +idevent === 218) && (
            <a
              href={`/torneos/${idevent}/puntaje-general`}
              rel="noopener noreferrer"
              className="mt-4 inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
            >
              Ver Puntuación Final
            </a>
          )}

          {(+idevent === 72 || +idevent === 74) && (
            <Link
              to={`/torneos/${idevent}/tabla-acumulada`}
              className="mt-4 inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm transition-colors"
            >
              Ver Tabla Acumulada
            </Link>
          )}
        </div>
        <div className="mt-4 w-full max-w-6xl">
          <div
            className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${typeDimension === 2 ? "lg:grid-cols-4" : "lg:grid-cols-3"
              } justify-items-center`}
          >
            {sports.map((sport, index) => (
              <div key={index}>
                <CardSport sport={sport.sport} typeDimension={typeDimension} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ListSportsSection;
