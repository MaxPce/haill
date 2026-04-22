import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/config.js";
import Bandera2 from "../Bandera/Bandera2";

import { Tab } from "@headlessui/react";
import { TbShirtFilled } from "react-icons/tb";
import { GiWinterGloves } from "react-icons/gi";
import { TbCircleLetterLFilled } from "react-icons/tb";
import { FaSocks } from "react-icons/fa6";
import { FaCalendarAlt } from "react-icons/fa";
import { MdAccessTime } from "react-icons/md";
import { MdPlace } from "react-icons/md";

import "./Programacion.css";
import moment from 'moment';
import 'moment/locale/es';

import { trackEvent } from "../../analytics.js";

import { useParams } from "react-router-dom";

import ModalDetalle from "../Modal/ModalDetalle/ModalDetalle";

const Programacion = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState("1");
  const [nroFechasGrupo, setNroFechasGrupo] = useState(0);
  const [nroEtapasFinal, setNroEtapasFinal] = useState(0);
  const [moodName, setMoodName] = useState(1); // Estado para almacenar moodName
  const [useBandera, setUseBandera] = useState(false);
  const [isHavePrevias, setIsHavePrevias] = useState(false);
  const [isHaveRepechaje, setIsHaveRepechaje] = useState(false);

  const [fechas, setFechas] = useState([]);
  const [etapas, setEtapas] = useState([]);
  const [matches, setMatches] = useState([]);

  const [openDetalle, setOpenDetalle] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const [sport, setSport] = useState(null);

  const [selectedGroupDate, setSelectedGroupDate] = useState("1"); // Fecha para fase de grupos
  const [selectedEliminationStage, setSelectedEliminationStage] = useState("1"); // Etapa para fase de eliminación
  const [selectedTipoUbi, setSelectedTipoUbi] = useState(1); // ← NUEVO

  const [isDownloading, setIsDownloading] = useState(false);

  const { idevent, idsport } = useParams();

  const [loading, setLoading] = useState(true);
  const [dots, setDots] = useState("");

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


  const handleOpenDetalle = (match) => {
    setSelectedMatch(match); // Guardar el enfrentamiento seleccionado
    setOpenDetalle(true); // Abrir el modal
  };

  // useEffect(() => {
  //   const getConfigCategory = async () => {
  //     const response = await axios.post(`${API_BASE_URL}/config_category`, {
  //       idevent: idevent,
  //       idsport: idsport,
  //     });
  //     const data = response.data;
  //     setNroFechasGrupo(data.nro_fechas_grupo);
  //     setNroEtapasFinal(data.nro_etapas_final);
  //     setMoodName(data.moodName); // Almacenar moodName en el estado
  //     setUseBandera(data.useBandera);
  //     setIsHavePrevias(data.isHavePrevias)
  //     const fechasArray = Array.from(
  //       { length: data.nro_fechas_grupo },
  //       (_, i) => String(i + 1)
  //     );
  //     setFechas(fechasArray);

  //     const etapasArray = ["Octavos", "Cuartos", "Semis", "Final"].slice(
  //       4 - data.nro_etapas_final
  //     );
  //     setEtapas(etapasArray);
  //   };

  //   const getSport = async () => {
  //     const sportResponse = await axios.get(
  //       `${API_BASE_URL}/sport/?idsport=${idsport}`
  //     );
  //     setSport(sportResponse.data);
  //   };

  //   if (idevent && idsport) {
  //     getConfigCategory();
  //     getMatches(1, 1); // Fetch initial matches for Fase de Grupos and nro_fecha 1
  //     getSport();
  //     // if (!idevent || !idsport) return;
  //     // getConfigCategory().then(() => {
  //     //   const phase = nroFechasGrupo > 0 ? 1 : 2;
  //     //   const dateOrStage = phase === 1 ? selectedGroupDate : selectedEliminationStage;
  //     //   getMatches(phase, dateOrStage);
  //     // });
  //     // getSport();
  //   }
  // }, [idevent, idsport, nroFechasGrupo]);
  useEffect(() => {
    if (!idevent || !idsport) return;

    const init = async () => {
      // 1) Traer configuración
      const configRes = await axios.post(`${API_BASE_URL}/config_category`, {
        idevent, idsport
      });
      const data = configRes.data;
      setNroFechasGrupo(data.nro_fechas_grupo);
      setNroEtapasFinal(data.nro_etapas_final);
      setMoodName(data.moodName);
      setUseBandera(data.useBandera);
      setIsHavePrevias(data.isHavePrevias);
      setIsHaveRepechaje(data.isHaveRepechaje);
      setFechas(Array.from({ length: data.nro_fechas_grupo }, (_, i) => String(i + 1)));
      setEtapas(["Octavos", "Cuartos", "Semis", "Final"].slice(4 - data.nro_etapas_final));

      // 2) Si no hay fechas de grupo, ir a pestaña Eliminación
      if (data.nro_fechas_grupo === 0 && data.nro_etapas_final > 0) {
        setSelectedIndex(1);
      }

      // 3) Llamar getMatches con fase 1 o 2
      const initialPhase = data.nro_fechas_grupo > 0 ? 1 : 2;
      await getMatches(initialPhase, "1");

      // 4) Traer info del deporte
      const sportRes = await axios.get(`${API_BASE_URL}/sport/?idsport=${idsport}`);
      setSport(sportRes.data);
    };

    init();
  }, [idevent, idsport]);


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
  }, [selectedIndex, selectedGroupDate, selectedEliminationStage])

  /* ─────────────────── DEFAULT tipo_ubi ───────────── */
  useEffect(() => {
    if ((Number(idevent) === 197 || Number(idevent) === 212) && selectedIndex === 1) {
      setSelectedTipoUbi(selectedEliminationStage === "2" ? 1 : 3);
    }
  }, [idevent, selectedIndex, selectedEliminationStage]);


  const groupLabel = (groupId) => {
    return String.fromCharCode(64 + groupId);
  };

  const renderUniformeExclusivo = (uniforme_exclusivo, idsport) => {
    if (
      idsport === "5" ||
      idsport === "42" ||
      idsport === "6" ||
      idsport === "7"
    ) {
      return (
        <div className="flex justify-center items-center gap-1 text-sm">
          <GiWinterGloves />
          <span>{uniforme_exclusivo ? uniforme_exclusivo : "-"}</span>
        </div>
      );
    } else if (idsport === "16" || idsport === "17") {
      return (
        <div className="flex justify-center items-center gap-1 text-sm">
          <TbCircleLetterLFilled />
          <span>{uniforme_exclusivo ? uniforme_exclusivo : "-"}</span>
        </div>
      );
    } else {
      return null;
    }
  };

  const renderUniformeMedias = (uniforme_medias, idsport) => {
    if (Number(idevent) === 1 && (idsport === "6" || idsport === "7")) {
      return (
        <div className="flex justify-center items-center gap-1 text-sm">
          <FaSocks />
          <span>{uniforme_medias ? uniforme_medias : "-"}</span>
        </div>
      )
    }
  }

  /* ─────────────────── DESCARGAR PDF ─────────────── */
  const handleDownloadProgramacion = async () => {
    trackEvent({ category: "Botón", action: "Descarga programación", label: "PDF Programación" });
    setIsDownloading(true);
    try {
      /* 1 · selecciona URL */
      console.log("selectedEliminationStage", selectedEliminationStage)
      const url =
        selectedIndex === 1
          ? ((Number(idevent) === 197 || Number(idevent) === 212) && selectedEliminationStage != "1")
            ? `${API_BASE_URL}/programacionfasefinaldivpdf` // tipo de ubicacion
            : `${API_BASE_URL}/programacionfasefinalpdf` // fase final normal
          : `${API_BASE_URL}/programacionpdf`; // fase de grupos

      /* 2 · payload */
      let payload;
      if (selectedIndex === 1) {
        payload = { idevent, idsport, selectedIndex, selectedEliminationStage, isFromHayllis: true };
        if (((Number(idevent) === 197 || Number(idevent) === 212) && selectedEliminationStage != "1")) payload.tipo_ubi = selectedTipoUbi;
        console.log("payload", payload)
      } else {
        // payload = { idevent, idsport, selectedIndex, selectedGroupDate, selectedEliminationStage, isFromHayllis: true };
        payload = { idevent, idsport, selectedIndex, selectedGroupDate, selectedEliminationStage, isFromHayllis: false };
      }

      /* 3 · petición */
      const { data, headers } = await axios.post(url, payload, { responseType: "arraybuffer" });
      if (!(headers["content-type"] ?? "").startsWith("application/pdf")) {
        alert("Error: el servidor no pudo generar el PDF");
        return;
      }
      const disp = headers["content-disposition"];
      let filename = "programacion.pdf";
      if (disp) {
        const m = disp.match(/filename="?([^";]+)"?/);
        if (m) filename = m[1];
      }
      const blob = new Blob([data], { type: "application/pdf" });
      const blobURL = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobURL;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(blobURL);
    } catch (e) {
      console.error(e);
      alert("No se pudo generar el PDF");
    } finally {
      setIsDownloading(false);
    }
  };
  /* ─────────────────── RENDER ─────────────────────── */
  const renderTipoUbiRadios = () => {
    if ((Number(idevent) !== 197 && Number(idevent) !== 212) || selectedIndex !== 1) return null;
    if (selectedEliminationStage !== "2" && selectedEliminationStage !== "3") return null;

    const isSemi = selectedEliminationStage === "2";
    const radios = isSemi
      ? [
        {
          value: 1,
          label: (
            <>
              PROGRAMACION SEMIFINAL - IDA<br />PROGRAMACION SEMIFINAL - POR EL 5° PUESTO<br />PROGRAMACION - 9° LUGAR y 11° LUGAR
            </>
          ),
        },
        {
          value: 2,
          label: (
            <>
              PROGRAMACION SEMIFINAL - VUELTA<br />PROGRAMACION - 5° LUGAR y 7° LUGAR
            </>
          ),
        },
      ]
      : [
        { value: 3, label: <>PROGRAMACION FINAL - IDA</> },
        {
          value: 4,
          label: (
            <>
              PROGRAMACION FINAL - VUELTA<br />PROGRAMACION - 3° LUGAR
            </>
          ),
        },
      ];

    return (
      <fieldset className="mt-4 mb-4 flex gap-3 text-sm text-gray-800">
        {radios.map((r) => (
          <label key={r.value} className="inline-flex gap-2 items-start">
            <input
              type="radio"
              name="tipoUbi"
              value={r.value}
              checked={selectedTipoUbi === r.value}
              onChange={() => setSelectedTipoUbi(r.value)}
            />
            <span>{r.label}</span>
          </label>
        ))}
      </fieldset>
    );
  };

  const formatFechaConDia = fecha => {
    if (!fecha) return '';
    // formatea en español: dddd → día de la semana completo, DD → 2 dígitos, [de] MMMM → “de Mes”
    const str = moment(fecha)
      .locale('es')
      .format('dddd DD [de] MMMM');
    // capitaliza la primera letra (de “martes…” a “Martes…”)
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // ↑ Dentro de tu componente (arriba del JSX)
  const URLS_BY_SPORT = {
    121: "https://resultados.hayllis.com/assets/pdf/chiclayo_cmp/Fulbito-6-Regular.pdf", // TODO: reemplaza por el enlace X
    122: "https://resultados.hayllis.com/assets/pdf/chiclayo_cmp/Fulbito-6-Master.pdf", // TODO: reemplaza por el enlace Y
    999: "https://resultados.hayllis.com/assets/pdf/chiclayo_cmp/FIXTURE-VOLEY-MIXTO.pdf", // TODO: reemplaza por el enlace Z
  };

  const handleClickDescarga = () => {
    const idE = +idevent;
    const idS = +idsport;

    if (idE === 80) {
      const url = URLS_BY_SPORT[idS];
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
        return; // No ejecuta handleDownloadProgramacion
      }
    }

    // Comportamiento por defecto
    handleDownloadProgramacion();
  };

  return (
    <div className="container_programacion mx-auto p-4 font-quickSand">
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
              {sport && sport.typeSport === 1
                ? "Fase de Grupos"
                : "Programación"}
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

              {
                Number(idevent) === 1 && (Number(idsport) === 3 || Number(idsport) === 4) && (
                  <>
                    <div className="text-center text-2xl font-semibold mb-1">
                      Reunión Técnica | 09/11/2024 | 11:00am
                    </div>
                    <div className="text-center text-2xl font-semibold mb-1">
                      Institución Universitaria Escuela Nacional del Deporte
                    </div>
                  </>
                )
              }
              {
                Number(idevent) === 1 && (Number(idsport) === 44 || Number(idsport) === 45) && (
                  <>
                    <div className="text-center text-2xl font-semibold mb-1">
                      Reunión Técnica | 11/11/2024 | 6:00pm
                    </div>
                    <div className="text-center text-2xl font-semibold mb-1">
                      Institución Universitaria Escuela Nacional del Deporte
                    </div>
                  </>
                )
              }


              <div className="flex justify-center mb-8 space-x-2">
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
                    {isHaveRepechaje && selectedEliminationStage === "1" && index === 0 ? 'Repechaje' : etapa }
                  </button>
                ))}
              </div>
            </Tab.Panel>
          )}
        </Tab.Panels>
      </Tab.Group>

      {/* BOTÓN DESCARGAR + RADIOS */}
      <div className="w-100 flex flex-col items-center mt-5 mb-4" style={{ marginTop: "-10px" }}>
        <button
          onClick={handleClickDescarga}
          disabled={isDownloading}
          className={`inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold tracking-wide px-5 py-3 rounded-lg shadow-md transition transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 ${isDownloading ? "opacity-70 cursor-not-allowed" : ""
            }`}
        >
          {isDownloading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v13m0 0l-4-4m4 4l4-4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
            </svg>
          )}
          <span>{isDownloading ? "Descargando..." : "Descargar programación (PDF)"}</span>
        </button>

        {renderTipoUbiRadios()}
      </div>

      <div className="cards_container grid grid-cols-1 md:grid-cols-2 gap-6">
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
        ) : matches
          .filter((match) => !match.flag_bye) // Filtra los partidos con flag_bye
          .map((match) => {
            const isPublished = Number(match.published) === 1;

            // 1. Calcula formattedTime para CADA match
            let formattedTime;
            if (match.time_match) {
              const m = moment(match.time_match, "HH:mm:ss");
              // Si es mediodía exacto
              console.log("a ver", m.hour(), m.minute());
              if (m.hour() === 12 && m.minute() === 0) {
                formattedTime = "12:00 M.";
              } else {
                formattedTime = m.format("h:mm A");
              }
            } else {
              formattedTime = "Hora";
            }
            return (
              <>
                {
                  match && match.track_match_final === 1 ? (
                    <div
                      key={match.idmatch}
                      className="card bg-white p-6 rounded-lg shadow-lg cursor-pointer flex flex-col items-center md:items-start"
                    >
                      <div className="text-2xl font-bold text-center mb-2 text-gray-800">
                        {match.tag_final || "Partido"}
                      </div>

                      {/* Fecha y Hora */}
                      <div className="flex flex-col md:flex-row md:items-center text-xl font-semibold mb-2">
                        <div className="flex items-center mb-2 md:mb-0">
                          <FaCalendarAlt className="mr-2 text-blue-600" />
                          {match.date_match
                            ? formatFechaConDia(match.date_match)
                            : 'Fecha'}

                        </div>
                        <div className="hidden md:block mx-2">|</div>
                        <div className="flex items-center">
                          <MdAccessTime className="mr-2 text-blue-600" />
                          {isPublished ? formattedTime : "Hora"}
                        </div>
                      </div>

                      {/* Sede */}
                      <div className="flex items-center text-xl font-semibold mb-2">
                        <MdPlace className="mr-2 text-red-600" />
                        {match.sede ? match.sede.name : "Sede"}
                      </div>
                    </div>
                  ) :
                    (
                      <div
                        key={match.idmatch}
                        className="
                           card
                           bg-white p-6 rounded-lg shadow-lg cursor-pointer
                           flex flex-col items-center relative
                           w-full        /* móvil: ocupa todo */
                           md:min-w-[400px]  /* desde md en adelante, mínimo 400px */
                         "
                        onClick={() => handleOpenDetalle(match)}
                      >
                        {match.tag_extra && (
                          <span className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-semibold uppercase px-2 py-0.5 rounded-md shadow">
                            {match.tag_extra.toUpperCase()}
                          </span>
                        )}

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
                        <div className="flex justify-around items-center mb-4 relative w-full">
                          <div className="team_icon w-16 h-16 rounded-full flex justify-center items-center relative">
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
                                  className="img_logo w-12 h-12"
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
                              <div className="w-12 h-12 bg-gray-300 rounded-full flex justify-center items-center">
                                <span className="text-gray-500"></span>
                              </div>
                            )}
                          </div>
                          <span className="text-xl font-bold">vs</span>
                          <div className="team_icon w-16 h-16 rounded-full flex justify-center items-center relative">
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
                                  className="img_logo w-12 h-12"
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
                              <div className="w-12 h-12 bg-gray-300 rounded-full flex justify-center items-center">
                                <span className="text-gray-500"></span>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* NOMBRES — reemplaza tu bloque actual por este */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-start mb-4 w-full">
                          <div className="text-center px-2">
                            <div
                              className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 leading-tight break-words whitespace-normal"
                              style={{ unicodeBidi: "plaintext", overflowWrap: "anywhere", wordBreak: "break-word" }}
                            >
                              {moodName === 1
                                ? match.Participant1?.Institution?.abrev
                                : match.Participant1?.Institution?.name || "Por Definir"}
                            </div>
                            <div className="flex justify-center items-center gap-1 text-sm">
                              <TbShirtFilled />
                              <span>{isPublished ? (match.uniforme1 || "-") : "-"}</span>
                            </div>
                            {renderUniformeExclusivo(isPublished ? match.uniforme_exclusivo1 : null, idsport)}
                            {renderUniformeMedias(isPublished ? match.uniforme_medias1 : null, idsport)}
                          </div>

                          <div className="text-center px-2">
                            <div
                              className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 leading-tight break-words whitespace-normal"
                              style={{ unicodeBidi: "plaintext", overflowWrap: "anywhere", wordBreak: "break-word" }}
                            >
                              {moodName === 1
                                ? match.Participant2?.Institution?.abrev
                                : match.Participant2?.Institution?.name || "Por Definir"}
                            </div>
                            <div className="flex justify-center items-center gap-1 text-sm">
                              <TbShirtFilled />
                              <span>{isPublished ? (match.uniforme2 || "-") : "-"}</span>
                            </div>
                            {renderUniformeExclusivo(isPublished ? match.uniforme_exclusivo2 : null, idsport)}
                            {renderUniformeMedias(isPublished ? match.uniforme_medias2 : null, idsport)}
                          </div>
                        </div>

                        <div className="text-3xl font-bold mb-1">
                          <div className="flex items-center">
                            <MdAccessTime className="mr-2 text-gray-600" />
                            {isPublished ? formattedTime : "Hora"}
                          </div>
                        </div>
                        <div className="text-xl font-semibold mb-4">
                          {isPublished && match.date_match
                            ? formatFechaConDia(match.date_match)
                            : 'Fecha'}
                        </div>
                        <div className="text-lg font-semibold text-center">
                          {isPublished && match.sede ? match.sede.name : "Sede"}
                        </div>
                        <div className="text-sm text-center">
                          {isPublished && match.sede && match.sede.linkMap ? (
                            <a
                              href={match.sede.linkMap}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 underline"
                            >
                              {match.sede.address}
                            </a>
                          ) : (
                            "Dirección"
                          )}
                        </div>
                      </div>
                    )
                }
              </>
            )
          })}
      </div>


      {openDetalle && selectedMatch && (
        <ModalDetalle
          open={openDetalle}
          setOpen={setOpenDetalle}
          match={selectedMatch}
        />
      )}
    </div>
  );
};

export default Programacion;
