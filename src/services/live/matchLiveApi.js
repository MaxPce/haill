/**
 * PURPOSE: Consumir snapshots públicos de match_events para el modal público (Hayllis).
 * RESPONSIBILITIES:
 *  - Sí: traer snapshot por match y deporte usando el endpoint /live.
 *  - Sí: soportar bypass de cache con `fresh=true` para el botón Recargar.
 *  - No: no maneja SSE ni estado React.
 * COLLABORATORS:
 *  - src/components/Modal/ModalDetalle/ModalDetalle.jsx
 *  - backend: GET /matchevents/by-match/:matchId/live
 * ROUTE: src/services/live/matchLiveApi.js
 */

import axios from "axios";
import API_BASE_URL from "../../config/config.js";

export async function fetchMatchLiveSnapshot(
  matchId,
  { includeVoided = false, mode = "FUTBOL", fresh = false } = {}
) {
  const mid = Number(matchId);
  if (!Number.isFinite(mid) || mid <= 0) {
    throw new Error("fetchMatchLiveSnapshot: matchId inválido.");
  }

  const normalizedMode = String(mode || "FUTBOL").trim().toUpperCase();

  const res = await axios.get(`${API_BASE_URL}/matchevents/by-match/${mid}/live`, {
    params: {
      includeVoided: includeVoided ? "true" : "false",
      mode: normalizedMode,
      ...(fresh ? { fresh: "true" } : {}),
    },
  });

  return res.data; // { mode, score, events, lineupSnapshotNo, jerseyByAccreditationId }
}
