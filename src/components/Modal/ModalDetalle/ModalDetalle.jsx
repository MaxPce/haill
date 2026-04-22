/**
 * PURPOSE: Modal público (Hayllis) para detalle del match, reutilizable por deporte.
 * RESPONSIBILITIES:
 *  - Sí: mostrar header del partido, score, momentos clave e incidencias por equipo.
 *  - Sí: hidratar snapshot al abrir y permitir recarga manual “fresh” contra DB.
 *  - Sí: mantener SSE solo para fútbol, dejando básquet en snapshot manual sin polling.
 *  - Sí: mantener visible la transmisión pública cuando exista URL.
 *  - No: no registra eventos ni maneja lógica de planilla interna.
 * COLLABORATORS:
 *  - src/hooks/useMatchLiveSSE.js
 *  - src/services/live/matchLiveApi.js
 *  - src/components/Modal/ModalDetalle/modalDetalleStrategies.js
 *  - src/components/Modal/ModalDetalle/MomentsBlock.jsx
 * NOTES:
 *  - El strategy decide comportamiento por deporte sin romper el flujo actual de fútbol.
 *  - Recargar usa `fresh=true` para saltarse cache y traer el estado real de DB.
 * ROUTE: src/components/Modal/ModalDetalle/ModalDetalle.jsx
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";
import Tooltip from "@mui/joy/Tooltip";

import moment from "moment";
import {
  RiArrowDownSLine,
  RiBroadcastFill,
  RiEyeLine,
  RiLoader4Line,
  RiLiveFill,
  RiRefreshLine,
  RiTimeLine,
} from "react-icons/ri";

import { stateMatch } from "../../../utils/stateMatch";
import { formatIdSport } from "../../../utils/formatIdSport.js";
import { useMatchLiveSSE } from "../../../hooks/useMatchLiveSSE.js";
import { fetchMatchLiveSnapshot } from "../../../services/live/matchLiveApi.js";
import MomentsBlock from "./MomentsBlock.jsx";
import { getModalDetalleStrategy } from "./modalDetalleStrategies.js";

function safeDetailObj(detail) {
  if (!detail) return null;
  if (typeof detail === "object") return detail;
  if (typeof detail === "string") {
    try {
      return JSON.parse(detail);
    } catch {
      return null;
    }
  }
  return null;
}

function getPerson(acc) {
  return acc?.person || acc?.Person || null;
}

function getInstitution(acc) {
  return acc?.institution || acc?.Institution || null;
}

function playerNameFromAcc(acc) {
  const dn = acc?.displayName;
  if (dn && String(dn).trim()) return String(dn).trim();

  const p = getPerson(acc);
  const first = p?.firstname ? String(p.firstname).trim() : "";
  const last = p?.lastname ? String(p.lastname).trim() : "";
  const full = `${first} ${last}`.trim();
  return full || acc?.persona || "Jugador";
}

function jerseyFromAcc(acc, jerseyByAccreditationId) {
  const id = Number(acc?.idacreditation);
  const validId = Number.isFinite(id) ? id : null;
  const j = (validId && jerseyByAccreditationId?.[validId]) ?? acc?.nro_camiseta;
  const cleanJ = String(j ?? "").trim();
  return cleanJ !== "" && cleanJ !== "NaN" ? `#${cleanJ}` : "#-";
}

function eventInstitutionId(ev) {
  const direct = Number(ev?.idinstitution);
  if (direct) return direct;

  const acc = ev?.accreditation || ev?.Accreditation || null;
  const inst = getInstitution(acc);
  const nested = Number(inst?.idinstitution);
  return nested || null;
}

function teamKeyForInstitutionId(idinst, team1InstId, team2InstId) {
  const id = Number(idinst);
  if (team1InstId && id === team1InstId) return "T1";
  if (team2InstId && id === team2InstId) return "T2";
  return "UNK";
}

function pillFromSseStatus(status) {
  switch (status) {
    case "open":
      return { text: "Conectado", cls: "bg-emerald-600 text-white" };
    case "connecting":
      return { text: "Conectando…", cls: "bg-amber-400 text-black" };
    case "reconnecting":
      return { text: "Reconectando…", cls: "bg-orange-500 text-white" };
    default:
      return { text: "Desconectado", cls: "bg-gray-500 text-white" };
  }
}

function getTeamLogo(inst) {
  if (!inst?.path_base || !inst?.image_path) return null;
  return `${inst.path_base}${inst.image_path}`;
}

const DEFAULT_TRANSMISSION_URL =
  "https://www.youtube.com/embed/6EaFRrlDODM?si=KQyPC4oLy7O1WA8H";

function getTransmissionUrl(match) {
  return (
    match?.transmission_url ||
    match?.link_transmission ||
    match?.video_url ||
    match?.url_video ||
    match?.link_video ||
    match?.stream_url ||
    DEFAULT_TRANSMISSION_URL
  );
}

function TeamPanel({
  team,
  statCards,
  events,
  loading,
  emptyText,
  buildIncidentRow,
  rowContext,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
      <div className="p-3 border-b border-gray-200 bg-white">
        <div className="flex items-start gap-2">
          {team.logo ? (
            <img
              src={team.logo}
              alt={team.abrev || "team"}
              className="w-9 h-9 rounded-full shadow object-contain bg-white shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-extrabold text-gray-900 break-words leading-tight">
              {team.abrev || "Equipo"}
            </div>
            <div className="text-xs text-gray-500 break-words leading-snug whitespace-normal">
              {team.name || ""}
            </div>
          </div>
        </div>

        <div className={`grid gap-2 mt-3 ${statCards.length >= 4 ? "grid-cols-4" : "grid-cols-3"}`}>
          {statCards.map((card) => (
            <div key={card.key} className={`rounded-xl border p-2 text-center ${card.wrapCls}`}>
              <div className={`text-[10px] font-bold ${card.labelCls}`}>{card.label}</div>
              <div className={`text-lg font-extrabold ${card.valueCls}`}>{card.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 space-y-2">
        {events.length === 0 ? (
          <div className="text-sm text-gray-500">{loading ? "Cargando..." : emptyText}</div>
        ) : (
          events.map((ev) => {
            const row = buildIncidentRow(ev, rowContext);
            if (!row) return null;

            return (
              <div
                key={row.id}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <span className="text-xs font-extrabold text-gray-900 shrink-0">
                        {row.time || "--:--"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border shrink-0 ${row.badgeCls}`}
                      >
                        {row.badgeText}
                      </span>
                      <span className="text-sm font-bold text-gray-900 break-words leading-snug">
                        {row.title}
                      </span>
                    </div>
                    {row.subtitle ? (
                      <div className="mt-1 text-xs text-gray-500 break-words leading-snug whitespace-normal">
                        {row.subtitle}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function ModalDetalle({ open, setOpen, match }) {
  const matchId = Number(match?.idmatch) || null;
  const formattedSport = formatIdSport(match?.idsport);
  const strategy = getModalDetalleStrategy(formattedSport);

  const isMatchLive = Number(match?.state) === 2;
  const matchState = stateMatch(match?.state);

  const formattedDate =
    match?.date_match && moment(match.date_match).isValid()
      ? moment(match.date_match).format("DD/MM/YYYY")
      : "Fecha";

  const formattedTime =
    match?.time_match && moment(match.time_match, "HH:mm:ss").isValid()
      ? moment(match.time_match, "HH:mm:ss").format("h:mm A")
      : "Hora";

  const team1Inst = match?.Participant1?.Institution || null;
  const team2Inst = match?.Participant2?.Institution || null;
  const team1InstId = Number(team1Inst?.idinstitution) || null;
  const team2InstId = Number(team2Inst?.idinstitution) || null;

  const canUseSse = !!strategy?.supportsSse && !!open && !!matchId && isMatchLive;
  const { status: liveStatus, live: sseLive } = useMatchLiveSSE({
    matchId,
    enabled: canUseSse,
  });

  const ssePill = pillFromSseStatus(liveStatus);
  const sseIconColorCls = useMemo(() => {
    if (liveStatus === "open") return "text-emerald-600";
    if (liveStatus === "connecting") return "text-amber-500";
    if (liveStatus === "reconnecting") return "text-orange-500";
    return "text-gray-500";
  }, [liveStatus]);

  const [tipKey, setTipKey] = useState(null);
  const tipTimerRef = useRef(null);
  const [tab, setTab] = useState(strategy?.getDefaultTab?.() || "ALL");

  useEffect(() => {
    setTab(strategy?.getDefaultTab?.() || "ALL");
  }, [strategy]);

  const toggleTip = (key) => {
    setTipKey((prev) => {
      const next = prev === key ? null : key;
      if (tipTimerRef.current) clearTimeout(tipTimerRef.current);
      if (next) {
        tipTimerRef.current = setTimeout(() => setTipKey(null), 1800);
      }
      return next;
    });
  };

  useEffect(() => {
    return () => {
      if (tipTimerRef.current) clearTimeout(tipTimerRef.current);
    };
  }, []);

  const [snapshot, setSnapshot] = useState({
    loading: false,
    syncing: false,
    error: null,
    score: null,
    events: [],
    refreshedAt: null,
    jerseyByAccreditationId: {},
    lineupSnapshotNo: null,
  });

  const syncTimerRef = useRef(null);
  const reqSeqRef = useRef(0);

  const scrollWrapRef = useRef(null);
  const incidenciasRef = useRef(null);
  const transmisionRef = useRef(null);

  const scrollToSection = (sectionRef, { offset = 12 } = {}) => {
    const wrap = scrollWrapRef.current;
    const el = sectionRef?.current;
    if (!wrap || !el) return;

    const wrapRect = wrap.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const nextTop = Math.max(0, wrap.scrollTop + (elRect.top - wrapRect.top) - offset);
    wrap.scrollTo({ top: nextTop, behavior: "smooth" });
  };

  const loadSnapshot = async ({ silent = false, forceFresh = false } = {}) => {
    if (!matchId || !strategy?.supportsSnapshot) return;

    const seq = ++reqSeqRef.current;
    if (silent) setSnapshot((p) => ({ ...p, syncing: true, error: null }));
    else setSnapshot((p) => ({ ...p, loading: true, error: null }));

    try {
      const data = await fetchMatchLiveSnapshot(matchId, {
        includeVoided: false,
        mode: strategy.apiMode,
        fresh: forceFresh,
      });

      if (seq !== reqSeqRef.current) return;

      setSnapshot((p) => ({
        ...p,
        loading: false,
        syncing: false,
        error: null,
        score: data?.score ?? null,
        events: Array.isArray(data?.events) ? data.events : [],
        refreshedAt: new Date().toISOString(),
        jerseyByAccreditationId: data?.jerseyByAccreditationId ?? {},
        lineupSnapshotNo: data?.lineupSnapshotNo ?? null,
      }));
    } catch (err) {
      if (seq !== reqSeqRef.current) return;
      setSnapshot((p) => ({
        ...p,
        loading: false,
        syncing: false,
        error: err?.message || "Error al cargar eventos.",
      }));
    }
  };

  useEffect(() => {
    if (!open || !matchId || !strategy?.supportsSnapshot) return;
    loadSnapshot({ silent: false, forceFresh: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, matchId, strategy?.apiMode, strategy?.supportsSnapshot]);

  useEffect(() => {
    if (!strategy?.supportsSse) return;
    if (!open || !matchId || !isMatchLive || !sseLive?.lastUpdateAt) return;

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      loadSnapshot({ silent: true, forceFresh: false });
    }, 1200);

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategy?.supportsSse, sseLive?.lastUpdateAt, open, matchId, isMatchLive]);

  const handleReload = async () => {
    await loadSnapshot({ silent: false, forceFresh: true });
  };

  const jerseyByAccId = snapshot.jerseyByAccreditationId || {};
  const mergedEvents = useMemo(() => {
    if (!strategy) return [];
    return strategy.mergeEvents({
      snapshotEvents: snapshot.events,
      sseEventsById: sseLive?.eventsById,
    });
  }, [strategy, snapshot.events, sseLive?.eventsById]);

  const eventsTeam1 = useMemo(() => {
    if (!team1InstId) return [];
    return mergedEvents.filter(
      (ev) => teamKeyForInstitutionId(eventInstitutionId(ev), team1InstId, team2InstId) === "T1"
    );
  }, [mergedEvents, team1InstId, team2InstId]);

  const eventsTeam2 = useMemo(() => {
    if (!team2InstId) return [];
    return mergedEvents.filter(
      (ev) => teamKeyForInstitutionId(eventInstitutionId(ev), team1InstId, team2InstId) === "T2"
    );
  }, [mergedEvents, team1InstId, team2InstId]);

  const statsT1 = useMemo(() => strategy?.computeTeamStats(eventsTeam1) || {}, [strategy, eventsTeam1]);
  const statsT2 = useMemo(() => strategy?.computeTeamStats(eventsTeam2) || {}, [strategy, eventsTeam2]);

  const tabs = strategy?.getTabs?.() || [];
  const listT1 = useMemo(() => strategy?.filterEventsByTab(eventsTeam1, tab) || [], [strategy, eventsTeam1, tab]);
  const listT2 = useMemo(() => strategy?.filterEventsByTab(eventsTeam2, tab) || [], [strategy, eventsTeam2, tab]);

  const scoreToShow = snapshot.score ?? {
    resultado1: Number(match?.resultado1 ?? 0),
    resultado2: Number(match?.resultado2 ?? 0),
    defpenal1: Number(match?.defpenal1 ?? 0),
    defpenal2: Number(match?.defpenal2 ?? 0),
  };

  const baseCtx = {
    match,
    mergedEvents,
    team1InstId,
    team2InstId,
    jerseyByAccId,
    safeDetailObj,
    playerNameFromAcc,
    jerseyFromAcc,
    eventInstitutionId,
    teamKeyForInstitutionId,
    getPerson,
    getInstitution,
  };

  const momentRows = useMemo(
    () => strategy?.buildMomentRows(baseCtx) || [],
    [strategy, baseCtx.match, baseCtx.mergedEvents, baseCtx.team1InstId, baseCtx.team2InstId, baseCtx.jerseyByAccId]
  );

  const transmissionUrl = getTransmissionUrl(match);
  const teamLeft = {
    abrev: team1Inst?.abrev || "Equipo 1",
    name: team1Inst?.name || "",
    logo: getTeamLogo(team1Inst),
  };
  const teamRight = {
    abrev: team2Inst?.abrev || "Equipo 2",
    name: team2Inst?.name || "",
    logo: getTeamLogo(team2Inst),
  };

  const showMomentBlock = !!strategy?.supportsMoments;
  const showTabs = tabs.length > 1;
  const canReload = !!strategy?.supportsSnapshot;

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Quicksand",
      }}
    >
      <Sheet
        variant="outlined"
        sx={{
          width: "calc(100% - 16px)",
          mx: "8px",
          maxHeight: "88vh",
          overflow: "hidden",
          borderRadius: "18px",
          boxShadow: "lg",
          "@media (min-width: 768px)": {
            width: "100%",
            mx: 0,
            maxWidth: 980,
            borderRadius: "16px",
          },
        }}
        className="bg-gradient-to-br from-[#f7f7f7] to-[#ffffff]"
      >
        <div className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b border-gray-200">
          <div className="relative p-3 md:p-5">
            <ModalClose className="text-[#c21546]" sx={{ m: 1 }} />

            <div className="absolute right-12 top-3 hidden md:block text-[11px] font-semibold text-gray-400">
              {formattedDate} · {formattedTime}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
              <span className={`px-2.5 py-1 rounded-full text-[11px] md:text-xs font-extrabold flex items-center gap-1 ${matchState.color}`}>
                {isMatchLive && <RiLiveFill className="animate-pulse" />}
                {matchState.tag}
              </span>

              {strategy?.supportsSse && isMatchLive && (
                <Tooltip
                  title={`SSE: ${ssePill.text}`}
                  open={tipKey === "sse"}
                  onClose={() => setTipKey(null)}
                  placement="bottom"
                  variant="soft"
                >
                  <button
                    type="button"
                    onClick={() => toggleTip("sse")}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center active:scale-95 transition"
                    aria-label={`SSE: ${ssePill.text}`}
                  >
                    <RiBroadcastFill className={`text-lg md:text-xl ${sseIconColorCls}`} />
                  </button>
                </Tooltip>
              )}

              {snapshot.refreshedAt && (
                <Tooltip
                  title={`Actualizado: ${moment(snapshot.refreshedAt).format("HH:mm:ss")}`}
                  open={tipKey === "updated"}
                  onClose={() => setTipKey(null)}
                  placement="bottom"
                  variant="soft"
                >
                  <button
                    type="button"
                    onClick={() => toggleTip("updated")}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center active:scale-95 transition"
                    aria-label={`Actualizado: ${moment(snapshot.refreshedAt).format("HH:mm:ss")}`}
                  >
                    <RiTimeLine className="text-lg md:text-xl text-gray-700" />
                  </button>
                </Tooltip>
              )}

              {snapshot.syncing && (
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                  <RiLoader4Line className="text-lg md:text-xl text-gray-700 animate-spin" />
                </div>
              )}

              {canReload && (
                <Tooltip
                  title="Recargar desde base de datos"
                  open={tipKey === "reload"}
                  onClose={() => setTipKey(null)}
                  placement="bottom"
                  variant="soft"
                >
                  <button
                    type="button"
                    onClick={async () => {
                      toggleTip("reload");
                      await handleReload();
                    }}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center active:scale-95 transition"
                    aria-label="Recargar"
                  >
                    {snapshot.loading ? (
                      <RiLoader4Line className="text-lg md:text-xl text-gray-700 animate-spin" />
                    ) : (
                      <RiRefreshLine className="text-lg md:text-xl text-gray-700" />
                    )}
                  </button>
                </Tooltip>
              )}
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-5">
              <div className="min-w-0 flex items-center justify-end gap-2 md:gap-3">
                <div className="min-w-0 flex-1 text-right">
                  <div className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-wide break-words leading-tight">
                    {teamLeft.abrev}
                  </div>
                  <div className="text-sm md:text-xl font-extrabold text-gray-900 break-words leading-tight whitespace-normal">
                    {teamLeft.name}
                  </div>
                </div>
                {teamLeft.logo ? (
                  <img
                    src={teamLeft.logo}
                    alt={teamLeft.abrev}
                    className="w-11 h-11 md:w-16 md:h-16 object-contain rounded-full bg-white shadow shrink-0"
                  />
                ) : null}
              </div>

              <div className="text-center shrink-0">
                <div className="text-[11px] md:text-xs font-bold uppercase tracking-[0.18em] text-gray-500 mb-1">
                  Marcador
                </div>
                <div className="inline-flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-2xl bg-gray-900 text-white shadow-lg">
                  <span className="text-3xl md:text-5xl font-black tabular-nums leading-none">
                    {Number(scoreToShow.resultado1 ?? 0)}
                  </span>
                  <span className="text-lg md:text-2xl font-black text-white/60">-</span>
                  <span className="text-3xl md:text-5xl font-black tabular-nums leading-none">
                    {Number(scoreToShow.resultado2 ?? 0)}
                  </span>
                </div>
              </div>

              <div className="min-w-0 flex items-center justify-start gap-2 md:gap-3">
                {teamRight.logo ? (
                  <img
                    src={teamRight.logo}
                    alt={teamRight.abrev}
                    className="w-11 h-11 md:w-16 md:h-16 object-contain rounded-full bg-white shadow shrink-0"
                  />
                ) : null}
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-wide break-words leading-tight">
                    {teamRight.abrev}
                  </div>
                  <div className="text-sm md:text-xl font-extrabold text-gray-900 break-words leading-tight whitespace-normal">
                    {teamRight.name}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => scrollToSection(incidenciasRef)}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm"
              >
                <RiEyeLine className="text-sm" /> Incidencias <RiArrowDownSLine className="text-base" />
              </button>

              <button
                type="button"
                onClick={() => scrollToSection(transmisionRef)}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm"
              >
                <RiEyeLine className="text-sm" /> Transmisión <RiArrowDownSLine className="text-base" />
              </button>
            </div>
          </div>
        </div>

        <div ref={scrollWrapRef} className="overflow-y-auto max-h-[calc(88vh-128px)]">
          <div className="p-3 md:p-5 space-y-4">
            {snapshot.error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {snapshot.error}
              </div>
            ) : null}

            {showMomentBlock && (
              <MomentsBlock
                moments={momentRows}
                loading={snapshot.loading}
                previewLimit={8}
                title={strategy.momentsTitle}
                subtitle={strategy.momentsSubtitle}
                emptyText={strategy.momentsEmptyText}
                kindMeta={strategy.momentKindMeta}
              />
            )}

            <section ref={incidenciasRef} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-base font-extrabold text-gray-900">
                    {strategy?.incidenciasTitle || "Incidencias"}
                  </div>
                  <div className="text-[12px] text-gray-500">
                    {strategy?.incidenciasSubtitle || "Eventos del partido separados por equipo."}
                  </div>
                </div>

                {showTabs ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    {tabs.map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setTab(t.key)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition border ${tab === t.key
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                          }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              {strategy ? (
                <div className="p-3 md:p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <TeamPanel
                      team={teamLeft}
                      statCards={strategy.buildStatCards(statsT1)}
                      events={listT1}
                      loading={snapshot.loading}
                      emptyText={strategy.emptyTeamEventsText}
                      buildIncidentRow={strategy.buildIncidentRow}
                      rowContext={baseCtx}
                    />
                    <TeamPanel
                      team={teamRight}
                      statCards={strategy.buildStatCards(statsT2)}
                      events={listT2}
                      loading={snapshot.loading}
                      emptyText={strategy.emptyTeamEventsText}
                      buildIncidentRow={strategy.buildIncidentRow}
                      rowContext={baseCtx}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 text-sm text-gray-500">
                  Este deporte todavía no tiene detalle público implementado.
                </div>
              )}
            </section>

            <section ref={transmisionRef} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="text-base font-extrabold text-gray-900">Transmisión</div>
                <div className="text-[12px] text-gray-500">
                  Mira la transmisión oficial del partido directamente desde el modal.
                </div>
              </div>
              <div className="p-3 md:p-4">
                <div className="rounded-2xl overflow-hidden border border-gray-200 bg-black aspect-video">
                  <iframe
                    src={transmissionUrl}
                    title="Transmisión del partido"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </Sheet>
    </Modal>
  );
}
