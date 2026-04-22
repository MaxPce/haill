// ROUTE: src/services/rugbyStatsService.js

import axios from "axios";
import API_BASE_URL from "../config/config.js";

async function getRugbyStats(url, { idevent, idsport }) {
  const response = await axios.get(`${API_BASE_URL}${url}`, {
    params: {
      idevent: Number(idevent),
      idsport: Number(idsport),
    },
  });

  return response.data;
}

export async function getRugbyTryScorers({ idevent, idsport }) {
  return getRugbyStats("/estadistica/rugby/tries-legacy", {
    idevent,
    idsport,
  });
}

export async function getRugbyTryScorersByDate({ idevent, idsport }) {
  return getRugbyStats("/estadistica/rugby/tries-by-date", {
    idevent,
    idsport,
  });
}

export async function getRugbyConversionStats({ idevent, idsport }) {
  return getRugbyStats("/estadistica/rugby/conversions", { idevent, idsport });
}

export async function getRugbyPenaltyScorers({ idevent, idsport }) {
  return getRugbyStats("/estadistica/rugby/penalties", { idevent, idsport });
}
