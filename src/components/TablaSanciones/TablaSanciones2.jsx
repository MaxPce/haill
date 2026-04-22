// components/TablaSanciones2.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/config.js";
import { useParams } from "react-router-dom";
import { idTarjeta } from "../../utils/idTarjeta.js";

const KO_PHASE_NAMES = {
    2: ["SEMIS", "FINAL"],
    3: ["CUARTOS", "SEMIS", "FINAL"],
    4: ["OCTAVOS", "CUARTOS", "SEMIS", "FINAL"],
};

const FALLBACK_CARD_INFO = {
    amarilla: 0,
    roja: false,
    color: "#9CA3AF",
    name: "Sin datos",
    abrev: "?",
};

const asArray = (value) => (Array.isArray(value) ? value : []);

const asText = (value, fallback = "") =>
    typeof value === "string" ? value : value == null ? fallback : String(value);

const asInt = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

const buildLogoUrl = (base, path) => {
    const safeBase = asText(base, "");
    const safePath = asText(path, "");
    return `${safeBase}${safePath}`;
};

const getTarjetaInfo = (tipoTarjeta) => {
    try {
        return idTarjeta(tipoTarjeta) ?? FALLBACK_CARD_INFO;
    } catch (error) {
        console.error("Error resolviendo idTarjeta:", error, tipoTarjeta);
        return FALLBACK_CARD_INFO;
    }
};

const toTitleCase = (value = "") =>
    asText(value, "")
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0]?.toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");

