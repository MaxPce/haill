/**
 * PURPOSE: Utils para mapear tipos de evento para la planilla de basquetball.
 * RESPONSIBILITIES:
 *  - Sí: constantes de ids + helpers de label + helpers para agrupar (points/fouls/timeouts).
 *  - No: no hace fetch, no maneja UI.
 * COLLABORATORS:
 *  - FullScreenPlanillaBasquetball.jsx (orquestador)
 *  - ActionPanel.jsx (labels)
 * NOTES:
 *  - Mantiene IDs numéricos consistentes (points: 1..3, fouls: 100..499, timeouts: 500+)
 * ROUTE: src/utils/codesEventPlanilla.js
 */

export const EVENT_TYPE = {
  // Points
  POINT_1: 1,
  POINT_2: 2,
  POINT_3: 3,

  // Fouls - Personales (100–199)
  FOUL_P: 100, // P
  FOUL_P1: 101, // P1
  FOUL_P2: 102, // P2
  FOUL_P3: 103, // P3

  // Fouls - Técnicas (200–299)
  FOUL_T1: 200, // T1
  FOUL_B1: 201, // B1
  FOUL_C1: 202, // C1

  // Fouls - Antideportivas (300–399)
  FOUL_U1: 300, // U1
  FOUL_U2: 301, // U2
  FOUL_U3: 302, // U3

  // Fouls - Descalificación (400–499)
  FOUL_D: 400, // D
  FOUL_D2: 401, // D2
  FOUL_D3: 402, // D3

  // Timeouts (500+)
  TIMEOUT: 500,

  // Participación (600+)
  PLAYER_STARTED: 600,
  PLAYER_PARTICIPATED: 601,

  // Lifecycle básquet (700+)
  BASQUET_SYS_START_MATCH: 700,
  BASQUET_SYS_END_MATCH: 701,
};

const FOUL_EVENT_TYPE_IDS = new Set([
  EVENT_TYPE.FOUL_P,
  EVENT_TYPE.FOUL_P1,
  EVENT_TYPE.FOUL_P2,
  EVENT_TYPE.FOUL_P3,
  EVENT_TYPE.FOUL_T1,
  EVENT_TYPE.FOUL_B1,
  EVENT_TYPE.FOUL_C1,
  EVENT_TYPE.FOUL_U1,
  EVENT_TYPE.FOUL_U2,
  EVENT_TYPE.FOUL_U3,
  EVENT_TYPE.FOUL_D,
  EVENT_TYPE.FOUL_D2,
  EVENT_TYPE.FOUL_D3,
]);

const POINT_EVENT_TYPE_IDS = new Set([
  EVENT_TYPE.POINT_1,
  EVENT_TYPE.POINT_2,
  EVENT_TYPE.POINT_3,
]);

const PARTICIPATION_EVENT_TYPE_IDS = new Set([
  EVENT_TYPE.PLAYER_STARTED,
  EVENT_TYPE.PLAYER_PARTICIPATED,
]);

const BASQUET_LIFECYCLE_EVENT_TYPE_IDS = new Set([
  EVENT_TYPE.BASQUET_SYS_START_MATCH,
  EVENT_TYPE.BASQUET_SYS_END_MATCH,
]);

