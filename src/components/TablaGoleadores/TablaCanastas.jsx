import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getBasquetScorers } from "../../services/basquetStatsService.js";

const LEADER_CARDS = [
    {
        key: "freeThrowsLeader",
        label: "Mejor TL",
        valueKey: "totalFreeThrows",
        tone: {
            shell:
                "border-amber-200/80 bg-gradient-to-b from-amber-50 via-white to-amber-100/70 shadow-amber-100/70",
            value: "text-amber-600",
            badge: "bg-amber-400 text-slate-950",
            ring: "ring-amber-100",
        },
    },
    {
        key: "doublesLeader",
        label: "Mejor Dobles",
        valueKey: "totalDoubles",
        tone: {
            shell:
                "border-sky-200/80 bg-gradient-to-b from-sky-50 via-white to-sky-100/70 shadow-sky-100/70",
            value: "text-sky-600",
            badge: "bg-sky-500 text-white",
            ring: "ring-sky-100",
        },
    },
    {
        key: "triplesLeader",
        label: "Mejor Triples",
        valueKey: "totalTriples",
        tone: {
            shell:
                "border-violet-200/80 bg-gradient-to-b from-violet-50 via-white to-violet-100/70 shadow-violet-100/70",
            value: "text-violet-600",
            badge: "bg-violet-500 text-white",
            ring: "ring-violet-100",
        },
    },
    {
        key: "pointsLeader",
        label: "Mejor Total",
        valueKey: "totalPoints",
        tone: {
            shell:
                "border-emerald-200/80 bg-gradient-to-b from-emerald-50 via-white to-emerald-100/70 shadow-emerald-100/70",
            value: "text-emerald-600",
            badge: "bg-emerald-500 text-white",
            ring: "ring-emerald-100",
        },
    },
];

