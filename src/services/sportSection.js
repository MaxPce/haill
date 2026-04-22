/**
 * PURPOSE:
 * Aislar los consumos HTTP usados por SportSection para evitar mezclar fetch con UI.
 *
 * RESPONSIBILITIES:
 * - Obtener el evento público por idevent.
 * - Obtener el deporte por idsport.
 * - Obtener la configuración pública del deporte/evento.
 *
 * COLLABORATORS:
 * - src/sections/SportSection.jsx
 * - src/config/config.js
 *
 * ROUTE:
 * src/services/sportSection.js
 */

import axios from "axios";
import API_BASE_URL from "../config/config.js";

/** Obtiene la información pública del evento. */
export const getChampionshipByEvent = async (idevent) => {
  const response = await axios.get(`${API_BASE_URL}/championship/?idevent=${idevent}`);
  return response.data;
};

/** Obtiene la información del deporte. */
export const getSportById = async (idsport) => {
  const response = await axios.get(`${API_BASE_URL}/sport/?idsport=${idsport}`);
  return response.data;
};

/** Obtiene la configuración pública del evento/deporte. */
export const getPublicSportConfig = async ({ idevent, idsport }) => {
  const response = await axios.post(`${API_BASE_URL}/config_category`, {
    idevent: Number(idevent),
    idsport: Number(idsport),
  });

  return response.data;
};
