/**
 * PURPOSE: Estrategias por deporte para el ModalDetalle público de Hayllis.
 * RESPONSIBILITIES:
 *  - Sí: encapsular filtros, tabs, momentos, stats y rendering semántico por deporte.
 *  - Sí: mantener fútbol intacto y agregar básquet sin romper su flujo actual.
 *  - No: no hace fetch HTTP ni maneja estado React del modal.
 * COLLABORATORS:
 *  - src/components/Modal/ModalDetalle/ModalDetalle.jsx
 *  - src/utils/codesEventPlanilla.js
 * ROUTE: src/components/Modal/ModalDetalle/modalDetalleStrategies.js
 */

import {
  labelFromEventTypeId,
  isFoulEventTypeId,
  isPointEventTypeId,
  isTimeoutEventTypeId,
} from "../../../utils/codesEventPlanilla.js";

const FUTBOL_LIVE_IDS = Object.freeze({
  GOAL: 3001,
  YELLOW: 3002,
  RED: 3003,
  SUB: 3004,
});

function toActive(events = []) {
  return (Array.isArray(events) ? events : []).filter(
    (e) => Number(e?.state ?? 1) === 1
  );
}

function sortDescByEventId(events = []) {
  const out = [...events];
  out.sort(
    (a, b) => Number(b?.idmatchevent ?? 0) - Number(a?.idmatchevent ?? 0)
  );
  return out;
}

function getTeamVisual(match, key) {
  const inst =
    key === "T1"
      ? match?.Participant1?.Institution
      : match?.Participant2?.Institution;
  return {
    abrev: inst?.abrev || (key === "T1" ? "T1" : "T2"),
    logo:
      inst?.path_base && inst?.image_path
        ? `${inst.path_base}${inst.image_path}`
        : null,
  };
}

