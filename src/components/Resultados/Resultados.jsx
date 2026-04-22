import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/config.js";
import Bandera2 from "../Bandera/Bandera2.jsx";
import { Tab } from "@headlessui/react";
import { TbShirtFilled } from "react-icons/tb";
import { GiGloves } from "react-icons/gi";
import "./Resultados.css";
import moment from "moment";
import { useParams, Link } from "react-router-dom";
import { stateMatch } from "../../utils/stateMatch.js";
import { formatIdSport } from "../../utils/formatIdSport.js";
import BracketResumido from "../BracketsResumido/BracketResumido";
import ModalDetalle from "../Modal/ModalDetalle/ModalDetalle";
import ModalOptionesDownload from "../Modal/ModalOptionsDownload/ModalOptionsDownload"
import { RiLiveFill } from "react-icons/ri";

const Resultados = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState("1");
  const [nroFechasGrupo, setNroFechasGrupo] = useState(0);
  const [nroEtapasFinal, setNroEtapasFinal] = useState(0);
  const [moodName, setMoodName] = useState(1); // Estado para almacenar moodName
  const [useBandera, setUseBandera] = useState(false);
  const [fechas, setFechas] = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [matches, setMatches] = useState([]);
  const [openDetalle, setOpenDetalle] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const [selectedGroupDate, setSelectedGroupDate] = useState("1"); // Fecha para fase de grupos
  const [selectedEliminationStage, setSelectedEliminationStage] = useState("1"); // Etapa para fase de eliminación
  const [isHavePrevias, setIsHavePrevias] = useState(false);
  const [nro_grupos, setNro_grupos] = useState(false);

  const [sport, setSport] = useState(null);

  const { idevent, idsport } = useParams();

  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dots, setDots] = useState("");

  const [openModalOptionsDownload, setOpenModalOptionsDownload] = useState(false)

  // Efecto para los puntos animados
  useEffect(() => {
    if (!loading) return; // sólo mientras carga
    const frames = ["", ".", "..", "..."];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % frames.length;
      setDots(frames[idx]);
    }, 250); // cada 500ms cambia
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!idevent || !idsport) return;

    const init = async () => {
      // 1) Traer configuración
      const { data } = await axios.post(`${API_BASE_URL}/config_category`, {
        idevent,
        idsport,
      });
      setNroFechasGrupo(data.nro_fechas_grupo);
      setNroEtapasFinal(data.nro_etapas_final);
      setMoodName(data.moodName);
      setUseBandera(data.useBandera);
      setIsHavePrevias(data.isHavePrevias);
      setNro_grupos(data.nro_grupos);

      // Generar arrays
      setFechas(
        Array.from({ length: data.nro_fechas_grupo }, (_, i) => String(i + 1))
      );
      setEtapas(
        ["Octavos", "Cuartos", "Semis", "Final"].slice(
          4 - data.nro_etapas_final
        )
      );

      // 2) Decidir fase y fecha/etapa inicial
      const initialPhase = data.nro_fechas_grupo > 0 ? 1 : 2;
      let initialDate = "1";

      // si es un deporte con fecha “2” por defecto
      if (
        initialPhase === 1 &&
        (Number(idsport) === 44 || Number(idsport) === 45)
      ) {
        initialDate = "2";
      }

      // ajustar estado de pestaña / selectores
      if (initialPhase === 2) {
        setSelectedIndex(1);             // ir a Eliminación
        setSelectedDate(initialDate);    // si tuvieras selector de fecha para fase 2
      } else {
        setSelectedGroupDate(initialDate);
        setSelectedDate(initialDate);
      }

      // 3) Traer partidos con fase y fecha correctas
      await getMatches(initialPhase, initialDate);

      // 4) Cargar info del deporte
      const sportRes = await axios.get(
        `${API_BASE_URL}/sport/?idsport=${idsport}`
      );
      setSport(sportRes.data);
    };

    init();
  }, [idevent, idsport]);


  const handleOpenDetalle = (match) => {
    setSelectedMatch(match); // Guardar el enfrentamiento seleccionado
    setOpenDetalle(true); // Abrir el modal
  };

  const getMatches = async (idtypephase, nro_fecha) => {
    try {
      setLoading(true);
      const requestBody = {
        idevent: idevent,
        idsport: idsport,
        nro_fecha: nro_fecha,
        idtypephase: idtypephase
        // ...(sport && sport.typeSport === 1 && { idtypephase: idtypephase }),
      };

      if (sport && (sport.typeSport === 2 || sport.typeSport === 3)) {
        delete requestBody.idtypephase
      }

      const response = await axios.post(
        // `${API_BASE_URL}/getmatches`,
        `${API_BASE_URL}/getmatchesperiod`,
        requestBody
      );

      let fetchedMatches = response.data;

      // Ordenar los partidos por `time_match`, si `time_match` está disponible
      fetchedMatches = fetchedMatches.sort((a, b) => {
        const timeA = a.time_match ? moment(a.time_match, "HH:mm") : null;
        const timeB = b.time_match ? moment(b.time_match, "HH:mm") : null;

        // Si alguno no tiene `time_match`, lo coloca al final
        if (!timeA || !timeB) return 0;

        // Comparar los tiempos
        return timeA.isBefore(timeB) ? -1 : 1;
      });

      setMatches(fetchedMatches);
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const idtypephase = selectedIndex === 0 ? 1 : 2;

    // Llama a getMatches con el estado correspondiente
    if (selectedIndex === 0) {
      getMatches(idtypephase, selectedGroupDate);
    } else {
      getMatches(idtypephase, selectedEliminationStage);
    }
  }, [selectedIndex, selectedGroupDate, selectedEliminationStage]);

  const groupLabel = (groupId) => {
    return String.fromCharCode(64 + groupId);
  };

  const formattedSport = formatIdSport(idsport);
  console.log("formatteddd", formattedSport)

  const handleOpenModalOptionsDownload = () => {
    setOpenModalOptionsDownload(true)
  }

  return (
    <div className="container_estadistica mx-auto p-4 font-quickSand">
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className="flex justify-center space-x-1 rounded-lg bg-gray-100 p-1">
          {nroFechasGrupo > 0 && (
            <Tab
              className={({ selected }) =>
                selected
                  ? "tab_selected w-full py-2.5 text-sm font-medium leading-5"
                  : "tab_unselected w-full py-2.5 text-sm font-medium leading-5"
              }
            >
              {sport && sport.typeSport === 1 ? "Fase de Grupos" : "Resultados"}
            </Tab>
          )}
          {nroEtapasFinal > 0 && (
            <Tab
              className={({ selected }) =>
                selected
                  ? "tab_selected w-full py-2.5 text-sm font-medium leading-5"
                  : "tab_unselected w-full py-2.5 text-sm font-medium leading-5"
              }
            >
              Fase de Eliminación
            </Tab>
          )}
        </Tab.List>
        <Tab.Panels className="mt-2">
          {nroFechasGrupo > 0 && (
            <Tab.Panel>
              <div className="title-container mb-4">
                <h4 className="title text-center text-3xl font-semibold text-gray-700">
                  FECHAS
                </h4>
              </div>
              <div className="flex justify-center mb-8 space-x-2">
                {/* {fechas.map((fecha) => (
                  <button
                    key={fecha}
                    className={`fechas_button ${selectedGroupDate === fecha ? "selected_date" : "unselected_date"
                      }`}
                    onClick={() => setSelectedGroupDate(fecha)}
                  >
                    <span className="tag_fecha">Fecha</span> {fecha}
                  </button>
                ))} */}
                {fechas.map((fecha, index) => (
                  <button
                    key={fecha}
                    className={`fechas_button ${selectedGroupDate === fecha ? "selected_date" : "unselected_date"
                      }`}
                    onClick={() => setSelectedGroupDate(fecha)}
                  >
                    {/* <span className="tag_fecha">Fecha</span> {fecha} */}
                    {
                      index === 0 && isHavePrevias === true ? (
                        <>
                          <span className="tag_fecha">Previas</span>
                        </>
                      ) : (
                        <>
                          <span className="tag_fecha">Fecha</span> {isHavePrevias === true ? fecha - 1 : fecha}
                        </>
                      )
                    }
                  </button>
                ))}
              </div>
            </Tab.Panel>
          )}
          {nroEtapasFinal > 0 && (
            <Tab.Panel>
              <div className="title-container mb-4">
                <h4 className="title text-center text-3xl font-semibold text-gray-700">
                  ETAPAS
                </h4>
              </div>
              <div className="flex justify-center mb-8 space-x-2">
                {etapas.map((etapa, index) => (
                  <button
                    key={index}
                    className={`fechas_button ${selectedEliminationStage === String(index + 1) ? "selected_date" : "unselected_date"
                      }`}
                    onClick={() => setSelectedEliminationStage(String(index + 1))}
                  >
                    {etapa}
                  </button>
                ))}

              </div>
            </Tab.Panel>
          )}
        </Tab.Panels>
      </Tab.Group>

      {/* <div className="w-100 flex justify-center mt-5 mb-4" style={{ marginTop: "-10px" }}>
        <button
          // onClick={handleDownloadProgramacion}
          onClick={handleOpenModalOptionsDownload}
          disabled={isDownloading}
          className={`
          inline-flex items-center gap-2
          bg-red-600 hover:bg-red-700 active:bg-red-800
          text-white font-semibold tracking-wide
          px-5 py-3 rounded-lg shadow-md
          transition transform hover:-translate-y-0.5 active:translate-y-0
          focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2
          ${isDownloading ? "opacity-70 cursor-not-allowed" : ""}
        `}
        >
          {isDownloading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none" viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 5v13m0 0l-4-4m4 4l4-4M4 16v2a2 2 0 002 2h12
                 a2 2 0 002-2v-2" />
            </svg>
          )}

          <span>
            {isDownloading ? "Descargando..." : "Descargar Resultados (PDF)"}
          </span>
        </button>
      </div> */}

      <div className="cards_container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="w-full col-span-1 md:col-span-2 p-4">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
              Cargando Enfrentamientos{dots}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white rounded-lg shadow-lg p-6 space-y-4"
                >
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        ) :
          matches
            .filter((match) => !match.flag_bye) // Filtra los partidos con flag_bye
            .map((match) => {
              const matchState = stateMatch(match.state);

              return (
                <div
                  key={match.idmatch}
                  className="card bg-white p-6 rounded-lg shadow-lg cursor-pointer flex flex-col items-center relative pb-10"
                  onClick={() => handleOpenDetalle(match)}
                >
                  {match.tag_extra && (
                    <span className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-semibold uppercase px-2 py-0.5 rounded-md shadow">
                      {match.tag_extra.toUpperCase()}
                    </span>
                  )}

                  <div
                    className={`not_disputed_dot flex items-center space-x-1 ${match.flagWO !== null
                      ? " bg-gray-800 text-white"
                      : matchState.color
                      } rounded-full absolute top-2 left-2`}
                    style={{ fontSize: "0.7rem", padding: "1px 6px" }}
                  >
                    {match.state === 2 && (
                      <RiLiveFill className="animate-pulse" />
                    )}
                    {match.flagWO === null && matchState.tag}{" "}
                    {match.flagWO !== null
                      ? match.flagWO === 999
                        ? "Doble W.O."
                        : "W.O."
                      : null}
                  </div>
                  <div className="absolute top-2 right-2">
                    {match.date_match
                      ? moment(match.date_match).format("DD/MM/YYYY")
                      : ""}
                  </div>
                  <div className="text-center mb-4">
                    <span
                      className={`relative inline-block px-3 py-1 rounded-lg font-bold uppercase ${match.flag_tag_resaltante
                        ? 'bg-red-600 text-white before:content-[""] before:absolute before:inset-0 before:rounded-lg before:border-4 before:border-red-400 before:animate-ping'
                        : 'bg-gray-200 text-gray-800'
                        }`}
                    >
                      {match?.idgrupo ? sport && sport.typeSport === 1
                        ? selectedIndex === 0
                          ? `GRUPO ${groupLabel(match.idgrupo)}`
                          : match.tag_final
                        : match.tag_final : match.tag_final}
                    </span>

                    {match.description_match && (
                      <span className="block mt-1 text-xs px-1 py-0.5 bg-gray-100 text-gray-600 rounded-md shadow-sm">
                        {match.description_match}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-around items-center gap-2 sm:gap-4 mb-4 relative w-full">
                    <div className="team_icon w-16 min-h-16 flex flex-col items-center relative">
                      <div className="circle w-12 h-12 rounded-full flex items-center justify-center mb-2 rounded-full">
                        {match.Participant1 ? (
                          <>
                            <img
                              src={`${match.Participant1?.Institution?.path_base}${match.Participant1?.Institution?.image_path}`}
                              alt={
                                moodName === 1
                                  ? match.Participant1?.Institution?.abrev
                                  : match.Participant1?.Institution?.name ||
                                  "Pendiente"
                              }
                              className="w-12 h-12 img_logo"
                            />
                            {useBandera && (
                              <Bandera2
                                src={
                                  match.Participant1?.Institution?.country
                                    ?.img_path || ""
                                }
                                alt="imagen"
                              />
                            )}
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-gray-300 rounded-full flex justify-center items-center">
                              <span className="text-gray-500"></span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="text-[11px] sm:text-xs font-semibold text-gray-900 text-center leading-tight break-words whitespace-normal px-1"
                        style={{ unicodeBidi: "plaintext", overflowWrap: "anywhere", wordBreak: "break-word" }}>
                        {moodName === 1
                          ? match.Participant1?.Institution?.abrev
                          : match.Participant1?.Institution?.name ||
                          "Por Definir"}
                      </div>
                    </div>

                    {/* Aquí se muestran los sets y periodos para voleibol */}
                    {formattedSport === 3 ? (
                      <>
                        <div className="score text-3xl font-bold mx-4 text-gray-900 flex">
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
                        <div className="score text-3xl font-bold mx-4 text-gray-900 flex">
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
                      </>
                    ) : formattedSport === 4 ?
                      (
                        <>
                          <div className="score text-3xl font-bold mx-4 text-gray-900 flex">
                            <div className="text-center mr-1">
                              {match.periods &&
                                match.periods.map((period, idx) => (
                                  <div key={idx} className="text-xs text-gray-500">
                                    {
                                      // idx === 2 &&
                                      period.puntos1 === 0 &&
                                        period.puntos2 === 0
                                        ? null
                                        : period.puntos1}
                                  </div>
                                ))}
                            </div>
                            {match.resultado1}
                          </div>
                          <span className="text-xl font-bold">vs</span>
                          <div className="score text-3xl font-bold mx-4 text-gray-900 flex">
                            {match.resultado2}
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
                        </>
                      )
                      : (
                        <>
                          {console.log("matchsdas", match, formattedSport, (match.defpenal1 > 0 || match.defpanel2 > 0))}
                          {console.log("asdasda", match.defpenal1, match.defpanel2)}
                          <div className="score text-3xl font-bold mx-4 text-gray-900">
                            <span className="text-sm align-middle">
                              {(formattedSport === 1 ||
                                formattedSport === 2 ||
                                formattedSport === 5) &&
                                (match.defpenal1 > 0 || match.defpenal2 > 0)
                                ? ` (${match.defpenal1})`
                                : ""}
                            </span>
                            {match.resultado1}
                          </div>
                          <span className="text-xl font-bold">vs</span>
                          <div className="score text-3xl font-bold mx-4 text-gray-900">
                            {match.resultado2}
                            <span className="text-sm align-middle">
                              {(formattedSport === 1 ||
                                formattedSport === 2 ||
                                formattedSport === 5) &&
                                (match.defpenal1 > 0 || match.defpenal2 > 0)
                                ? ` (${match.defpenal2})`
                                : ""}
                            </span>
                          </div>
                        </>
                      )}

                    <div className="team_icon w-16 min-h-16 flex flex-col items-center relative">
                      <div className="circle w-12 h-12 rounded-full flex items-center justify-center mb-2">
                        {match.Participant2 ? (
                          <>
                            <img
                              src={`${match.Participant2?.Institution?.path_base}${match.Participant2?.Institution?.image_path}`}
                              alt={
                                moodName === 1
                                  ? match.Participant2?.Institution?.abrev
                                  : match.Participant2?.Institution?.name ||
                                  "Pendiente"
                              }
                              className="w-12 h-12 img_logo"
                            />
                            {useBandera && (
                              <Bandera2
                                src={
                                  match.Participant2?.Institution?.country
                                    ?.img_path || ""
                                }
                                alt="imagen"
                              />
                            )}
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-gray-300 rounded-full flex justify-center items-center">
                              <span className="text-gray-500"></span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="text-[11px] sm:text-xs font-semibold text-gray-900 text-center leading-tight break-words whitespace-normal px-1"
                        style={{ unicodeBidi: "plaintext", overflowWrap: "anywhere", wordBreak: "break-word" }}>
                        {moodName === 1
                          ? match.Participant2?.Institution?.abrev
                          : match.Participant2?.Institution?.name ||
                          "Por Definir"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
      {openDetalle && selectedMatch && (
        <ModalDetalle
          open={openDetalle}
          setOpen={setOpenDetalle}
          match={selectedMatch}
        />
      )}
      {openModalOptionsDownload && (
        <ModalOptionesDownload open={openModalOptionsDownload} setOpen={setOpenModalOptionsDownload} nro_grupos={nro_grupos} nroFechasGrupo={nroFechasGrupo} />
      )
      }
    </div>
  );
};

export default Resultados;
