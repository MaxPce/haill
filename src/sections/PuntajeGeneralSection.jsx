// src/pages/PuntajeGeneralSection.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/config.js";
import { useParams } from "react-router-dom";
import { FaMedal } from "react-icons/fa";
import placeholderLogo from "./placeholder-logo.png"; // <= usa un asset real

// Convierte un color hex (#RRGGBB o #RGB) en un hex con alfa (#RRGGBBAA)
const tintHex = (hex, alphaHex = "22") => {
    if (!hex) return undefined;
    const h = hex.startsWith("#") ? hex.slice(1) : hex;
    const full = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
    return `#${full}${alphaHex}`; // '22' ~ 13% de opacidad
};


const medalForPlace = (puesto) => {
    if (puesto === 1) return <FaMedal className="inline-block text-yellow-500 mr-1" title="1°" />;
    if (puesto === 2) return <FaMedal className="inline-block text-gray-400 mr-1" title="2°" />;
    if (puesto === 3) return <FaMedal className="inline-block text-amber-700 mr-1" title="3°" />;
    return null;
};

const cellBadge = (puesto) => {
    if (!Number.isInteger(puesto) || puesto < 1 || puesto > 6) {
        return <span className="text-gray-400">—</span>;
    }
    const base = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold";
    const colorByPlace = {
        1: "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300",
        2: "bg-gray-100 text-gray-800 ring-1 ring-gray-300",
        3: "bg-amber-100 text-amber-800 ring-1 ring-amber-300",
        4: "bg-blue-100 text-blue-800 ring-1 ring-blue-300",
        5: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300",
        6: "bg-purple-100 text-purple-800 ring-1 ring-purple-300",
    };
    const cls = `${base} ${colorByPlace[puesto] || "bg-gray-100 text-gray-700"}`;
    return (
        <span className={cls}>
            {medalForPlace(puesto)}
            {puesto}°
        </span>
    );
};

const Skeleton = () => (
    <div className="animate-pulse">
        <div className="h-6 w-64 bg-gray-200 rounded mb-2" />
        <div className="h-10 w-full bg-gray-100 rounded" />
    </div>
);

