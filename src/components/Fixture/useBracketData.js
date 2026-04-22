// useBracketData.js
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/config.js"; // ajusta la ruta si cambia

// nº de matches esperados por ronda (bracket 16→1)
const MATCHES_PER_ROUND = { 1: 8, 2: 4, 3: 2, 4: 1 };

/**
 * Hook que:
 * 1️⃣ Trae los matches desde el backend.
 * 2️⃣ Normaliza y agrupa por ronda.
 * 3️⃣ Aplica reglas de “bye”.
 * Devuelve un array de rondas: [{ n, matches }]
 */
export default function useBracketData(idevent, idsport) {
  const ev = Number(idevent);
  const sp = Number(idsport);
  const [matches, setMatches] = useState([]);

  // ─── Fetch de matches ───
  useEffect(() => {
    if (!idevent || !idsport) return;
    (async () => {
      try {
        const { data } = await axios.post(`${API_BASE_URL}/getmatches`, {
          idevent,
          idsport,
        });
        setMatches(data);
      } catch (err) {
        console.error("Error al obtener los matches:", err);
      }
    })();
  }, [idevent, idsport]);

  // ─── Normalización, agrupación y reglas bye ───
  const rounds = useMemo(() => {
    if (!Array.isArray(matches)) return [];

    // 1️⃣ Mapear raw → formato interno
    const base = matches
      .filter((m) => m.tag_final?.toUpperCase() !== "PUESTO 3")
      .map((m) => {
        // si ya viene normalizado
        if (m.round !== undefined && m.teamA !== undefined) return m;

        // calcular número de ronda
        let round = null;
        if (/ronda\s+(\d+)/i.test(m.tag_final)) {
          round = parseInt(m.tag_final.match(/ronda\s+(\d+)/i)[1], 10);
        } else if (m.tag_final?.toUpperCase() === "PUESTO 1") {
          round = 4;
        }

        // función para mapear participante ➝ { name, logo }
        const toTeam = (p) => {
          if (!p?.Institution) return null;
          const i = p.Institution;
          return {
            name: i.name,
            logo: `${i.path_base || ""}${i.image_path || ""}`,
          };
        };

        return {
          id: m.idmatch,
          round,
          teamA: toTeam(m.Participant1),
          teamB: toTeam(m.Participant2),
          winner: null,
          bye: false,
        };
      })
      .filter((m) => m.round != null);

    // 2️⃣ Agrupar por ronda y completar placeholders
    const grouped = base.reduce((acc, m) => {
      (acc[m.round] ||= []).push(m);
      return acc;
    }, {});

    Object.entries(MATCHES_PER_ROUND).forEach(([rStr, total]) => {
      const r = Number(rStr);
      const list = grouped[r] || [];
      for (let i = list.length; i < total; i++) {
        list.push({
          id: `ph-r${r}-${i}`,
          round: r,
          teamA: null,
          teamB: null,
          winner: null,
          bye: false,
        });
      }
      grouped[r] = list;
    });

    // 3️⃣ Reglas BYE
    const markBye = (arr, idx) => {
      if (!arr?.[idx]) return;
      arr[idx] = {
        ...arr[idx],
        teamA: null,
        teamB: null,
        bye: true,
        winner: null,
      };
    };

    if (ev === 16 && sp === 5) {
      markBye(grouped[1], 6);
      markBye(grouped[1], 7);
    } else if (sp === 999) {
      markBye(grouped[1], 6);
      markBye(grouped[1], 7);
      markBye(grouped[2], 3);
    }

    // 4️⃣ Construir array de rondas ordenado
    return Object.keys(grouped)
      .sort((a, b) => Number(a) - Number(b))
      .map((r) => ({
        n: Number(r),
        matches: grouped[r],
      }));
  }, [matches, idevent, idsport]);

  return rounds;
}
