/**
 * ROUTE: src/components/Pruebas/PruebasFilters.jsx
 * Barra de filtros: género, nivel, buscador y botón recargar.
 *
 * Identificadores en los nombres de fase:
 *   Damas   → Femenino
 *   Varones → Masculino
 *   Az      → Avanzados
 *   Nv      → Noveles
 */

import React from "react";

const GENERO_OPTIONS = [
  { value: "",        label: "Todos" },
  { value: "Damas",   label: "Damas" },
  { value: "Varones", label: "Varones" },
];

const NIVEL_OPTIONS = [
  { value: "",    label: "Todos" },
  { value: "Az",  label: "Az" },
  { value: "Nv",  label: "Nv" },
];

const FilterChip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 text-xs font-semibold rounded border transition-colors ${
      active
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"
    }`}
  >
    {label}
  </button>
);

const PruebasFilters = ({ genero, nivel, busqueda, onGenero, onNivel, onBusqueda, onRecargar, cargando }) => {
  return (
    <div className="flex flex-col gap-3 mb-4">
      {/* Fila superior: buscador + recargar */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Buscar prueba..."
          value={busqueda}
          onChange={(e) => onBusqueda(e.target.value)}
          className="flex-1 text-sm px-3 py-1.5 rounded border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
        />
        <button
          onClick={onRecargar}
          disabled={cargando}
          className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
            cargando
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"
          }`}
          title="Recargar pruebas"
        >
          {cargando ? "Cargando..." : "Recargar"}
        </button>
      </div>

      {/* Fila inferior: chips de filtro */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {/* Filtro género */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide select-none">
            Género
          </span>
          <div className="flex items-center gap-1">
            {GENERO_OPTIONS.map((opt) => (
              <FilterChip
                key={opt.value}
                label={opt.label}
                active={genero === opt.value}
                onClick={() => onGenero(opt.value)}
              />
            ))}
          </div>
        </div>

        {/* Separador visual */}
        <span className="hidden sm:block w-px h-4 bg-gray-200" />

        {/* Filtro nivel */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide select-none">
            Nivel
          </span>
          <div className="flex items-center gap-1">
            {NIVEL_OPTIONS.map((opt) => (
              <FilterChip
                key={opt.value}
                label={opt.label}
                active={nivel === opt.value}
                onClick={() => onNivel(opt.value)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PruebasFilters;