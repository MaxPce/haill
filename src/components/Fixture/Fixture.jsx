import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/config.js";
import moment from "moment";
import Bandera from "../Bandera/Bandera";
import "./Fixture.css";
import { useParams } from "react-router-dom";

export default function Fixture() {
  const [matches, setMatches] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [moodName, setMoodName] = useState(1);
  const [useBandera, setUseBandera] = useState(false);

  const [loading, setLoading] = useState(true);
  const [dots, setDots] = useState("");
  const [error, setError] = useState(null);
  const [nroRondas, setNroRondas] = useState(1);
  const [fixtureRows, setFixtureRows] = useState([]);

  const { idevent, idsport } = useParams();

  // Efecto para los puntos animados
  useEffect(() => {
    if (!loading) return; // sólo mientras carga
    const frames = ["", ".", "..", "..."];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % frames.length;
      setDots(frames[idx]);
    }, 250); // cada 500ms cambia
    return () => clearInterval(interval);
  }, [loading]);


  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [cfg, parts, mchs, fxRows] = await Promise.all([
          axios.post(`${API_BASE_URL}/config_category`, { idevent, idsport }),
          axios.post(`${API_BASE_URL}/getparticipants`, {
            idevent,
            idsport,
            idtypephase: 1,
          }),
          axios.post(`${API_BASE_URL}/getmatches`, {
            idevent,
            idsport,
            idtypephase: 1,
          }),
          axios.post(`${API_BASE_URL}/getfixture`, { idevent, idsport })
        ]);

        /* ------------------------------------------------------------ */
        /* 1) Convertir "3, 4" → [3,4] → idbase [1,2]                   */
        /* ------------------------------------------------------------ */
        const numeros = cfg.data.nro_equipos_x_grupo
          .split(",")
          .map(s => Number(s.trim()))
          .filter(n => Number.isInteger(n) && n >= 3);

        const idbaseSet = new Set(numeros.map(n => n - 2));  // 3→1, 4→2, ...

        /* 2) Filtrar los fixtures que NO pertenezcan a ese idbase      */
        const fixtureFiltered = fxRows.data.filter(row => idbaseSet.has(row.idbase));

        setMoodName(cfg.data.moodName);
        setUseBandera(cfg.data.useBandera);
        setNroRondas(Number(cfg.data.nro_rondas))

        setParticipants(parts.data);
        setMatches(mchs.data);
        setFixtureRows(fixtureFiltered);
      } catch (err) {
        console.error(err);
        setError("Error cargando el fixture.");
      } finally {
        setLoading(false);
      }
    };

    if (idevent && idsport) fetchAll();
  }, [idevent, idsport]);

  const buildBaseFromFixtureRows = rows => {
    const porBase = {};

    for (const row of rows) {
      const { idbase, n_fecha, nro_team1, nro_team2 } = row;
      (porBase[idbase] ??= {});
      (porBase[idbase][n_fecha] ??= []).push([nro_team1, nro_team2]);
    }

    // Convertimos a array ordenado por fecha
    Object.keys(porBase).forEach(idb => {
      const fechas = Object.keys(porBase[idb])
        .map(n => +n)
        .sort((a, b) => a - b);
      porBase[idb] = fechas.map(f => porBase[idb][f]);
    });

    return porBase;   // p. ej.  { 1: [[…],[…],[…]], 2: [[…],[…],[…]] }
  };
  const baseFixturesByBase = useMemo(
    () => buildBaseFromFixtureRows(fixtureRows),
    [fixtureRows]
  );

  // =======================
  // Construir fechas a mostrar según nroRondas
  // =======================
  const groupMatchesByGroupAndDate = (matches) => {
    return matches.reduce((acc, match) => {
      const groupKey = +idevent === 80 ? `${match.tag_final}` : `Grupo ${String.fromCharCode(64 + match.idgrupo)}`;
      const dateKey = `Fecha ${match.nro_fecha}`;
      if (!acc[groupKey]) {
        acc[groupKey] = {};
      }
      if (!acc[groupKey][dateKey]) {
        acc[groupKey][dateKey] = [];
      }
      acc[groupKey][dateKey].push(match);
      return acc;
    }, {});
  };

  const getParticipantsByGroup = (groupId) => {
    return participants
      .filter((participant) => participant.idgrupo === groupId)
      .sort((a, b) => a.nro_grupo - b.nro_grupo);
  };

  const sortMatchesWithByeLast = (matches) => {
    return matches.sort((a, b) => {
      if (a.flag_bye) return 1;
      if (b.flag_bye) return -1;
      return 0;
    });
  };

  // const groupedMatches = groupMatchesByGroupAndDate(matches);
  /// -->
  /* ======================================================= */
  /*  NUEVA FUNCIÓN: arma el fixture base para el GRUPO 1    */
  /* ======================================================= */
  const buildBaseFixture = (allMatches) => {
    // nos quedamos SOLO con idtypephase=1, idgrupo=1
    const g1 = allMatches.filter(
      (m) => m.idtypephase === 1 && m.idgrupo === 1
    );

    // agrupamos por nro_fecha
    const byFecha = g1.reduce((acc, m) => {
      (acc[m.nro_fecha] ??= []).push([m.nro_team1, m.nro_team2]);
      return acc;
    }, {});

    /* Queremos un array ordenado [ [4‑1, 3‑2], … ]   */
    const salida = [1, 2, 3].map((f) => byFecha[f] ?? []);

    return salida;   // ejemplo:  [ [ [4,1],[3,2] ], [ [1,2],[4,3] ], … ]
  };

  /* ======================================================= */
  /*  Construimos structures para render                     */
  /* ======================================================= */
  const groupedMatches = groupMatchesByGroupAndDate(matches);
  const baseFixture = buildBaseFixture(matches);   // 👈 nuevo
  const flag_use_lottery = true;

  const fechasParaRender = useMemo(() => {
    if (fixtureRows.length === 0) return [];

    // Si sólo hay un tipo de fixture repites la lógica anterior
    if (Object.keys(baseFixturesByBase).length === 1) {
      const arr = Object.values(baseFixturesByBase)[0];
      return nroRondas === 2
        ? [...arr, ...arr.map(f => f.map(([a, b]) => [b, a]))]
        : arr;
    }

    // Si hay varios tipos ⇒ devolvemos un objeto {idbase: fechas[]}
    const salida = {};
    for (const [idb, arr] of Object.entries(baseFixturesByBase)) {
      salida[idb] =
        nroRondas === 2
          ? [...arr, ...arr.map(f => f.map(([a, b]) => [b, a]))]
          : arr;
    }
    return salida;          // { 1: [[…]], 2: [[…]] }
  }, [baseFixturesByBase, nroRondas, fixtureRows]);
  const isSingleFixture = Array.isArray(fechasParaRender);

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Cargando el Fixture{dots}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-white rounded-lg shadow-lg p-6 space-y-4"
            >
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }


  return (
    <div className="fixture flex flex-col items-center w-full p-4 gap-5 font-quickSand">

      {/* ---------- FIXTURE BASE (versión estilizada) ---------- */}
      {fixtureRows.length > 0 && flag_use_lottery && (
        <section className="w-full mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-xl p-6 text-white">
            <h2 className="text-3xl font-extrabold text-center mb-3">
              FIXTURE&nbsp;BASE
            </h2>

            { /* —————— Si solo hay un tipo de fixture —————— */}
            {isSingleFixture ? (
              <div className="grid gap-6 md:grid-cols-3 px-4">
                {fechasParaRender.map((fecha, idx) => (
                  <FechaCard key={idx} idx={idx} fecha={fecha} />
                ))}
              </div>

            ) : (
              /* —————— Si hay varios tipos de fixture —————— */
              <div className="flex flex-wrap justify-evenly gap-8 px-4">
                {Object.entries(fechasParaRender).map(([idb, fechas]) => (
                  <div
                    key={idb}
                    className="flex-shrink-0 
                 w-full sm:w-1/2 md:w-1/3 lg:w-auto 
                 flex flex-col items-center"
                  >
                    {/* Chip “N equipos” */}
                    <div className="bg-white text-blue-600 font-bold text-xs uppercase tracking-wide
                      px-3 py-1 rounded-full shadow-sm mb-4">
                      {+idb + 2} equipos
                    </div>

                    {/* FechaCards en columna en móvil, fila en pantallas mayores */}
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 justify-center">
                      {fechas.map((f, i) => (
                        <div key={i} className="sm:flex-shrink-0">
                          <FechaCard idx={i} fecha={f} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            )}
          </div>
        </section>
      )}


      {/* ---------- RESTO DEL COMPONENTE TAL CUAL ---------- */}
      {matches.length === 0 ? (
        <div className="text-center text-xl font-bold text-gray-700">
          Todavía no se ha generado el Fixture
        </div>
      ) : (
        Object.keys(groupedMatches).map((groupKey) => {
          const groupId = groupKey.charCodeAt(6) - 64;
          const groupParticipants = getParticipantsByGroup(groupId);

          return (
            <div
              key={groupKey}
              className="fixture-card bg-white p-6 rounded-lg shadow-lg w-full"
            >
              <div className="titulo_grupo flex items-center flex-col justify-center">
                <h2 className="text-3xl font-bold text-blue-600 mb-4">
                  {groupKey.toUpperCase()}
                </h2>

                <div className="flex space-x-2 mt-2 lg:mt-0 gap-8">
                  {groupParticipants.map((participant, index) => (
                    <div
                      className="circle relative flex flex-col items-center"
                      key={index}
                    >
                      <img
                        src={`${participant.Institution.path_base}${participant.Institution.image_path}`}
                        alt="imagen"
                        className="circle-image mb-1 rounded-full"
                      />
                      {useBandera && (
                        <Bandera
                          src={`${participant.Institution?.country?.img_path}`}
                          alt="imagen"
                        />
                      )}
                      <div className="font-bold text-center mt-1">
                        {participant.Institution.abrev}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap justify-center space-x-4">
                {Object.keys(groupedMatches[groupKey]).map((dateKey) => {
                  const sortedMatches = sortMatchesWithByeLast(
                    groupedMatches[groupKey][dateKey]
                  );
                  return (
                    <div key={dateKey} className="card mb-4">
                      <h3 className="text-xl font-semibold mb-2 text-gray-900">
                        {dateKey}
                      </h3>
                      <div className="match-container flex flex-col space-y-4">
                        {sortedMatches.map((match) => (
                          <div
                            key={match.idmatch}
                            className={`match flex items-center justify-center ${match.Participant1 && match.Participant2
                              ? ""
                              : "gap-4"
                              }`}
                          >
                            {/* Mostrar contenido del match */}
                            {match.Participant1 && match.Participant2 ? (
                              <>
                                <div className="team-container">
                                  <div className="team-content">
                                    <div className="circle relative">
                                      <img
                                        src={`${match.Participant1.Institution.path_base}${match.Participant1.Institution.image_path}`}
                                        alt="imagen"
                                        className="circle-image rounded-full"
                                      />
                                      {useBandera && (
                                        <Bandera
                                          src={`${match.Participant1?.Institution?.country?.img_path}`}
                                          alt="imagen"
                                          className="absolute top-0 right-0 w-4 h-3"
                                        />
                                      )}
                                    </div>
                                    <div className="team-name">
                                      {moodName === 1
                                        ? match.Participant1.Institution.abrev
                                        : match.Participant1.Institution.name}
                                    </div>
                                  </div>
                                </div>

                                {!match.flag_bye && (
                                  <div className="vs-container">
                                    <div className="vs">vs</div>
                                  </div>
                                )}

                                <div className="team-container">
                                  <div className="team-content">
                                    <div className="circle relative">
                                      <img
                                        src={`${match.Participant2.Institution.path_base}${match.Participant2.Institution.image_path}`}
                                        alt="imagen"
                                        className="circle-image rounded-full"
                                      />
                                      {useBandera && (
                                        <Bandera
                                          src={`${match.Participant2?.Institution?.country?.img_path}`}
                                          alt="imagen"
                                          className="absolute top-0 right-0 w-4 h-3"
                                        />
                                      )}
                                    </div>
                                    <div className="team-name">
                                      {moodName === 1
                                        ? match.Participant2.Institution.abrev
                                        : match.Participant2.Institution.name}
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              /* Mostrar "descansa" si hay un bye */
                              <div className="team-name text-center">
                                {match.Participant1
                                  ? `${match.Participant1.Institution.abrev} descansa`
                                  : `${match.Participant2.Institution.abrev} descansa`}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

const FechaCard = ({ idx, fecha }) => (
  <div className="bg-white text-gray-800 rounded-xl shadow-lg border border-gray-200
                  px-4 py-5 flex flex-col items-center
                  transition hover:shadow-2xl">
    <span className="bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full mb-3">
      Fecha {idx + 1}
    </span>
    {fecha.map(([t1, t2], i) => (
      <div key={i} className="flex items-center gap-2 text-lg font-medium my-1">
        <span className="text-blue-600">{t1 ?? "X"}</span>
        <span className="opacity-60">vs</span>
        <span className="text-blue-600">{t2 ?? "X"}</span>
      </div>
    ))}
  </div>
);
