// src/components/TablaGoleadores/TablaGoleadores2.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/config.js";
import { useParams } from "react-router-dom";

const KO_PHASE_NAMES = {
    2: ["SEMIS", "FINAL"],
    3: ["CUARTOS", "SEMIS", "FINAL"],
    4: ["OCTAVOS", "CUARTOS", "SEMIS", "FINAL"],
};

const toTitleCase = (s = "") =>
    s
        .split(" ")
        .map((w) => w[0]?.toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");

export default function TablaGoleadores2() {
    const { idevent, idsport } = useParams();
    const [config, setConfig] = useState(null);
    const [goles, setGoles] = useState([]);

    /* ---------- carga ---------- */
    useEffect(() => {
        if (!idevent || !idsport) return;
        (async () => {
            try {
                const [{ data: cfg }, { data: goals }] = await Promise.all([
                    axios.post(`${API_BASE_URL}/config_category`, {
                        idevent: +idevent,
                        idsport: +idsport,
                    }),
                    axios.post(`${API_BASE_URL}/getgoles`, {
                        idevent: +idevent,
                        idsport: +idsport,
                    }),
                ]);
                setConfig(cfg);
                setGoles(goals);
            } catch (e) {
                console.error("Error cargando goleadores:", e);
            }
        })();
    }, [idevent, idsport]);

    /* ---------- encabezados ---------- */
    const headers = useMemo(() => {
        if (!config) return [];
        const fechas = Array.from(
            { length: config.nro_fechas_grupo },
            (_, i) => `FECHA ${i + 1}`
        );
        return [...fechas, ...(KO_PHASE_NAMES[config.nro_etapas_final] ?? [])];
    }, [config]);

    /* ---------- procesar goles ---------- */
    const { rows, totalsPerCol, grandTotal } = useMemo(() => {
        if (!config) return { rows: [], totalsPerCol: {}, grandTotal: 0 };

        const map = {}; // idacreditation -> data
        const totals = Object.fromEntries(headers.map((h) => [h, 0]));
        let overall = 0;
        console.log("golesss", goles)
        goles.forEach((g) => {
            const col =
                g.idtypephase === 1
                    ? `FECHA ${g.nro_fecha}`
                    : (KO_PHASE_NAMES[config.nro_etapas_final] ?? [])[g.nro_fecha - 1] ?? null;
            if (!col) return;

            const pid = g.idacreditation;
            map[pid] ??= {
                idinstitution: g.idinstitution,
                sigla: g.institution?.abrev,
                logo: `${g.institution.path_base}${g.institution.image_path}`,
                name: toTitleCase(g.accreditation.persona),
                cols: Object.fromEntries(headers.map((h) => [h, 0])),
                total: 0,
                lastIdx: -1,
            };

            map[pid].cols[col] += 1;
            map[pid].total += 1;
            totals[col] += 1;
            overall += 1;

            /* índice de la columna (sirve para el desempate por “fecha”/fase) */
            const colIdx = headers.indexOf(col);
            if (colIdx > map[pid].lastIdx) map[pid].lastIdx = colIdx;
        });

        /* ---------- orden final de filas ---------- */
        const rowsArr = Object.entries(map).sort(([, a], [, b]) => {
            if (b.total !== a.total) return b.total - a.total;          // 1º: más goles
            if (b.lastIdx !== a.lastIdx) return b.lastIdx - a.lastIdx;    // 2º: fecha/fase más reciente
            if (a.idinstitution !== b.idinstitution)
                return a.idinstitution - b.idinstitution;                  // 3º: universidad
            return a.name.localeCompare(b.name);                          // 4º: nombre
        });
        return { rows: rowsArr, totalsPerCol: totals, grandTotal: overall };
    }, [goles, config, headers]);

    if (!config) return null;

    /* ---------- render ---------- */
    return (
        <div className="overflow-x-auto">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">
                TABLA DE GOLEADORES
            </h2>
            <table className="min-w-full border-collapse text-xs sm:text-sm">
                <thead className="sticky top-0 bg-gradient-to-r from-cyan-400 to-blue-500 text-white">
                    <tr>
                        <th className="px-3 py-2">N°</th>
                        <th className="px-3 py-2">SIGLAS</th>
                        <th className="px-3 py-2 text-left">NOMBRES Y APELLIDOS</th>
                        {headers.map((h) => (
                            <th key={h} className="px-3 py-2 text-center">
                                {h}
                            </th>
                        ))}
                        <th className="px-3 py-2 text-center">TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(([pid, row], idx) => (
                        <tr key={pid} className={idx % 2 ? "bg-white" : "bg-gray-50"}>
                            <td className="px-2 py-1 text-center">{idx + 1}</td>
                            <td className="px-2 py-1">
                                <div className="flex items-center gap-2">
                                    <img src={row.logo} alt="" className="h-6 w-6 rounded-full object-cover" />
                                    <span>{row.sigla}</span>
                                </div>
                            </td>
                            <td className="px-2 py-1 text-left">{row.name}</td>
                            {headers.map((h) => (
                                <td key={h} className="px-2 py-1 text-center font-semibold">
                                    {row.cols[h] || " "}
                                </td>
                            ))}
                            <td className="px-2 py-1 text-center font-bold">{row.total}</td>
                        </tr>
                    ))}
                    {/* fila de totales */}
                    <tr className="bg-indigo-100 font-semibold">
                        <td colSpan={3} className="px-3 py-2 text-right">TOTAL:</td>
                        {headers.map((h) => (
                            <td key={h} className="px-2 py-2 text-center">
                                {totalsPerCol[h]}
                            </td>
                        ))}
                        <td className="px-2 py-2 text-center">{grandTotal}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
