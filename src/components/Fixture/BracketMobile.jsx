import React from "react";

export default function BracketMobile({ rounds }) {
    return (
        <div className="space-y-6 px-2">
            {rounds.map((rnd) => (
                <div key={rnd.n}>
                    <h4 className="text-lg font-semibold text-blue-700 mb-2">
                        Ronda {rnd.n}
                    </h4>
                    {rnd.matches
                        .filter((m) => !m.bye)
                        .map((m) => (
                            <div
                                key={m.id}
                                className="bg-white border rounded-lg shadow-sm mb-3 p-3 flex flex-col gap-2"
                            >
                                <TeamLine team={m.teamA} />
                                <TeamLine team={m.teamB} />
                            </div>
                        ))}
                </div>
            ))}
        </div>
    );
}

function TeamLine({ team }) {
    return (
        <div className="flex items-center gap-2 text-sm truncate">
            {team ? (
                <>
                    <img src={team.logo} alt="" className="w-4 h-4 shrink-0" />
                    <span className="truncate">{team.name}</span>
                </>
            ) : (
                <span className="italic text-slate-400">—</span>
            )}
        </div>
    );
}
