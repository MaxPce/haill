// src/analytics.js
import ReactGA from "react-ga4";

// 1. Inicializa Google Analytics con tu Measurement ID
export function initGA() {
  const MEASUREMENT_ID = "G-K26HJREC19"; // ≤≤ Sustituye por tu ID real ≥≥
  ReactGA.initialize(MEASUREMENT_ID);
}

// 2. Cada vez que cambie la ruta, envía un page_view
export function logPageView(path) {
  ReactGA.send({ hitType: "pageview", page: path });
}

// ← Agrega esto:
export function trackEvent({ category, action, label, value }) {
  ReactGA.event({ category, action, label, value });
}
