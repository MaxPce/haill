import React, { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import {
  buildResultadosFaseEndpoint,
  extractFaseFromReport,
  getPhaseTypeProps,
} from "../categorias.utils";
import FaseMejorDe3    from "./FaseMejorDe3";
import FaseEliminacion from "./FaseEliminacion";
import FaseGrupo       from "./FaseGrupo";

const FaseDetalle = ({ eventCategoryId, phaseId, vista = "llaves" }) => {
  const [fase, setFase]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");
    setFase(null);

    const load = async () => {
      try {
        const res = await fetch(buildResultadosFaseEndpoint(eventCategoryId, phaseId));
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        if (!isMounted) return;
        setFase(extractFaseFromReport(data));
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Error cargando resultados");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, [eventCategoryId, phaseId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <Stack spacing={1} alignItems="center">
          <CircularProgress size={28} />
          <Typography variant="caption" color="text.secondary">
            Cargando resultados...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  if (!fase)  return <Alert severity="info"  sx={{ m: 2 }}>Sin datos para esta fase.</Alert>;

  const phaseType = String(fase.phaseType || "").toLowerCase();

  const VISTAS = {
    mejor_de_3:  <FaseMejorDe3    fase={fase} vista={vista} />,
    eliminacion: <FaseEliminacion fase={fase} vista={vista} />,
    grupo:       <FaseGrupo       fase={fase} vista={vista} />,
  };

  return VISTAS[phaseType] ?? (
    <Alert severity="info" sx={{ m: 2 }}>
      Vista para tipo <strong>{getPhaseTypeProps(fase.phaseType).label}</strong> en desarrollo.
    </Alert>
  );
};

export default FaseDetalle;