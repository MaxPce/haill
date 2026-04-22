// src/sections/TorneosSection.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import API_BASE_URL from "../config/config.js";
import CardEvent from "../components/Cards/CardEvent/CardEvent";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

const TorneosSection = () => {
  const [campeonatos, setCampeonatos] = useState([]);
  const [q, setQ] = useState("");
  const yearSelected = useSelector((state) => state.year.yearSelected);
  const { search } = useLocation();

  const params = new URLSearchParams(search);
  const idcompany = params.get("idcompany") || "";

  useEffect(() => {
    const getCampeonatos = async () => {
      try {
        const qs = new URLSearchParams();
        if (idcompany) qs.set("idcompany", idcompany);
        if (yearSelected) qs.set("periodo", yearSelected);

        const url = `${API_BASE_URL}/championshipsbycompany?${qs.toString()}`;
        const { data } = await axios.get(url);
        setCampeonatos(Array.isArray(data) ? (data).reverse() : []);
      } catch (error) {
        console.error("Error fetching championships:", error);
        setCampeonatos([]);
      }
    };

    if (idcompany || yearSelected) {
      getCampeonatos();
    } else {
      setCampeonatos([]);
    }
  }, [idcompany, yearSelected]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return campeonatos;
    return campeonatos.filter((c) => {
      const name = (c?.name || "").toLowerCase();
      const place = (c?.place || "").toLowerCase();
      return name.includes(term) || place.includes(term);
    });
  }, [q, campeonatos]);

  return (
    <section className="pt-20 pb-12 px-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Eventos
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Explora los campeonatos disponibles {yearSelected ? `(${yearSelected})` : ""}.
          </p>
        </div>

        {/* Buscador */}
        <div className="w-full md:w-80">
          <label htmlFor="search-events" className="sr-only">Buscar eventos</label>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              id="search-events"
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre o lugar..."
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/80 dark:bg-zinc-900/60 ring-1 ring-zinc-200 dark:ring-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center text-zinc-500 dark:text-zinc-400 py-12">
            {q ? "No se encontraron eventos que coincidan con tu búsqueda." : "No hay eventos para mostrar."}
          </div>
        ) : (
          filtered.map((campeonato) => (
            <CardEvent key={campeonato.idchampionship} event={campeonato} />
          ))
        )}
      </div>
    </section>
  );
};

export default TorneosSection;
