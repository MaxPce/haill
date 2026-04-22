// src/sections/CompaniesSection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Tarjeta individual
const CompanyCard = React.memo(function CompanyCard({ company, onClick }) {
    const { name, abrev, logo_path } = company || {};

    return (
        <div
            className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-zinc-900/70 backdrop-blur ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
        >
            <div className="p-4 sm:p-5">
                <div className="aspect-[3/2] w-full rounded-xl bg-zinc-50 dark:bg-zinc-800/70 flex items-center justify-center overflow-hidden ring-1 ring-zinc-100 dark:ring-zinc-800">
                    <img
                        src={logo_path}
                        alt={`Logo de ${name ?? abrev}`}
                        className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.style.opacity = 0; }}
                    />
                </div>

                <div className="mt-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                            {name ?? abrev}
                        </h3>
                        <p className="mt-0.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 truncate">
                            {abrev}
                        </p>
                    </div>
                </div>
            </div>

            {/* Glow sutil al hover */}
            <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(99,102,241,.08), transparent 40%)' }}
            />
        </div>
    );
});

// Skeleton para carga
const SkeletonCard = () => (
    <div className="animate-pulse rounded-2xl bg-white/60 dark:bg-zinc-900/60 ring-1 ring-zinc-200 dark:ring-zinc-800">
        <div className="p-4 sm:p-5">
            <div className="aspect-[3/2] w-full rounded-xl bg-zinc-100 dark:bg-zinc-800" />
            <div className="mt-4 h-5 bg-zinc-100 dark:bg-zinc-800 rounded w-2/3" />
            <div className="mt-2 h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-1/3" />
        </div>
    </div>
);

export default function CompaniesSection({ companies = [], loading, error }) {
    const navigate = useNavigate();

    // efecto pequeño para el glow siguiendo el mouse
    const onMove = (e) => {
        const cards = e.currentTarget.querySelectorAll('.group');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--y', `${e.clientY - rect.top}px`);
        });
    };

    const handleClickCompany = (idcompany) => {
        if (!idcompany) return;
        navigate(`/torneos?idcompany=${idcompany}`);
    };

    return (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12" style={{ marginTop: "40px" }}>
            <header className="mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Organizaciones
                </h2>
                <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                    Instituciones con las que trabajamos
                </p>
            </header>

            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300 px-4 py-3">
                    {error}
                </div>
            )}

            <div
                onMouseMove={onMove}
                className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6"
            >
                {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}

                {!loading && companies?.length === 0 && !error && (
                    <div className="col-span-full text-center text-zinc-500 dark:text-zinc-400 py-12">
                        No hay compañías registradas por ahora.
                    </div>
                )}

                {!loading && companies?.map((c) => (
                    <CompanyCard
                        key={c.idcompany ?? c.abrev}
                        company={c}
                        onClick={() => handleClickCompany(c.idcompany)}
                    />
                ))}
            </div>
        </section>
    );
}
