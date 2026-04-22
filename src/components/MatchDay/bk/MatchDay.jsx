import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/config.js";
import dayjs from "dayjs";
import { stateMatch } from "../../utils/stateMatch.js";
import ModalDetalle from "../Modal/ModalDetalle/ModalDetalle";
import { RiLiveFill } from "react-icons/ri";

const convertTo12HourFormat = (time) => {
  const [hour, minutes] = time.split(":");
  const hourInt = parseInt(hour, 10);
  const period = hourInt >= 12 ? "pm" : "am";
  const hour12 = hourInt % 12 || 12;
  return `${hour12}:${minutes}${period}`;
};

const MatchDay = ({ selectedDate, onDateChange }) => {
  const [matches, setMatches] = useState([]);
  const [sports, setSports] = useState({});
  const [openDetalle, setOpenDetalle] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const formatDate = (date) => {
    const currentYear = dayjs().year();
    const dateWithYear = `${date} ${currentYear}`;
    return dayjs(dateWithYear, "DD MMM YYYY").format("YYYY-MM-DD");
  };

  const getSport = async (idsport) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/sport?idsport=${idsport}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching sport:", error);
    }
  };

  useEffect(() => {
    const getMatches = async () => {
      try {
        console.log("select", selectedDate);
        const formattedDate = formatDate(selectedDate);
        const response = await axios.post(`${API_BASE_URL}/getmatchesperiod`, {
          date_match: formattedDate,
        });
        let fetchedMatches = response.data.filter((match) => !match.flag_bye);

        // Ordenar los matches por el campo 'time_match'
        fetchedMatches = fetchedMatches.sort((a, b) => {
          return a.time_match.localeCompare(b.time_match);
        });

        setMatches(fetchedMatches);

        console.log("matches", fetchedMatches);

        const sportsData = {};
        await Promise.all(
          fetchedMatches.map(async (match) => {
            if (!sportsData[match.idsport]) {
              const sportData = await getSport(match.idsport);
              sportsData[match.idsport] = sportData;
            }
          })
        );
        console.log("sport data", sportsData)
        setSports(sportsData);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    };
    getMatches();
  }, [selectedDate]);

  const handleOpenDetalle = (match) => {
    setSelectedMatch(match);
    setOpenDetalle(true);
  };

  // Función para manejar el cambio de fecha al 28 de Septiembre
  const handleGoToNextMatch = () => {
    onDateChange("2024-09-28");
  };

  return (
    <>
      <div className="mt-4 p-6 bg-white shadow-xl rounded-xl border-4 border-gray-200">
        <h2 className="text-2xl sm:text-xl font-extrabold text-gray-800 text-center tracking-widest uppercase">
          III FISU AMERICA GAMES CALI 2024
        </h2>
        <div className="mt-6 space-y-10">
          {matches.length > 0 ? (
            matches.map((match) => (
              <div
                key={match.idmatch}
                className="relative border-t border-gray-300 pt-6 cursor-pointer hover:bg-gray-50 transition-all duration-300"
                onClick={() => handleOpenDetalle(match)}
              >
                <div className="absolute left-0 top-0">
                  <p className="hidden sm:block text-indigo-500 text-sm sm:text-lg">
                    {sports[match.idsport]
                      ? `${sports[match.idsport].name} | ${
                          match.time_match
                            ? convertTo12HourFormat(match.time_match)
                            : "Hora"
                        }`
                      : "Cargando deporte..."}
                  </p>
                  <p className="block sm:hidden text-indigo-500 text-lg">
                    {sports[match.idsport]
                      ? `${
                          sports[match.idsport].acronym
                        } | ${convertTo12HourFormat(match.time_match)}`
                      : "Cargando deporte..."}
                  </p>
                </div>
                <div className="flex justify-center items-center text-center space-x-8 relative">
                  {/* Primer participante */}
                  <div className="flex items-center justify-center space-x-2 w-36">
                    <span className="font-semibold text-gray-800 text-sm sm:text-lg">
                      {match.Participant1 && match.Participant1.Institution
                        ? match.Participant1.Institution.abrev
                        : "Por definir"}
                    </span>
                    <img
                      src={`${match.Participant1.Institution.path_base}${match.Participant1.Institution.image_path}`}
                      alt="logo 1"
                      className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                    />
                  </div>

                  {/* Resultado */}
                  <div className="flex justify-center items-center w-36">
                    <span className="mx-4 text-2xl sm:text-4xl text-indigo-600 font-bold whitespace-nowrap">
                      {match.resultado1 !== null ? match.resultado1 : "0"} -{" "}
                      {match.resultado2 !== null ? match.resultado2 : "0"}
                    </span>
                  </div>

                  {/* Segundo participante */}
                  <div className="flex items-center justify-center space-x-2 w-36">
                    <img
                      src={`${match.Participant2.Institution.path_base}${match.Participant2.Institution.image_path}`}
                      alt="logo 2"
                      className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                    />
                    <span className="font-semibold text-gray-800 text-sm sm:text-lg">
                      {match.Participant2 && match.Participant2.Institution
                        ? match.Participant2.Institution.abrev
                        : "Por definir"}
                    </span>
                  </div>

                  {/* Estado del partido */}
                  <div
                    className={`absolute -top-5 right-0 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-2 ${
                      stateMatch(match.state).color
                    }`}
                  >
                    {match.state === 2 && (
                      <RiLiveFill className="animate-pulse text-red-600" />
                    )}
                    <span>{stateMatch(match.state).tag}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-600 font-semibold text-lg">
              <span className="border-b border-gray-400 transition-all duration-300 hover:border-b-2">
                No hay Enfrentamientos en esta fecha.
              </span>
            </div>
          )}
        </div>
      </div>
      {openDetalle && selectedMatch && (
        <ModalDetalle
          open={openDetalle}
          setOpen={setOpenDetalle}
          match={selectedMatch}
        />
      )}
    </>
  );
};

export default MatchDay;