const futbolStrategy = {
  key: "FUTBOL",
  apiMode: "FUTBOL",
  supportsSnapshot: true,
  supportsSse: true,
  supportsMoments: true,
  momentsTitle: "MOMENTOS",
  momentsSubtitle: "Goles · Tarjetas · Cambios",
  momentsEmptyText: "Aún no hay momentos.",
  incidenciasTitle: "Incidencias en vivo",
  incidenciasSubtitle: "Eventos clave separados por equipo.",
  emptyTeamEventsText: "Sin eventos para este equipo.",
  momentKindMeta: Object.freeze({
    GOAL: { txt: "G", cls: "bg-emerald-600 text-white" },
    YELLOW: { txt: "A", cls: "bg-yellow-400 text-black" },
    RED: { txt: "R", cls: "bg-red-600 text-white" },
    SUB: { txt: "S", cls: "bg-blue-600 text-white" },
  }),
  getDefaultTab() {
    return "ALL";
  },
  getTabs() {
    return [
      { key: "ALL", label: "Todo" },
      { key: "GOALS", label: "Goles" },
      { key: "CARDS", label: "Tarjetas" },
      { key: "SUBS", label: "Cambios" },
    ];
  },
  mergeEvents({ snapshotEvents, sseEventsById }) {
    const base = Array.isArray(snapshotEvents) ? snapshotEvents : [];
    const baseMap = new Map();

    for (const ev of base) {
      if (!ev?.idmatchevent) continue;
      baseMap.set(Number(ev.idmatchevent), ev);
    }

    const sseById = sseEventsById || {};
    for (const [idStr, sseEv] of Object.entries(sseById)) {
      const id = Number(idStr);
      if (!id) continue;

      const prev = baseMap.get(id);
      const merged =
        prev && Number(sseEv?.eventTypeId) === FUTBOL_LIVE_IDS.SUB
          ? {
              ...prev,
              ...sseEv,
              inAccreditation:
                sseEv?.inAccreditation ?? prev?.inAccreditation ?? null,
            }
          : { ...(prev || {}), ...(sseEv || {}) };

      baseMap.set(id, merged);
    }

    return sortDescByEventId(Array.from(baseMap.values()));
  },
  computeTeamStats(events) {
    const active = toActive(events);
    let goals = 0;
    let yellows = 0;
    let reds = 0;
    let subs = 0;

    for (const e of active) {
      const t = Number(e?.eventTypeId);
      if (t === FUTBOL_LIVE_IDS.GOAL) goals += 1;
      else if (t === FUTBOL_LIVE_IDS.YELLOW) yellows += 1;
      else if (t === FUTBOL_LIVE_IDS.RED) reds += 1;
      else if (t === FUTBOL_LIVE_IDS.SUB) subs += 1;
    }

    return { goals, yellows, reds, subs };
  },
  buildStatCards(stats) {
    return [
      {
        key: "goals",
        label: "G",
        value: stats.goals ?? 0,
        wrapCls: "bg-emerald-50 border-emerald-100",
        labelCls: "text-emerald-700",
        valueCls: "text-emerald-900",
      },
      {
        key: "yellows",
        label: "TA",
        value: stats.yellows ?? 0,
        wrapCls: "bg-yellow-50 border-yellow-100",
        labelCls: "text-yellow-800",
        valueCls: "text-yellow-900",
      },
      {
        key: "reds",
        label: "TR",
        value: stats.reds ?? 0,
        wrapCls: "bg-red-50 border-red-100",
        labelCls: "text-red-700",
        valueCls: "text-red-900",
      },
      {
        key: "subs",
        label: "S",
        value: stats.subs ?? 0,
        wrapCls: "bg-blue-50 border-blue-100",
        labelCls: "text-blue-700",
        valueCls: "text-blue-900",
      },
    ];
  },
  filterEventsByTab(list, tab) {
    const active = toActive(list);
    if (tab === "GOALS")
      return active.filter(
        (e) => Number(e?.eventTypeId) === FUTBOL_LIVE_IDS.GOAL
      );
    if (tab === "CARDS") {
      return active.filter((e) => {
        const t = Number(e?.eventTypeId);
        return t === FUTBOL_LIVE_IDS.YELLOW || t === FUTBOL_LIVE_IDS.RED;
      });
    }
    if (tab === "SUBS")
      return active.filter(
        (e) => Number(e?.eventTypeId) === FUTBOL_LIVE_IDS.SUB
      );
    return active;
  },
  buildMomentRows(ctx) {
    const {
      match,
      mergedEvents,
      team1InstId,
      team2InstId,
      jerseyByAccId,
      eventInstitutionId,
      teamKeyForInstitutionId,
      playerNameFromAcc,
      jerseyFromAcc,
      safeDetailObj,
    } = ctx;

    const out = [];

    for (const ev of toActive(mergedEvents)) {
      const typeId = Number(ev?.eventTypeId);
      const isMoment =
        typeId === FUTBOL_LIVE_IDS.GOAL ||
        typeId === FUTBOL_LIVE_IDS.YELLOW ||
        typeId === FUTBOL_LIVE_IDS.RED ||
        typeId === FUTBOL_LIVE_IDS.SUB;

      if (!isMoment) continue;

      const id = Number(ev?.idmatchevent);
      if (!Number.isFinite(id) || id <= 0) continue;

      const key = teamKeyForInstitutionId(
        eventInstitutionId(ev),
        team1InstId,
        team2InstId
      );
      const team = getTeamVisual(match, key);
      const outAcc = ev?.accreditation || ev?.Accreditation || null;
      const time = ev?.eventTime || "--:--";

      if (typeId === FUTBOL_LIVE_IDS.SUB) {
        const inAcc = ev?.inAccreditation || null;
        const detail = safeDetailObj(ev?.detail);
        const inId =
          Number(detail?.inIdacreditation) ||
          Number(inAcc?.idacreditation) ||
          null;
        const outJersey = jerseyFromAcc(outAcc, jerseyByAccId);
        const inJersey = inId
          ? `#${String(jerseyByAccId?.[inId] ?? "-").trim() || "-"}`
          : jerseyFromAcc(inAcc, jerseyByAccId);

        out.push({
          id,
          time,
          kind: "SUB",
          teamAbrev: team.abrev,
          teamLogo: team.logo,
          mainText: `${outJersey} → ${inJersey}`,
          detailRows: [
            {
              label: "OUT",
              value: `${outJersey} ${playerNameFromAcc(outAcc)}`,
            },
            {
              label: "IN",
              value: `${inJersey} ${
                inAcc ? playerNameFromAcc(inAcc) : "Cargando…"
              }`,
            },
          ],
        });
        continue;
      }

      const playerJersey = jerseyFromAcc(outAcc, jerseyByAccId);
      const playerName = playerNameFromAcc(outAcc);

      out.push({
        id,
        time,
        kind:
          typeId === FUTBOL_LIVE_IDS.GOAL
            ? "GOAL"
            : typeId === FUTBOL_LIVE_IDS.YELLOW
            ? "YELLOW"
            : "RED",
        teamAbrev: team.abrev,
        teamLogo: team.logo,
        mainText:
          typeId === FUTBOL_LIVE_IDS.GOAL
            ? `${playerJersey} GOL`
            : `${playerJersey}`,
        detailRows: [
          { label: "Jugador", value: `${playerJersey} ${playerName}` },
        ],
      });
    }

    return [...out].sort((a, b) => Number(b?.id ?? 0) - Number(a?.id ?? 0));
  },
  buildIncidentRow(ev, ctx) {
    const { jerseyByAccId, playerNameFromAcc, jerseyFromAcc, safeDetailObj } =
      ctx;
    const acc = ev?.accreditation || ev?.Accreditation || null;
    const player = `${jerseyFromAcc(acc, jerseyByAccId)} ${playerNameFromAcc(
      acc
    )}`;
    const typeId = Number(ev?.eventTypeId);

    if (typeId === FUTBOL_LIVE_IDS.GOAL) {
      const subtype = String(
        safeDetailObj(ev?.detail)?.subtype || "NORMAL"
      ).toUpperCase();
      const subtypeLabel =
        subtype === "AUTOGOL"
          ? "Autogol"
          : subtype === "PENAL"
          ? "Penal"
          : "Gol";
      return {
        id: ev.idmatchevent,
        time: ev.eventTime,
        badgeText: "G",
        badgeCls: "bg-emerald-50 text-emerald-700 border-emerald-200",
        title: player,
        subtitle: subtypeLabel,
      };
    }

    if (typeId === FUTBOL_LIVE_IDS.YELLOW) {
      return {
        id: ev.idmatchevent,
        time: ev.eventTime,
        badgeText: "TA",
        badgeCls: "bg-yellow-50 text-yellow-800 border-yellow-200",
        title: player,
        subtitle: "Tarjeta amarilla",
      };
    }

    if (typeId === FUTBOL_LIVE_IDS.RED) {
      return {
        id: ev.idmatchevent,
        time: ev.eventTime,
        badgeText: "TR",
        badgeCls: "bg-red-50 text-red-700 border-red-200",
        title: player,
        subtitle: "Tarjeta roja",
      };
    }

    if (typeId === FUTBOL_LIVE_IDS.SUB) {
      const detail = safeDetailObj(ev?.detail);
      const inAcc = ev?.inAccreditation || null;
      const inId =
        Number(detail?.inIdacreditation) ||
        Number(inAcc?.idacreditation) ||
        null;
      const outJersey = jerseyFromAcc(acc, jerseyByAccId);
      const inJersey = inId
        ? `#${String(jerseyByAccId?.[inId] ?? "-").trim() || "-"}`
        : jerseyFromAcc(inAcc, jerseyByAccId);
      const outName = playerNameFromAcc(acc);
      const inName = inAcc ? playerNameFromAcc(inAcc) : "Cargando…";
      return {
        id: ev.idmatchevent,
        time: ev.eventTime,
        badgeText: "S",
        badgeCls: "bg-blue-50 text-blue-700 border-blue-200",
        title: `${outJersey} ${outName}`,
        subtitle: `Entra ${inJersey} ${inName}`,
      };
    }

    return null;
  },
};

