/**
 * ROUTE: src/components/Pruebas/pruebas.utils.js
 * Helpers compartidos entre los sub-componentes de Pruebas.
 */

export const ATLETISMO_EVENT_ID = 223;
export const ATLETISMO_SPORT_ID = 7;

export const getBadgeColor = (status) => {
  switch (status) {
    case "finalizado": return "bg-green-100 text-green-700";
    case "en_curso":   return "bg-yellow-100 text-yellow-700";
    default:           return "bg-gray-100 text-gray-500";
  }
};

export const capitalize = (str = "") =>
  str.trim().charAt(0).toUpperCase() + str.trim().slice(1).toLowerCase();

export const getMedalColor = (pos) => {
  switch (pos) {
    case 1: return "text-yellow-500 font-bold";
    case 2: return "text-gray-400 font-bold";
    case 3: return "text-amber-600 font-bold";
    default: return "text-gray-500";
  }
};

/**
 * Extrae los identificadores de género y nivel del nombre de una categoría.
 * Formato esperado: "Damas Az 100 metros", "Varones Nv 200 metros", etc.
 */
export const parseCategoryTokens = (name = "") => {
  const upper = name.toUpperCase();

  const genero = upper.includes("DAMAS")
    ? "Damas"
    : upper.includes("VARONES")
    ? "Varones"
    : null;

  const nivel = /\bAZ\b/.test(upper)
    ? "Az"
    : /\bNV\b/.test(upper)
    ? "Nv"
    : null;

  return { genero, nivel };
};