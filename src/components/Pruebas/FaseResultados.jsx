/**
 * ROUTE: src/components/Pruebas/FaseResultados.jsx
 * Renderiza la tabla de resultados de una fase específica (altura, distancia o pista).
 */

import React, { useEffect, useState } from "react";
import API_BASE_FORMATOS_URL from "../../config/config_formatos";
import { ATLETISMO_EVENT_ID, capitalize, getMedalColor } from "./pruebas.utils";

// ── VientoLabel ───────────────────────────────────────────────────────────────

const VientoLabel = ({ value }) => {
  if (value === null || value === undefined) return null;
  const num = parseFloat(value);
  const esVV = Math.abs(num) <= 2.0;
  return (
    <span
      className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${
        esVV
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-red-50 text-red-500 border border-red-200"
      }`}
      title={esVV ? "Viento válido (≤ ±2.0 m/s)" : "Viento no válido (> ±2.0 m/s)"}
    >
      {num > 0 ? "+" : ""}
      {value} m/s{esVV && <span className="ml-1 font-bold">VV</span>}
    </span>
  );
};

// ── LaneBadge ─────────────────────────────────────────────────────────────────

const LaneBadge = ({ lane }) => {
  if (lane === null || lane === undefined) return null;
  return (
    <span
      className="text-xs font-mono font-semibold w-8 text-center px-1 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 flex-shrink-0"
      title="Carril"
    >
      {lane}
    </span>
  );
};

// ── FaseResultados ─────────────────────────────────────────────────────────────

const FaseResultados = ({ eventCategoryId, phaseId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(
      `${API_BASE_FORMATOS_URL}/api/sismaster/competition-report/${ATLETISMO_EVENT_ID}?eventCategoryId=${eventCategoryId}&phaseId=${phaseId}`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((res) => {
        const phase = res.sports?.[0]?.categories?.[0]?.phases?.[0];
        setData(phase ?? null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [eventCategoryId, phaseId]);

  if (loading)
    return <p className="text-gray-400 text-sm py-2">Cargando resultados...</p>;
  if (error)
    return <p className="text-red-400 text-sm py-2">Error: {error}</p>;
  if (!data)
    return <p className="text-gray-400 text-sm py-2">Sin datos.</p>;

  // ── ALTURA ──────────────────────────────────────────────────────────────────
  if (data.athleticsType === "altura") {
    const athletes   = data.athletes   ?? [];
    const allHeights = data.allHeights ?? [];

    if (athletes.length === 0)
      return <p className="text-gray-400 text-sm py-2">Sin resultados registrados aún.</p>;

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
              <th className="px-2 py-1.5 text-center w-6">#</th>
              <th className="px-2 py-1.5 text-left min-w-[140px]">Atleta</th>
              <th className="px-2 py-1.5 text-left hidden sm:table-cell min-w-[120px]">Universidad</th>
              {allHeights.map((h) => (
                <th key={h} className="px-2 py-1.5 text-center min-w-[42px] font-mono">
                  {h}m
                </th>
              ))}
              <th className="px-2 py-1.5 text-right min-w-[64px]">Mejor</th>
            </tr>
          </thead>
          <tbody>
            {athletes.map((entry) => {
              const athleteData = entry.athlete?.athlete;
              const fullName    = athleteData?.fullName ?? "—";
              const institution = athleteData?.institution?.name ?? "—";
              const heightMap   = {};
              (entry.heights ?? []).forEach((h) => { heightMap[h.height] = h; });

              return (
                <tr key={entry.registrationId} className="border-t border-gray-100 hover:bg-slate-50 transition-colors">
                  <td className={`px-2 py-2 text-center font-bold ${getMedalColor(entry.pos)}`}>{entry.pos}</td>
                  <td className="px-2 py-2 text-gray-800 font-medium capitalize">{fullName.toLowerCase()}</td>
                  <td className="px-2 py-2 text-gray-400 text-xs hidden sm:table-cell">{capitalize(institution)}</td>
                  {allHeights.map((h) => {
                    const hd = heightMap[h];
                    if (!hd) return <td key={h} className="px-2 py-2 text-center text-gray-300 font-mono text-xs">—</td>;
                    const seq       = hd.sequence ?? "-";
                    const isSkipped = seq === "-";
                    const isFail    = seq === "XXX";
                    return (
                      <td
                        key={h}
                        className={`px-2 py-2 text-center font-mono text-xs font-semibold ${
                          isSkipped
                            ? "text-gray-300"
                            : hd.cleared
                            ? h === entry.bestHeight
                              ? "text-blue-700 bg-blue-50 font-bold"
                              : "text-green-600"
                            : isFail
                            ? "text-red-500"
                            : "text-yellow-600"
                        }`}
                        title={`${h}m — ${seq}`}
                      >
                        {isSkipped ? "—" : seq}
                      </td>
                    );
                  })}
                  <td className="px-2 py-2 text-right font-mono font-bold text-blue-700">
                    {entry.bestHeight ?? "—"}
                    <span className="text-gray-400 font-normal text-xs ml-1">m</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // ── DISTANCIA ───────────────────────────────────────────────────────────────
  if (data.athleticsType === "distancia") {
    const athletes = data.athletes ?? [];
    if (athletes.length === 0)
      return <p className="text-gray-400 text-sm py-2">Sin resultados registrados aún.</p>;

    const hasWind = athletes.some((entry) =>
      (entry.attempts ?? []).some((a) => a.wind !== null && a.wind !== undefined)
    );

    return (
      <div className="flex flex-col gap-3">
        {athletes.map((entry) => {
          const athleteData = entry.athlete?.athlete;
          const fullName    = athleteData?.fullName ?? "—";
          const institution = athleteData?.institution?.name ?? "—";
          const attempts    = entry.attempts ?? [];

          return (
            <div key={entry.registrationId} className="bg-white rounded-lg border border-gray-150 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold w-6 text-center ${getMedalColor(entry.pos)}`}>
                    {entry.pos}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm capitalize">{fullName.toLowerCase()}</p>
                    <p className="text-xs text-gray-400 capitalize">{capitalize(institution)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Mejor marca</p>
                  <p className="font-mono font-bold text-blue-700 text-base">
                    {entry.bestDistance ?? "—"}
                    <span className="text-gray-400 font-normal text-xs ml-1">m</span>
                  </p>
                </div>
              </div>
              {attempts.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-3 py-2 bg-gray-50">
                  {attempts.map((attempt) => {
                    const isBest  = attempt.distance === entry.bestDistance;
                    const isValid = attempt.isValid && attempt.distance !== null;
                    return (
                      <div key={attempt.attemptNumber} className="flex flex-col items-center gap-0.5" title={`Intento ${attempt.attemptNumber}`}>
                        <span className={`text-xs px-2 py-1 rounded font-mono ${
                          isValid
                            ? isBest
                              ? "bg-blue-100 text-blue-700 font-bold ring-1 ring-blue-300"
                              : "bg-gray-100 text-gray-600"
                            : "bg-red-50 text-red-400 line-through"
                        }`}>
                          {attempt.distance !== null ? `${attempt.distance}m` : "X"}
                        </span>
                        {hasWind && <VientoLabel value={attempt.wind} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ── PISTA (tiempo) ──────────────────────────────────────────────────────────
  const sections = data.sections ?? [];
  if (sections.length === 0)
    return <p className="text-gray-400 text-sm py-2">Sin resultados registrados aún.</p>;

  return (
    <div className="flex flex-col gap-4">
      {sections.map((section) => (
        <div key={section.sectionId}>
          {/* Cabecera de serie */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {section.sectionName}
            </span>
            {section.wind !== null && section.wind !== undefined && (
              <VientoLabel value={section.wind} />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            {section.athletes.map((entry) => {
              const athleteInfo = entry.athlete?.athlete;
              const isTeam      = athleteInfo?.source === "team";
              const hasTime     = entry.time !== null && entry.time !== undefined;
              const isDNF       = entry.status === "DNF";
              const isDNS       = entry.status === "DNS";
              const hasPos      = entry.pos !== null && entry.pos !== undefined;
              const lane        = entry.lane ?? null;

              // ── Equipo (postas) ────────────────────────────────────────────
              if (isTeam) {
                const members = athleteInfo?.members ?? [];
                return (
                  <div key={entry.registrationId} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold w-6 text-center flex-shrink-0 ${hasPos ? getMedalColor(entry.pos) : "text-gray-400"}`}>
                          {hasPos ? entry.pos : "—"}
                        </span>
                        <LaneBadge lane={lane} />
                        <div>
                          <p className="font-semibold text-gray-800 text-sm capitalize">
                            {athleteInfo?.teamName?.toLowerCase() ?? "Equipo"}
                          </p>
                          <p className="text-xs text-gray-400">{members.length} integrantes</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {isDNF || isDNS ? (
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-50 text-red-500">{entry.status}</span>
                        ) : (
                          <span className="font-mono font-bold text-blue-700 text-sm">
                            {hasTime ? entry.time : "—"}
                            {hasTime && <span className="text-gray-400 font-normal text-xs ml-1">s</span>}
                          </span>
                        )}
                      </div>
                    </div>
                    {members.length > 0 && (
                      <div className="border-t border-gray-100 bg-gray-50 px-3 py-2">
                        <ul className="flex flex-col gap-1">
                          {members.map((member) => (
                            <li key={member.tmId} className="flex items-center gap-2 text-xs text-gray-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0" />
                              <span className="capitalize">{member.name?.toLowerCase() ?? "—"}</span>
                              {member.rol && member.rol !== "titular" && (
                                <span className="text-gray-400 italic">({member.rol})</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              }

              // ── Individual ─────────────────────────────────────────────────
              const fullName    = athleteInfo?.fullName ?? "—";
              const institution = athleteInfo?.institution?.name ?? "—";

              return (
                <div
                  key={entry.registrationId}
                  className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold w-6 text-center flex-shrink-0 ${hasPos ? getMedalColor(entry.pos) : "text-gray-400"}`}>
                      {hasPos ? entry.pos : "—"}
                    </span>
                    <LaneBadge lane={lane} />
                    <div>
                      <p className="font-medium text-gray-800 text-sm capitalize">{fullName.toLowerCase()}</p>
                      <p className="text-xs text-gray-400 capitalize hidden sm:block">{capitalize(institution)}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {isDNF || isDNS ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-50 text-red-500">{entry.status}</span>
                    ) : (
                      <span className="font-mono font-bold text-blue-700 text-sm">
                        {hasTime ? entry.time : "—"}
                        {hasTime && <span className="text-gray-400 font-normal text-xs ml-1">s</span>}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FaseResultados;