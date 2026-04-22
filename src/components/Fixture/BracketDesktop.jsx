import React, { useMemo } from "react";

/* --- Estética --- */
const BOX_W = 210;        // 30 % menos que 300
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

/**
 * Componente SOLO para desktop.
 * Recibe `rounds` (salida del hook) y pinta el bracket con conectores.
 */
export default function BracketDesktop({ rounds = [] }) {
    /* Dimensiones generales */
    const { width, height } = useMemo(() => {
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
        return { width: w, height: h };
    }, [rounds]);

    return (
        <div className="w-full overflow-x-auto">
            <div
                className="relative p-6 min-w-fit"
                style={{ width, height, maxWidth: "100%" }}
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
                                    match={m}
                                    top={(idx * 2 + 1) * step - BOX_H / 2}
                                    step={step}
                                    mIdx={idx}
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

/* ---------- Sub‑componentes ---------- */
function MatchBox({ match, top, step, mIdx, isLastCol }) {
    const { teamA, teamB, winner } = match;
    const isWinnerA = winner === "A";
    const isWinnerB = winner === "B";

    return (
        <div style={{ position: "absolute", top, width: BOX_W, height: BOX_H }}>
            <div
                className="w-full h-full rounded-lg bg-white border shadow-sm"
                style={{ borderColor: COLORS.boxBorder }}
            >
                <TeamRow team={teamA} highlight={isWinnerA} />
                <div style={{ height: 1, background: COLORS.divider }} />
                <TeamRow team={teamB} highlight={isWinnerB} />
            </div>

            {/* Conectores */}
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
    const bg = highlight ? COLORS.winnerBg : "transparent";
    const txt = highlight ? "font-semibold" : "text-slate-600";
    return (
        <div
            className={`flex items-center h-1/2 px-3 gap-2 text-[13px] truncate ${txt}`}
            style={{ background: bg }}
        >
            {team ? (
                <>
                    <img src={team.logo} alt="" className="w-4 h-4 shrink-0" />
                    <span className="truncate">{team.name}</span>
                </>
            ) : (
                <span className="truncate">—</span>
            )}
        </div>
    );
}
