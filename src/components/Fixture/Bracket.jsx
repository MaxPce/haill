import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../config/config.js";

/* ───────── Configuración visual ───────── */
// ancho de cada match reducido 30%: 300 → 210
const BOX_W = 210;
const BOX_H = 76;
const V_GAP = 26;
const GAP_X = 80;
const FINAL_GAP = 60;

const COLORS = {
    connector: "#1e22aa",
    boxBorder: "#CBD5E1",
    divider: "#E2E8F0",
    winnerBg: "#E0E7FF",
};

// nº de matches esperados por ronda (bracket 16→1)
const MATCHES_PER_ROUND = { 1: 8, 2: 4, 3: 2, 4: 1 };

export default function Bracket() {
    const { idevent, idsport } = useParams();
    const ev = +idevent;
    const sp = +idsport;

    const [matches, setMatches] = useState([]);

    // 1) Fetch interno de matches
    const getMatches = async () => {
        try {
            const requestBody = { idevent, idsport };
            const response = await axios.post(
                `${API_BASE_URL}/getmatches`,
                requestBody
            );
            setMatches(response.data);
        } catch (err) {
            console.error("Error al obtener los matches:", err);
        }
    };

    useEffect(() => {
        if (idevent && idsport) getMatches();
    }, [idevent, idsport]);

    // 2) Normalizar y aplicar reglas de bye
    const normalized = useMemo(() => {
        if (!Array.isArray(matches)) return [];

        // Mapear raw → interno
        const base = matches
            .filter((m) => m.tag_final?.toUpperCase() !== "PUESTO 3")
            .map((m) => {
                if (m.round !== undefined && m.teamA !== undefined) return m;
                let round = null;
                if (/ronda\s+(\d+)/i.test(m.tag_final)) {
                    round = +m.tag_final.match(/ronda\s+(\d+)/i)[1];
                } else if (m.tag_final?.toUpperCase() === "PUESTO 1") {
                    round = 4;
                }
                const toTeam = (p) => {
                    if (!p?.Institution) return null;
                    const i = p.Institution;
                    return { name: i.name, logo: (i.path_base ?? "") + (i.image_path ?? "") };
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
            .filter((m) => m.round !== null);

        // Agrupar por ronda y completar placeholders
        const grouped = base.reduce((acc, m) => {
            (acc[m.round] ||= []).push(m);
            return acc;
        }, {});

        Object.entries(MATCHES_PER_ROUND).forEach(([rStr, total]) => {
            const r = +rStr;
            const list = grouped[r] ?? [];
            for (let i = list.length; i < total; i++) {
                list.push({ id: `ph-r${r}-${i}`, round: r, teamA: null, teamB: null, winner: null, bye: false });
            }
            grouped[r] = list;
        });

        // Función para marcar bye
        const markBye = (arr, idx) => {
            if (!arr?.[idx]) return;
            arr[idx].teamA = null;
            arr[idx].teamB = null;
            arr[idx].bye = true;
            arr[idx].winner = null;
        };

        // Reglas específicas
        if (ev === 16 && sp === 5) {
            markBye(grouped[1], 6);
            markBye(grouped[1], 7);
        } else if (sp === 999) {
            markBye(grouped[1], 6);
            markBye(grouped[1], 7);
            markBye(grouped[2], 3);
        }

        // Devolver plano ordenado
        return Object.keys(grouped)
            .sort((a, b) => +a - +b)
            .flatMap((r) => grouped[r]);
    }, [matches, ev, sp]);

    // 3) Agrupar para render
    const rounds = useMemo(() => {
        const map = {};
        normalized.forEach((m) => (map[m.round] ||= []).push(m));
        Object.values(map).forEach((arr) =>
            arr.sort((a, b) => ("" + a.id).localeCompare("" + b.id))
        );
        return Object.keys(map)
            .sort((a, b) => +a - +b)
            .map((r) => ({ n: +r, matches: map[r] }));
    }, [normalized]);

    // 4) Calcular dimensiones
    const { containerWidth, containerHeight } = useMemo(() => {
        const stepUnit = BOX_H + V_GAP;
        const w = rounds.length * (BOX_W + GAP_X);
        let h = 0;
        rounds.forEach((rnd, idx) => {
            const step = Math.pow(2, idx) * stepUnit;
            rnd.matches.forEach((_, i) => {
                const bottom = (i * 2 + 1) * step + BOX_H / 2;
                if (bottom > h) h = bottom;
            });
        });
        return { containerWidth: w, containerHeight: h };
    }, [rounds]);

    // 5) Render con scroll horizontal
    return (
        <div className="w-full overflow-x-auto">
            <div
                className="relative p-6 min-w-fit"
                style={{ width: containerWidth, height: containerHeight, maxWidth: "100%" }}
            >
                {rounds.map((rnd, rIdx) => {
                    const colLeft = rIdx * (BOX_W + GAP_X);
                    const step = Math.pow(2, rIdx) * (BOX_H + V_GAP);
                    const visible = rnd.matches.filter((m) => !m.bye);
                    return (
                        <div key={rnd.n} style={{ position: "absolute", left: colLeft }}>
                            <h4 className="mb-6 text-center font-semibold text-slate-700 select-none">
                                Ronda&nbsp;{rnd.n}
                            </h4>
                            {visible.map((m, idx) => (
                                <MatchBox
                                    key={m.id}
                                    top={(idx * 2 + 1) * step - BOX_H / 2}
                                    match={m}
                                    rIdx={rIdx}
                                    mIdx={idx}
                                    step={step}
                                    isLastCol={rIdx === rounds.length - 1}
                                />
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function MatchBox({ top, match, rIdx, mIdx, step, isLastCol }) {
    const { teamA, teamB, winner } = match;
    const isWinnerA = winner === "A";
    const isWinnerB = winner === "B";
    return (
        <div
            className="relative"
            style={{ position: "absolute", top, width: BOX_W, height: BOX_H }}
        >
            <div
                className="w-full h-full rounded-lg bg-white border shadow-sm"
                style={{ borderColor: COLORS.boxBorder }}
            >
                <TeamRow team={teamA} highlight={isWinnerA} />
                <div style={{ height: 1, background: COLORS.divider }} />
                <TeamRow team={teamB} highlight={isWinnerB} />
            </div>
            {!isLastCol && (
                <>
                    <span
                        className="absolute"
                        style={{
                            top: "50%",
                            right: -GAP_X,
                            width: GAP_X,
                            borderTop: `1px solid ${COLORS.connector}`,
                            zIndex: 0,
                        }}
                    />
                    {mIdx % 2 === 0 && (
                        <span
                            className="absolute"
                            style={{
                                right: -GAP_X,
                                top: "50%",
                                height: step * 2,
                                borderLeft: `1px solid ${COLORS.connector}`,
                                zIndex: 0,
                            }}
                        />
                    )}
                </>
            )}
            {isLastCol && (
                <span
                    className="absolute"
                    style={{
                        top: "50%",
                        right: -FINAL_GAP,
                        width: FINAL_GAP,
                        borderTop: `1px solid ${COLORS.connector}`,
                        zIndex: 0,
                    }}
                />
            )}
        </div>
    );
}

function TeamRow({ team, highlight }) {
    const background = highlight ? COLORS.winnerBg : "transparent";
    const textClass = highlight ? "font-semibold" : "text-slate-600";
    return (
        <div
            className={`flex items-center h-1/2 px-3 gap-2 text-[13px] truncate ${textClass}`}
            style={{ background }}
        >
            {team ? (
                <>
                    <img src={team.logo} alt="logo" className="w-4 h-4 shrink-0" />
                    <span className="truncate">{team.name}</span>
                </>
            ) : (
                <span className="truncate">—</span>
            )}
        </div>
    );
}
