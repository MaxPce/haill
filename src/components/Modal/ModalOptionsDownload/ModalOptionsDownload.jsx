import React, { useEffect, useState } from "react";
import API_BASE_URL from "../../../config/config.js";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import axios from "axios";

const ModalOptionsDownload = ({
    open,
    setOpen,
    nro_grupos,
    nroFechasGrupo,
}) => {
    const [selectedGrupos, setSelectedGrupos] = useState([]);
    const [selectedFecha, setSelectedFecha] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const grupos = Array.from({ length: nro_grupos }, (_, i) =>
        String.fromCharCode(65 + i)
    ); // ["A","B",...]
    const fechas = Array.from({ length: nroFechasGrupo }, (_, i) => i + 1);

    useEffect(() => {
        console.log("aqui here", nro_grupos, nroFechasGrupo);
    }, [nro_grupos, nroFechasGrupo]);

    const toggleGrupo = (grupoNum) => {
        setSelectedGrupos(prev =>
            prev.includes(grupoNum)
                ? prev.filter(x => x !== grupoNum)
                : [...prev, grupoNum]
        );
    };

    const handleDownloadResultados = async () => {
        if (selectedGrupos.length === 0) {
            alert("Por favor, selecciona al menos un grupo.");
            return;
        }

        if (!selectedFecha) {
            alert("Por favor, selecciona una fecha.");
            return;
        }

        console.log("a", selectedGrupos, selectedFecha);
        setIsDownloading(true);
        // try {
        //     const response = await axios.post(`${API_BASE_URL}/resultadospdf`, {
        //         idevent,
        //         idsport,
        //         grupos: selectedGrupos,
        //         fecha: selectedFecha,
        //     })
        // } catch (error) {
        //     console.error("Error al intentar descargar PDF ►", error);
        //     alert("No se pudo generar el PDF (ver consola).");
        // } finally {
        //     setIsDownloading(false);
        // }
    }

    return (
        <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={open}
            onClose={() => setOpen(false)}
            sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
        >
            <Sheet
                variant="outlined"
                sx={{ maxWidth: 600, borderRadius: "md", p: 4, boxShadow: "xl" }}
            >
                <ModalClose variant="plain" sx={{ position: "absolute", top: 8, right: 8 }} />
                <Typography
                    component="h2"
                    id="modal-title"
                    level="h4"
                    sx={{ fontWeight: "lg", mb: 4, textAlign: "center" }}
                >
                    Opciones de Descarga
                </Typography>

                {/* Selección de Grupos */}
                <div className="mb-6">
                    <p className="text-lg font-medium text-gray-700 mb-2">Selecciona grupos:</p>
                    <div className="flex flex-wrap gap-4">
                        {grupos.map((letra, i) => (
                            <label key={letra} className="inline-flex items-center gap-2 text-gray-800">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 accent-red-600"
                                    // en lugar de letra, compruebo y envío el número i+1
                                    checked={selectedGrupos.includes(i + 1)}
                                    onChange={() => toggleGrupo(i + 1)}
                                />
                                Grupo {letra}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Selección de Fecha */}
                <div className="mb-6">
                    <p className="text-lg font-medium text-gray-700 mb-2">Selecciona fecha:</p>
                    <div className="flex flex-wrap gap-4">
                        {fechas.map((f) => (
                            <label key={f} className="inline-flex items-center gap-2 text-gray-800">
                                <input
                                    type="radio"
                                    name="fecha"
                                    className="w-5 h-5 accent-red-600"
                                    value={f}
                                    checked={selectedFecha === f}
                                    onChange={() => setSelectedFecha(f)}
                                />
                                Fecha {f}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Botón de descarga */}
                <div className="flex justify-center mt-8">
                    <button
                        onClick={() => handleDownloadResultados()}
                        className="
              inline-flex items-center gap-2
              bg-red-600 hover:bg-red-700 active:bg-red-800
              text-white font-semibold tracking-wide
              px-6 py-3 rounded-xl shadow-lg
              transition-transform duration-200
              hover:-translate-y-0.5 active:translate-y-0
              focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2
            "
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 5v13m0 0l-4-4m4 4l4-4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                            />
                        </svg>
                        Descargar programación (PDF)
                    </button>
                </div>
            </Sheet>
        </Modal>
    );
};

export default ModalOptionsDownload;
