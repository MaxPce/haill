import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import {
  buildCategoriasEndpoint,
  buildFasesEndpoint,
  extractCategoriasFromReport,
  extractFasesFromReport,
  formatCategoriaSubtitle,
  getParticipantsLabel,
  getPhaseTypeProps,
  getStatusChipProps,
  getSummary,
  sortCategorias,
  sortFases,
} from "./categorias.utils";
import FaseDetalle from "./brackets/FaseDetalle";


// ─── Fases de una categoría ────────────────────────────────────────────────────
const FasesList = ({ eventCategoryId }) => {
  const [fases, setFases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPhaseId, setSelectedPhaseId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadFases = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(buildFasesEndpoint(eventCategoryId));
        if (!response.ok)
          throw new Error(`Error ${response.status}: no se pudieron obtener las fases`);

        const data = await response.json();
        const sorted = sortFases(extractFasesFromReport(data));

        if (!isMounted) return;
        setFases(sorted);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Error al cargar las fases");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadFases();
    return () => { isMounted = false; };
  }, [eventCategoryId]);

  if (loading) {
    return (
      <Stack spacing={1} sx={{ p: 2 }}>
        {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={52} />)}
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  if (!fases.length) {
    return <Alert severity="info" sx={{ m: 2 }}>Esta categoría no tiene fases registradas aún.</Alert>;
  }

  return (
    <Stack spacing={0} sx={{ p: 2, pt: 1 }}>
      {fases.map((fase) => {
        const phaseProps = getPhaseTypeProps(fase.phaseType);
        const isSelected = selectedPhaseId === fase.phaseId;

        return (
          <Box key={fase.phaseId}>
            {/* Fila de la fase (clickeable) */}
            <Box
              onClick={() => setSelectedPhaseId(isSelected ? null : fase.phaseId)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1,
                px: 2,
                py: 1.5,
                mb: 1,
                borderRadius: 2,
                cursor: "pointer",
                bgcolor: isSelected ? "primary.50" : "action.hover",
                border: "1px solid",
                borderColor: isSelected ? "primary.main" : "divider",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "primary.light",
                  bgcolor: "primary.50",
                },
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {fase.phaseName}
                </Typography>
                {fase.displayOrder != null && (
                  <Typography variant="caption" color="text.secondary">
                    Orden: {fase.displayOrder}
                  </Typography>
                )}
              </Box>

              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={phaseProps.label} color={phaseProps.color} size="small" variant="outlined" />
                <Tooltip title="Participantes en esta fase">
                  <Chip label={getParticipantsLabel(fase.totalParticipants)} size="small" variant="filled" />
                </Tooltip>
                {isSelected
                  ? <ExpandLessIcon fontSize="small" color="primary" />
                  : <ExpandMoreIcon fontSize="small" color="action" />
                }
              </Stack>
            </Box>

            {/* Detalle de la fase (combates, podio, etc.) */}
            <Collapse in={isSelected} unmountOnExit>
              <Box
                sx={{
                  mb: 2,
                  border: "1px solid",
                  borderColor: "primary.light",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <FaseDetalle
                  eventCategoryId={eventCategoryId}
                  phaseId={fase.phaseId}
                />
              </Box>
            </Collapse>
          </Box>
        );
      })}
    </Stack>
  );
};


// ─── Card de una categoría ─────────────────────────────────────────────────────
const CategoriaCard = ({ categoria }) => {
  const [expanded, setExpanded] = useState(false);
  const statusProps = getStatusChipProps(categoria.status);

  const handleToggle = () => setExpanded((prev) => !prev);

  return (
    <Card
      elevation={1}
      sx={{
        height: "100%",
        borderRadius: 3,
        border: "1px solid",
        borderColor: expanded ? "primary.main" : "divider",
        transition: "border-color 0.2s ease",
      }}
    >
      <CardActionArea onClick={handleToggle} sx={{ borderRadius: "inherit" }}>
        <CardContent>
          <Stack spacing={2}>
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
                <Typography variant="body2" color="text.secondary">
                  {formatCategoriaSubtitle(categoria)}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={statusProps.label}
                  color={statusProps.color}
                  size="small"
                  variant="filled"
                />
                {expanded ? (
                  <ExpandLessIcon fontSize="small" color="action" />
                ) : (
                  <ExpandMoreIcon fontSize="small" color="action" />
                )}
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={getParticipantsLabel(categoria.totalParticipants)}
                variant="outlined"
                size="small"
              />
              <Chip
                label={`Resultado: ${categoria.resultType || "N/D"}`}
                variant="outlined"
                size="small"
              />
              <Chip
                label={`ID cat.: ${categoria.eventCategoryId}`}
                variant="outlined"
                size="small"
              />
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>

      <Collapse in={expanded} unmountOnExit>
        <Divider />
        <Box>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ px: 2, pt: 2, display: "block" }}
          >
            Fases
          </Typography>
          <FasesList eventCategoryId={categoria.eventCategoryId} />
        </Box>
      </Collapse>
    </Card>
  );
};

// ─── Componente principal ──────────────────────────────────────────────────────
const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [eventInfo, setEventInfo] = useState(null);
  const [sportInfo, setSportInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCategorias = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(buildCategoriasEndpoint());

        if (!response.ok)
          throw new Error(
            `Error ${response.status}: no se pudo obtener categorías`
          );

        const data = await response.json();
        const sorted = sortCategorias(extractCategoriasFromReport(data));

        if (!isMounted) return;

        setCategorias(sorted);
        setEventInfo(data?.event || null);
        setSportInfo(data?.sports?.[0] || null);
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
      <Box sx={{ minHeight: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
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
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            {sportInfo?.sportName || "Deporte"} · {eventInfo?.name || "Evento"}
          </Typography>
        </Box>

        {/* Resumen */}
        <Grid container spacing={2}>
          {[
            { label: "Total categorías",       value: summary.totalCategorias          },
            { label: "Con participantes",       value: summary.categoriasConParticipantes },
            { label: "Total participantes",     value: summary.totalParticipantes       },
          ].map(({ label, value }) => (
            <Grid item xs={12} sm={4} key={label}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="overline" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

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