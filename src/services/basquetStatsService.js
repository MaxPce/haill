// ROUTE: frontend/src/services/basquetStatsService.js

import axios from "axios";
import API_BASE_URL from "../config/config.js";

async function getBasquetStats(url, { idevent, idsport }) {
  const response = await axios.get(`${API_BASE_URL}${url}`, {
    params: {
      idevent: Number(idevent),
      idsport: Number(idsport),
    },
  });

  return response.data;
}

export async function getBasquetScorers({ idevent, idsport }) {
  return getBasquetStats("/estadistica/basquet/scorers", {
    idevent,
    idsport,
  });
}
