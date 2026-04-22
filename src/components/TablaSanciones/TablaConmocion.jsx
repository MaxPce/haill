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

const CONMOCION_CARD_ID = 11;

const toTitleCase = (s = "") =>
    s
        .split(" ")
        .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
        .join(" ");

const buildHeaderLabel = (config, tarjeta) => {
    if (!config || !tarjeta) return null;

    if (Number(tarjeta.idtypephase) === 1) {
        return `FECHA ${tarjeta.nro_fecha}`;
    }

    return (
        (KO_PHASE_NAMES[config.nro_etapas_final] ?? [])[Number(tarjeta.nro_fecha) - 1] ??
        null
    );
};

const getMaxMinutesFromCell = (cell = []) =>
    cell.reduce((max, item) => {
        if (Number(item.tipo_tarjeta) !== CONMOCION_CARD_ID) return max;
        const next = Number(item.minutes) || 0;
        return next > max ? next : max;
    }, 0);

const getMaxExtraMinutesFromCell = (cell = []) =>
    cell.reduce((max, item) => {
        if (Number(item.tipo_tarjeta) !== CONMOCION_CARD_ID) return max;
        const next = Number(item.extraminutes) || 0;
        return next > max ? next : max;
    }, 0);

export default function TablaConmocion() {
    const { idevent, idsport } = useParams();

    const [config, setConfig] = useState(null);
    const [tarjetas, setTarjetas] = useState([]);
    const [descansos, setDescansos] = useState([]);

    useEffect(() => {
        if (!idevent || !idsport) return;

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

                setConfig(cfg);
                setTarjetas(tjs);

                const { data: resp } = await axios.post(
                    `${API_BASE_URL}/getparticipantdescansowithfecha`,
                    {
                        idevent: +idevent,
                        idsport: +idsport,
                    }
                );

                const mapped = resp.map((d) => ({
                    siglas: d.ParticipantBye?.Institution?.abrev,
                    nro_fecha: d.nro_fecha,
                }));

                setDescansos(mapped);
            } catch (error) {
                console.error("Error cargando tabla de conmociones:", error);
            }
        })();
    }, [idevent, idsport]);

    const headers = useMemo(() => {
        if (!config) return [];

        const fechas = Array.from(
            { length: Number(config.nro_fechas_grupo) || 0 },
            (_, i) => `FECHA ${i + 1}`
        );

        return [...fechas, ...(KO_PHASE_NAMES[config.nro_etapas_final] ?? [])];
    }, [config]);

    const rows = useMemo(() => {
        if (!config) return [];

        const map = {};

        tarjetas
            .filter((t) => Number(t.tipo_tarjeta) === CONMOCION_CARD_ID)
            .forEach((t) => {
                const col = buildHeaderLabel(config, t);
                if (!col) return;
                if (!t?.institution || !t?.accreditation) return;

                const pid = t.idacreditation;

                map[pid] ??= {
                    instId: t.institution.idinstitution,
                    sigla: t.institution.abrev,
                    logo: `${t.institution.path_base}${t.institution.image_path}`,
                    name: toTitleCase(t.accreditation.persona),
                    cols: {},
                };

                map[pid].cols[col] ??= [];
                map[pid].cols[col].push({
                    tipo_tarjeta: CONMOCION_CARD_ID,
                    virtual: false,
                    minutes: Number(t.minutes) || 0,
                    extraminutes: Number(t.extraminutes) || 0,
                });
            });

        // Agregar descansos visuales para mantener la lectura tipo control de tarjetas
        descansos.forEach((d) => {
            const header = `FECHA ${d.nro_fecha}`;

            Object.values(map).forEach((row) => {
                if (row.sigla === d.siglas) {
                    row.cols[header] ??= [];
                    if (!row.cols[header].some((c) => Number(c.tipo_tarjeta) === 10)) {
                        row.cols[header].push({
                            tipo_tarjeta: 10,
                            virtual: true,
                        });
                    }
                }
            });
        });

        // Generar suspensiones virtuales (S) según minutes de la conmoción
        Object.values(map).forEach((row) => {
            headers.forEach((header, index) => {
                const cell = row.cols[header] ?? [];
                const suspLen = getMaxMinutesFromCell(cell);

                if (suspLen <= 0) return;

                let placed = 0;
                let idx = index;

                while (placed < suspLen) {
                    idx += 1;
                    if (idx >= headers.length) break;

                    const nextHeader = headers[idx];
                    row.cols[nextHeader] ??= [];

                    const hasDescanso = row.cols[nextHeader].some(
                        (c) => Number(c.tipo_tarjeta) === 10
                    );

                    if (hasDescanso) continue;

                    const hasSuspendido = row.cols[nextHeader].some(
                        (c) => Number(c.tipo_tarjeta) === 8
                    );

                    if (!hasSuspendido) {
                        row.cols[nextHeader].push({
                            tipo_tarjeta: 8,
                            virtual: true,
                        });
                    }

                    placed += 1;
                }
            });
        });

        return Object.entries(map).sort(([, a], [, b]) => {
            if (a.instId !== b.instId) return a.instId - b.instId;
            return a.name.localeCompare(b.name, "es");
        });
    }, [tarjetas, descansos, config, headers]);

    if (!config) return null;

    if (!rows.length) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white px-6 py-8 text-center text-sm text-gray-500 shadow-sm">
                No hay conmociones registradas para este evento.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-xs sm:text-sm">
                <thead className="sticky top-0 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                    <tr>
                        <th className="px-3 py-2">N°</th>
                        <th className="px-3 py-2">SIGLAS</th>
                        <th className="px-3 py-2 text-left">NOMBRES Y APELLIDOS</th>
                        {headers.map((h) => (
                            <th key={h} className="px-3 py-2">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {rows.map(([pid, row], idx) => (
                        <tr key={pid} className={idx % 2 ? "bg-white" : "bg-gray-50"}>
                            <td className="px-2 py-1 text-center">{idx + 1}</td>

                            <td className="px-2 py-1">
                                <div className="flex items-center gap-2">
                                    <img
                                        src={row.logo}
                                        alt=""
                                        className="h-6 w-6 rounded-full object-cover"
                                    />
                                    <span>{row.sigla}</span>
                                </div>
                            </td>

                            <td className="px-2 py-1 text-left">{row.name}</td>

                            {headers.map((h) => {
                                const cell = row.cols[h] ?? [];

                                const hasIR = cell.some(
                                    (c) => Number(c.tipo_tarjeta) === CONMOCION_CARD_ID
                                );
                                const hasS = cell.some((c) => Number(c.tipo_tarjeta) === 8);
                                const hasD = cell.some((c) => Number(c.tipo_tarjeta) === 10);
                                const minutes = getMaxMinutesFromCell(cell);
                                const extraminutes = getMaxExtraMinutesFromCell(cell);

                                return (
                                    <td key={h} className="px-2 py-1 text-center">
                                        <div className="flex flex-wrap items-center justify-center gap-1">
                                            {hasIR && (
                                                <div className="flex flex-col items-center">
                                                    <span
                                                        className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                                                        style={{ backgroundColor: idTarjeta(11).color }}
                                                        title={`Conmoción${minutes > 0 ? ` · ${minutes} fecha(s) de suspensión` : ""
                                                            }${extraminutes > 0 ? ` · ${extraminutes} día(s) de suspensión` : ""
                                                            }`}
                                                    >
                                                        {idTarjeta(11).abrev}
                                                    </span>
                                                    {extraminutes > 0 && (
                                                        <span className="mt-0.5 text-[10px] font-medium text-gray-500">
                                                            ({extraminutes} días)
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {hasS && (
                                                <span
                                                    className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                                                    style={{ backgroundColor: idTarjeta(8).color }}
                                                    title={idTarjeta(8).name}
                                                >
                                                    {idTarjeta(8).abrev}
                                                </span>
                                            )}

                                            {hasD && (
                                                <span
                                                    className="inline-block rounded px-2 py-0.5 text-[10px] font-semibold text-white"
                                                    style={{ backgroundColor: idTarjeta(10).color }}
                                                    title={idTarjeta(10).name}
                                                >
                                                    {idTarjeta(10).abrev}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