export default function TablaSanciones2() {
    const { idevent, idsport } = useParams();
    const [config, setConfig] = useState(null);
    const [tarjetas, setTarjetas] = useState([]);
    const [descansos, setDescansos] = useState([]);

    /* ---------- carga ---------- */
    useEffect(() => {
        if (!idevent || !idsport) return;

        let cancelled = false;

        (async () => {
            try {
                const [{ data: cfg }, { data: tjs }] = await Promise.all([
                    axios.post(`${API_BASE_URL}/config_category`, {
                        idevent: +idevent,
                        idsport: +idsport,
                    }),
                    axios.post(`${API_BASE_URL}/gettarjetas`, {
                        idevent: +idevent,
                        idsport: +idsport,
                    }),
                ]);

                if (cancelled) return;

                setConfig(cfg && typeof cfg === "object" ? cfg : null);
                const tarjetasSinConmocion = asArray(tjs).filter(
                    (t) => asInt(t?.tipo_tarjeta, 0) !== 11
                  );
                  
                  setTarjetas(tarjetasSinConmocion);

                const { data: resp } = await axios.post(
                    `${API_BASE_URL}/getparticipantdescansowithfecha`,
                    { idevent: +idevent, idsport: +idsport }
                );

                if (cancelled) return;

                const mapped = asArray(resp).map((d) => ({
                    siglas: asText(d?.ParticipantBye?.Institution?.abrev, ""),
                    nro_fecha: asInt(d?.nro_fecha, 0),
                }));

                setDescansos(mapped);
            } catch (e) {
                console.error("Error cargando datos:", e);
                if (!cancelled) {
                    setConfig(null);
                    setTarjetas([]);
                    setDescansos([]);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [idevent, idsport]);

    /* ---------- encabezados ---------- */
    const headers = useMemo(() => {
        try {
            if (!config || typeof config !== "object") return [];

            const nroFechasGrupo = Math.max(0, asInt(config?.nro_fechas_grupo, 0));
            const nroEtapasFinal = asInt(config?.nro_etapas_final, 0);

            const fechas = Array.from(
                { length: nroFechasGrupo },
                (_, i) => `FECHA ${i + 1}`
            );

            return [...fechas, ...(KO_PHASE_NAMES[nroEtapasFinal] ?? [])];
        } catch (error) {
            console.error("Error construyendo encabezados:", error);
            return [];
        }
    }, [config]);

    /* ---------- helpers ---------- */
    const colFor = (t) => {
        const phaseNames = KO_PHASE_NAMES[asInt(config?.nro_etapas_final, 0)] ?? [];
        return asInt(t?.idtypephase, 0) === 1
            ? `FECHA ${asInt(t?.nro_fecha, 0)}`
            : phaseNames[asInt(t?.nro_fecha, 0) - 1] ?? null;
    };

    /* ---------- filas ---------- */
    const rows = useMemo(() => {
        try {
            if (!config || typeof config !== "object") return [];

            const map = {};

            /* 1 · tarjetas originales (cambiando RE cuando evaluar=true) */
            asArray(tarjetas).forEach((t, index) => {
                const col = colFor(t);
                if (!col) return;

                const instId = asInt(t?.institution?.idinstitution, 0);
                const personaNombre = toTitleCase(
                    t?.accreditation?.persona ??
                    t?.accreditation?.persona_completa ??
                    t?.accreditation?.person?.persona ??
                    "-"
                ) || "-";

                const pid =
                    t?.idacreditation ?? `${instId || "inst"}-${personaNombre}-${index}`;

                const tipoFinal =
                    t?.evaluar && asInt(t?.tipo_tarjeta, 0) === 2
                        ? 5
                        : asInt(t?.tipo_tarjeta, 0);

                map[pid] ??= {
                    instId,
                    sigla: asText(t?.institution?.abrev, "-"),
                    logo: buildLogoUrl(
                        t?.institution?.path_base,
                        t?.institution?.image_path
                    ),
                    name: personaNombre,
                    cols: {},
                };

                map[pid].cols[col] ??= [];
                map[pid].cols[col].push({
                    tipo_tarjeta: tipoFinal,
                    virtual: false,
                    rojaEval: tipoFinal === 5,
                    minutes:
                        t?.minutes == null || t?.minutes === ""
                            ? null
                            : asInt(t?.minutes, null),
                });
            });

            /* 2 · descansos */
            asArray(descansos).forEach((d) => {
                const nroFecha = asInt(d?.nro_fecha, 0);
                if (!nroFecha) return;

                const header = `FECHA ${nroFecha}`;
                const siglas = asText(d?.siglas, "");
                if (!siglas) return;

                Object.values(map).forEach((row) => {
                    if (row?.sigla === siglas) {
                        row.cols[header] ??= [];
                        if (!row.cols[header].some((c) => c?.tipo_tarjeta === 10)) {
                            row.cols[header].push({ tipo_tarjeta: 10, virtual: true });
                        }
                    }
                });
            });

            /* umbral dinámico */
            const yellowThreshold =
                asInt(idevent, 0) === 202 &&
                    [6, 7].includes(asInt(idsport, 0))
                    ? 3
                    : 2;

            /* 2-bis · acumulación de amarillas solo para idevent 202 */
            if (asInt(idevent, 0) === 202) {
                Object.values(map).forEach((row) => {
                    let acc = 0;

                    headers.forEach((header, i) => {
                        if (!asText(header).startsWith("FECHA")) return;

                        const cell = asArray(row?.cols?.[header]);
                        acc += cell.filter((c) => asInt(c?.tipo_tarjeta, 0) === 1).length;

                        if (acc >= yellowThreshold) {
                            let sIdx = i;

                            while (++sIdx < headers.length) {
                                const nxt = headers[sIdx];
                                const hasD = asArray(row?.cols?.[nxt]).some(
                                    (c) => asInt(c?.tipo_tarjeta, 0) === 10
                                );
                                if (!hasD) {
                                    row.cols[nxt] ??= [];
                                    if (
                                        !row.cols[nxt].some(
                                            (c) => asInt(c?.tipo_tarjeta, 0) === 8
                                        )
                                    ) {
                                        row.cols[nxt].push({
                                            tipo_tarjeta: 8,
                                            virtual: true,
                                        });
                                    }
                                    break;
                                }
                            }

                            while (++sIdx < headers.length) {
                                const nxt = headers[sIdx];
                                const hasD = asArray(row?.cols?.[nxt]).some(
                                    (c) => asInt(c?.tipo_tarjeta, 0) === 10
                                );
                                if (!hasD) {
                                    row.cols[nxt] ??= [];
                                    if (
                                        !row.cols[nxt].some(
                                            (c) => asInt(c?.tipo_tarjeta, 0) === 9
                                        )
                                    ) {
                                        row.cols[nxt].push({
                                            tipo_tarjeta: 9,
                                            virtual: true,
                                        });
                                    }
                                    break;
                                }
                            }

                            acc = 0;
                        }

                        if (cell.some((c) => asInt(c?.tipo_tarjeta, 0) === 8)) acc = 0;
                    });
                });
            }

            /* 3 · suspensiones y habilitados dinámicos — salta descansos */
            const analyseCell = (cell) => {
                let yell = 0;
                let suspLen = 1;
                let generateH = false;
                let hasTrigger = false;

                asArray(cell).forEach((c) => {
                    const info = getTarjetaInfo(c?.tipo_tarjeta);
                    yell += asInt(info?.amarilla, 0);

                    if (info?.roja) {
                        hasTrigger = true;
                        if (c?.rojaEval) {
                            if (c?.minutes != null) {
                                suspLen = asInt(c?.minutes, 1);
                                generateH = true;
                            } else {
                                suspLen = 1;
                                generateH = false;
                            }
                        } else {
                            suspLen = 1;
                            generateH = true;
                        }
                    }
                });

                if (!hasTrigger && yell >= 2) {
                    hasTrigger = true;
                    suspLen = 1;
                    generateH = true;
                }

                return { suspend: hasTrigger, suspLen, generateH };
            };

            Object.values(map).forEach((row) => {
                headers.forEach((h, i) => {
                    const { suspend, suspLen, generateH } = analyseCell(row?.cols?.[h]);
                    if (!suspend) return;

                    let placed = 0;
                    let idx = i;
                    while (placed < suspLen) {
                        idx += 1;
                        if (idx >= headers.length) break;

                        const nextHeader = headers[idx];
                        const nextCell = asArray(row?.cols?.[nextHeader]);
                        if (nextCell.some((c) => asInt(c?.tipo_tarjeta, 0) === 10)) continue;

                        row.cols[nextHeader] ??= [];
                        if (
                            !row.cols[nextHeader].some(
                                (c) => asInt(c?.tipo_tarjeta, 0) === 8
                            )
                        ) {
                            row.cols[nextHeader].push({ tipo_tarjeta: 8, virtual: true });
                        }
                        placed += 1;
                    }

                    if (!generateH) return;

                    for (let k = idx + 1; k < headers.length; k++) {
                        const laterHeader = headers[k];
                        const laterCell = asArray(row?.cols?.[laterHeader]);
                        if (!laterCell.some((c) => asInt(c?.tipo_tarjeta, 0) === 10)) {
                            row.cols[laterHeader] ??= [];
                            if (
                                !row.cols[laterHeader].some(
                                    (c) => asInt(c?.tipo_tarjeta, 0) === 9
                                )
                            ) {
                                row.cols[laterHeader].push({
                                    tipo_tarjeta: 9,
                                    virtual: true,
                                });
                            }
                            break;
                        }
                    }
                });
            });

            /* ---------- ORDEN FINAL ---------- */
            return Object.entries(map).sort(([, a], [, b]) => {
                const instA = asInt(a?.instId, 0);
                const instB = asInt(b?.instId, 0);
                if (instA !== instB) return instA - instB;
                return asText(a?.name, "").localeCompare(asText(b?.name, ""), "es");
            });
        } catch (error) {
            console.error("Error construyendo filas de TablaSanciones2:", error);
            return [];
        }
    }, [tarjetas, descansos, config, headers, idevent, idsport]);

    /* ---------- puntos por institución ---------- */
    const totals = useMemo(() => {
        try {
            const instMap = {};

            asArray(rows).forEach(([, row]) => {
                const instKey = row?.instId ?? "unknown";

                if (!instMap[instKey]) {
                    instMap[instKey] = {
                        sigla: asText(row?.sigla, "-"),
                        logo: asText(row?.logo, ""),
                        points: 0,
                    };
                }

                headers.forEach((h) => {
                    const cell = asArray(row?.cols?.[h]).filter((c) => !c?.virtual);
                    if (!cell.length) return;

                    const hasRed = cell.some((c) =>
                        [2, 5].includes(asInt(c?.tipo_tarjeta, 0))
                    );
                    const yellCount = cell.filter(
                        (c) => asInt(c?.tipo_tarjeta, 0) === 1
                    ).length;

                    if (hasRed || yellCount >= 2) {
                        instMap[instKey].points += 20;
                    } else {
                        instMap[instKey].points += yellCount * 10;
                    }
                });
            });

            return Object.entries(instMap)
                .map(([id, v]) => ({ id, ...v }))
                .sort((a, b) => asInt(b?.points, 0) - asInt(a?.points, 0));
        } catch (error) {
            console.error("Error calculando puntos acumulados:", error);
            return [];
        }
    }, [rows, headers]);

    if (!config || typeof config !== "object") return null;

    /* ---------- render ---------- */
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-xs sm:text-sm">
                <thead className="sticky top-0 bg-gradient-to-r from-cyan-400 to-blue-500 text-white">
                    <tr>
                        <th className="px-3 py-2">N°</th>
                        <th className="px-3 py-2">SIGLAS</th>
                        <th className="px-3 py-2 text-left">NOMBRES Y APELLIDOS</th>
                        {asArray(headers).map((h) => (
                            <th key={h} className="px-3 py-2">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {asArray(rows).map(([pid, row], idx) => (
                        <tr key={pid} className={idx % 2 ? "bg-white" : "bg-gray-50"}>
                            <td className="px-2 py-1 text-center">{idx + 1}</td>
                            <td className="px-2 py-1">
                                <div className="flex items-center gap-2">
                                    {row?.logo ? (
                                        <img
                                            src={row.logo}
                                            alt={row?.sigla ? `Logo ${row.sigla}` : "Logo institución"}
                                            className="h-6 w-6 rounded-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                    ) : null}
                                    <span>{asText(row?.sigla, "-")}</span>
                                </div>
                            </td>
                            <td className="px-2 py-1 text-left">{asText(row?.name, "-")}</td>
                            {asArray(headers).map((h) => {
                                const cell = asArray(row?.cols?.[h]);

                                const hasH = cell.some(
                                    (c) => asInt(c?.tipo_tarjeta, 0) === 9
                                );
                                const yell = cell.filter(
                                    (c) => asInt(c?.tipo_tarjeta, 0) === 1
                                ).length;
                                const reds = cell
                                    .filter((c) => asInt(c?.tipo_tarjeta, 0) === 2)
                                    .map(() => 2);
                                const re = cell.some(
                                    (c) => asInt(c?.tipo_tarjeta, 0) === 5
                                );
                                const hasD = cell.some(
                                    (c) => asInt(c?.tipo_tarjeta, 0) === 10
                                );
                                const hasS = cell.some(
                                    (c) => asInt(c?.tipo_tarjeta, 0) === 8
                                );

                                const badges = [];
                                if (hasH) badges.push(9);
                                if (yell >= 2) badges.push(3);
                                else if (yell === 1) badges.push(1);
                                if (re) badges.push(5);
                                reds.forEach(() => badges.push(2));
                                if (hasD) badges.push(10);
                                if (hasS) badges.push(8);

                                return (
                                    <td key={h} className="px-2 py-1 text-center">
                                        {badges.map((tid, i) => {
                                            const info = getTarjetaInfo(tid);
                                            const isYellow = tid === 1;

                                            return (
                                                <span
                                                    key={`${h}-${tid}-${i}`}
                                                    className={
                                                        isYellow
                                                            ? "inline-block rounded px-2 py-0.5 mx-0.5 text-[10px] font-semibold text-black"
                                                            : "inline-block rounded-full px-2 py-0.5 mx-0.5 text-[10px] font-semibold text-white"
                                                    }
                                                    style={{
                                                        backgroundColor:
                                                            info?.color || FALLBACK_CARD_INFO.color,
                                                    }}
                                                    title={asText(
                                                        info?.name,
                                                        FALLBACK_CARD_INFO.name
                                                    )}
                                                >
                                                    {asText(
                                                        info?.abrev,
                                                        FALLBACK_CARD_INFO.abrev
                                                    )}
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

            {![56, 57].includes(+idsport) && (
                <div className="mt-8 w-full max-w-md mx-auto">
                    <h3 className="mb-4 text-center text-base font-semibold text-gray-700">
                        Puntos acumulados por tarjetas
                    </h3>

                    <div className="overflow-hidden rounded-lg shadow-md ring-1 ring-gray-200">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                                <tr>
                                    <th className="w-10 px-2 py-2 text-center font-medium">#</th>
                                    <th className="px-4 py-2 font-medium text-left">SIGLAS</th>
                                    <th className="w-20 px-3 py-2 text-center font-medium">PUNTOS</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100 bg-white">
                                {asArray(totals).map((t, i) => (
                                    <tr key={t.id} className="hover:bg-gray-50">
                                        <td className="px-2 py-2 text-center">{i + 1}</td>
                                        <td className="px-4 py-2">
                                            <div className="flex items-center gap-2">
                                                {t?.logo ? (
                                                    <img
                                                        src={t.logo}
                                                        alt={`Logo ${asText(t?.sigla, "-")}`}
                                                        className="h-6 w-6 rounded-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = "none";
                                                        }}
                                                    />
                                                ) : null}
                                                <span>{asText(t?.sigla, "-")}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-center font-semibold">
                                            {asInt(t?.points, 0)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
    );
}
