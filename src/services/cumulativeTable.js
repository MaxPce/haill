import axios from "axios";
import API_BASE_URL from "../config/config.js";

/**
 * PURPOSE:
 * Consumir cumulative_table desde el frontend público.
 *
 * RESPONSIBILITIES:
 * - Obtener la tabla acumulada por idevent.
 * - Mantener el consumo HTTP aislado de la UI.
 *
 * COLLABORATORS:
 * - src/sections/TablaAcumuladaSection.jsx
 * - src/config/config.js
 *
 * ROUTE:
 * src/services/cumulativeTable.js
 */

export const getCumulativeTableByEvent = async (idevent) => {
  const response = await axios.get(`${API_BASE_URL}/getcumulativetable/${idevent}`);
  return response.data;
};
