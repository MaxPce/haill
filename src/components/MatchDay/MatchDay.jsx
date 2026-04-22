import React, { useEffect, useState, useMemo } from "react";
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
  const [selectedSports, setSelectedSports] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingDots, setLoadingDots] = useState("");
  const [campeonatos, setCampeonatos] = useState([]);
  const yearSelected = 2025;
  const [moodName, setMoodName] = useState(1);
  const [selectedVenues, setSelectedVenues] = useState({});

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setLoadingDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 225);
    return () => clearInterval(dotsInterval);
  }, []);

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
      setLoading(true);
      try {
        const formattedDate = formatDate(selectedDate);
        const response = await axios.post(`${API_BASE_URL}/getmatchesperiod`, {
          date_match: formattedDate,
        });
        console.log("lista de matches", response.data, formattedDate)
        let fetchedMatches = response.data.filter((match) => !match.flag_bye);

        // fetchedMatches = fetchedMatches.sort((a, b) =>
        //   a.time_match.localeCompare(b.time_match)
        // );
        fetchedMatches = fetchedMatches.sort((a, b) => {
          const timeA = a.time_match || "";
          const timeB = b.time_match || "";
          return timeA.localeCompare(timeB);
        });

        setMatches(fetchedMatches);

        const sportsData = {};
        await Promise.all(
          fetchedMatches.map(async (match) => {
            if (!sportsData[match.idsport]) {
              const sportData = await getSport(match.idsport);
              sportsData[match.idsport] = sportData;
            }
          })
        );
        setSports(sportsData);

        // Ahora: todos los deportes desmarcados por defecto
        const initialSelectedSports = Object.keys(sportsData).reduce(
          (acc, key) => ({ ...acc, [key]: false }), // ahora todos vienen desmarcados
          {}
        );
        setSelectedSports(initialSelectedSports);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false); // 🔹 Desactivar el estado de carga al terminar
      }
    };
    getMatches();
  }, [selectedDate]);

  useEffect(() => {
    const getCampeonatos = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/championships/?periodo=${yearSelected}`
        );

        console.log("eventos", response.data);

        // Convertir array en objeto { idchampionship: { ...datos } }
        const campeonatosMap = response.data.reduce((acc, championship) => {
          acc[championship.idchampionship] = championship;
          return acc;
        }, {});

        setCampeonatos(campeonatosMap);
      } catch (error) {
        console.error("Error fetching championships:", error);
      }
    };

    getCampeonatos();
  }, []);

  const handleSportSelection = (idsport) => {
    setSelectedSports((prev) => ({
      ...prev,
      [idsport]: !prev[idsport],
    }));
  };

  // const filteredMatches = matches.filter(
  //   (match) => selectedSports[match.idsport]
  // );
  // const filteredMatches = matches.filter(
  //   (match) =>
  //     selectedSports[match.idsport] && // Filtra por deporte
  //     (Object.keys(selectedVenues).length === 0 ||  // Si no hay sede seleccionada, muestra todos
  //       (match.sede?.name ? selectedVenues[match.sede.name] : true)) // Si no tiene sede, igual se muestra
  // );

  // ¿Hay al menos un deporte marcado?
  const anySportSelected = Object.values(selectedSports).some(v => v);
  // ¿Hay al menos una sede marcada?
  const anyVenueSelected = Object.values(selectedVenues).some(v => v);

  const filteredMatches = matches.filter(match => {
    // chequeo deporte: si marqué alguno, sólo esos; si no marqué ninguno, todos
    const passSport = anySportSelected
      ? selectedSports[match.idsport]
      : true;

    // chequeo sede: si marqué alguna, sólo esas; si no marqué ninguna, todos
    const venueName = match.sede?.name;
    const passVenue = anyVenueSelected
      ? !!selectedVenues[venueName]
      : true;

    return passSport && passVenue;
  });

  // Agrupación de todos los matches, sin aplicar filtros
  const groupedAllMatches = useMemo(() => {
    const grouped = {};
    matches.forEach(match => {
      if (!grouped[match.idevent]) grouped[match.idevent] = [];
      grouped[match.idevent].push(match);
    });
    return grouped;
  }, [matches]);


  // const filteredMatches = matches.filter(
  //   (match) =>
  //     selectedSports[match.idsport]
  // );


  const handleOpenDetalle = (match) => {
    setSelectedMatch(match);
    setOpenDetalle(true);
  };

  // const groupedMatches = useMemo(() => {
  //   const grouped = {};
  //   matches.forEach((match) => {
  //     if (!grouped[match.idevent]) {
  //       grouped[match.idevent] = [];
  //     }
  //     grouped[match.idevent].push(match);
  //   });
  //   return grouped;
  // }, [matches]);
  // Agrupación de los matches que PASAN los filtros
  const groupedFilteredMatches = useMemo(() => {
    const grouped = {};
    filteredMatches.forEach(match => {
      if (!grouped[match.idevent]) grouped[match.idevent] = [];
      grouped[match.idevent].push(match);
    });
    return grouped;
  }, [filteredMatches]);

  return (
    <>
      {
        loading ? (
          <div className="flex justify-center items-center py-4">
            <span className="text-lg font-semibold">Cargando enfrentamientos para esta fecha...</span>
          </div>
        ) :
          (
            <div>
              {/* Si no hay ningún evento en la fecha, muestro sólo ese mensaje global */}
              {!loading && Object.keys(groupedAllMatches).length === 0 && (
                <div className="mt-4 p-6 bg-white shadow-xl rounded-xl border-4 border-gray-200">
                  <div className="text-center text-gray-600 font-semibold text-xl">
                    No hay enfrentamientos programados para este día.
                  </div>
                </div>
              )}

              {Object.entries(groupedAllMatches).map(([eventId, eventMatches]) => (
                <div key={eventId} className="mt-4 p-6 bg-white shadow-xl rounded-xl border-4 border-gray-200">
                  {/* Aquí se muestra el nombre del evento dinámicamente */}
                  <h2 className="text-2xl sm:text-xl font-extrabold text-gray-800 text-center tracking-widest uppercase">
                    {campeonatos[eventId]?.name || `Evento ${eventId}`}
                  </h2>

                  <div className="mt-4">
                    <h3 className="font-bold text-lg mb-2">Filtrar por Deporte:</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.values(sports).map((sport) => (
                        <label
                          key={sport.idsport}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSports[sport.idsport] || false}
                            onChange={() => handleSportSelection(sport.idsport)}
                          />
                          <span>{sport.name} ({sport.acronym})</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <h3 className="font-bold text-lg mb-2">Filtrar por Sede:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from(
                      new Set(matches
                        .map((match) => match.sede?.name) // Extrae los nombres de sede (incluye undefined)
                        .filter(Boolean)) // Elimina los valores nulos o undefined
                    ).map((venue) => (
                      <label key={venue} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedVenues[venue] || false}
                          onChange={() =>
                            setSelectedVenues((prev) => ({
                              ...prev,
                              [venue]: !prev[venue],
                            }))
                          }
                        />
                        <span>{venue}</span>
                      </label>
                    ))}
                  </div>

                  {groupedFilteredMatches[eventId]?.length > 0 ? (
                    <div className="mt-6 space-y-10">
                      {
                        groupedFilteredMatches[eventId].map(match => (
                          <div
                            key={match.idmatch}
                            className="relative border-t border-gray-300 pt-6 cursor-pointer hover:bg-gray-50 transition-all duration-300"
                            onClick={() => handleOpenDetalle(match)}
                          >
                            {/* Código del match aquí */}
                            <div className="absolute left-0 top-0">
                              {sports[match.idsport] &&
                                match.Participant1 === null &&
                                match.Participant2 === null &&
                                sports[match.idsport]?.typeSport !== 3 ? (
                                // Si los participantes son nulos y el deporte no es de tipo 3
                                <>
                                  {/* Versión de escritorio */}
                                  {/* <p className="hidden sm:block text-indigo-500 text-sm sm:text-lg">
                                {`${sports[match.idsport].name} | ${match.time_match ? convertTo12HourFormat(match.time_match) : "Hora"
                                  } | ${match.tag_final}`}
                              </p> */}
                                  <p className="hidden sm:block text-indigo-500 text-sm sm:text-lg">
                                    {`${sports[match.idsport].name} | ${match.time_match ? convertTo12HourFormat(match.time_match) : "Hora"
                                      } | ${match.tag_final} | ${match.sede.name}`}
                                  </p>

                                  {/* Versión móvil */}
                                  <p className="block sm:hidden text-indigo-500 text-lg">
                                    {`${sports[match.idsport].acronym} | ${match.time_match ? convertTo12HourFormat(match.time_match) : "Hora"
                                      } | ${match.tag_final} | ${match.sede.name}`}
                                  </p>
                                </>
                              ) : (
                                // Renderizado normal para otros casos
                                <>
                                  <p className="hidden sm:block text-indigo-500 text-sm sm:text-lg">
                                    {sports[match.idsport]
                                      ? `${sports[match.idsport].name} | ${match.time_match ? convertTo12HourFormat(match.time_match) : "Hora"
                                      // } | ${match?.sede?.name}`
                                      } | ${match?.sede?.name} | ${match?.tag_final}`
                                      : "Cargando deporte..."}
                                  </p>
                                  <p className="block sm:hidden text-indigo-500 text-lg">
                                    {sports[match.idsport]
                                      ? `${sports[match.idsport].acronym} | ${match.time_match ? convertTo12HourFormat(match.time_match) : ""
                                      } ${match?.sede?.name}`
                                      : "Cargando deporte..."}
                                  </p>
                                </>
                              )}
                            </div>
                            <div className="flex justify-center items-center text-center space-x-8 relative">
                              {sports[match.idsport]?.typeSport === 3 ? (
                                <div className="font-semibold text-gray-800 text-sm sm:text-lg">
                                  {match.tag_final}
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center justify-center space-x-2 w-36">
                                    <span className="font-semibold text-gray-800 text-sm sm:text-lg">
                                      {/* {match.Participant1?.Institution?.abrev || "Por definir"} */}
                                      {moodName === 1
                                        ? match.Participant1?.Institution?.abrev
                                        : match.Participant1?.Institution?.name || "Por Definir"}
                                    </span>
                                    {
                                      match.Participant1?.Institution ? (<img
                                        src={`${match.Participant1?.Institution?.path_base}${match.Participant1?.Institution?.image_path}`}
                                        alt="logo 1"
                                        className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                                      />) :
                                        (
                                          <img
                                            src="/assets/icon/shield_icon.png"
                                            alt="logo 1"
                                            className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                                          />
                                        )
                                    }

                                  </div>

                                  <div className="flex justify-center items-center w-36">
                                    <span className="mx-4 text-2xl sm:text-4xl text-indigo-600 font-bold whitespace-nowrap">
                                      {/* {match.resultado1 ?? "0"} - {match.resultado2 ?? "0"} */}
                                      {
                                        match && (match.idsport === 16 || match.idsport === 17 || match.idsport === 100 || match.idsport === 101 || match.idsport === 102 || match.idsport === 103 || match.idsport === 104 || match.idsport === 999 || match.idsport === 113 || match.idsport === 114 || match.idsport === 115 || match.idsport === 116) ? (
                                          <>
                                            {/* {match.sets1 ?? "0"} - {match.sets2 ?? "0"} */}
                                            <div style={{ display: "flex" }}>
                                              <div className="score text-2xl sm:text-4xl font-bold mx-4 text-indigo-600 flex">
                                                <div className="text-center mr-1">
                                                  {match.periods &&
                                                    match.periods.map((period, idx) => (
                                                      <div key={idx} className="text-xs text-gray-500">
                                                        {
                                                          period.puntos1 === 0 &&
                                                            period.puntos2 === 0
                                                            ? null
                                                            : period.puntos1}
                                                      </div>
                                                    ))}
                                                </div>
                                                {match.sets1}
                                              </div>
                                              <span className="text-xl font-bold">vs</span>
                                              <div className="score text-2xl sm:text-4xl font-bold mx-4 text-indigo-600 flex">
                                                {match.sets2}
                                                <div className="text-center ml-1">
                                                  {match.periods &&
                                                    match.periods.map((period, idx) => (
                                                      <div key={idx} className="text-xs text-gray-500">
                                                        {
                                                          // idx === 2 &&
                                                          period.puntos1 === 0 &&
                                                            period.puntos2 === 0
                                                            ? null
                                                            : period.puntos2}
                                                      </div>
                                                    ))}
                                                </div>
                                              </div>
                                            </div>
                                          </>
                                        ) : (
                                          <>
                                            {match.resultado1 ?? "0"} - {match.resultado2 ?? "0"}
                                          </>
                                        )
                                      }
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-center space-x-2 w-36">
                                    {
                                      match.Participant2?.Institution ? (<img
                                        src={`${match.Participant2?.Institution?.path_base}${match.Participant2?.Institution?.image_path}`}
                                        alt="logo 2"
                                        className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                                      />) :
                                        (
                                          <img
                                            src="/assets/icon/shield_icon.png"
                                            alt="logo 2"
                                            className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                                          />
                                        )
                                    }
                                    <span className="font-semibold text-gray-800 text-sm sm:text-lg">
                                      {/* {match.Participant2?.Institution?.abrev || "Por definir"} */}
                                      {moodName === 1
                                        ? match.Participant2?.Institution?.abrev
                                        : match.Participant2?.Institution?.name || "Por Definir"}
                                    </span>
                                  </div>

                                  <div
                                    className={`absolute -top-5 right-0 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-2 ${stateMatch(match.state).color}`}
                                  >
                                    {match.state === 2 && (
                                      <RiLiveFill className="animate-pulse text-red-600" />
                                    )}
                                    <span>{stateMatch(match.state).tag}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  ) : (
                    <div className="text-center text-gray-600 font-semibold text-lg mt-6">
                      No hay enfrentamientos que coincidan con los filtros.
                    </div>
                  )}

                </div>
              ))}
            </div>
          )
      }
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