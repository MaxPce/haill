// ROUTE: src/components/TablaGoleadores/TablaConversionesPenales.jsx

import React, { useEffect, useMemo, useState } from "react";
import { Tab } from "@headlessui/react";
import { useParams } from "react-router-dom";
import {
  getRugbyConversionStats,
  getRugbyPenaltyScorers,
} from "../../services/rugbyStatsService.js";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function TeamAvatar({ row, fallback = "RUG" }) {
  if (row?.institutionLogo) {
    return (
      <img
        src={row.institutionLogo}
        alt={row.institutionAbbrev || row.playerName}
        className="h-11 w-11 shrink-0 rounded-2xl border border-slate-200 bg-white object-cover shadow-sm"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-600 shadow-sm">
      {row?.institutionAbbrev?.slice(0, 3) || fallback}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-[30px] border border-slate-200 bg-slate-100"
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

function ErrorState({ message }) {
  return (
    <div className="rounded-[30px] border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
      <div className="text-sm font-semibold">No se pudo cargar la estadística</div>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-[30px] border border-dashed border-slate-300 bg-white/90 p-10 text-center shadow-sm">
      <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function StatCard({ eyebrow, title, subtitle, value, accent = "emerald" }) {
  const accentMap = {
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    rose: "bg-rose-50 text-rose-600 ring-rose-100",
    sky: "bg-sky-50 text-sky-600 ring-sky-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
  };

  return (
    <div className="rounded-[30px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {eyebrow}
      </div>
      <div className="mt-3 text-base font-bold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-500">{subtitle}</div>
      <div
        className={classNames(
          "mt-5 inline-flex min-w-[72px] items-center justify-center rounded-2xl px-4 py-2 text-2xl font-black ring-1",
          accentMap[accent] || accentMap.emerald
        )}
      >
        {value}
      </div>
    </div>
  );
}

function ConversionDesktopTable({ rows }) {
  return (
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
            <th className="w-48 px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em]">
              Institución
            </th>
            <th className="w-36 px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em]">
              Convertidas
            </th>
            <th className="w-36 px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em]">
              Falladas
            </th>
            <th className="w-32 px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em]">
              Intentos
            </th>
            <th className="w-36 px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em]">
              Efectividad
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr
              key={row.idacreditation}
              className={classNames(
                "transition-colors duration-150 hover:bg-emerald-50/40",
                index % 2 === 0 ? "bg-white" : "bg-slate-50/60"
              )}
            >
              <td className="px-5 py-4 text-sm font-semibold text-slate-500">
                #{row.rank}
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <TeamAvatar row={row} />
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
                <span className="inline-flex min-w-[60px] items-center justify-center rounded-2xl bg-emerald-50 px-3 py-2 text-lg font-black text-emerald-600 ring-1 ring-emerald-100">
                  {row.totalConverted}
                </span>
              </td>
              <td className="px-5 py-4 text-center">
                <span className="inline-flex min-w-[60px] items-center justify-center rounded-2xl bg-rose-50 px-3 py-2 text-lg font-black text-rose-600 ring-1 ring-rose-100">
                  {row.totalMissed}
                </span>
              </td>
              <td className="px-5 py-4 text-center text-sm font-semibold text-slate-700">
                {row.totalAttempts}
              </td>
              <td className="px-5 py-4 text-center">
                <span className="inline-flex min-w-[70px] items-center justify-center rounded-2xl bg-sky-50 px-3 py-2 text-lg font-black text-sky-600 ring-1 ring-sky-100">
                  {row.effectivenessPct}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ConversionMobileList({ rows }) {
  return (
    <div className="divide-y divide-slate-100 md:hidden">
      {rows.map((row) => (
        <div key={row.idacreditation} className="px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white shadow-sm">
                {row.rank}
              </div>
              <TeamAvatar row={row} />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">
                  {row.playerName}
                </div>
                <div className="mt-1 truncate text-xs font-medium text-slate-500">
                  {row.institutionAbbrev || "Institución"}
                </div>
              </div>
            </div>
            <div className="shrink-0 rounded-2xl bg-sky-50 px-3 py-1.5 text-sm font-black text-sky-600 ring-1 ring-sky-100">
              {row.effectivenessPct}%
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-center ring-1 ring-emerald-100">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-600/80">
                Convertidas
              </div>
              <div className="mt-1 text-xl font-black text-emerald-600">
                {row.totalConverted}
              </div>
            </div>
            <div className="rounded-2xl bg-rose-50 px-3 py-2 text-center ring-1 ring-rose-100">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-600/80">
                Falladas
              </div>
              <div className="mt-1 text-xl font-black text-rose-600">
                {row.totalMissed}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-100 px-3 py-2 text-center ring-1 ring-slate-200">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Intentos
              </div>
              <div className="mt-1 text-xl font-black text-slate-700">
                {row.totalAttempts}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PenaltyDesktopTable({ rows }) {
  return (
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
            <th className="w-52 px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em]">
              Institución
            </th>
            <th className="w-40 px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em]">
              Penales
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr
              key={row.idacreditation}
              className={classNames(
                "transition-colors duration-150 hover:bg-amber-50/40",
                index % 2 === 0 ? "bg-white" : "bg-slate-50/60"
              )}
            >
              <td className="px-5 py-4 text-sm font-semibold text-slate-500">
                #{row.rank}
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <TeamAvatar row={row} />
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
                <span className="inline-flex min-w-[64px] items-center justify-center rounded-2xl bg-amber-50 px-3 py-2 text-lg font-black text-amber-600 ring-1 ring-amber-100">
                  {row.totalPenalties}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PenaltyMobileList({ rows }) {
  return (
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
            <TeamAvatar row={row} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">
                {row.playerName}
              </div>
              <div className="mt-1 truncate text-xs font-medium text-slate-500">
                {row.institutionAbbrev || "Institución"}
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-amber-50 px-3 py-1.5 text-center ring-1 ring-amber-100">
            <div className="text-[11px] uppercase tracking-[0.18em] text-amber-600/80">
              Penales
            </div>
            <div className="mt-1 text-2xl font-black text-amber-600">
              {row.totalPenalties}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ConversionsView({ rows }) {
  const topConverted = rows[0] || null;
  const topMissed = useMemo(() => {
    return [...rows]
      .sort((a, b) => b.totalMissed - a.totalMissed || a.rank - b.rank)
      .find((row) => row.totalMissed > 0) || null;
  }, [rows]);
  const topEfficiency = useMemo(() => {
    return [...rows]
      .filter((row) => row.totalAttempts > 0)
      .sort(
        (a, b) =>
          b.effectivenessPct - a.effectivenessPct ||
          b.totalConverted - a.totalConverted ||
          a.rank - b.rank
      )[0] || null;
  }, [rows]);

  if (!rows.length) {
    return (
      <EmptyState
        title="Aún no hay conversiones publicadas"
        description="La tabla se alimenta solo con partidos oficializados y conversiones válidas de rugby."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          eyebrow="Líder"
          title={topConverted?.playerName || "Sin datos"}
          subtitle={topConverted?.institutionAbbrev || "Más conversiones acertadas"}
          value={topConverted?.totalConverted ?? 0}
          accent="emerald"
        />
        <StatCard
          eyebrow="Mejor efectividad"
          title={topEfficiency?.playerName || "Sin datos"}
          subtitle={topEfficiency ? `${topEfficiency.totalConverted}/${topEfficiency.totalAttempts} acertadas` : "Sin intentos publicados"}
          value={`${topEfficiency?.effectivenessPct ?? 0}%`}
          accent="sky"
        />
        {/* <StatCard
          eyebrow="Más falladas"
          title={topMissed?.playerName || "Sin datos"}
          subtitle={topMissed?.institutionAbbrev || "Aún no hay fallos publicados"}
          value={topMissed?.totalMissed ?? 0}
          accent="rose"
        /> */}
      </div>

      <div className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <ConversionDesktopTable rows={rows} />
        <ConversionMobileList rows={rows} />
      </div>
    </div>
  );
}

function PenaltiesView({ rows }) {
  const topPenalty = rows[0] || null;
  const totalPenalties = rows.reduce(
    (acc, row) => acc + (Number(row.totalPenalties) || 0),
    0
  );
  const countPlayers = rows.length;

  if (!rows.length) {
    return (
      <EmptyState
        title="Aún no hay penales publicados"
        description="La tabla se alimenta solo con partidos oficializados y penales válidos de rugby."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          eyebrow="Líder"
          title={topPenalty?.playerName || "Sin datos"}
          subtitle={topPenalty?.institutionAbbrev || "Más penales acertados"}
          value={topPenalty?.totalPenalties ?? 0}
          accent="amber"
        />
        <StatCard
          eyebrow="Jugadores"
          title="Ranking activo"
          subtitle="Jugadores con penales publicados"
          value={countPlayers}
          accent="sky"
        />
        <StatCard
          eyebrow="Total"
          title="Penales contabilizados"
          subtitle="Sumados en partidos oficializados"
          value={totalPenalties}
          accent="emerald"
        />
      </div>

      <div className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <PenaltyDesktopTable rows={rows} />
        <PenaltyMobileList rows={rows} />
      </div>
    </div>
  );
}

export default function TablaConversionesPenales() {
  const { idevent, idsport } = useParams();
  const [conversionRows, setConversionRows] = useState([]);
  const [penaltyRows, setPenaltyRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      if (!idevent || !idsport) return;

      try {
        setLoading(true);
        setError("");

        const [conversionsData, penaltiesData] = await Promise.all([
          getRugbyConversionStats({
            idevent: Number(idevent),
            idsport: Number(idsport),
          }),
          getRugbyPenaltyScorers({
            idevent: Number(idevent),
            idsport: Number(idsport),
          }),
        ]);

        if (cancelled) return;

        setConversionRows(
          Array.isArray(conversionsData?.rows) ? conversionsData.rows : []
        );
        setPenaltyRows(
          Array.isArray(penaltiesData?.rows) ? penaltiesData.rows : []
        );
      } catch (err) {
        if (cancelled) return;

        console.error("Error cargando estadísticas extras de rugby:", err);
        setError("Intente nuevamente en unos momentos.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [idevent, idsport]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="w-full space-y-5">
      <div className="rounded-[32px] border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-slate-100/70 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-5" style={{ display:"flex", justifyContent:"center" }}>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
              Conversiones y Penales
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Visualiza quién convierte más, quién falla más y quién lidera en penales acertados,
              considerando solo partidos oficializados.
            </p>
          </div>
        </div>
      </div>

      <Tab.Group>
        <Tab.List className="flex w-full gap-2 rounded-[26px] border border-slate-200/80 bg-white/90 p-2 shadow-sm">
          {[
            { key: "conversions", label: "Conversiones" },
            { key: "penalties", label: "Penales" },
          ].map((item) => (
            <Tab
              key={item.key}
              className={({ selected }) =>
                classNames(
                  "flex-1 rounded-[20px] px-4 py-3 text-sm font-semibold transition-all duration-150 focus:outline-none",
                  selected
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )
              }
            >
              {item.label}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="mt-5">
          <Tab.Panel className="focus:outline-none">
            <ConversionsView rows={conversionRows} />
          </Tab.Panel>
          <Tab.Panel className="focus:outline-none">
            <PenaltiesView rows={penaltyRows} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
