import API_BASE_FORMATOS_URL from "../../config/config_formatos";

// ─── Base y ruta del recurso ──────────────────────────────────────────────────
const COMPETITION_REPORT_PATH = "/api/sismaster/competition-report";
const getBase = () => String(API_BASE_FORMATOS_URL).replace(/\/$/, "");

// ─── IDs hardcodeados para testing ───────────────────────────────────────────
const TEST_EVENT_ID = 200;
const TEST_SPORT_ID = 4;

// ─── Builders de URL ─────────────────────────────────────────────────────────
export const buildCategoriasEndpoint = () =>
  `${getBase()}${COMPETITION_REPORT_PATH}/${TEST_EVENT_ID}?sportId=${TEST_SPORT_ID}`;

export const buildFasesEndpoint = (eventCategoryId) =>
  `${getBase()}${COMPETITION_REPORT_PATH}/${TEST_EVENT_ID}?eventCategoryId=${eventCategoryId}`;

export const buildResultadosFaseEndpoint = (eventCategoryId, phaseId) =>
  `${getBase()}${COMPETITION_REPORT_PATH}/${TEST_EVENT_ID}?eventCategoryId=${eventCategoryId}&phaseId=${phaseId}`;

// ─── Extractores ─────────────────────────────────────────────────────────────
export const extractCategoriasFromReport = (report) => {
  if (!report?.sports?.length) return [];
  return report.sports[0]?.categories || [];
};

export const extractFasesFromReport = (report) => {
  if (!report?.sports?.length) return [];
  return report.sports[0]?.categories?.[0]?.phases || [];
};

export const extractFaseFromReport = (report) =>
  report?.sports?.[0]?.categories?.[0]?.phases?.[0] || null;

// ─── Formatters ──────────────────────────────────────────────────────────────
export const normalizeText = (value) => {
  if (!value) return "No especificado";
  return String(value).trim();
};

export const formatCategoriaSubtitle = (categoria) => {
  const gender = normalizeText(categoria?.gender);
  const ageGroup = categoria?.ageGroup ? normalizeText(categoria.ageGroup) : null;
  return [gender, ageGroup].filter(Boolean).join(" · ");
};

export const getParticipantsLabel = (totalParticipants = 0) => {
  const total = Number(totalParticipants) || 0;
  return `${total} participante${total === 1 ? "" : "s"}`;
};

// ─── Mapeo de phaseType → label y color MUI ───────────────────────────────────
export const getPhaseTypeProps = (phaseType) => {
  const normalized = String(phaseType || "").toLowerCase();

  const MAP = {
    eliminacion: { label: "Eliminación directa", color: "error"   },
    grupo:       { label: "Fase de grupos",       color: "primary" },
    mejor_de_3:  { label: "Mejor de 3",           color: "info"    },
    round_robin: { label: "Round Robin",           color: "success" },
    suizo:       { label: "Sistema suizo",         color: "warning" },
    final:       { label: "Final",                 color: "error"   },
    semifinal:   { label: "Semifinal",             color: "warning" },
    repechaje:   { label: "Repechaje",             color: "default" },
  };

  return MAP[normalized] ?? { label: normalizeText(phaseType), color: "default" };
};

// ─── Status chips ─────────────────────────────────────────────────────────────
export const getStatusChipProps = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "pendiente")  return { label: "Pendiente",  color: "warning" };
  if (normalized === "en curso")   return { label: "En curso",   color: "info"    };
  if (normalized === "finalizado") return { label: "Finalizado", color: "success" };

  return { label: normalizeText(status), color: "default" };
};

export const getBracketStatusProps = (status) => {
  const n = String(status || "").toLowerCase();
  if (n === "finalizado") return { label: "Finalizado", color: "success" };
  if (n === "en curso")   return { label: "En curso",   color: "info"    };
  if (n === "pendiente")  return { label: "Pendiente",  color: "warning" };
  return { label: status || "—", color: "default" };
};

