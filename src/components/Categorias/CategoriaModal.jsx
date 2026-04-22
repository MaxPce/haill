import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Slide,
  Stack,
  Tab,
  Tabs,
  Typography,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import BarChartIcon from "@mui/icons-material/BarChart";

import {
  buildFasesEndpoint,
  extractFasesFromReport,
  formatCategoriaSubtitle,
  getPhaseTypeProps,
  getParticipantsLabel,
  sortFases,
} from "./categorias.utils";
import FaseDetalle from "./brackets/FaseDetalle";

// ─── Transición slide-up para el modal ───────────────────────────────────────
const SlideUp = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
SlideUp.displayName = "SlideUp";

// ─── Selector de fases (chips horizontales con scroll) ────────────────────────
const FaseSelector = ({ fases, selectedId, onChange }) => (
  <Box
    sx={{
      display: "flex",
      gap: 1,
      overflowX: "auto",
      pb: 1,
      "&::-webkit-scrollbar": { height: 4 },
      "&::-webkit-scrollbar-thumb": { borderRadius: 2, bgcolor: "divider" },
    }}
  >
    {fases.map((fase) => {
      const typeProps = getPhaseTypeProps(fase.phaseType);
      const isSelected = selectedId === fase.phaseId;

      return (
        <Chip
          key={fase.phaseId}
          label={fase.phaseName}
          color={isSelected ? typeProps.color : "default"}
          variant={isSelected ? "filled" : "outlined"}
          onClick={() => onChange(fase.phaseId)}
          sx={{
            flexShrink: 0,
            fontWeight: isSelected ? 700 : 400,
            transition: "all 0.2s ease",
          }}
        />
      );
    })}
  </Box>
);

// ─── Tabs de vista por fase ───────────────────────────────────────────────────
const VISTA_LLAVES     = "llaves";
const VISTA_RESULTADOS = "resultados";

// ─── Modal principal ──────────────────────────────────────────────────────────
const CategoriaModal = ({ open, onClose, categoria }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [fases, setFases]               = useState([]);
  const [loadingFases, setLoadingFases] = useState(false);
  const [errorFases, setErrorFases]     = useState("");
  const [selectedPhaseId, setSelectedPhaseId] = useState(null);
  const [vistaTab, setVistaTab]         = useState(VISTA_LLAVES);

  // Carga las fases cuando se abre el modal
  useEffect(() => {
    if (!open || !categoria) return;

    let isMounted = true;
    setFases([]);
    setSelectedPhaseId(null);
    setVistaTab(VISTA_LLAVES);
    setLoadingFases(true);
    setErrorFases("");

    const load = async () => {
      try {
        const res = await fetch(buildFasesEndpoint(categoria.eventCategoryId));
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        const sorted = sortFases(extractFasesFromReport(data));
        if (!isMounted) return;
        setFases(sorted);
        if (sorted.length) setSelectedPhaseId(sorted[0].phaseId);
      } catch (err) {
        if (!isMounted) return;
        setErrorFases(err.message || "Error cargando fases");
      } finally {
        if (isMounted) setLoadingFases(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, [open, categoria]);

  const handlePhaseChange = useCallback((phaseId) => {
    setSelectedPhaseId(phaseId);
    setVistaTab(VISTA_LLAVES);
  }, []);

  const selectedFase = fases.find((f) => f.phaseId === selectedPhaseId) || null;
  const phaseTypeProps = selectedFase ? getPhaseTypeProps(selectedFase.phaseType) : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="xl"
      fullWidth
      TransitionComponent={SlideUp}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 4,
          height: fullScreen ? "100%" : "92vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      {/* ── Header del modal ── */}
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          pt: { xs: 2, md: 3 },
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              <Typography variant="h5" fontWeight={800} color="primary.main">
                {categoria?.categoryName}
              </Typography>
              {selectedFase && (
                <Chip
                  label={phaseTypeProps?.label}
                  color={phaseTypeProps?.color}
                  size="small"
                  variant="filled"
                />
              )}
            </Stack>

            
          </Box>

          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              flexShrink: 0,
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* Selector de fases */}
        {fases.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Fases
            </Typography>
            <FaseSelector
              fases={fases}
              selectedId={selectedPhaseId}
              onChange={handlePhaseChange}
            />
          </Box>
        )}
      </Box>

      {/* ── Contenido ── */}
      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {loadingFases && (
          <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ flex: 1 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Cargando fases...
            </Typography>
          </Stack>
        )}

        {!loadingFases && errorFases && (
          <Alert severity="error" sx={{ m: 3 }}>
            {errorFases}
          </Alert>
        )}

        {!loadingFases && !errorFases && !fases.length && (
          <Alert severity="info" sx={{ m: 3 }}>
            Esta categoría no tiene fases registradas.
          </Alert>
        )}

        {!loadingFases && selectedPhaseId && (
          <Box sx={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
            {/* Tabs Llaves / Resultados */}
            <Box sx={{ px: { xs: 2, md: 4 }, borderBottom: "1px solid", borderColor: "divider", flexShrink: 0 }}>
              <Tabs
                value={vistaTab}
                onChange={(_, v) => setVistaTab(v)}
                textColor="primary"
                indicatorColor="primary"
              >
                <Tab
                  value={VISTA_LLAVES}
                  label="MATCHES"
                  icon={<AccountTreeIcon fontSize="small" />}
                  iconPosition="start"
                  sx={{ fontWeight: 600, minHeight: 48 }}
                />
                <Tab
                  value={VISTA_RESULTADOS}
                  label="Resultados"
                  icon={<BarChartIcon fontSize="small" />}
                  iconPosition="start"
                  sx={{ fontWeight: 600, minHeight: 48 }}
                />
              </Tabs>
            </Box>

            {/* Contenido de la tab seleccionada */}
            <Box sx={{ flex: 1, overflowY: "auto", px: { xs: 1, md: 3 }, py: 2 }}>
              <FaseDetalle
                key={`${selectedPhaseId}-${vistaTab}`}
                eventCategoryId={categoria.eventCategoryId}
                phaseId={selectedPhaseId}
                vista={vistaTab}
              />
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CategoriaModal;