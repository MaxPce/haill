/**
 * PURPOSE: Hook React para consumir SSE de un match y mantener estado LIVE en baja prioridad.
 * RESPONSIBILITIES:
 *  - Sí: conectar/cerrar SSE según matchId/enabled.
 *  - Sí: exponer status, lastMessage y liveState (events + score).
 *  - Sí: actualizar estado con startTransition (última prioridad en UI).
 *  - No: no decide cómo renderizar (eso va en ModalDetalle PASO 4).
 * COLLABORATORS:
 *  - src/services/live/matchSseClient.js
 *  - src/components/Modal/ModalDetalle/ModalDetalle.jsx
 * NOTES:
 *  - Mantiene un map por idmatchevent para soportar UPSERT/VOID/DELETE.
 *  - “Defensivo sin sobreingeniería”: ignora payloads inválidos.
 * ROUTE: src/hooks/useMatchLiveSSE.js
 */

import { useEffect, useMemo, useRef, useState, startTransition } from "react";
import API_BASE_URL from "../config/config.js";
import { createMatchSseClient } from "../services/live/matchSseClient.js";

function initLiveState() {
  return {
    score: null, // {resultado1, resultado2, defpenal1, defpenal2} (opcional)
    eventsById: {}, // { [idmatchevent]: eventSlim }
    lastUpdateAt: null,
  };
}

// Aplica un payload SSE al estado live (puro, simple).
function applyLivePayload(prev, payload) {
  if (!payload || typeof payload !== "object") return prev;

  const type = String(payload.type || "");
  const ev = payload.event;
  const id = ev?.idmatchevent;

  const next = { ...prev };

  if (payload.score) next.score = payload.score;
  next.lastUpdateAt = payload.sentAt || new Date().toISOString();

  // Si no hay evento, igual podríamos haber actualizado score; retornamos.
  if (!id) return next;

  if (type === "DELETE_EVENT") {
    const copy = { ...(next.eventsById || {}) };
    delete copy[id];
    next.eventsById = copy;
    return next;
  }

  // UPSERT_EVENT / VOID_EVENT / EDIT_EVENT -> guardamos snapshot del evento
  if (
    type === "UPSERT_EVENT" ||
    type === "VOID_EVENT" ||
    type === "EDIT_EVENT"
  ) {
    next.eventsById = {
      ...(next.eventsById || {}),
      [id]: ev,
    };
    return next;
  }

  // Si llega algo inesperado, no rompemos nada.
  return next;
}

/**
 * FLUJO DE DATOS DEL HOOK:
 * 1. SUBSCRIPCIÓN: Al montar o cambiar 'matchId', limpia el cliente anterior y abre una nueva 
 * conexión EventSource hacia el backend.
 * 2. ESCUCHA (onMatchUpdate): Recibe el mensaje del sseHub. Implementa un 'dedupe' usando 
 * lastEventId para evitar procesar dos veces el mismo mensaje en reconexiones inestables.
 * 3. PROCESAMIENTO (applyLivePayload): 
 * - Si es UPSERT: Agrega o actualiza el evento en el objeto plano 'eventsById'.
 * - Si es DELETE: Elimina la clave del objeto.
 * - Marcador: Actualiza el score global si el payload lo incluye.
 * 4. RENDERIZADO (startTransition): Envuelve la actualización del estado en Concurrent Mode. 
 * Esto marca la actualización como "no urgente", permitiendo que el navegador priorice 
 * animaciones o clicks antes de renderizar la lista de eventos.
 * 5. DERIVACIÓN (useMemo): Transforma el mapa de eventos en un array ordenado solo cuando 
 * cambian los datos, evitando cálculos innecesarios en cada render.
 */
export function useMatchLiveSSE({ matchId, enabled = true } = {}) {
  const mid = Number(matchId);
  const canConnect = enabled && Number.isFinite(mid) && mid > 0;

  const clientRef = useRef(null);
  const lastEventIdRef = useRef(null);

  const [status, setStatus] = useState("idle"); // idle | connecting | open | reconnecting
  const [lastMessage, setLastMessage] = useState(null);
  const [live, setLive] = useState(() => initLiveState());

  useEffect(() => {
    // Cerrar conexión anterior si cambia matchId o se deshabilita
    if (!canConnect) {
      if (clientRef.current) {
        clientRef.current.close();
        clientRef.current = null;
      }
      setStatus("idle");
      return;
    }

    setStatus("connecting");

    const client = createMatchSseClient({
      baseUrl: API_BASE_URL,
      matchId: mid,

      // Se dispara cuando backend envía event: connected
      onConnected: () => {
        setStatus("open");
      },

      // Se dispara cuando backend envía event: match_update
      onMatchUpdate: (payload, rawEvent) => {
        // Dedupe defensivo (por reconexiones/reintentos)
        const lastId = rawEvent?.lastEventId || null;
        if (lastId && lastEventIdRef.current === lastId) return;
        if (lastId) lastEventIdRef.current = lastId;

        setLastMessage(payload);

        // Baja prioridad real en UI -> uso de startTransition
        // "Oye, esto es importante, pero si el usuario está haciendo algo más (como cerrar el modal o escribir), prioriza eso primero"
        startTransition(() => {
          setLive((prev) => applyLivePayload(prev, payload));
        });
      },

      onError: () => {
        // EventSource reintenta solo; reflejamos reconexión en UI
        setStatus((prev) =>
          prev === "open" ? "reconnecting" : "reconnecting"
        );
      },
    });

    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.close();
        clientRef.current = null;
      }
    };
  }, [canConnect, mid]);

  // Derivados útiles para PASO 4 (ordenados por idmatchevent)
  const events = useMemo(() => {
    const arr = Object.values(live.eventsById || {});
    arr.sort((a, b) => Number(a.idmatchevent) - Number(b.idmatchevent));
    return arr;
  }, [live.eventsById]);

  return {
    status,
    lastMessage,
    live,
    events,
  };
}
