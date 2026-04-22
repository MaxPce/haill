/**
 * ROUTE: src/components/Pruebas/Pruebas.jsx
 */

import React, { useCallback, useEffect, useState } from "react";
import API_BASE_FORMATOS_URL from "../../config/config_formatos";
import { ATLETISMO_EVENT_ID, ATLETISMO_SPORT_ID } from "./pruebas.utils";
import PruebasFilters from "./PruebasFilters";
import CategoriaFases from "./CategoriaFases";

const Pruebas = () => {
  const [categorias, setCategorias]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [selectedCategoria, setSelectedCategoria] = useState(null);

  // Estados de filtros — se pasan como props a CategoriaFases
  const [genero, setGenero]     = useState("");
  const [nivel, setNivel]       = useState("");
  const [busqueda, setBusqueda] = useState("");

  const cargarCategorias = useCallback(() => {
    setLoading(true);
    setError(null);
    setSelectedCategoria(null);
    fetch(
      `${API_BASE_FORMATOS_URL}/api/sismaster/competition-report/${ATLETISMO_EVENT_ID}?sportId=${ATLETISMO_SPORT_ID}`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const sport = data.sports?.[0];
        setCategorias(sport?.categories ?? []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => { cargarCategorias(); }, [cargarCategorias]);

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto py-4 px-2">
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto py-4 px-2 text-center">
        <p className="text-red-500 text-sm mb-3">Error al cargar las pruebas: {error}</p>
        <button
          onClick={cargarCategorias}
          className="px-4 py-1.5 text-sm font-semibold rounded border border-blue-400 text-blue-600 hover:bg-blue-50 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (categorias.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-8">
        No hay pruebas registradas para este evento.
      </p>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-4 px-2">
      <PruebasFilters
        genero={genero}
        nivel={nivel}
        busqueda={busqueda}
        onGenero={setGenero}
        onNivel={setNivel}
        onBusqueda={setBusqueda}
        onRecargar={cargarCategorias}
        cargando={loading}
      />

      <div className="flex flex-col gap-2">
        {categorias.map((categoria) => {
          const isOpen = selectedCategoria === categoria.eventCategoryId;
          return (
            <div
              key={categoria.eventCategoryId}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              <button
                className="w-full flex justify-between items-center px-4 py-3 bg-white hover:bg-slate-50 transition-colors text-left"
                onClick={() =>
                  setSelectedCategoria((prev) =>
                    prev === categoria.eventCategoryId ? null : categoria.eventCategoryId
                  )
                }
              >
                <span className="font-semibold text-gray-800 capitalize">
                  {categoria.categoryName.toLowerCase()}
                </span>
                <span className="text-blue-400 text-sm ml-4 flex-shrink-0">
                  {isOpen ? "▲" : "▼"}
                </span>
              </button>

              {isOpen && (
                <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                  {/* Los filtros bajan como props — CategoriaFases filtra sus propias fases */}
                  <CategoriaFases
                    eventCategoryId={categoria.eventCategoryId}
                    genero={genero}
                    nivel={nivel}
                    busqueda={busqueda}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pruebas;