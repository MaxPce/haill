import React, { useEffect, useMemo, useState } from "react";
import { RiInformationLine, RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";

/**
 * PURPOSE: Bloque mobile-first de momentos clave reutilizable por deporte.
 * RESPONSIBILITIES:
 *  - Sí: renderizar preview/expand del feed compacto superior.
 *  - Sí: soportar chips configurables por `kind` y detalle genérico por filas.
 *  - No: no calcula eventos ni decide reglas de negocio del deporte.
 * COLLABORATORS:
 *  - src/components/Modal/ModalDetalle/ModalDetalle.jsx
 *  - src/components/Modal/ModalDetalle/modalDetalleStrategies.js
 * ROUTE: src/components/Modal/ModalDetalle/MomentsBlock.jsx
 */

const DEFAULT_KIND_META = Object.freeze({
    GOAL: { txt: "G", cls: "bg-emerald-600 text-white" },
    YELLOW: { txt: "A", cls: "bg-yellow-400 text-black" },
    RED: { txt: "R", cls: "bg-red-600 text-white" },
    SUB: { txt: "S", cls: "bg-blue-600 text-white" },
});

function chipForKind(kind, kindMeta) {
    return kindMeta?.[kind] || DEFAULT_KIND_META[kind] || { txt: "?", cls: "bg-gray-600 text-white" };
}

export default function MomentsBlock({
    moments = [],
    loading = false,
    previewLimit = 8,
    className = "",
    title = "MOMENTOS",
    subtitle = "Resumen clave del partido",
    emptyText = "Aún no hay momentos.",
    kindMeta = DEFAULT_KIND_META,
}) {
    const [expanded, setExpanded] = useState(false);
    const [openMomentId, setOpenMomentId] = useState(null);

    const visible = useMemo(() => {
        if (!Array.isArray(moments)) return [];
        if (expanded) return moments;
        return moments.slice(0, previewLimit);
    }, [moments, expanded, previewLimit]);

    const toggleDetail = (id) => {
        setOpenMomentId((prev) => (prev === id ? null : id));
    };

    const canToggle = Array.isArray(moments) && moments.length > previewLimit;

    useEffect(() => {
        if (!openMomentId) return;
        const exists = Array.isArray(moments) && moments.some((m) => m?.id === openMomentId);
        if (!exists) setOpenMomentId(null);
    }, [moments, openMomentId]);

    useEffect(() => {
        if (!expanded) setOpenMomentId(null);
    }, [expanded]);

    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-base font-extrabold text-gray-900 truncate">
                        {title} {Array.isArray(moments) ? `(${moments.length})` : ""}
                    </div>
                    <div className="text-[12px] text-gray-500">{subtitle}</div>
                </div>

                {canToggle && (
                    <button
                        type="button"
                        onClick={() => setExpanded((p) => !p)}
                        className="text-xs font-bold text-gray-700 hover:text-black flex items-center gap-1 px-2 py-1 rounded-full border border-gray-200 bg-gray-50"
                    >
                        {expanded ? (
                            <>
                                Ver menos <RiArrowUpSLine className="text-base" />
                            </>
                        ) : (
                            <>
                                Ver todos <RiArrowDownSLine className="text-base" />
                            </>
                        )}
                    </button>
                )}
            </div>

            <div className="p-3 md:p-4">
                {loading && (!moments || moments.length === 0) ? (
                    <div className="text-sm text-gray-500">Cargando momentos...</div>
                ) : !moments || moments.length === 0 ? (
                    <div className="text-sm text-gray-500">{emptyText}</div>
                ) : (
                    <div className="space-y-2">
                        {visible.map((m, idx) => {
                            const isOpen = openMomentId === m.id;
                            const chip = chipForKind(m.kind, kindMeta);
                            const detailRows = Array.isArray(m?.detailRows) ? m.detailRows : [];

                            return (
                                <div
                                    key={m.id}
                                    className={`rounded-xl border bg-white p-3 ${idx === 0 ? "border-emerald-200 ring-1 ring-emerald-100" : "border-gray-200"
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-extrabold text-gray-900 w-[48px] shrink-0">
                                                    {m.time || "--:--"}
                                                </span>

                                                {m.teamLogo && (
                                                    <img
                                                        src={m.teamLogo}
                                                        alt="team"
                                                        className="w-6 h-6 rounded-full ring-1 ring-white shadow-sm shrink-0 object-contain bg-white"
                                                    />
                                                )}

                                                <span className="text-sm font-extrabold text-gray-900 truncate">
                                                    {m.teamAbrev || "Equipo"}
                                                </span>

                                                <span className="text-sm font-extrabold text-gray-900 truncate">{m.mainText}</span>
                                            </div>

                                            {idx === 0 && (
                                                <div className="mt-1 text-[11px] font-bold text-emerald-700">Último evento</div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <span
                                                className={`min-w-[2rem] h-8 px-2 rounded-lg flex items-center justify-center text-sm font-extrabold ${chip.cls}`}
                                                title={m.kind}
                                            >
                                                {chip.txt}
                                            </span>

                                            {detailRows.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => toggleDetail(m.id)}
                                                    className="w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center active:scale-95 transition"
                                                    aria-label="Ver detalle"
                                                    title="Ver detalle"
                                                >
                                                    <RiInformationLine className="text-lg text-gray-700" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {isOpen && detailRows.length > 0 && (
                                        <div className="mt-2 text-sm text-gray-700 space-y-1">
                                            {detailRows.map((row, index) => (
                                                <div key={`${m.id}-${index}`}>
                                                    <span className="font-bold">{row.label}:</span>{" "}
                                                    <span className="font-semibold text-gray-900">{row.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {!expanded && canToggle && (
                    <div className="mt-3 text-[12px] text-gray-500">
                        Mostrando últimos {previewLimit}. Toca <span className="font-bold">Ver todos</span> para ver el resto.
                    </div>
                )}
            </div>
        </div>
    );
}