const PuntajeGeneralSection = () => {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);      // registros del back (response/registros)
    const [config, setConfig] = useState(null); // puntuacionFinalEvent
    const [sports, setSports] = useState([]);   // [{idsport, name, acronym, color}]
    const { idevent } = useParams();

    const getEvent = async () => {
        const { data } = await axios.get(`${API_BASE_URL}/championship/?idevent=${idevent}`);
        setEvent(data);
    };

    const getPuntajeFinal = async () => {
        const { data } = await axios.post(`${API_BASE_URL}/getpuntuacionfinalfiltrado`, { idevent });
        console.log("Puntaje final data:", data);
        const registros = data.response || data.registros || [];
        const cfg = data.puntuacionFinalEvent || null;

        setRows(registros);
        setConfig(cfg);

        const ids = (cfg?.sports || []).filter((n) => Number.isInteger(n));
        if (ids.length) {
            const respSports = await axios.post(`${API_BASE_URL}/sportsbyids`, ids);
            const list = respSports?.data?.sports || respSports?.data || [];
            const orderMap = new Map(ids.map((id, i) => [id, i]));
            list.sort((a, b) => (orderMap.get(a.idsport) ?? 0) - (orderMap.get(b.idsport) ?? 0));
            setSports(list);
        } else {
            setSports([]);
        }
    };

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                setLoading(true);
                if (idevent) {
                    await Promise.all([getEvent(), getPuntajeFinal()]);
                }
            } catch (e) {
                console.error(e);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [idevent]);

    // Construir matriz por institución (y guardar abrev+logo)
    const matrix = useMemo(() => {
        if (!rows?.length) return [];
        const byInst = new Map();
        const metaByInst = new Map(); // idinst -> {abrev, logo}

        for (const r of rows) {
            const inst = r.idinstitution;
            const sport = r.idsport;

            if (!byInst.has(inst)) {
                byInst.set(inst, {
                    idinstitution: inst,
                    perSport: new Map(),
                    sumRanking: 0,
                    sumBonoDeporte: 0,
                });
            }
            // guarda meta si viene del back
            if (!metaByInst.has(inst)) {
                metaByInst.set(inst, { abrev: r.abrev || null, logo: r.logo || null });
            }

            const acc = byInst.get(inst);
            acc.perSport.set(sport, {
                puesto: r.puesto,
                puntaje: Number(r.puntaje || 0),
                cant_sports: Number(r.cant_sports || 0),
            });
            acc.sumRanking += Number(r.puntaje || 0);
            acc.sumBonoDeporte += Number(r.cant_sports || 0);
        }

        const arr = Array.from(byInst.values()).map((it) => {
            const meta = metaByInst.get(it.idinstitution) || {};
            return {
                idinstitution: it.idinstitution,
                abrev: meta.abrev || null,
                logo: meta.logo || null,
                perSport: it.perSport,
                bonoPorDeporte: it.sumBonoDeporte,
                total: it.sumRanking + it.sumBonoDeporte,
            };
        });

        arr.sort((a, b) => b.total - a.total || a.idinstitution - b.idinstitution);
        return arr;
    }, [rows]);

    if (loading) {
        return (
            <div className="p-4">
                <Skeleton />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center w-full text-black-800" style={{ flexDirection: "column !important" }}>
            <div className="text-center mb-4">
                <h2 className="text-2xl sm:text-4xl font-bold text-blue-600">
                    {event?.name || "Puntaje General"}
                </h2>
                <h3 className="text-3xl sm: text-5xl font-bold text-black">
                    PUNTAJE GENERAL
                </h3>
                {/* {config?.sports?.length ? (
                    <p className="text-sm text-gray-600 mt-1">
                        Deportes en tabla: {config.sports.join(", ")} · Bono por deporte:{" "}
                        <span className="font-semibold">{config.cant_sports}</span>
                    </p>
                ) : null} */}
            </div>

            <div className="relative">
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                    <table className="min-w-[900px] w-full border-collapse">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="sticky left-0 z-20 bg-gray-50/90 backdrop-blur px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Institución
                                </th>
                                {sports.map((s) => (
                                    <th key={s.idsport} className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        <div
                                            className="px-2 py-1 rounded-md inline-flex items-center gap-2 ring-1 ring-gray-200"
                                            style={{ backgroundColor: `${s.color}22` }}
                                            title={s.name}
                                        >
                                            <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: s.color }} />
                                            <span className="font-bold">{s.acronym || s.name}</span>
                                        </div>
                                    </th>
                                ))}
                                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Pts x Deporte</th>
                                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white">
                            {matrix.map((row, idx) => (
                                <tr key={row.idinstitution} className={idx % 2 ? "bg-white" : "bg-gray-50/50"}>
                                    {/* Columna fija izquierda */}
                                    <td className="sticky left-0 z-10 bg-inherit px-3 py-2 text-sm font-medium text-gray-800 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={row.logo || placeholderLogo}
                                                alt={row.abrev || `Inst ${row.idinstitution}`}
                                                className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-200"
                                                loading="lazy"
                                                onError={(e) => {
                                                    // corta el loop y usa el asset local
                                                    e.currentTarget.onerror = null;
                                                    e.currentTarget.src = placeholderLogo;
                                                }}
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-semibold">
                                                    {row.abrev || `ID ${row.idinstitution}`}
                                                </span>
                                                <span className="text-[10px] text-gray-500">ID {row.idinstitution}</span>
                                            </div>
                                        </div>
                                    </td>
                                    {/* Celdas por deporte */}
                                    {sports.map((s) => {
                                        const cell = row.perSport.get(s.idsport);
                                        const puesto = cell?.puesto ?? null;
                                        // participa si existe la fila (aunque no tenga puesto todavía)
                                        const participa = !!cell;

                                        return (
                                            <td
                                                key={`${row.idinstitution}-${s.idsport}`}
                                                className={`px-3 py-2 text-center transition-colors ${participa ? "ring-1 rounded-md" : ""
                                                    }`}
                                                style={
                                                    participa
                                                        ? {
                                                            // tinte muy suave + anillo sutil usando el color del deporte
                                                            backgroundColor: tintHex(s.color, "14"),
                                                            boxShadow: `inset 0 0 0 1px ${tintHex(s.color, "33")}`,
                                                        }
                                                        : undefined
                                                }
                                                title={participa ? "Participa en este deporte" : "No participa"}
                                            >
                                                {cellBadge(puesto)}
                                            </td>
                                        );
                                    })}


                                    {/* Bono por deporte */}
                                    <td className="px-3 py-2 text-center">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                                            +{row.bonoPorDeporte}
                                        </span>
                                    </td>

                                    {/* Total */}
                                    <td className="px-3 py-2 text-center">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
                                            {row.total}
                                        </span>
                                    </td>
                                </tr>
                            ))}

                            {!matrix.length && (
                                <tr>
                                    <td colSpan={2 + sports.length} className="px-3 py-6 text-center text-gray-500">
                                        No hay datos para mostrar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-2 text-center text-xs text-gray-500">
                    Desliza horizontalmente para ver todos los deportes →
                </div>
            </div>
        </div>
    );
};

export default PuntajeGeneralSection;