const LABEL_BY_EVENT_TYPE = {
  [EVENT_TYPE.POINT_1]: "+1",
  [EVENT_TYPE.POINT_2]: "+2",
  [EVENT_TYPE.POINT_3]: "+3",

  [EVENT_TYPE.FOUL_P]: "P",
  [EVENT_TYPE.FOUL_P1]: "P1",
  [EVENT_TYPE.FOUL_P2]: "P2",
  [EVENT_TYPE.FOUL_P3]: "P3",

  [EVENT_TYPE.FOUL_T1]: "T1",
  [EVENT_TYPE.FOUL_B1]: "B1",
  [EVENT_TYPE.FOUL_C1]: "C1",

  [EVENT_TYPE.FOUL_U1]: "U1",
  [EVENT_TYPE.FOUL_U2]: "U2",
  [EVENT_TYPE.FOUL_U3]: "U3",

  [EVENT_TYPE.FOUL_D]: "D",
  [EVENT_TYPE.FOUL_D2]: "D2",
  [EVENT_TYPE.FOUL_D3]: "D3",

  [EVENT_TYPE.TIMEOUT]: "TM",

  [EVENT_TYPE.PLAYER_STARTED]: "INICIA",
  [EVENT_TYPE.PLAYER_PARTICIPATED]: "JUGÓ",

  [EVENT_TYPE.BASQUET_SYS_START_MATCH]: "Inicio de partido",
  [EVENT_TYPE.BASQUET_SYS_END_MATCH]: "Fin de partido",
};

export const FOUL_GROUP = {
  PERSONAL: "PERSONAL",
  TECH: "TECH",
  UNSPORT: "UNSPORT",
  DISQ: "DISQ",
};

const TIMEOUT_EVENT_TYPE_IDS = new Set([EVENT_TYPE.TIMEOUT]);

export function labelFromEventTypeId(eventTypeId) {
  const id = Number(eventTypeId ?? 0) || 0;
  return LABEL_BY_EVENT_TYPE[id] || "";
}

export function isPointEventTypeId(eventTypeId) {
  return POINT_EVENT_TYPE_IDS.has(Number(eventTypeId ?? 0));
}

export function isFoulEventTypeId(eventTypeId) {
  return FOUL_EVENT_TYPE_IDS.has(Number(eventTypeId ?? 0));
}

export function isTimeoutEventTypeId(eventTypeId) {
  return Number(eventTypeId ?? 0) === Number(EVENT_TYPE.TIMEOUT);
}

export function isParticipationEventTypeId(eventTypeId) {
  return PARTICIPATION_EVENT_TYPE_IDS.has(Number(eventTypeId ?? 0));
}

export function isBasquetLifecycleEventTypeId(eventTypeId) {
  return BASQUET_LIFECYCLE_EVENT_TYPE_IDS.has(Number(eventTypeId ?? 0));
}

export function isActiveParticipationEvent(ev) {
  return (
    Number(ev?.state ?? 1) === 1 && isParticipationEventTypeId(ev?.eventTypeId)
  );
}

export function foulGroupFromEventTypeId(eventTypeId) {
  const id = Number(eventTypeId ?? 0) || 0;

  if (
    id === EVENT_TYPE.FOUL_P ||
    id === EVENT_TYPE.FOUL_P1 ||
    id === EVENT_TYPE.FOUL_P2 ||
    id === EVENT_TYPE.FOUL_P3
  ) {
    return "PERSONAL";
  }

  if (
    id === EVENT_TYPE.FOUL_T1 ||
    id === EVENT_TYPE.FOUL_B1 ||
    id === EVENT_TYPE.FOUL_C1
  ) {
    return "TECH";
  }

  if (
    id === EVENT_TYPE.FOUL_U1 ||
    id === EVENT_TYPE.FOUL_U2 ||
    id === EVENT_TYPE.FOUL_U3
  ) {
    return "UNSPORT";
  }

  if (
    id === EVENT_TYPE.FOUL_D ||
    id === EVENT_TYPE.FOUL_D2 ||
    id === EVENT_TYPE.FOUL_D3
  ) {
    return "DISQ";
  }

  return null;
}

/**
 * Helper opcional: devuelve true si el eventTypeId representa “cualquier falta”
 * y el evento está activo (state=1). Útil para filtros.
 */
export function isActiveFoulEvent(ev) {
  if (!ev) return false;
  if (Number(ev?.state ?? 1) !== 1) return false;
  return isFoulEventTypeId(ev?.eventTypeId);
}

export function isActiveTimeoutEvent(ev) {
  if (!ev) return false;
  if (Number(ev?.state ?? 1) !== 1) return false;
  return isTimeoutEventTypeId(ev?.eventTypeId);
}