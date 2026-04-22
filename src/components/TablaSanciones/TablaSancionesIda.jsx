import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/config.js";
import { useParams } from "react-router-dom";
import { idTarjeta } from "../../utils/idTarjeta.js";
import { FaInfoCircle } from "react-icons/fa";

/* ──────────── constantes ──────────── */
const KO_PHASE_NAMES = {
    2: ["SEMIS", "FINAL"],
    3: ["CUARTOS", "SEMIS", "FINAL"],
    4: ["OCTAVOS", "CUARTOS", "SEMIS", "FINAL"],
};

/* KO ida / vuelta (caso especial evento 197) */
const KO_PHASE_NAMES_SPECIAL = [
    "CUARTOS",
    "SEMIS IDA/POR UBI.",
    "SEMIS VUELTA",
    "FINAL IDA",
    "FINAL VUELTA",
];

const toTitleCase = (s = "") =>
    s
        .split(" ")
        .map((w) => w[0]?.toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");

export default function TablaSancionesIda() {
    const { idevent, idsport } = useParams();

    /* Detectar formato KO ida/vuelta */
    const isTwoLegKO = (+idevent === 197 || +idevent === 212) && [5, 6, 7].includes(+idsport);

    const [config, setConfig] = useState(null);
    const [tarjetas, setTarjetas] = useState([]);
    const [descansos, setDescansos] = useState([]);

    /* ─────────────── Fetch datos ─────────────── */
    useEffect(() => {
        if (!idevent || !idsport) return;
        const ac = new AbortController();

        (async () => {
            try {
                const [{ data: cfg }, { data: tjs }] = await Promise.all([
                    axios.post(
                        `${API_BASE_URL}/config_category`,
                        { idevent: +idevent, idsport: +idsport },
                        { signal: ac.signal }
                    ),
                    axios.post(
                        `${API_BASE_URL}/gettarjetas`,
                        { idevent: +idevent, idsport: +idsport },
                        { signal: ac.signal }
                    ),
                ]);
                setConfig(cfg);
                setTarjetas(tjs);

                const { data: resp } = await axios.post(
                    `${API_BASE_URL}/getparticipantdescansowithfecha`,
                    { idevent: +idevent, idsport: +idsport },
                    { signal: ac.signal }
                );
                setDescansos(
                    resp.map((d) => ({
                        siglas: d.ParticipantBye.Institution.abrev,
                        nro_fecha: d.nro_fecha,
                    }))
                );
            } catch (e) {
                if (e.name !== "CanceledError") console.error("Error cargando datos:", e);
            }
        })();

        return () => ac.abort();
    }, [idevent, idsport]);

    /* ─────────────── Cabeceras ─────────────── */
    const headers = useMemo(() => {
        if (!config) return [];

        const fechas = Array.from({ length: config.nro_fechas_grupo }, (_, i) => `FECHA ${i + 1}`);
        const ko = isTwoLegKO ? KO_PHASE_NAMES_SPECIAL : KO_PHASE_NAMES[config.nro_etapas_final] ?? [];

        return [...fechas, ...ko];
    }, [config, isTwoLegKO]);

    /* Helper para mapear tarjeta → columna */
    const colFor = (t) => {
        if (t.idtypephase === 1) return `FECHA ${t.nro_fecha}`;
        if (isTwoLegKO) {
            return KO_PHASE_NAMES_SPECIAL[t.nro_fecha - 1] ?? null;
        }
        return (KO_PHASE_NAMES[config.nro_etapas_final] ?? [])[t.nro_fecha - 1] ?? null;
    };

    /* ──────────────────── ROWS ──────────────────── */
    const rows = useMemo(() => {
        if (!config) return [];

        const map = {};
        console.log("tarjetassss", tarjetas)
        /* 1 · Tarjetas originales */
        tarjetas.forEach((t) => {
            // 6152 6169 6220

            // Partidos que deben considerarse SEMIS VUELTA (lista ampliada)
            // forcedSemisIds -> Son Semifinales Vuelta de Futbol/Futsal

            const forcedSemisIds = [
                // Div 1 - Apertura 2025
                1164, 6149, 6217, 6219, 6168, 6166,
                // Div 1 - Clausura 2025
                // --
                8986, 8984, 8953, 8955, 8922, 8924
            ];

            const forcedFinalIdaIds = [
                // Div 1 - Apertura 2025
                6152, 6169, 6220,
                // Div 1 - Clausura 2025
                // --
                8927, 8958, 8989
            ]

            // UNW vs UNE (6166) -> LLave 7 (vuelta) | UPC vs USIL (6168) -> Llave 8 (vuelta)
            const isForcedSemis = (+idevent === 197 || +idevent === 212) && forcedSemisIds.includes(t.idmatch);
            const isForcedFinalIda = (+idevent === 197 || +idevent === 212) && forcedFinalIdaIds.includes(t.idmatch);
            const col = isForcedSemis ? "SEMIS VUELTA" : isForcedFinalIda ? "FINAL IDA" : colFor(t);
            if (!col) return;

            const pid = t.idacreditation;

            /* Normalizar tipo de tarjeta */
            let tipoFinal = t.evaluar && t.tipo_tarjeta === 2 ? 5 : t.tipo_tarjeta; // 5 = roja evaluada
            if (t.tipo_tarjeta === 3) tipoFinal = 11; // 11 = Informe

            map[pid] ??= {
                instId: t.institution?.idinstitution,
                sigla: t.institution.abrev,
                logo: `${t.institution.path_base}${t.institution.image_path}`,
                name: toTitleCase(t.accreditation.persona),
                cols: {},
            };
            map[pid].cols[col] ??= [];
            map[pid].cols[col].push({
                tipo_tarjeta: tipoFinal,
                virtual: false,
                rojaEval: tipoFinal === 5,
                minutes: t.minutes, // minutos de suspensión (roja evaluada)
            });

            /* Habilitado inmediato cuando minutes === 0 */
            if (tipoFinal === 5 && t.minutes !== null && t.minutes !== undefined && Number(t.minutes) === 0) {
                map[pid].cols[col].push({ tipo_tarjeta: 9, virtual: true });
            }
        });

        /* 2 · Descansos */
        descansos.forEach((d) => {
            const header = `FECHA ${d.nro_fecha}`;
            Object.values(map).forEach((row) => {
                if (row.sigla === d.siglas) {
                    row.cols[header] ??= [];
                    if (!row.cols[header].some((c) => c.tipo_tarjeta === 10)) row.cols[header].push({ tipo_tarjeta: 10, virtual: true });
                }
            });
        });

        /* 3 · Algoritmo de suspensiones / habilitados */
        const analyseCell = (cell) => {
            let yellows = 0,
                suspLen = 1,
                generateH = false,
                trigger = false,
                isInforme = false;

            cell.forEach((c) => {
                const info = idTarjeta(c.tipo_tarjeta);
                if (c.tipo_tarjeta === 11) isInforme = true;

                yellows += info.amarilla;
                if (info.roja) {
                    trigger = true;
                    if (c.rojaEval) {
                        const hasMinutes = c.minutes !== null && c.minutes !== undefined && c.minutes !== "";
                        if (!hasMinutes) {
                            // minutes NULL → 1 suspensión, SIN habilitado
                            suspLen = 1;
                            generateH = false;
                        } else {
                            const mVal = Number(c.minutes);
                            if (mVal === 0) {
                                // minutes = 0 → sin suspensión, habilitado inmediato (ya añadido arriba)
                                suspLen = 0;
                                generateH = false;
                            } else {
                                // minutes >=1 → tantas fechas + habilitado
                                suspLen = mVal;
                                generateH = true;
                            }
                        }
                    } else {
                        // Roja directa
                        suspLen = 1;
                        generateH = true;
                    }
                }
            });

            if (!trigger && yellows >= 2) {
                trigger = true;
                suspLen = 1;
                generateH = true;
            }
            return { trigger, suspLen, generateH, isInforme };
        };

        Object.values(map).forEach((row) => {
            headers.forEach((h, i) => {
                const { trigger, suspLen, generateH, isInforme } = analyseCell(row.cols[h] ?? []);

                /* —— INFORME —— */
                if (isInforme) {
                    const nextIdx = i + 1;
                    const nextNextIdx = i + 2;

                    if (headers[nextIdx]) {
                        const nh = headers[nextIdx];
                        row.cols[nh] = (row.cols[nh] ?? []).filter((c) => c.tipo_tarjeta !== 9);
                        const cellN = row.cols[nh] ?? [];
                        if (!cellN.some((c) => c.tipo_tarjeta === 10) && !cellN.some((c) => c.tipo_tarjeta === 8)) {
                            row.cols[nh].push({ tipo_tarjeta: 8, virtual: true });
                        }
                    }
                    if (headers[nextNextIdx]) {
                        const nnh = headers[nextNextIdx];
                        row.cols[nnh] = (row.cols[nnh] ?? []).filter((c) => c.tipo_tarjeta !== 9);
                        const cellNN = row.cols[nnh] ?? [];
                        if (!cellNN.some((c) => c.tipo_tarjeta === 10) && !cellNN.some((c) => c.tipo_tarjeta === 9)) {
                            row.cols[nnh].push({ tipo_tarjeta: 9, virtual: true });
                        }
                    }
                    return;
                }

                if (!trigger) return; // nada que propagar

                /* —— Regla especial: SEMIS IDA —— */
                if (isTwoLegKO && h === "SEMIS IDA/POR UBI.") {
                    const sHead = "SEMIS VUELTA";
                    row.cols[sHead] ??= [];
                    if (!row.cols[sHead].some((c) => c.tipo_tarjeta === 8) && suspLen > 0) row.cols[sHead].push({ tipo_tarjeta: 8, virtual: true });

                    if (generateH) {
                        const hHead = "FINAL IDA";
                        row.cols[hHead] ??= [];
                        if (!row.cols[hHead].some((c) => c.tipo_tarjeta === 9)) row.cols[hHead].push({ tipo_tarjeta: 9, virtual: true });
                    }
                    return;
                }

                /* —— Regla especial: SEMIS VUELTA —— */
                if (isTwoLegKO && h === "SEMIS VUELTA") {
                    let placed = 0;
                    let idx = i;
                    while (placed < suspLen) {
                        idx += 1;
                        if (idx >= headers.length) break;
                        const hd = headers[idx];
                        const cell = row.cols[hd] ?? [];
                        if (cell.some((c) => c.tipo_tarjeta === 10)) continue; // descanso
                        row.cols[hd] ??= [];
                        if (!row.cols[hd].some((c) => c.tipo_tarjeta === 8)) row.cols[hd].push({ tipo_tarjeta: 8, virtual: true });
                        placed += 1;
                    }

                    if (generateH && idx + 1 < headers.length) {
                        const hHead = headers[idx + 1];
                        const cellH = row.cols[hHead] ?? [];
                        if (!cellH.some((c) => c.tipo_tarjeta === 10) && !cellH.some((c) => c.tipo_tarjeta === 9)) {
                            row.cols[hHead] ??= [];
                            row.cols[hHead].push({ tipo_tarjeta: 9, virtual: true });
                        }
                    }
                    return;
                }

                /* —— Rutina estándar —— */
                let placed = 0;
                let idx = i;
                while (placed < suspLen) {
                    idx += 1;
                    if (idx >= headers.length) break;
                    const hd = headers[idx];
                    const cell = row.cols[hd] ?? [];
                    if (cell.some((c) => c.tipo_tarjeta === 10)) continue;
                    row.cols[hd] ??= [];
                    if (!row.cols[hd].some((c) => c.tipo_tarjeta === 8)) row.cols[hd].push({ tipo_tarjeta: 8, virtual: true });
                    placed += 1;
                }

                if (generateH && idx + 1 < headers.length) {
                    const hHead = headers[idx + 1];
                    const cellH = row.cols[hHead] ?? [];
                    if (!cellH.some((c) => c.tipo_tarjeta === 10) && !cellH.some((c) => c.tipo_tarjeta === 9)) {
                        row.cols[hHead] ??= [];
                        row.cols[hHead].push({ tipo_tarjeta: 9, virtual: true });
                    }
                }
            });
        });

        /* Orden final: institución > nombre */
        return Object.entries(map).sort(([, a], [, b]) => {
            if (a.instId !== b.instId) return a.instId - b.instId;
            return a.name.localeCompare(b.name, "es");
        });
    }, [tarjetas, descansos, config, headers, isTwoLegKO, idevent]);

    /* ─────────────── Totales por institución ─────────────── */
    const totals = useMemo(() => {
        const inst = {};
        rows.forEach(([, row]) => {
            inst[row.instId] ??= { sigla: row.sigla, logo: row.logo, points: 0 };
            headers.forEach((h) => {
                const cell = (row.cols[h] ?? []).filter((c) => !c.virtual);
                if (!cell.length) return;
                const roja = cell.some((c) => c.tipo_tarjeta === 2 || c.tipo_tarjeta === 5);
                const yCount = cell.filter((c) => c.tipo_tarjeta === 1).length;
                inst[row.instId].points += roja || yCount >= 2 ? 20 : yCount * 10;
            });
        });
        return Object.entries(inst)
            .map(([id, v]) => ({ id, ...v }))
            .sort((a, b) => b.points - a.points);
    }, [rows, headers]);

    if (!config) return null;

    /* ---------- render ---------- */
    return (
        <div className="w-full overflow-x-auto">
            {/* contenedor para scroll vertical con header fijo */}
            <div className="max-h-[75vh] overflow-y-auto">
                <table className="w-full min-w-max border-collapse text-xs sm:text-sm">
                    {/* ─── THEAD ─── */}
                    <thead className="sticky top-0 z-20 bg-gradient-to-r from-cyan-400 to-blue-500 text-white">
                        <tr>
                            <th className="px-2 py-2 border-r border-white/30 last:border-r-0">N°</th>
                            <th className="px-2 py-2 border-r border-white/30 last:border-r-0">SIGLAS</th>
                            <th className="px-2 py-2 border-r border-white/30 last:border-r-0 text-left">
                                NOMBRES Y APELLIDOS
                            </th>
                            {headers.map((h) => (
                                <th
                                    key={h}
                                    className="px-2 py-2 border-r border-white/30 last:border-r-0 whitespace-nowrap"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* ─── TBODY ─── */}
                    <tbody>
                        {rows.map(([pid, row], idx) => (
                            <tr key={pid} className={idx % 2 ? "bg-white" : "bg-gray-50"}>
                                <td className="px-2 py-1 text-center border-r border-gray-200 last:border-r-0">
                                    {idx + 1}
                                </td>
                                <td className="px-2 py-1 border-r border-gray-200 last:border-r-0">
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={row.logo}
                                            alt={row.sigla}
                                            className="h-6 w-6 rounded-full object-cover shrink-0"
                                        />
                                        <span>{row.sigla}</span>
                                    </div>
                                </td>
                                <td className="px-2 py-1 text-left border-r border-gray-200 last:border-r-0">
                                    {row.name}
                                </td>

                                {headers.map((h) => {
                                    const cell = row.cols[h] ?? [];

                                    const hasH = cell.some((c) => c.tipo_tarjeta === 9);
                                    const hasI = cell.some((c) => c.tipo_tarjeta === 11); // informe
                                    const yell = cell.filter((c) => c.tipo_tarjeta === 1).length;
                                    const reds = cell.filter((c) => c.tipo_tarjeta === 2).map(() => 2);
                                    const re = cell.some((c) => c.tipo_tarjeta === 5);
                                    const hasD = cell.some((c) => c.tipo_tarjeta === 10);
                                    const hasS = cell.some((c) => c.tipo_tarjeta === 8);

                                    const badges = [];
                                    if (hasS) badges.push(8);              // <— suspensión primero
                                    if (hasI) badges.push(11);             // <— luego el informe
                                    if (hasH) badges.push(9);              // habilitado
                                    if (yell >= 2) badges.push(3);         // doble amarilla
                                    else if (yell === 1) badges.push(1);   // amarilla simple
                                    if (re) badges.push(5);                // roja por evaluación
                                    reds.forEach(() => badges.push(2));    // cada roja normal
                                    if (hasD) badges.push(10);             // descanso

                                    return (
                                        <td
                                            key={h}
                                            className="px-2 py-1 text-center border-r border-gray-200 last:border-r-0 whitespace-nowrap"
                                        >
                                            {badges.map((tid, i) => {
                                                const info = idTarjeta(tid);

                                                if (tid === 11) {
                                                    return (
                                                        <div key={i} className="relative inline-block mx-0.5 group">
                                                            {/* Icono azul con cursor-pointer */}
                                                            <FaInfoCircle className="text-lg text-blue-600 cursor-pointer" />

                                                            {/* Tooltip corregido: sin comentarios dentro de className */}
                                                            <div
                                                                className="
            absolute
            bottom-full
            left-1/2
            transform -translate-x-1/2
            mb-1
            bg-gray-800
            text-white
            text-xs
            rounded
            px-2
            py-1
            opacity-0
            group-hover:opacity-100
            transition-opacity
            duration-200
            pointer-events-none
            whitespace-normal
            break-words
          "
                                                                style={{
                                                                    width: "240px",        // ancho fijo (por ejemplo 240px)
                                                                    maxWidth: "400px",     // opcional, para que no pase de 400px si quieres
                                                                    wordBreak: "break-word",
                                                                    whiteSpace: "normal",
                                                                    zIndex: 50
                                                                }}

                                                            >
                                                                {info.description}
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                // Resto de badges (amarilla, roja, etc.) sin cambios:
                                                const isYellow = tid === 1;
                                                return (
                                                    <span
                                                        key={i}
                                                        className={
                                                            isYellow
                                                                ? "inline-block rounded px-2 py-0.5 mx-0.5 text-[10px] font-semibold text-black"
                                                                : "inline-block rounded-full px-2 py-0.5 mx-0.5 text-[10px] font-semibold text-white"
                                                        }
                                                        style={{ backgroundColor: idTarjeta(tid).color }}
                                                        title={idTarjeta(tid).name}
                                                    >
                                                        {idTarjeta(tid).abrev}
                                                    </span>
                                                );
                                            })}


                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* AQUI */}
            {
                +idevent === 197 && (+idsport === 5) && (
                    <div className="flex items-start gap-2 p-4 mb-6 bg-blue-50 border-l-4 border-blue-500 text-blue-800 rounded">
                        <FaInfoCircle className="mt-1 text-xl" />
                        <p className="text-sm leading-relaxed">
                            Tras el informe recibido por el árbitro principal del partido en el encuentro entre la UPC vs ULIMA, válido por la
                            semifinal de ida de la liga universitaria de futbol varones 2025, la comisión organizadora amplia la fecha de suspensión
                            al deportista indicado en el informe.
                        </p>
                    </div>
                )
            }

            {/* Tabla de puntos acumulados */}
            <div className="mt-6 max-w-md mx-auto">
                <h3 className="mb-3 text-center text-base font-semibold text-gray-700">
                    Puntos acumulados por tarjetas
                </h3>
                <div className="overflow-hidden rounded-lg shadow ring-1 ring-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                            <tr>
                                <th className="w-10 px-2 py-2 text-center font-medium border-r border-white/30 last:border-r-0">
                                    #
                                </th>
                                <th className="px-4 py-2 font-medium text-left border-r border-white/30 last:border-r-0">
                                    SIGLAS
                                </th>
                                <th className="w-20 px-3 py-2 text-center font-medium">PUNTOS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {totals.map((t, i) => (
                                <tr key={t.id} className="hover:bg-gray-50">
                                    <td className="px-2 py-2 text-center">{i + 1}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={t.logo}
                                                alt={`Logo ${t.sigla}`}
                                                className="h-6 w-6 rounded-full object-cover shrink-0"
                                            />
                                            <span>{t.sigla}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-center font-semibold">{t.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
