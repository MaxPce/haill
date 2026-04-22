// ROUTE: src/components/TablaGoleadores/TablaTries.jsx

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import API_BASE_URL from "../../config/config.js";
import {
    getRugbyTryScorers,
    getRugbyTryScorersByDate,
} from "../../services/rugbyStatsService.js";

const KO_PHASE_NAMES = {
    2: ["SEMIS", "FINAL"],
    3: ["CUARTOS", "SEMIS", "FINAL"],
    4: ["OCTAVOS", "CUARTOS", "SEMIS", "FINAL"],
};

const TAB_TRIES_BY_DATE = "TRIES_BY_DATE";
const TAB_PODIUM = "PODIUM";

function PodiumStep({ row, place, heightClass = "h-40", tone = "slate" }) {
    if (!row) return <div className="hidden md:block" />;

    const toneMap = {
        gold: {
            shell:
                "border-amber-200/80 bg-gradient-to-b from-amber-50 via-white to-amber-100/70 shadow-amber-100/70",
            rankBadge: "bg-amber-400 text-slate-950",
            triesText: "text-amber-600",
            pillar: "from-amber-300 via-amber-400 to-amber-500",
            softRing: "ring-amber-100",
        },
        silver: {
            shell:
                "border-slate-200/90 bg-gradient-to-b from-slate-50 via-white to-slate-100 shadow-slate-200/70",
            rankBadge: "bg-slate-300 text-slate-900",
            triesText: "text-slate-700",
            pillar: "from-slate-300 via-slate-400 to-slate-500",
            softRing: "ring-slate-100",
        },
        bronze: {
            shell:
                "border-orange-200/80 bg-gradient-to-b from-orange-50 via-white to-orange-100/70 shadow-orange-100/70",
            rankBadge: "bg-orange-300 text-slate-900",
            triesText: "text-orange-600",
            pillar: "from-orange-300 via-orange-400 to-orange-500",
            softRing: "ring-orange-100",
        },
        slate: {
            shell:
                "border-slate-200/90 bg-gradient-to-b from-slate-50 via-white to-slate-100 shadow-slate-200/70",
            rankBadge: "bg-slate-900 text-white",
            triesText: "text-emerald-600",
            pillar: "from-slate-500 via-slate-700 to-slate-900",
            softRing: "ring-slate-100",
        },
    };

    const current = toneMap[tone] ?? toneMap.slate;

    return (
        <div className="flex h-full flex-col justify-end">
            <div
                className={`relative z-10 rounded-[28px] border px-4 pb-4 pt-4 shadow-xl ring-1 ${current.shell} ${current.softRing}`}
            >
                <div className="absolute right-4 top-4">
                    <div
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-black shadow-sm ${current.rankBadge}`}
                    >
                        {place}
                    </div>
                </div>

                <div className="flex items-center gap-3 pr-10">
                    {row.institutionLogo ? (
                        <img
                            src={row.institutionLogo}
                            alt={row.institutionAbbrev || row.playerName}
                            className="h-14 w-14 rounded-2xl border border-white/80 bg-white object-cover shadow-sm"
                        />
                    ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/80 bg-white text-sm font-bold text-slate-600 shadow-sm">
                            {row.institutionAbbrev?.slice(0, 3) || "RUG"}
                        </div>
                    )}

                    <div className="min-w-0 flex-1 text-left">
                        <div className="truncate text-base font-bold text-slate-900">
                            {row.playerName}
                        </div>
                        <div className="mt-1 truncate text-sm font-medium text-slate-500">
                            {row.institutionAbbrev || "Institución"}
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex items-end justify-between border-t border-slate-200/80 pt-4">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Tries
                    </div>
                    <div className={`text-4xl font-black leading-none ${current.triesText}`}>
                        {row.totalTries}
                    </div>
                </div>
            </div>

            <div
                className={`mx-auto mt-3 w-[82%] rounded-t-[28px] bg-gradient-to-b ${current.pillar} ${heightClass} shadow-lg`}
            />
        </div>
    );
}

function PodiumMobileCard({ row }) {
    if (!row) return null;

    return (
        <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-md shadow-slate-200/60">
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white shadow-sm">
                        {row.rank}
                    </div>

                    {row.institutionLogo ? (
                        <img
                            src={row.institutionLogo}
                            alt={row.institutionAbbrev || row.playerName}
                            className="h-11 w-11 shrink-0 rounded-2xl border border-slate-200 object-cover shadow-sm"
                        />
                    ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-600 shadow-sm">
                            {row.institutionAbbrev?.slice(0, 3) || "RUG"}
                        </div>
                    )}

                    <div className="min-w-0 text-left">
                        <div className="truncate text-sm font-semibold text-slate-900">
                            {row.playerName}
                        </div>
                        <div className="mt-1 truncate text-xs font-medium text-slate-500">
                            {row.institutionAbbrev || "Institución"}
                        </div>
                    </div>
                </div>

                <div className="shrink-0 text-center">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Tries
                    </div>
                    <div className="mt-1 inline-flex min-w-[52px] items-center justify-center rounded-2xl bg-emerald-50 px-3 py-1.5 text-2xl font-black text-emerald-600 ring-1 ring-emerald-100">
                        {row.totalTries}
                    </div>
                </div>
            </div>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="space-y-5">
            <div className="h-14 animate-pulse rounded-[28px] bg-slate-100" />
            <div className="hidden md:grid md:grid-cols-3 md:items-end md:gap-5">
                <div className="h-72 animate-pulse rounded-[32px] bg-slate-100" />
                <div className="h-80 animate-pulse rounded-[32px] bg-slate-100" />
                <div className="h-64 animate-pulse rounded-[32px] bg-slate-100" />
            </div>

            <div className="space-y-3 md:hidden">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-24 animate-pulse rounded-3xl border border-slate-200 bg-slate-100"
                    />
                ))}
            </div>

            <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
                <div className="hidden md:block">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-16 animate-pulse border-b border-slate-100 bg-slate-50"
                        />
                    ))}
                </div>

                <div className="divide-y divide-slate-100 md:hidden">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="h-24 animate-pulse bg-slate-50" />
                    ))}
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="rounded-[30px] border border-dashed border-slate-300 bg-white/90 p-10 text-center shadow-sm">
            <h3 className="text-xl font-semibold text-slate-800">
                Aún no hay tries publicados
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
                La tabla se alimenta solo con partidos oficializados y tries válidos.
            </p>
        </div>
    );
}

function ErrorState({ message }) {
    return (
        <div className="rounded-[30px] border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            <div className="text-sm font-semibold">
                No se pudo cargar la tabla de tries
            </div>
            <p className="mt-2 text-sm">{message}</p>
        </div>
    );
}

function StatPill({ label, value, tone = "emerald" }) {
    const toneMap = {
        emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
        slate: "bg-slate-100 text-slate-700 ring-slate-200",
        blue: "bg-blue-50 text-blue-700 ring-blue-100",
    };

    return (
        <div className={`rounded-2xl px-4 py-3 text-left ring-1 ${toneMap[tone] || toneMap.emerald}`}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">
                {label}
            </div>
            <div className="mt-1 text-2xl font-black leading-none">{value}</div>
        </div>
    );
}

function TabButton({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-150 ${active
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
        >
            {children}
        </button>
    );
}

function TriesByDateMobile({ rows, headers }) {
    return (
        <div className="space-y-3 md:hidden">
            {rows.map((row, index) => {
                const visibleCols = headers.filter((header) => Number(row.cols?.[header] || 0) > 0);

                return (
                    <div
                        key={row.idacreditation}
                        className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 text-left">
                                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                    #{index + 1}
                                </div>
                                <div className="mt-1 truncate text-sm font-bold text-slate-900">
                                    {row.playerName}
                                </div>
                                <div className="mt-1 truncate text-xs font-medium text-slate-500">
                                    {row.institutionAbbrev || "Institución"}
                                </div>
                            </div>

                            <div className="inline-flex min-w-[58px] items-center justify-center rounded-2xl bg-emerald-50 px-3 py-2 text-xl font-black text-emerald-600 ring-1 ring-emerald-100">
                                {row.total}
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {visibleCols.length ? (
                                visibleCols.map((header) => (
                                    <div
                                        key={`${row.idacreditation}-${header}`}
                                        className="rounded-2xl bg-slate-50 px-3 py-2 text-left"
                                    >
                                        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                            {header}
                                        </div>
                                        <div className="mt-1 text-lg font-black text-slate-900">
                                            {row.cols[header]}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 rounded-2xl border border-dashed border-slate-200 px-3 py-3 text-center text-xs text-slate-500">
                                    Sin tries cargados por fecha.
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function TriesByDateDesktop({ rows, headers, totalsPerCol, grandTotal }) {
    return (
        <div className="hidden md:block">
            <div className="overflow-x-auto rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                <table className="min-w-full border-collapse text-sm">
                    <thead className="bg-slate-900 text-white">
                        <tr>
                            <th className="w-20 px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em]">
                                #
                            </th>
                            <th className="w-32 px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em]">
                                Siglas
                            </th>
                            <th className="min-w-[280px] px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em]">
                                Nombres y apellidos
                            </th>
                            {headers.map((header) => (
                                <th
                                    key={header}
                                    className="min-w-[108px] px-4 py-4 text-center text-xs font-semibold uppercase tracking-[0.18em]"
                                >
                                    {header}
                                </th>
                            ))}
                            <th className="min-w-[110px] px-4 py-4 text-center text-xs font-semibold uppercase tracking-[0.18em]">
                                Total
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {rows.map((row, index) => (
                            <tr
                                key={row.idacreditation}
                                className={`transition-colors duration-150 hover:bg-emerald-50/40 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                                    }`}
                            >
                                <td className="px-4 py-4 text-left text-sm font-semibold text-slate-500">
                                    #{index + 1}
                                </td>
                                <td className="px-4 py-4 text-left text-sm font-semibold text-slate-700">
                                    <div className="flex items-center gap-2 text-left">
                                        {row.institutionLogo ? (
                                            <img
                                                src={row.institutionLogo}
                                                alt={row.institutionAbbrev || row.playerName}
                                                className="h-8 w-8 rounded-xl border border-slate-200 bg-white object-cover shadow-sm"
                                            />
                                        ) : (
                                            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-[10px] font-bold text-slate-600 shadow-sm">
                                                {row.institutionAbbrev?.slice(0, 3) || "RUG"}
                                            </div>
                                        )}
                                        <span className="text-left">{row.institutionAbbrev || "—"}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                                    {row.playerName}
                                </td>
                                {headers.map((header) => (
                                    <td
                                        key={`${row.idacreditation}-${header}`}
                                        className="px-4 py-4 text-center text-sm font-bold text-slate-700"
                                    >
                                        {row.cols[header] || ""}
                                    </td>
                                ))}
                                <td className="px-4 py-4 text-center">
                                    <span className="inline-flex min-w-[58px] items-center justify-center rounded-2xl bg-emerald-50 px-3 py-2 text-lg font-black text-emerald-600 ring-1 ring-emerald-100">
                                        {row.total}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                    <tfoot>
                        <tr className="bg-slate-100">
                            <td colSpan={3} className="px-4 py-4 text-right text-sm font-black uppercase tracking-[0.14em] text-slate-700">
                                Totales
                            </td>
                            {headers.map((header) => (
                                <td
                                    key={`total-${header}`}
                                    className="px-4 py-4 text-center text-sm font-black text-slate-800"
                                >
                                    {totalsPerCol[header] || 0}
                                </td>
                            ))}
                            <td className="px-4 py-4 text-center text-sm font-black text-slate-900">
                                {grandTotal}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}

export default function TablaTries() {
    const { idevent, idsport } = useParams();

    const [activeTab, setActiveTab] = useState(TAB_TRIES_BY_DATE);
    const [config, setConfig] = useState(null);
    const [podiumRows, setPodiumRows] = useState([]);
    const [byDateRows, setByDateRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadTryTables() {
            if (!idevent || !idsport) return;

            try {
                setLoading(true);
                setError("");

                const [configResponse, podiumResponse, byDateResponse] = await Promise.all([
                    axios.post(`${API_BASE_URL}/config_category`, {
                        idevent: Number(idevent),
                        idsport: Number(idsport),
                    }),
                    getRugbyTryScorers({
                        idevent: Number(idevent),
                        idsport: Number(idsport),
                    }),
                    getRugbyTryScorersByDate({
                        idevent: Number(idevent),
                        idsport: Number(idsport),
                    }),
                ]);

                if (cancelled) return;

                setConfig(configResponse?.data ?? null);
                setPodiumRows(Array.isArray(podiumResponse?.rows) ? podiumResponse.rows : []);
                setByDateRows(Array.isArray(byDateResponse?.rows) ? byDateResponse.rows : []);
            } catch (err) {
                if (cancelled) return;

                console.error("Error cargando tabla de tries de rugby:", err);
                setError("Intente nuevamente en unos momentos.");
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadTryTables();

        return () => {
            cancelled = true;
        };
    }, [idevent, idsport]);

    const topThree = useMemo(() => podiumRows.slice(0, 3), [podiumRows]);

    const headers = useMemo(() => {
        const groupCount = Number(config?.nro_fechas_grupo) || 0;
        const knockoutCount = Number(config?.nro_etapas_final) || 0;

        const fechas = Array.from({ length: groupCount }, (_, index) => `FECHA ${index + 1}`);
        const koHeaders = KO_PHASE_NAMES[knockoutCount] ?? [];

        return [...fechas, ...koHeaders];
    }, [config]);

    const triesByDateTable = useMemo(() => {
        const totalsPerCol = Object.fromEntries(headers.map((header) => [header, 0]));
        let grandTotal = 0;

        if (!headers.length) {
            return {
                rows: [],
                totalsPerCol,
                grandTotal,
            };
        }

        const byPlayer = new Map();

        byDateRows.forEach((item) => {
            const phaseType = Number(item?.idtypephase) || 0;
            const matchDateNumber = Number(item?.nro_fecha) || 0;

            const columnName =
                phaseType === 1
                    ? `FECHA ${matchDateNumber}`
                    : (KO_PHASE_NAMES[Number(config?.nro_etapas_final) || 0] ?? [])[matchDateNumber - 1] ?? null;

            if (!columnName || !headers.includes(columnName)) return;

            const playerKey = String(item.idacreditation);
            const currentTotal = Number(item.totalTries) || 0;

            if (!byPlayer.has(playerKey)) {
                byPlayer.set(playerKey, {
                    idacreditation: item.idacreditation,
                    institutionId: item.institutionId,
                    institutionAbbrev: item.institutionAbbrev,
                    institutionLogo: item.institutionLogo,
                    playerName: item.playerName,
                    cols: Object.fromEntries(headers.map((header) => [header, 0])),
                    total: 0,
                    lastIdx: -1,
                });
            }

            const row = byPlayer.get(playerKey);
            row.cols[columnName] += currentTotal;
            row.total += currentTotal;
            row.lastIdx = Math.max(row.lastIdx, headers.indexOf(columnName));

            totalsPerCol[columnName] += currentTotal;
            grandTotal += currentTotal;
        });

        const rows = Array.from(byPlayer.values()).sort((a, b) => {
            if (b.total !== a.total) return b.total - a.total;
            if (b.lastIdx !== a.lastIdx) return b.lastIdx - a.lastIdx;
            if ((a.institutionId || 0) !== (b.institutionId || 0)) {
                return (a.institutionId || 0) - (b.institutionId || 0);
            }
            return String(a.playerName || "").localeCompare(String(b.playerName || ""), "es", {
                sensitivity: "base",
            });
        });

        return {
            rows,
            totalsPerCol,
            grandTotal,
        };
    }, [byDateRows, headers, config]);

    const tabHasAnyData = podiumRows.length > 0 || triesByDateTable.rows.length > 0;

    if (loading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState message={error} />;
    }

    if (!tabHasAnyData) {
        return <EmptyState />;
    }

    return (
        <div className="w-full space-y-5">
            <div className="rounded-[30px] border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] md:p-5">
                <div className="flex flex-col items-start gap-4 text-left md:flex-row md:items-start md:justify-between">
                    <div className="w-full text-left">
                        <div className="text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-600">
                            Estadística de Tries
                        </div>
                        <h2 className="mt-1 text-left text-2xl font-black text-slate-900 md:text-3xl">
                            Tabla de Tries
                        </h2>
                        <p className="mt-2 max-w-2xl text-left text-sm leading-6 text-slate-500">
                            Revisa el detalle de tries por fecha y el podio de tries de partidos culminados.
                        </p>
                    </div>

                    <div className="grid w-full grid-cols-2 gap-3 md:w-auto md:min-w-[320px]">
                        <StatPill
                            label="Jugadores"
                            value={podiumRows.length}
                            tone="emerald"
                        />
                        <StatPill
                            label="Tries"
                            value={triesByDateTable.grandTotal || podiumRows.reduce((acc, row) => acc + (Number(row.totalTries) || 0), 0)}
                            tone="slate"
                        />
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 rounded-[24px] bg-white/80 p-2 ring-1 ring-slate-200/80 backdrop-blur-sm">
                    <TabButton
                        active={activeTab === TAB_TRIES_BY_DATE}
                        onClick={() => setActiveTab(TAB_TRIES_BY_DATE)}
                    >
                        Tries por fecha
                    </TabButton>
                    <TabButton
                        active={activeTab === TAB_PODIUM}
                        onClick={() => setActiveTab(TAB_PODIUM)}
                    >
                        Podio
                    </TabButton>
                </div>
            </div>

            {activeTab === TAB_TRIES_BY_DATE ? (
                triesByDateTable.rows.length ? (
                    <div className="space-y-4">
                        <TriesByDateDesktop
                            rows={triesByDateTable.rows}
                            headers={headers}
                            totalsPerCol={triesByDateTable.totalsPerCol}
                            grandTotal={triesByDateTable.grandTotal}
                        />
                        <TriesByDateMobile rows={triesByDateTable.rows} headers={headers} />
                    </div>
                ) : (
                    <EmptyState />
                )
            ) : (
                <div className="space-y-5">
                    <div className="hidden md:grid md:grid-cols-3 md:items-end md:gap-5">
                        <PodiumStep
                            row={topThree[1]}
                            place={2}
                            tone="silver"
                            heightClass="h-28"
                        />
                        <PodiumStep
                            row={topThree[0]}
                            place={1}
                            tone="gold"
                            heightClass="h-40"
                        />
                        <PodiumStep
                            row={topThree[2]}
                            place={3}
                            tone="bronze"
                            heightClass="h-20"
                        />
                    </div>

                    <div className="space-y-3 md:hidden">
                        {topThree.map((row) => (
                            <PodiumMobileCard key={row.idacreditation} row={row} />
                        ))}
                    </div>

                    <div className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                        <div className="hidden overflow-x-auto md:block">
                            <table className="min-w-full border-collapse">
                                <thead className="bg-slate-900 text-white">
                                    <tr>
                                        <th className="w-20 px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em]">
                                            #
                                        </th>
                                        <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em]">
                                            Jugador
                                        </th>
                                        <th className="w-56 px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em]">
                                            Institución
                                        </th>
                                        <th className="w-36 px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em]">
                                            Tries
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {podiumRows.map((row, index) => (
                                        <tr
                                            key={row.idacreditation}
                                            className={`transition-colors duration-150 hover:bg-emerald-50/40 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                                                }`}
                                        >
                                            <td className="px-5 py-4 text-left text-sm font-semibold text-slate-500">
                                                #{row.rank}
                                            </td>

                                            <td className="px-5 py-4 text-left">
                                                <div className="flex items-center gap-3 text-left">
                                                    {row.institutionLogo ? (
                                                        <img
                                                            src={row.institutionLogo}
                                                            alt={row.institutionAbbrev || row.playerName}
                                                            className="h-11 w-11 rounded-2xl border border-slate-200 bg-white object-cover shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-600 shadow-sm">
                                                            {row.institutionAbbrev?.slice(0, 3) || "RUG"}
                                                        </div>
                                                    )}

                                                    <div className="min-w-0 text-left">
                                                        <div className="truncate text-sm font-semibold text-slate-900">
                                                            {row.playerName}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-left text-sm font-medium text-slate-600">
                                                {row.institutionAbbrev || "Institución"}
                                            </td>

                                            <td className="px-5 py-4 text-center">
                                                <span className="inline-flex min-w-[58px] items-center justify-center rounded-2xl bg-emerald-50 px-3 py-2 text-lg font-black text-emerald-600 ring-1 ring-emerald-100">
                                                    {row.totalTries}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="divide-y divide-slate-100 md:hidden">
                            {podiumRows.map((row) => (
                                <div
                                    key={row.idacreditation}
                                    className="flex items-center justify-between gap-3 px-4 py-4"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white shadow-sm">
                                            {row.rank}
                                        </div>

                                        {row.institutionLogo ? (
                                            <img
                                                src={row.institutionLogo}
                                                alt={row.institutionAbbrev || row.playerName}
                                                className="h-11 w-11 shrink-0 rounded-2xl border border-slate-200 object-cover shadow-sm"
                                            />
                                        ) : (
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-600 shadow-sm">
                                                {row.institutionAbbrev?.slice(0, 3) || "RUG"}
                                            </div>
                                        )}

                                        <div className="min-w-0 text-left">
                                            <div className="truncate text-sm font-semibold text-slate-900">
                                                {row.playerName}
                                            </div>
                                            <div className="mt-1 truncate text-xs font-medium text-slate-500">
                                                {row.institutionAbbrev || "Institución"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shrink-0 text-center">
                                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                            Tries
                                        </div>
                                        <div className="mt-1 inline-flex min-w-[52px] items-center justify-center rounded-2xl bg-emerald-50 px-3 py-1.5 text-2xl font-black text-emerald-600 ring-1 ring-emerald-100">
                                            {row.totalTries}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
