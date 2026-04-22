/**
 * PURPOSE: Crear y administrar una conexión SSE (EventSource) para un match.
 * RESPONSIBILITIES:
 *  - Sí: construir URL SSE, conectar EventSource, escuchar events y exponer close().
 *  - Sí: normalizar callbacks (connected, match_update, error).
 *  - No: no maneja estado React ni UI (eso es del hook).
 * COLLABORATORS:
 *  - src/hooks/useMatchLiveSSE.js
 *  - backend: GET /sse/matches/:matchId
 * NOTES:
 *  - EventSource no soporta headers custom; el endpoint SSE es público.
 *  - Defensivo pero simple: try/catch al parsear JSON.
 * ROUTE: src/services/live/matchSseClient.js
 */

function trimTrailingSlash(url) {
  // Limpia baseUrl para evitar // en la URL final
  return String(url || "").replace(/\/+$/, "");
}

function safeJsonParse(text) {
  // Parse seguro para no romper el stream por un JSON malformado
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Conecta a SSE del match y registra listeners.
 */
export function createMatchSseClient({
  baseUrl,
  matchId,
  onConnected,
  onMatchUpdate,
  onError,
  onAnyMessage,
}) {
  const mid = Number(matchId);
  if (!Number.isFinite(mid) || mid <= 0) {
    throw new Error("createMatchSseClient: matchId inválido.");
  }

  const url = `${trimTrailingSlash(baseUrl)}/sse/matches/${mid}`;
  const es = new EventSource(url); // público, sin credentials

  // Listener: handshake inicial (event: connected)
  const handleConnected = (e) => {
    const payload = safeJsonParse(e?.data);
    if (typeof onConnected === "function") onConnected(payload, e);
  };

  // Listener principal: updates (event: match_update)
  const handleMatchUpdate = (e) => {
    const payload = safeJsonParse(e?.data);
    if (typeof onMatchUpdate === "function") onMatchUpdate(payload, e);
  };

  // Fallback: por si llega algún mensaje sin `event:`
  const handleMessage = (e) => {
    if (typeof onAnyMessage === "function") {
      const payload = safeJsonParse(e?.data);
      onAnyMessage(payload, e);
    }
  };

  const handleError = (e) => {
    if (typeof onError === "function") onError(e);
    // Ojo: EventSource reintenta solo; no cerramos aquí.
  };

  es.addEventListener("connected", handleConnected);
  es.addEventListener("match_update", handleMatchUpdate);
  es.addEventListener("message", handleMessage); // fallback
  es.addEventListener("error", handleError);

  // API mínima de cierre
  const close = () => {
    try {
      es.removeEventListener("connected", handleConnected);
      es.removeEventListener("match_update", handleMatchUpdate);
      es.removeEventListener("message", handleMessage);
      es.removeEventListener("error", handleError);
      es.close();
    } catch {
      // no-op
    }
  };

  return { es, url, close };
}
