import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/config.js";
import "./ProgramacionIndividual.css";
import moment from "moment";
import { useParams } from "react-router-dom";
import { Tab } from "@headlessui/react";

const ProgramacionIndividual = () => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [selectedDate, setSelectedDate] = useState("1");
    const [nroFechasGrupo, setNroFechasGrupo] = useState(0);
    const [nroEtapasFinal, setNroEtapasFinal] = useState(0);
    const [moodName, setMoodName] = useState(1);
    const [useBandera, setUseBandera] = useState(false);
    const [fechas, setFechas] = useState([]);
    const [etapas, setEtapas] = useState([]);
    const [matches, setMatches] = useState([]);
    const [firstMatchInfo, setFirstMatchInfo] = useState({ date: null, venue: null });
    const [sport, setSport] = useState(null); // Definición de 'sport'
    const [isHavePrevias, setIsHavePrevias] = useState(false)

    const { idevent, idsport } = useParams();

    useEffect(() => {
        const getConfigCategory = async () => {
            const response = await axios.post(`${API_BASE_URL}/config_category`, {
                idevent: idevent,
                idsport: idsport,
            });
            const data = response.data;
            setNroFechasGrupo(data.nro_fechas_grupo);
            setNroEtapasFinal(data.nro_etapas_final);
            setMoodName(data.moodName);
            setUseBandera(data.useBandera);
            setIsHavePrevias(data.isHavePrevias)

            const fechasArray = Array.from(
                { length: data.nro_fechas_grupo },
                (_, i) => String(i + 1)
            );
            setFechas(fechasArray);

            const etapasArray = ["Octavos", "Cuartos", "Semis", "Final"].slice(
                4 - data.nro_etapas_final
            );
            setEtapas(etapasArray);
        };

        const getSport = async () => {
            const sportResponse = await axios.get(
                `${API_BASE_URL}/sport/?idsport=${idsport}`
            );
            setSport(sportResponse.data);
        };

        if (idevent && idsport) {
            getConfigCategory();
            getMatches(1, 1); // Fetch initial matches for Fase de Grupos and nro_fecha 1
            getSport();
        }
    }, [idevent, idsport]);

    const getMatches = async (idtypephase, nro_fecha) => {
        try {
            const requestBody = {
                idevent: idevent,
                idsport: idsport,
                nro_fecha: nro_fecha,
                ...(sport && sport.typeSport === 1 && { idtypephase: idtypephase }),
            };

            const response = await axios.post(
                `${API_BASE_URL}/getmatches`,
                requestBody
            );
            let fetchedMatches = response.data.sort((a, b) => {
                const timeA = a.time_match ? moment(a.time_match, "HH:mm") : null;
                const timeB = b.time_match ? moment(b.time_match, "HH:mm") : null;
                return timeA && timeB ? timeA - timeB : 0;
            });

            setMatches(fetchedMatches);
            if (fetchedMatches.length > 0) {
                const firstMatch = fetchedMatches[0];
                setFirstMatchInfo({
                    date: firstMatch.date_match
                        ? moment(firstMatch.date_match).format("DD/MM/YYYY")
                        : "Fecha no disponible",
                    venue: firstMatch.sede ? firstMatch.sede.name : "Sede no disponible",
                });
            }
        } catch (error) {
            console.error("Error fetching matches:", error);
        }
    };

    useEffect(() => {
        const idtypephase = selectedIndex === 0 ? 1 : 2;
        getMatches(idtypephase, selectedDate);
    }, [selectedIndex, selectedDate]);

    return (
        <div className="container_programacion_individual mx-auto p-4 font-quickSand">
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
                            Información
                        </Tab>
                    )}
                    {/* {nroEtapasFinal > 0 && (
                        <Tab
                            className={({ selected }) =>
                                selected
                                    ? "tab_selected w-full py-2.5 text-sm font-medium leading-5"
                                    : "tab_unselected w-full py-2.5 text-sm font-medium leading-5"
                            }
                        >
                            Fase de Eliminación
                        </Tab>
                    )} */}
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
                                Number(idevent) === 1 && Number(idsport) === 2 && (
                                    <>
                                        <div className="text-center text-2xl font-semibold mb-1">
                                            Reunión Técnica | 11/11/2024 | 2:00pm
                                        </div>
                                        <div className="text-center text-2xl font-semibold mb-1">
                                            Institución Universitaria Escuela Nacional del Deporte
                                        </div>
                                    </>
                                )
                            }
                            {
                                Number(idevent) === 1 && Number(idsport) === 24 && (
                                    <>
                                        <div className="text-center text-2xl font-semibold mb-1">
                                            Reunión Técnica | 11/11/2024 | 12:00pm
                                        </div>
                                        <div className="text-center text-2xl font-semibold mb-1">
                                            Institución Universitaria Escuela Nacional del Deporte
                                        </div>
                                    </>
                                )
                            }
                            {
                                Number(idevent) === 1 && Number(idsport) === 14 && (
                                    <>
                                        <div className="text-center text-2xl font-semibold mb-1">
                                            Reunión Técnica | 10/11/2024 | 3:00pm
                                        </div>
                                        <div className="text-center text-2xl font-semibold mb-1">
                                            Institución Universitaria Escuela Nacional del Deporte
                                        </div>
                                    </>
                                )
                            }
                            {
                                Number(idevent) === 1 && Number(idsport) === 12 && (
                                    <>
                                        <div className="text-center text-2xl font-semibold mb-1">
                                            Reunión Técnica | 09/11/2024 | 2:00pm
                                        </div>
                                        <div className="text-center text-2xl font-semibold mb-1">
                                            Institución Universitaria Escuela Nacional del Deporte
                                        </div>
                                    </>
                                )
                            }
                            {
                                Number(idevent) === 1 && Number(idsport) === 13 && (
                                    <>
                                        <div className="text-center text-2xl font-semibold mb-1">
                                            Reunión Técnica | 07/11/2024 | 4:00pm
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
                                        className={`fechas_button ${selectedDate === fecha ? "selected_date" : "unselected_date"}`}
                                        onClick={() => setSelectedDate(fecha)}
                                    >
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
                            <div className="text-center mb-4">
                                <h5 className="text-2xl font-semibold">{`Fecha Seleccionada: ${firstMatchInfo.date || ""}`}</h5>
                                <h6 className="text-xl font-semibold">{`Sede: ${firstMatchInfo.venue || ""}`}</h6>
                            </div>
                        </Tab.Panel>
                    )}
                    {/* {nroEtapasFinal > 0 && (
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
                                        className={`fechas_button ${selectedDate === String(index + 1) ? "selected_date" : "unselected_date"}`}
                                        onClick={() => setSelectedDate(String(index + 1))}
                                    >
                                        {etapa}
                                    </button>
                                ))}
                            </div>
                        </Tab.Panel>
                    )} */}
                </Tab.Panels>
            </Tab.Group>

            <div className="cards_container grid grid-cols-1 md:grid-cols-2 gap-6">
                {matches
                    .filter((match) => !match.flag_bye)
                    .map((match) => (
                        <div
                            key={match.idmatch}
                            className="card bg-white p-6 rounded-lg shadow-lg cursor-pointer flex flex-col items-center"
                        >
                            <div className="text-xl font-bold text-center mb-2">
                                {match.tag_final || "Partido"}
                            </div>
                            <div className="text-2xl font-semibold mb-2">
                                {match.time_match ? moment(match.time_match, "HH:mm:ss").format("h:mm A") : "Hora"}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default ProgramacionIndividual;