const basquetStrategy = {
  key: "BASQUET",
  apiMode: "BASQUET",
  supportsSnapshot: true,
  supportsSse: false,
  supportsMoments: true,
  momentsTitle: "PROGRESIÓN DE PUNTAJE",
  momentsSubtitle: "+1 · +2 · +3 por deportista",
  momentsEmptyText: "Aún no hay conversiones de puntos.",
  incidenciasTitle: "Incidencias de básquet",
  incidenciasSubtitle: "Puntos, faltas y tiempos muertos separados por equipo.",
  emptyTeamEventsText: "Sin incidencias para este equipo.",
  momentKindMeta: Object.freeze({
    POINT_1: { txt: "+1", cls: "bg-emerald-600 text-white" },
    POINT_2: { txt: "+2", cls: "bg-sky-600 text-white" },
    POINT_3: { txt: "+3", cls: "bg-violet-600 text-white" },
  }),
  getDefaultTab() {
    return "ALL";
  },
  getTabs() {
    return [
      { key: "ALL", label: "Todo" },
      { key: "POINTS", label: "Puntos" },
      { key: "FOULS", label: "Faltas" },
      { key: "TIMEOUTS", label: "TM" },
    ];
  },
  mergeEvents({ snapshotEvents }) {
    return sortDescByEventId(
      Array.isArray(snapshotEvents) ? snapshotEvents : []
    );
  },
  computeTeamStats(events) {
    const active = toActive(events);
    let points = 0;
    let fouls = 0;
    let timeouts = 0;

    for (const e of active) {
      const t = Number(e?.eventTypeId);
      if (isPointEventTypeId(t)) points += t;
      else if (isFoulEventTypeId(t)) fouls += 1;
      else if (isTimeoutEventTypeId(t)) timeouts += 1;
    }

    return { points, fouls, timeouts };
  },
  buildStatCards(stats) {
    return [
      {
        key: "points",
        label: "PTS",
        value: stats.points ?? 0,
        wrapCls: "bg-emerald-50 border-emerald-100",
        labelCls: "text-emerald-700",
        valueCls: "text-emerald-900",
      },
      {
        key: "fouls",
        label: "FA",
        value: stats.fouls ?? 0,
        wrapCls: "bg-amber-50 border-amber-100",
        labelCls: "text-amber-700",
        valueCls: "text-amber-900",
      },
      {
        key: "timeouts",
        label: "TM",
        value: stats.timeouts ?? 0,
        wrapCls: "bg-indigo-50 border-indigo-100",
        labelCls: "text-indigo-700",
        valueCls: "text-indigo-900",
      },
    ];
  },
  filterEventsByTab(list, tab) {
    const active = toActive(list);
    if (tab === "POINTS")
      return active.filter((e) => isPointEventTypeId(e?.eventTypeId));
    if (tab === "FOULS")
      return active.filter((e) => isFoulEventTypeId(e?.eventTypeId));
    if (tab === "TIMEOUTS")
      return active.filter((e) => isTimeoutEventTypeId(e?.eventTypeId));
    return active;
  },
  buildMomentRows(ctx) {
    const {
      match,
      mergedEvents,
      team1InstId,
      team2InstId,
      jerseyByAccId,
      eventInstitutionId,
      teamKeyForInstitutionId,
      playerNameFromAcc,
      jerseyFromAcc,
    } = ctx;

    const out = [];
    for (const ev of toActive(mergedEvents)) {
      const typeId = Number(ev?.eventTypeId);
      if (!isPointEventTypeId(typeId)) continue;

      const id = Number(ev?.idmatchevent);
      if (!Number.isFinite(id) || id <= 0) continue;

      const key = teamKeyForInstitutionId(
        eventInstitutionId(ev),
        team1InstId,
        team2InstId
      );
      const team = getTeamVisual(match, key);
      const acc = ev?.accreditation || ev?.Accreditation || null;
      const playerJersey = jerseyFromAcc(acc, jerseyByAccId);
      const playerName = playerNameFromAcc(acc);

      out.push({
        id,
        time: ev?.eventTime || "--:--",
        kind: `POINT_${typeId}`,
        teamAbrev: team.abrev,
        teamLogo: team.logo,
        mainText: `${playerJersey} +${typeId}`,
        detailRows: [
          { label: "Jugador", value: `${playerJersey} ${playerName}` },
        ],
      });
    }

    return [...out].sort((a, b) => Number(b?.id ?? 0) - Number(a?.id ?? 0));
  },
  buildIncidentRow(ev, ctx) {
    const { jerseyByAccId, playerNameFromAcc, jerseyFromAcc } = ctx;
    const acc = ev?.accreditation || ev?.Accreditation || null;
    const typeId = Number(ev?.eventTypeId);
    const period = Number(ev?.period) || null;
    const periodLabel = period ? `P${period}` : "";

    if (isPointEventTypeId(typeId)) {
      return {
        id: ev.idmatchevent,
        time: ev.eventTime,
        badgeText: `+${typeId}`,
        badgeCls:
          typeId === 1
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : typeId === 2
            ? "bg-sky-50 text-sky-700 border-sky-200"
            : "bg-violet-50 text-violet-700 border-violet-200",
        title: `${jerseyFromAcc(acc, jerseyByAccId)} ${playerNameFromAcc(acc)}`,
        subtitle: `${typeId} punto${typeId > 1 ? "s" : ""}${
          periodLabel ? ` · ${periodLabel}` : ""
        }`,
      };
    }

    if (isFoulEventTypeId(typeId)) {
      const label = labelFromEventTypeId(typeId) || "FA";
      return {
        id: ev.idmatchevent,
        time: ev.eventTime,
        badgeText: label,
        badgeCls: "bg-amber-50 text-amber-700 border-amber-200",
        title: `${jerseyFromAcc(acc, jerseyByAccId)} ${playerNameFromAcc(acc)}`,
        subtitle: `Falta ${label}${periodLabel ? ` · ${periodLabel}` : ""}`,
      };
    }

    if (isTimeoutEventTypeId(typeId)) {
      return {
        id: ev.idmatchevent,
        time: ev.eventTime,
        badgeText: "TM",
        badgeCls: "bg-indigo-50 text-indigo-700 border-indigo-200",
        title: "Tiempo muerto",
        subtitle: periodLabel
          ? `Solicitado en ${periodLabel}`
          : "Tiempo muerto de equipo",
      };
    }

    return null;
  },
};

export function getModalDetalleStrategy(formattedSport) {
  if (Number(formattedSport) === 1) return futbolStrategy;
  if (Number(formattedSport) === 4) return basquetStrategy;
  return null;
}