function LeaderCard({ title, row, valueKey, tone }) {
    if (!row) {
        return (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/90 p-6 text-center shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {title}
                </div>
                <div className="mt-4 text-sm text-slate-500">Sin líder publicado</div>
            </div>
        );
    }

    const value = Number(row?.[valueKey]) || 0;

    return (
        <div
            className={`relative rounded-[28px] border px-5 pb-5 pt-5 shadow-xl ring-1 ${tone.shell} ${tone.ring}`}
        >
            <div className="absolute right-4 top-4">
                <div
                    className={`inline-flex h-9 min-w-9 items-center justify-center rounded-2xl px-3 text-[11px] font-black uppercase tracking-[0.16em] shadow-sm ${tone.badge}`}
                >
                    1°
                </div>
            </div>

            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                {title}
            </div>

            <div className="mt-4 flex items-start gap-3 pr-10">
                {row.institutionLogo ? (
                    <img
                        src={row.institutionLogo}
                        alt={row.institutionAbbrev || row.playerName}
                        className="h-14 w-14 shrink-0 rounded-2xl border border-white/80 bg-white object-cover shadow-sm"
                    />
                ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white text-sm font-bold text-slate-600 shadow-sm">
                        {row.institutionAbbrev?.slice(0, 3) || "BAS"}
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <div
                        className="min-h-[3.25rem] break-words text-[15px] font-bold leading-6 text-slate-900"
                        title={row.playerName}
                        style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}
                    >
                        {row.playerName}
                    </div>

                    <div className="mt-1 text-sm font-medium text-slate-500">
                        {row.institutionAbbrev || "Institución"}
                    </div>
                </div>
            </div>

            <div className="mt-5 flex items-end justify-between border-t border-slate-200/80 pt-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    {title}
                </div>
                <div className={`text-4xl font-black leading-none ${tone.value}`}>
                    {value}
                </div>
            </div>
        </div>
    );
}

function MobileLeaderCard({ title, row, valueKey, tone }) {
    if (!row) return null;

    const value = Number(row?.[valueKey]) || 0;

    return (
        <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-md shadow-slate-200/60">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                    <div
                        className={`inline-flex h-10 min-w-10 shrink-0 items-center justify-center rounded-2xl px-3 text-xs font-black uppercase tracking-[0.12em] shadow-sm ${tone.badge}`}
                    >
                        1°
                    </div>

                    {row.institutionLogo ? (
                        <img
                            src={row.institutionLogo}
                            alt={row.institutionAbbrev || row.playerName}
                            className="h-11 w-11 shrink-0 rounded-2xl border border-slate-200 object-cover shadow-sm"
                        />
                    ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-600 shadow-sm">
                            {row.institutionAbbrev?.slice(0, 3) || "BAS"}
                        </div>
                    )}

                    <div className="min-w-0">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                            {title}
                        </div>
                        <div
                            className="mt-1 break-words text-sm font-semibold leading-5 text-slate-900"
                            title={row.playerName}
                            style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                            }}
                        >
                            {row.playerName}
                        </div>
                        <div className="mt-1 text-xs font-medium text-slate-500">
                            {row.institutionAbbrev || "Institución"}
                        </div>
                    </div>
                </div>

                <div className="shrink-0 text-center">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        Valor
                    </div>
                    <div
                        className={`mt-1 inline-flex min-w-[56px] items-center justify-center rounded-2xl bg-white px-3 py-1.5 text-2xl font-black ring-1 ring-slate-200 ${tone.value}`}
                    >
                        {value}
                    </div>
                </div>
            </div>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="space-y-5">
            <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-4 md:gap-5">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-56 animate-pulse rounded-[32px] bg-slate-100"
                    />
                ))}
            </div>

            <div className="space-y-3 md:hidden">
                {Array.from({ length: 4 }).map((_, index) => (
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
                Aún no hay canastas publicadas
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
                La tabla se alimenta solo con partidos oficializados y eventos válidos.
            </p>
        </div>
    );
}

function ErrorState({ message }) {
    return (
        <div className="rounded-[30px] border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            <div className="text-sm font-semibold">
                No se pudo cargar la tabla de canastas
            </div>
            <p className="mt-2 text-sm">{message}</p>
        </div>
    );
}

export default function TablaCanastas() {
    const { idevent, idsport } = useParams();
    const [rows, setRows] = useState([]);
    const [leaders, setLeaders] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadBasquetScorers() {
            if (!idevent || !idsport) return;

            try {
                setLoading(true);
                setError("");

                const data = await getBasquetScorers({
                    idevent: Number(idevent),
                    idsport: Number(idsport),
                });

                if (cancelled) return;

                setRows(Array.isArray(data?.rows) ? data.rows : []);
                setLeaders(
                    data?.leaders && typeof data.leaders === "object" ? data.leaders : {}
                );
            } catch (err) {
                if (cancelled) return;

                console.error("Error cargando tabla de canastas:", err);
                setError("Intente nuevamente en unos momentos.");
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadBasquetScorers();

        return () => {
            cancelled = true;
        };
    }, [idevent, idsport]);

    const leaderCards = useMemo(
        () =>
            LEADER_CARDS.map((card) => ({
                ...card,
                row: leaders?.[card.key] ?? null,
            })),
        [leaders]
    );

    if (loading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState message={error} />;
    }

    if (!rows.length) {
        return <EmptyState />;
    }

    return (
        <div className="w-full">
            <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-4 md:gap-5">
                {leaderCards.map((card) => (
                    <LeaderCard
                        key={card.key}
                        title={card.label}
                        row={card.row}
                        valueKey={card.valueKey}
                        tone={card.tone}
                    />
                ))}
            </div>

            <div className="mb-5 space-y-3 md:hidden">
                {leaderCards.map((card) => (
                    <MobileLeaderCard
                        key={card.key}
                        title={card.label}
                        row={card.row}
                        valueKey={card.valueKey}
                        tone={card.tone}
                    />
                ))}
            </div>

            <div className="mt-5 overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm">
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
                                <th className="w-56 px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em]">
                                    Institución
                                </th>
                                <th className="w-28 px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em]">
                                    TL
                                </th>
                                <th className="w-28 px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em]">
                                    Dobles
                                </th>
                                <th className="w-28 px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em]">
                                    Triples
                                </th>
                                <th className="w-36 px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em]">
                                    Total
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {rows.map((row, index) => (
                                <tr
                                    key={row.idacreditation}
                                    className={`transition-colors duration-150 hover:bg-sky-50/40 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                                        }`}
                                >
                                    <td className="px-5 py-4 text-sm font-semibold text-slate-500">
                                        #{row.rank}
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            {row.institutionLogo ? (
                                                <img
                                                    src={row.institutionLogo}
                                                    alt={row.institutionAbbrev || row.playerName}
                                                    className="h-11 w-11 rounded-2xl border border-slate-200 bg-white object-cover shadow-sm"
                                                />
                                            ) : (
                                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-600 shadow-sm">
                                                    {row.institutionAbbrev?.slice(0, 3) || "BAS"}
                                                </div>
                                            )}

                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-semibold text-slate-900">
                                                    {row.playerName}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4 text-center text-sm font-medium text-slate-600">
                                        {row.institutionAbbrev || "Institución"}
                                    </td>

                                    <td className="px-5 py-4 text-center">
                                        <span className="inline-flex min-w-[48px] items-center justify-center rounded-2xl bg-amber-50 px-3 py-2 text-base font-black text-amber-600 ring-1 ring-amber-100">
                                            {row.totalFreeThrows}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4 text-center">
                                        <span className="inline-flex min-w-[48px] items-center justify-center rounded-2xl bg-sky-50 px-3 py-2 text-base font-black text-sky-600 ring-1 ring-sky-100">
                                            {row.totalDoubles}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4 text-center">
                                        <span className="inline-flex min-w-[48px] items-center justify-center rounded-2xl bg-violet-50 px-3 py-2 text-base font-black text-violet-600 ring-1 ring-violet-100">
                                            {row.totalTriples}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4 text-center">
                                        <span className="inline-flex min-w-[58px] items-center justify-center rounded-2xl bg-emerald-50 px-3 py-2 text-lg font-black text-emerald-600 ring-1 ring-emerald-100">
                                            {row.totalPoints}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="divide-y divide-slate-100 md:hidden">
                    {rows.map((row) => (
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
                                        {row.institutionAbbrev?.slice(0, 3) || "BAS"}
                                    </div>
                                )}

                                <div className="min-w-0">
                                    <div className="truncate text-sm font-semibold text-slate-900">
                                        {row.playerName}
                                    </div>
                                    <div className="mt-1 truncate text-xs font-medium text-slate-500">
                                        {row.institutionAbbrev || "Institución"}
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <span className="inline-flex items-center justify-center rounded-2xl bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-600 ring-1 ring-amber-100">
                                            TL {row.totalFreeThrows}
                                        </span>
                                        <span className="inline-flex items-center justify-center rounded-2xl bg-sky-50 px-2.5 py-1 text-xs font-black text-sky-600 ring-1 ring-sky-100">
                                            2P {row.totalDoubles}
                                        </span>
                                        <span className="inline-flex items-center justify-center rounded-2xl bg-violet-50 px-2.5 py-1 text-xs font-black text-violet-600 ring-1 ring-violet-100">
                                            3P {row.totalTriples}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="shrink-0 text-center">
                                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                    Total
                                </div>
                                <div className="mt-1 inline-flex min-w-[56px] items-center justify-center rounded-2xl bg-emerald-50 px-3 py-1.5 text-2xl font-black text-emerald-600 ring-1 ring-emerald-100">
                                    {row.totalPoints}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}