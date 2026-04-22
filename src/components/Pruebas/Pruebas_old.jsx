
import React, { useEffect, useState } from "react";
import API_BASE_FORMATOS_URL from "../../config/config_formatos";

const ATLETISMO_EVENT_ID = 223;
const ATLETISMO_SPORT_ID = 7;

// ─── Helpers ────────────────────────────────────────────────────────────────

const getBadgeColor = (status) => {
  switch (status) {
    case "finalizado": return "bg-green-100 text-green-700";
    case "en_curso":   return "bg-yellow-100 text-yellow-700";
    default:           return "bg-gray-100 text-gray-500";
  }
};



const capitalize = (str = "") =>
  str.trim().charAt(0).toUpperCase() + str.trim().slice(1).toLowerCase();

const getMedalColor = (pos) => {
  switch (pos) {
    case 1: return "text-yellow-500 font-bold";
    case 2: return "text-gray-400 font-bold";
    case 3: return "text-amber-600 font-bold";
    default: return "text-gray-500";
  }
};

// ─── Sub-componente: Tabla de resultados de una fase ────────────────────────

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

  if (loading) return <p className="text-gray-400 text-sm py-2">Cargando resultados...</p>;
  if (error)   return <p className="text-red-400 text-sm py-2">Error: {error}</p>;
  if (!data)   return <p className="text-gray-400 text-sm py-2">Sin datos.</p>;

  // ── ALTURA: salto alto, garrocha, etc. → allHeights[] + athletes[].heights[]
  if (data.athleticsType === "altura") {
    const athletes  = data.athletes  ?? [];
    const allHeights = data.allHeights ?? [];

    if (athletes.length === 0)
      return <p className="text-gray-400 text-sm py-2">Sin resultados registrados aún.</p>;

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-100 text-gray-500 text-xs uppercase">
              <th className="px-2 py-1 text-center w-6">#</th>
              <th className="px-2 py-1 text-left min-w-[140px]">Atleta</th>
              <th className="px-2 py-1 text-left hidden sm:table-cell min-w-[120px]">Universidad</th>
              {/* Una columna por altura */}
              {allHeights.map((h) => (
                <th key={h} className="px-2 py-1 text-center min-w-[42px] font-mono">
                  {h}m
                </th>
              ))}
              <th className="px-2 py-1 text-right min-w-[64px]">Mejor</th>
            </tr>
          </thead>
          <tbody>
            {athletes.map((entry) => {
              const athleteData  = entry.athlete?.athlete;
              const fullName     = athleteData?.fullName ?? "—";
              const institution  = athleteData?.institution?.name ?? "—";

              // Mapear heights por valor para acceso rápido
              const heightMap = {};
              (entry.heights ?? []).forEach((h) => {
                heightMap[h.height] = h;
              });

              return (
                <tr
                  key={entry.registrationId}
                  className="border-t border-gray-100 hover:bg-blue-50 transition-colors"
                >
                  <td className={`px-2 py-2 text-center font-bold ${getMedalColor(entry.pos)}`}>
                    {entry.pos}
                  </td>
                  <td className="px-2 py-2 text-gray-800 font-medium capitalize">
                    {fullName.toLowerCase()}
                  </td>
                  <td className="px-2 py-2 text-gray-500 text-xs hidden sm:table-cell">
                    {capitalize(institution)}
                  </td>

                  {/* Celda por cada altura del barco */}
                  {allHeights.map((h) => {
                    const heightData = heightMap[h];

                    if (!heightData) {
                      // Esta altura no aparece en el registro del atleta → no compitió
                      return (
                        <td key={h} className="px-2 py-2 text-center text-gray-300 font-mono text-xs">
                          —
                        </td>
                      );
                    }

                    const seq = heightData.sequence ?? "-";
                    const cleared = heightData.cleared;
                    const isSkipped = seq === "-";
                    const isFail    = seq === "XXX";

                    return (
                      <td
                        key={h}
                        className={`px-2 py-2 text-center font-mono text-xs font-semibold ${
                          isSkipped
                            ? "text-gray-300"
                            : cleared
                            ? h === entry.bestHeight
                              ? "text-blue-700 bg-blue-50"   // mejor altura
                              : "text-green-600"              // superada
                            : isFail
                            ? "text-red-500"                  // eliminado
                            : "text-yellow-600"               // intentos parciales
                        }`}
                        title={`${h}m — ${seq}`}
                      >
                        {isSkipped ? "—" : seq}
                      </td>
                    );
                  })}

                  {/* Mejor altura */}
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

  // ── CAMPO (distancia): impulsión, lanzamiento, salto → athletes[] + bestDistance + attempts[]
  if (data.athleticsType === "distancia") {
    const athletes = data.athletes ?? [];

    if (athletes.length === 0)
      return <p className="text-gray-400 text-sm py-2">Sin resultados registrados aún.</p>;

    // Detectar si algún intento de cualquier atleta tiene viento registrado
    const hasWind = athletes.some((entry) =>
      (entry.attempts ?? []).some((a) => a.wind !== null && a.wind !== undefined)
    );

    return (
      <div className="flex flex-col gap-4">
        {athletes.map((entry) => {
          const athleteData = entry.athlete?.athlete;
          const fullName    = athleteData?.fullName ?? "—";
          const institution = athleteData?.institution?.name ?? "—";
          const attempts    = entry.attempts ?? [];

          return (
            <div key={entry.registrationId} className="bg-white rounded border border-gray-100 p-3">
              {/* Encabezado del atleta */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold w-6 text-center ${getMedalColor(entry.pos)}`}>
                    {entry.pos}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm capitalize">
                      {fullName.toLowerCase()}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {capitalize(institution)}
                    </p>
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

              {/* Intentos */}
              {attempts.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {attempts.map((attempt) => {
                    const isBest  = attempt.distance === entry.bestDistance;
                    const isValid = attempt.isValid && attempt.distance !== null;

                    return (
                      <div
                        key={attempt.attemptNumber}
                        className="flex flex-col items-center"
                        title={`Intento ${attempt.attemptNumber}`}
                      >
                        <span
                          className={`text-xs px-2 py-1 rounded font-mono ${
                            isValid
                              ? isBest
                                ? "bg-blue-100 text-blue-700 font-bold"
                                : "bg-gray-100 text-gray-600"
                              : "bg-red-50 text-red-400 line-through"
                          }`}
                        >
                          {attempt.distance !== null ? `${attempt.distance}m` : "X"}
                        </span>

                        {/* Viento por intento — solo si la fase usa viento */}
                        {hasWind && (
                          <span className="text-gray-400 text-xs mt-0.5 font-mono">
                            {attempt.wind !== null && attempt.wind !== undefined
                              ? `${attempt.wind > 0 ? "+" : ""}${attempt.wind}`
                              : "—"}
                          </span>
                        )}
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


  // ── PISTA (tiempo): sections[] → athletes[] con time
  const sections = data.sections ?? [];

  if (sections.length === 0)
    return <p className="text-gray-400 text-sm py-2">Sin resultados registrados aún.</p>;

  return (
    <div className="flex flex-col gap-4">
      {sections.map((section) => (
        <div key={section.sectionId}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {section.sectionName}
            </span>
            {section.wind !== null && section.wind !== undefined && (
              <span className="text-xs text-gray-400">
                Viento: {section.wind > 0 ? "+" : ""}{section.wind} m/s
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {section.athletes.map((entry) => {
              const athleteInfo = entry.athlete?.athlete;
              const isTeam      = athleteInfo?.source === "team";
              const hasTime     = entry.time !== null && entry.time !== undefined;
              const isDNF       = entry.status === "DNF";
              const isDNS       = entry.status === "DNS";
              const hasPos      = entry.pos !== null && entry.pos !== undefined;

              // ── Equipo (postas) ──────────────────────────────────────────────
              if (isTeam) {
                const members = athleteInfo?.members ?? [];

                return (
                  <div
                    key={entry.registrationId}
                    className="bg-white rounded border border-gray-100 overflow-hidden"
                  >
                    {/* Fila principal del equipo */}
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold w-6 text-center flex-shrink-0 ${hasPos ? getMedalColor(entry.pos) : "text-gray-400"}`}>
                          {hasPos ? entry.pos : "—"}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm capitalize">
                            {athleteInfo?.teamName?.toLowerCase() ?? "Equipo"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {members.length} integrantes
                          </p>
                        </div>
                      </div>

                      {/* Tiempo o estado especial */}
                      <div className="text-right flex-shrink-0">
                        {isDNF || isDNS ? (
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-50 text-red-500">
                            {entry.status}
                          </span>
                        ) : (
                          <span className="font-mono font-bold text-blue-700 text-sm">
                            {hasTime ? entry.time : "—"}
                            {hasTime && (
                              <span className="text-gray-400 font-normal text-xs ml-1">s</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Integrantes del equipo */}
                    {members.length > 0 && (
                      <div className="border-t border-gray-100 bg-gray-50 px-3 py-2">
                        <ul className="flex flex-col gap-1">
                          {members.map((member) => (
                            <li
                              key={member.tmId}
                              className="flex items-center gap-2 text-xs text-gray-600"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0" />
                              <span className="capitalize">
                                {member.name?.toLowerCase() ?? "—"}
                              </span>
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

              // ── Individual ───────────────────────────────────────────────────
              const fullName   = athleteInfo?.fullName ?? "—";
              const institution = athleteInfo?.institution?.name ?? "—";

              return (
                <div
                  key={entry.registrationId}
                  className="flex items-center justify-between px-3 py-2 bg-white rounded border border-gray-100"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold w-6 text-center flex-shrink-0 ${hasPos ? getMedalColor(entry.pos) : "text-gray-400"}`}>
                      {hasPos ? entry.pos : "—"}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800 text-sm capitalize">
                        {fullName.toLowerCase()}
                      </p>
                      <p className="text-xs text-gray-400 capitalize hidden sm:block">
                        {capitalize(institution)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    {isDNF || isDNS ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-50 text-red-500">
                        {entry.status}
                      </span>
                    ) : (
                      <span className="font-mono font-bold text-blue-700 text-sm">
                        {hasTime ? entry.time : "—"}
                        {hasTime && (
                          <span className="text-gray-400 font-normal text-xs ml-1">s</span>
                        )}
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


// ─── Sub-componente: Lista de fases de una categoría ────────────────────────

const CategoriaFases = ({ eventCategoryId }) => {
  const [fases, setFases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // phaseId expandida actualmente dentro de esta categoría
  const [selectedPhase, setSelectedPhase] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

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
  if (fases.length === 0)
    return <p className="text-gray-400 text-sm">Sin fases registradas.</p>;

  return (
    <ul className="flex flex-col gap-2">
      {fases.map((fase) => {
        const isPhaseOpen = selectedPhase === fase.phaseId;

        return (
          <li key={fase.phaseId} className="rounded border border-gray-200 overflow-hidden">
            {/* Cabecera de la fase */}
            <button
              className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-blue-50 transition-colors text-left"
              onClick={() =>
                setSelectedPhase((prev) =>
                  prev === fase.phaseId ? null : fase.phaseId
                )
              }
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                <span className="text-gray-700 text-sm capitalize font-medium">
                  {fase.phaseName.trim().toLowerCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                
                <span className="text-blue-400 text-xs">
                  {isPhaseOpen ? "▲" : "▼"}
                </span>
              </div>
            </button>

            {/* Resultados de la fase */}
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

// ─── Componente principal ────────────────────────────────────────────────────

const Pruebas = () => {
  const [categorias, setCategorias] = useState([]);
  const [eventInfo, setEventInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // eventCategoryId expandida actualmente
  const [selectedCategoria, setSelectedCategoria] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(
      `${API_BASE_FORMATOS_URL}/api/sismaster/competition-report/${ATLETISMO_EVENT_ID}?sportId=${ATLETISMO_SPORT_ID}`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setEventInfo(data.event);
        const sport = data.sports?.[0];
        setCategorias(sport?.categories ?? []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10 text-gray-500">
        Cargando pruebas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-10 text-red-500">
        Error al cargar las pruebas: {error}
      </div>
    );
  }

  if (categorias.length === 0) {
    return (
      <div className="flex justify-center items-center py-10 text-gray-400">
        No hay pruebas registradas para este evento.
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-4 px-2">
      

      <div className="flex flex-col gap-2">
        {categorias.map((categoria) => {
          const isOpen = selectedCategoria === categoria.eventCategoryId;

          return (
            <div
              key={categoria.eventCategoryId}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              {/* Nivel 1: Cabecera de categoría */}
              <button
                className="w-full flex justify-between items-center px-4 py-3 bg-white hover:bg-blue-50 transition-colors text-left"
                onClick={() =>
                  setSelectedCategoria((prev) =>
                    prev === categoria.eventCategoryId
                      ? null
                      : categoria.eventCategoryId
                  )
                }
              >
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-gray-800 capitalize">
                    {categoria.categoryName.toLowerCase()}
                  </span>
                  <div className="flex items-center gap-2">
                    
                    
                  </div>
                </div>
                <span className="text-blue-500 text-lg ml-4">
                  {isOpen ? "▲" : "▼"}
                </span>
              </button>

              {/* Nivel 2 + 3: Fases y resultados */}
              {isOpen && (
                <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                  <CategoriaFases
                    eventCategoryId={categoria.eventCategoryId}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pruebas;