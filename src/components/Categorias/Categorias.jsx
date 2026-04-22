import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import {
  buildCategoriasEndpoint,
  extractCategoriasFromReport,
  formatCategoriaSubtitle,
  getParticipantsLabel,
  getStatusChipProps,
  getSummary,
  sortCategorias,
} from "./categorias.utils";
import CategoriaModal from "./CategoriaModal";

// ─── Card de una categoría ────────────────────────────────────────────────────
const CategoriaCard = ({ categoria }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const statusProps = getStatusChipProps(categoria.status);

  return (
    <>
      <Card
        elevation={1}
        sx={{
          height: "100%",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "primary.main",
            boxShadow: 4,
            transform: "translateY(-2px)",
          },
        }}
        onClick={() => setModalOpen(true)}
      >
        <CardContent>
          <Stack spacing={2}>
            {/* Nombre y status */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              spacing={2}
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {categoria.categoryName}
                </Typography>
                
              </Box>
              
            </Stack>

            

            {/* CTA */}
            <Typography variant="caption" color="primary.main" fontWeight={600}>
              Ver llaves y resultados →
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <CategoriaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        categoria={categoria}
      />
    </>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [eventInfo, setEventInfo]   = useState(null);
  const [sportInfo, setSportInfo]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCategorias = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(buildCategoriasEndpoint());

        if (!response.ok)
          throw new Error(`Error ${response.status}: no se pudo obtener categorías`);

        const data   = await response.json();
        const sorted = sortCategorias(extractCategoriasFromReport(data));

        if (!isMounted) return;

        setCategorias(sorted);
        setEventInfo(data?.event         || null);
        setSportInfo(data?.sports?.[0]   || null);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Ocurrió un error al cargar las categorías");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCategorias();

    return () => { isMounted = false; };
  }, []);

  const summary = useMemo(() => getSummary(categorias), [categorias]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 260,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body1" color="text.secondary">
            Cargando categorías...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Stack spacing={3}>
        {/* Encabezado */}
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary.main">
            Categorías
          </Typography>
        </Box>

        

        {/* Grid de categorías */}
        <Grid container spacing={2}>
          {categorias.map((categoria) => (
            <Grid item xs={12} md={6} lg={4} key={categoria.eventCategoryId}>
              <CategoriaCard categoria={categoria} />
            </Grid>
          ))}
        </Grid>

        {!categorias.length && (
          <Alert severity="info">
            No hay categorías registradas para este deporte.
          </Alert>
        )}
      </Stack>
    </Box>
  );
};

export default Categorias;