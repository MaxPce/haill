import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import API_BASE_URL from "../config/config.js";
import { getCumulativeTableByEvent } from "../services/cumulativeTable";

/**
 * PURPOSE:
 * Mostrar la tabla acumulada del torneo a partir de cumulative_table.
 *
 * RESPONSIBILITIES:
 * - Consumir cumulative_table por idevent.
 * - Transformar filas por institución y por fecha/evento.
 * - Renderizar una tabla moderna, elegante y responsive.
 * - Manejar loading, vacío y error sin romper la pantalla.
 *
 * COLLABORATORS:
 * - src/services/cumulativeTable.js
 * - src/config/config.js
 *
 * ROUTE:
 * src/sections/TablaAcumuladaSection.jsx
 */

const formatEventIds = (rows) => {
    const ordered = [];
    const seen = new Set();

    rows.forEach((row) => {
        String(row?.ids_events || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
            .forEach((item) => {
                if (!seen.has(item)) {
                    seen.add(item);
                    ordered.push(Number(item));
                }
            });
    });

    return ordered.filter((item) => Number.isFinite(item));
};

const getRowAccentClasses = (rank) => {
    if (rank === 1) {
        return "bg-amber-50/90 border-amber-200";
    }

    if (rank === 2) {
        return "bg-slate-100/95 border-slate-200";
    }

    if (rank === 3) {
        return "bg-orange-50/90 border-orange-200";
    }

    return "bg-white border-slate-200";
};

const getRankBadgeClasses = (rank) => {
    if (rank === 1) {
        return "bg-amber-100 text-amber-800 border border-amber-200";
    }

    if (rank === 2) {
        return "bg-slate-200 text-slate-700 border border-slate-300";
    }

    if (rank === 3) {
        return "bg-orange-100 text-orange-800 border border-orange-200";
    }

    return "bg-slate-100 text-slate-700 border border-slate-200";
};

const ClubIdentity = ({ logo, abrev, idinstitution }) => {
    const fallbackLetter = abrev?.[0] || "C";

    return (
        <div className="flex items-center gap-3 min-w-[210px]">
            {logo ? (
                <img
                    src={logo}
                    alt={abrev || `Club ${idinstitution}`}
                    className="h-11 w-11 rounded-xl object-cover border border-slate-200 bg-white shadow-sm"
                />
            ) : (
                <div className="h-11 w-11 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center shadow-sm">
                    {fallbackLetter}
                </div>
            )}

            <div className="flex flex-col min-w-0">
                <span className="font-semibold text-slate-900 truncate">
                    {abrev || `Club ${idinstitution}`}
                </span>
                <span className="text-xs text-slate-500 truncate">ID {idinstitution}</span>
            </div>
        </div>
    );
};

const PositionCell = ({ position }) => {
    if (position == null) {
        return <span className="text-slate-400 font-medium">—</span>;
    }

    return (
        <span className="inline-flex items-center justify-center min-w-[52px] rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
            {position}°
        </span>
    );
};

const PointsCell = ({ points, accent = false }) => (
    <span
        className={`inline-flex items-center justify-center min-w-[52px] rounded-full px-3 py-1 text-sm font-bold ${accent
                ? "bg-emerald-100 text-emerald-700"
                : "bg-blue-50 text-blue-700"
            }`}
    >
        {Number(points || 0)}
    </span>
);

const TablaAcumuladaSection = () => {
    const { idevent } = useParams();

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [eventBanner, setEventBanner] = useState("");

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError("");

                const [cumulativeResponse, championshipResponse] = await Promise.all([
                    getCumulativeTableByEvent(idevent),
                    axios.get(`${API_BASE_URL}/championship/?idevent=${idevent}`),
                ]);

                if (!isMounted) return;

                setRows(Array.isArray(cumulativeResponse?.response) ? cumulativeResponse.response : []);
                setEventBanner(championshipResponse?.data?.event_banner || "");
            } catch (fetchError) {
                console.error("Error loading tabla acumulada:", fetchError);
                if (!isMounted) return;
                setError("No se pudo cargar la tabla acumulada.");
                setRows([]);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        if (idevent) {
            loadData();
        }

        return () => {
            isMounted = false;
        };
    }, [idevent]);

    const { orderedEventIds, tableRows } = useMemo(() => {
        const orderedIds = formatEventIds(rows);
        const groupedMap = new Map();

        rows.forEach((row) => {
            const key = row.idinstitution;
            if (!groupedMap.has(key)) {
                groupedMap.set(key, {
                    idinstitution: row.idinstitution,
                    institution_abrev: row.institution_abrev,
                    institution_logo: row.institution_logo,
                    institution_name: row.institution_name,
                    byEvent: {},
                });
            }

            const current = groupedMap.get(key);
            current.byEvent[row.idevent] = {
                position: row.position,
                points: Number(row.points || 0),
            };
        });

        const normalizedRows = Array.from(groupedMap.values()).map((item) => {
            const totalPoints = orderedIds.reduce((acc, eventId) => {
                return acc + Number(item.byEvent[eventId]?.points || 0);
            }, 0);

            return {
                ...item,
                totalPoints,
            };
        });

        normalizedRows.sort((a, b) => {
            if (b.totalPoints !== a.totalPoints) {
                return b.totalPoints - a.totalPoints;
            }

            return String(a.institution_abrev || "").localeCompare(String(b.institution_abrev || ""));
        });

        return {
            orderedEventIds: orderedIds,
            tableRows: normalizedRows,
        };
    }, [rows]);

    return (
        <section className="w-full px-4 md:px-6 lg:px-8 py-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="text-center space-y-5">
                    {eventBanner && (
                        <div className="w-full flex justify-center">
                            <img
                                src={eventBanner}
                                alt="Banner del evento"
                                className="w-full max-w-6xl rounded-[28px] border border-slate-200/90 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)]"
                                style={{ objectFit: "cover" }}
                            />
                        </div>
                    )}

                    <div className="mx-auto max-w-4xl">
                        <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-blue-700 shadow-sm">
                            Tabla Acumulada
                        </div>

                        <div className="mt-4 space-y-3">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-950">
                                Circuito Nacional de 7&apos;S femenino
                            </h2>
                            <p className="mx-auto max-w-2xl text-sm md:text-base font-medium text-slate-500">
                                Clasificación general con el acumulado de puntos por club.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_18px_45px_-25px_rgba(15,23,42,0.35)] overflow-hidden">
                    {loading ? (
                        <div className="px-6 py-16 text-center text-slate-500 font-medium">
                            Cargando tabla acumulada...
                        </div>
                    ) : error ? (
                        <div className="px-6 py-16 text-center text-rose-600 font-medium">
                            {error}
                        </div>
                    ) : tableRows.length === 0 ? (
                        <div className="px-6 py-16 text-center text-slate-500 font-medium">
                            No hay datos acumulados disponibles para este torneo.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-4 text-slate-700 font-bold whitespace-nowrap">N°</th>
                                        <th className="px-4 py-4 text-slate-700 font-bold whitespace-nowrap min-w-[240px]">Club</th>

                                        {orderedEventIds.map((eventId, index) => (
                                            <React.Fragment key={eventId}>
                                                <th className="px-4 py-4 text-slate-700 font-bold whitespace-nowrap text-center">
                                                    <div className="flex flex-col items-center leading-tight">
                                                        <span>Fecha {index + 1}</span>
                                                        {/* <span className="text-xs font-medium text-slate-500">Evento {eventId}</span> */}
                                                    </div>
                                                </th>
                                                <th className="px-4 py-4 text-slate-700 font-bold whitespace-nowrap text-center">
                                                    Pts
                                                </th>
                                            </React.Fragment>
                                        ))}

                                        <th className="px-4 py-4 text-slate-700 font-bold whitespace-nowrap text-center">
                                            Total Pts
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {tableRows.map((row, index) => {
                                        const rank = index + 1;
                                        return (
                                            <tr
                                                key={row.idinstitution}
                                                className={`border-b last:border-b-0 transition-colors ${getRowAccentClasses(rank)}`}
                                            >
                                                <td className="px-4 py-4 align-middle">
                                                    <span
                                                        className={`inline-flex min-w-[56px] items-center justify-center rounded-full px-3 py-1 text-sm font-bold ${getRankBadgeClasses(rank)}`}
                                                    >
                                                        {rank}°
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4 align-middle">
                                                    <ClubIdentity
                                                        logo={row.institution_logo}
                                                        abrev={row.institution_abrev}
                                                        idinstitution={row.idinstitution}
                                                    />
                                                </td>

                                                {orderedEventIds.map((eventId) => {
                                                    const eventData = row.byEvent[eventId] || { position: null, points: 0 };
                                                    return (
                                                        <React.Fragment key={`${row.idinstitution}-${eventId}`}>
                                                            <td className="px-4 py-4 text-center align-middle">
                                                                <PositionCell position={eventData.position} />
                                                            </td>
                                                            <td className="px-4 py-4 text-center align-middle">
                                                                <PointsCell points={eventData.points} />
                                                            </td>
                                                        </React.Fragment>
                                                    );
                                                })}

                                                <td className="px-4 py-4 text-center align-middle">
                                                    <PointsCell points={row.totalPoints} accent />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default TablaAcumuladaSection;
