import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import API_BASE_URL from "../../../config/config.js";
import { useParams } from "react-router-dom";
import { FaTrophy } from "react-icons/fa";

/**
 * PURPOSE: Mostrar ranking/final standings con reglas visuales configurables.
 * RESPONSIBILITIES:
 *  - Sí: traer participantes, ordenar por ranking y pintar destacados visuales.
 *  - No: no altera datos de negocio ni cálculo de posiciones.
 * NOTES:
 *  - La lógica visual de destacados/copa está centralizada para evitar duplicación
 *    entre renderPos y ringStyle.
 */

const EVENT_WITH_TOP_2_HIGHLIGHT = 220;
const SPORTS_WITH_TOP_2_HIGHLIGHT_FOR_EVENT_220 = [5, 42];

const VISUAL_RULES = {
    DEFAULT: {
        highlightedPlaces: [1, 2, 3],
        trophyPlaces: [1, 2, 3],
    },
    EVENT_220_TOP_1_ONLY: {
        highlightedPlaces: [1],
        trophyPlaces: [1],
    },
    EVENT_220_TOP_2_ONLY: {
        highlightedPlaces: [1, 2],
        trophyPlaces: [1, 2],
    },
};

function resolveVisualRules(eventId, sportId) {
    const safeEventId = Number(eventId);
    const safeSportId = Number(sportId);

    if (
        safeEventId === EVENT_WITH_TOP_2_HIGHLIGHT &&
        SPORTS_WITH_TOP_2_HIGHLIGHT_FOR_EVENT_220.includes(safeSportId)
    ) {
        return VISUAL_RULES.EVENT_220_TOP_2_ONLY;
    }

    if (safeEventId === EVENT_WITH_TOP_2_HIGHLIGHT) {
        return VISUAL_RULES.EVENT_220_TOP_1_ONLY;
    }

    return VISUAL_RULES.DEFAULT;
}

function getRingStyle(place, highlightedPlaces) {
    if (!highlightedPlaces.includes(place)) {
        return "ring-1 ring-gray-200/60";
    }

    if (place === 1) return "ring-4 ring-yellow-400/80";
    if (place === 2) return "ring-4 ring-gray-300/80";
    if (place === 3) return "ring-4 ring-amber-700/80";

    return "ring-1 ring-gray-200/60";
}

const Ranking = () => {
    const [participantes, setParticipantes] = useState([]);
    const { idevent, idsport } = useParams();

    const eventId = Number(idevent);
    const sportId = Number(idsport);

    // Mapeo de nombres de deporte según idsport
    const sportNames = {
        3: "Básquetbol Damas",
        4: "Básquetbol Varones",
        6: "Futsal Damas",
        7: "Futsal Varones",
        16: "Voleibol Damas",
        17: "Voleibol Varones",
        42: "Fútbol Damas",
        5: "Fútbol Varones",
        113: "Voleibol B Varones",
        114: "Voleibol B Damas",
        115: "Voleibol C Varones",
        116: "Voleibol C Damas",
    };

    const sportName = sportNames[sportId];

    const visualRules = useMemo(() => {
        return resolveVisualRules(eventId, sportId);
    }, [eventId, sportId]);

    // 1. Traer participantes
    useEffect(() => {
        const fetchData = async () => {
            const { data } = await axios.post(`${API_BASE_URL}/getparticipants`, {
                idevent: eventId,
                idsport: sportId,
                idtypephase: 1,
            });
            setParticipantes(Array.isArray(data) ? data : []);
        };

        if (Number.isFinite(eventId) && Number.isFinite(sportId)) {
            fetchData();
        }
    }, [eventId, sportId]);

    // 2. Filtrar y ordenar
    const ranking = useMemo(() => {
        return participantes
            .filter((p) => p?.ranking != null)
            .sort((a, b) => a.ranking - b.ranking);
    }, [participantes]);

    // 3. Número + copa según configuración visual
    const renderPos = (idx, rk) => {
        const place = idx + 1;
        const colores = {
            1: "text-yellow-400",
            2: "text-gray-300",
            3: "text-amber-700",
        };

        const shouldShowTrophy = visualRules.trophyPlaces.includes(place);

        if (shouldShowTrophy) {
            return (
                <div className="flex items-center justify-center gap-1">
                    <span className="font-semibold text-sm">{place}.</span>
                    <FaTrophy
                        className={`w-5 h-5 ${colores[place] ?? "text-yellow-400"}`}
                    />
                </div>
            );
        }

        return <span className="font-semibold text-sm">{rk}</span>;
    };

    return (
        <section className="w-full">
            <div style={{ backgroundColor: "#2564eb", borderRadius: "10px" }}>
                <h2
                    className="text-2xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 py-6 uppercase tracking-wide"
                    style={{ color: "white" }}
                >
                    {`Ubicación Final${sportName ? ` de ${sportName}` : ""}`}
                </h2>
            </div>

            <div className="overflow-x-auto hover:overflow-x-hidden relative">
                <table className="min-w-full border-separate border-spacing-y-3">
                    <thead>
                        <tr>
                            <th className="w-20 text-center text-xs font-bold uppercase tracking-wider text-gray-600">
                                Pos
                            </th>
                            <th className="text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                                Institución
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {ranking.map((p, idx) => {
                            const place = idx + 1;

                            const logo =
                                (p?.Institution?.path_base ?? "") +
                                (p?.Institution?.image_path ?? "placeholder.png");

                            const ringStyle = getRingStyle(
                                place,
                                visualRules.highlightedPlaces
                            );

                            return (
                                <tr
                                    key={p.idparticipant}
                                    className={`
                                        bg-white/70 backdrop-blur-sm ${ringStyle}
                                        rounded-xl shadow-sm
                                        hover:scale-105 transition-transform duration-200
                                        transform origin-center cursor-pointer
                                    `}
                                >
                                    <td className="px-4 py-3 text-center">
                                        {renderPos(idx, p.ranking)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={logo}
                                                alt={p?.Institution?.abrev ?? "Institución"}
                                                className="w-9 h-9 rounded-lg bg-gray-100 object-contain"
                                            />
                                            <span className="font-medium text-gray-700 tracking-wide">
                                                {p?.Institution?.name ?? "Institución sin nombre"}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default Ranking;