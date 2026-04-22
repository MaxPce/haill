import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  buildResultadosFaseEndpoint,
  extractFaseFromReport,
  getPhaseTypeProps,
} from "../categorias.utils";
import FaseMejorDe3 from "./FaseMejorDe3";
import FaseEliminacion from "./FaseEliminacion";
import FaseGrupo from "./FaseGrupo";

const FaseDetalle = ({ eventCategoryId, phaseId }) => {
  const [fase, setFase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          buildResultadosFaseEndpoint(eventCategoryId, phaseId)
        );
        if (!res.ok)
          throw new Error(`Error ${res.status}: no se pudieron cargar los resultados`);

        const data = await res.json();
        const extracted = extractFaseFromReport(data);
        if (!isMounted) return;
        setFase(extracted);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Error cargando resultados de fase");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => { isMounted = false; };
  }, [eventCategoryId, phaseId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <Stack spacing={1} alignItems="center">
          <CircularProgress size={28} />
          <Typography variant="caption" color="text.secondary">
            Cargando resultados...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!fase) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No hay datos disponibles para esta fase.
      </Alert>
    );
  }

  const phaseType = String(fase.phaseType || "").toLowerCase();

  if (phaseType === "mejor_de_3") {
    return <FaseMejorDe3 fase={fase} />;
  }

  if (phaseType === "eliminacion") {
    return <FaseEliminacion fase={fase} />;
  }

  if (phaseType === "grupo") {
    return <FaseGrupo fase={fase} />;
  }

  // Fallback para tipos no implementados aún
  const typeProps = getPhaseTypeProps(fase.phaseType);
  return (
    <Alert severity="info" sx={{ m: 2 }}>
      Vista para tipo <strong>{typeProps.label}</strong> en desarrollo.
    </Alert>
  );
};

export default FaseDetalle;