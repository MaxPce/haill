/**
 * ROUTE: src/components/Pruebas/CategoriaFases.jsx
 */

import React, { useEffect, useState } from "react";
import API_BASE_FORMATOS_URL from "../../config/config_formatos";
import { ATLETISMO_EVENT_ID, getBadgeColor, parseCategoryTokens } from "./pruebas.utils";
import FaseResultados from "./FaseResultados";

const CategoriaFases = ({ eventCategoryId, genero, nivel, busqueda }) => {
  const [fases, setFases]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [selectedPhase, setSelectedPhase] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setSelectedPhase(null);
    fetch(
      `${API_BASE_FORMATOS_URL}/api/sismaster/competition-report/${ATLETISMO_EVENT_ID}?eventCategoryId=${eventCategoryId}`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const phases = data.sports?.[0]?.categories?.[0]?.phases ?? [];
        setFases(phases);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [eventCategoryId]);

  if (loading) return <p className="text-gray-400 text-sm">Cargando fases...</p>;
  if (error)   return <p className="text-red-400 text-sm">Error: {error}</p>;

  // ── Aplicar filtros sobre las fases ──────────────────────────────────────
  const fasesFiltradas = fases.filter((fase) => {
    const name = fase.phaseName ?? "";
    const { genero: faseGenero, nivel: faseNivel } = parseCategoryTokens(name);

    if (genero  && faseGenero !== genero)  return false;
    if (nivel   && faseNivel  !== nivel)   return false;
    if (busqueda && !name.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  if (fasesFiltradas.length === 0)
    return <p className="text-gray-400 text-sm">Sin fases para los filtros seleccionados.</p>;

  return (
    <ul className="flex flex-col gap-2">
      {fasesFiltradas.map((fase) => {
        const isPhaseOpen = selectedPhase === fase.phaseId;
        const badgeClass  = getBadgeColor(fase.status);
        const viento      = fase.wind ?? null;
        const tieneViento = viento !== null && viento !== undefined;
        const esVV        = tieneViento && Math.abs(parseFloat(viento)) <= 2.0;
        const { genero: faseGenero, nivel: faseNivel } = parseCategoryTokens(fase.phaseName ?? "");

        return (
          <li key={fase.phaseId} className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <button
              className="w-full flex items-center justify-between px-3 py-2.5 bg-white hover:bg-slate-50 transition-colors text-left"
              onClick={() =>
                setSelectedPhase((prev) =>
                  prev === fase.phaseId ? null : fase.phaseId
                )
              }
            >
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                  <span className="text-gray-700 text-sm capitalize font-medium truncate">
                    {fase.phaseName.trim().toLowerCase()}
                  </span>
                </div>
                {/* Chips de género y nivel de la fase */}
                <div className="flex items-center gap-1.5 pl-4">
                  {faseGenero && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                      faseGenero === "Damas"
                        ? "bg-rose-50 text-rose-600 border-rose-200"
                        : "bg-sky-50 text-sky-600 border-sky-200"
                    }`}>
                      {faseGenero === "Damas" ? "Femenino" : "Masculino"}
                    </span>
                  )}
                  {faseNivel && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                      faseNivel === "Az"
                        ? "bg-violet-50 text-violet-600 border-violet-200"
                        : "bg-amber-50 text-amber-600 border-amber-200"
                    }`}>
                      {faseNivel === "Az" ? "Avanzado" : "Novel"}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                {fase.status && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>
                    {fase.status.replace("_", " ")}
                  </span>
                )}
                {tieneViento && (
                  <span
                    className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${
                      esVV
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-red-50 text-red-500 border-red-200"
                    }`}
                    title={esVV ? "Viento válido (≤ ±2.0 m/s)" : "Viento no válido (> ±2.0 m/s)"}
                  >
                    {parseFloat(viento) > 0 ? "+" : ""}
                    {viento} m/s{esVV && " VV"}
                  </span>
                )}
                <span className="text-gray-400 text-xs">{isPhaseOpen ? "▲" : "▼"}</span>
              </div>
            </button>

            {isPhaseOpen && (
              <div className="bg-gray-50 border-t border-gray-100 px-3 py-3">
                <FaseResultados
                  eventCategoryId={eventCategoryId}
                  phaseId={fase.phaseId}
                  phaseName={fase.phaseName}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default CategoriaFases;