// ─── Ordenamiento ─────────────────────────────────────────────────────────────
const parseWeight = (name = "") => {
  const cleaned = String(name).replace(",", ".").trim();
  const match = cleaned.match(/([+-]?\d+(\.\d+)?)/);
  if (!match) return Number.POSITIVE_INFINITY;
  return Number(match[1]);
};

export const sortCategorias = (categorias = []) => {
  return [...categorias].sort((a, b) => {
    const wA = parseWeight(a?.categoryName);
    const wB = parseWeight(b?.categoryName);
    if (wA !== wB) return wA - wB;
    return String(a?.categoryName || "").localeCompare(
      String(b?.categoryName || ""),
      "es",
      { numeric: true, sensitivity: "base" }
    );
  });
};

export const sortFases = (fases = []) =>
  [...fases].sort((a, b) => {
    const orderA = a?.displayOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b?.displayOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return String(a?.phaseName || "").localeCompare(
      String(b?.phaseName || ""),
      "es",
      { sensitivity: "base" }
    );
  });

// ─── Summary ──────────────────────────────────────────────────────────────────
export const getSummary = (categorias = []) => ({
  totalCategorias: categorias.length,
  categoriasConParticipantes: categorias.filter(
    (item) => Number(item?.totalParticipants || 0) > 0
  ).length,
  totalParticipantes: categorias.reduce(
    (acc, item) => acc + Number(item?.totalParticipants || 0),
    0
  ),
});

// ─── Helpers de brackets ──────────────────────────────────────────────────────
export const getAthleteName = (athleteEntry) =>
  athleteEntry?.athlete?.fullName ||
  athleteEntry?.fullName ||
  "Atleta desconocido";

export const getAthleteInstitution = (athleteEntry) =>
  athleteEntry?.athlete?.institution?.name ||
  athleteEntry?.institution?.name ||
  "";


export const getAthleteInstitutionLogo = (athleteEntry) =>
  athleteEntry?.athlete?.institution?.logoUrl ||
  athleteEntry?.institution?.logoUrl ||
  null;

export const isWinner = (bracket, registrationId) =>
  bracket?.winner?.registrationId === registrationId;

export const getRoundLabel = (round) => {
  const MAP = {
    cuartos:   "Cuartos de final",
    semifinal: "Semifinal",
    final:     "Final",
    "3er":     "Tercer lugar",
    serie:     "Serie",
    "1":       "Ronda 1",
    "2":       "Ronda 2",
    "3":       "Ronda 3",
  };
  return MAP[String(round || "").toLowerCase()] ?? `Ronda ${round}`;
};

export const groupBracketsByRound = (brackets = []) => {
  const ROUND_ORDER = ["cuartos", "semifinal", "3er", "final", "serie", "1", "2", "3"];

  const grouped = brackets.reduce((acc, bracket) => {
    const key = String(bracket.round || "otro");
    if (!acc[key]) acc[key] = [];
    acc[key].push(bracket);
    return acc;
  }, {});

  return Object.entries(grouped).sort(([roundA], [roundB]) => {
    const idxA = ROUND_ORDER.indexOf(roundA.toLowerCase());
    const idxB = ROUND_ORDER.indexOf(roundB.toLowerCase());
    const oA = idxA === -1 ? 99 : idxA;
    const oB = idxB === -1 ? 99 : idxB;
    return oA - oB;
  });
};

// ─── Helpers de podio ─────────────────────────────────────────────────────────
export const getRankMedal = (rank) => {
  if (rank === 1) return { emoji: "🥇", label: "1°", color: "gold"     };
  if (rank === 2) return { emoji: "🥈", label: "2°", color: "silver"   };
  if (rank === 3) return { emoji: "🥉", label: "3°", color: "#cd7f32"  };
  return           { emoji: "",   label: `${rank}°`, color: "text.secondary" };
};