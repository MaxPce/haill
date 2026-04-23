import React from "react";
import {
  Alert, Box, Chip, Divider, Paper,
  Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import {
  getAthleteName, getAthleteInstitution, getAthleteInstitutionLogo,
  getBracketStatusProps, getRoundLabel, groupBracketsByRound, getRankMedal,
} from "../categorias.utils";
import InstitutionLogo from "../InstitutionLogo";

// ─── Tarjeta de un atleta dentro de la llave ──────────────────────────────────
const AthleteSlot = ({ entry, score, isWin, corner }) => {
  const name = getAthleteName(entry?.athlete);
  const inst = getAthleteInstitution(entry?.athlete);
  const logoUrl = getAthleteInstitutionLogo(entry?.athlete);
  const cornerColor = corner === "blue" ? "#1565c0" : corner === "white" ? "#bdbdbd" : "#9e9e9e";
  

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 1.5,
        py: 0.9,
        bgcolor: isWin ? "success.50" : "transparent",
        gap: 1,
      }}
    >
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
        <InstitutionLogo logoUrl={logoUrl} name={inst} size={20} showTooltip={!!inst} />
        <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={isWin ? 700 : 400} noWrap>
            {name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
            {inst}
            </Typography>
        </Box>
        </Stack>
      <Typography
        variant="body2"
        fontWeight={700}
        sx={{ minWidth: 24, textAlign: "right", color: isWin ? "success.main" : "text.secondary" }}
      >
        {score ?? "—"}
      </Typography>
    </Box>
  );
};

// ─── Una tarjeta de match (usada en la vista llaves) ─────────────────────────
const MatchCard = ({ bracket }) => {
  const [p1Entry, p2Entry] = bracket.participants || [];
  const winnerRegId = bracket.winner?.registrationId;
  const p1RegId = p1Entry?.athlete?.registrationId;
  const p2RegId = p2Entry?.athlete?.registrationId;
  const s1 = bracket.scores?.participant1?.score;
  const s2 = bracket.scores?.participant2?.score;
  const statusProps = getBracketStatusProps(bracket.status);

  return (
    <Paper
      elevation={2}
      sx={{ borderRadius: 2, overflow: "hidden", minWidth: 240, maxWidth: 320, width: "100%" }}
    >
      <Box
        sx={{
          px: 1.5, py: 0.6,
          bgcolor: "action.selected",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}
      >
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          #{bracket.matchNumber} · {getRoundLabel(bracket.round)}
        </Typography>
        <Chip label={statusProps.label} color={statusProps.color} size="small" variant="outlined" sx={{ height: 18, fontSize: "0.6rem" }} />
      </Box>
      <Divider />
      <AthleteSlot entry={p1Entry} score={s1} isWin={winnerRegId === p1RegId} corner={p1Entry?.corner} />
      <Divider sx={{ mx: 1.5 }} />
      <AthleteSlot entry={p2Entry} score={s2} isWin={winnerRegId === p2RegId} corner={p2Entry?.corner} />
    </Paper>
  );
};

// ─── Vista LLAVES: árbol de rondas ────────────────────────────────────────────
const VistaLlaves = ({ brackets }) => {
  const roundGroups = groupBracketsByRound(brackets);

  return (
    <Box sx={{ overflowX: "auto", pb: 2 }}>
      <Stack
        direction="row"
        spacing={4}
        sx={{ minWidth: "max-content", px: 1, py: 2, alignItems: "flex-start" }}
      >
        {roundGroups.map(([round, roundBrackets]) => (
          <Box key={round} sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {/* Etiqueta de la ronda */}
            <Box sx={{ mb: 2, textAlign: "center" }}>
              <Chip label={getRoundLabel(round)} color="primary" variant="filled" size="small" />
            </Box>

            {/* Matches de la ronda con espaciado que simula el árbol */}
            <Stack
              spacing={roundBrackets.length > 1 ? 4 : 2}
              sx={{ justifyContent: "center" }}
            >
              {roundBrackets.map((bracket) => (
                <MatchCard key={bracket.bracketId || bracket.matchNumber} bracket={bracket} />
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

// ─── Vista RESULTADOS: podio + tabla detallada ─────────────────────────────────
const VistaResultados = ({ brackets, podium }) => {
  const roundGroups = groupBracketsByRound(brackets);
  const hasRank = podium.some((p) => p.rank != null);

  return (
    <Stack spacing={3}>
      {/* Podio */}
      {hasRank && (
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ px: 2, py: 1.5, bgcolor: "action.hover" }}>
            <Typography variant="subtitle2" fontWeight={700}>🏆 Podio final</Typography>
          </Box>
          <Stack spacing={0}>
            {podium
              .filter((p) => p.rank != null)
              .sort((a, b) => a.rank - b.rank)
              .map((entry, idx) => {
                const medal = getRankMedal(entry.rank);
                const name  = getAthleteName(entry.athlete?.athlete);
                const inst  = getAthleteInstitution(entry.athlete?.athlete);
                return (
                  <Box
                    key={entry.athlete?.registrationId ?? idx}
                    sx={{
                      display: "flex", alignItems: "center", gap: 2,
                      px: 3, py: 1.5,
                      borderBottom: "1px solid", borderColor: "divider",
                      bgcolor: idx === 0 ? "rgba(255,215,0,0.06)" : idx === 1 ? "rgba(192,192,192,0.06)" : idx === 2 ? "rgba(205,127,50,0.06)" : "transparent",
                    }}
                  >
                    <Typography fontSize={26}>{medal.emoji}</Typography>
                    <InstitutionLogo logoUrl={getAthleteInstitutionLogo(entry.athlete)} name={inst} size={32} showTooltip={!!inst} />
                    <Box>
                    <Typography variant="body1" fontWeight={700}>{name}</Typography>
                    <Typography variant="caption" color="text.secondary">{inst}</Typography>
                    </Box>
                  </Box>
                );
              })}
          </Stack>
        </Paper>
      )}

      {/* Detalle de combates por ronda */}
      {roundGroups.map(([round, roundBrackets]) => (
        <Box key={round}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <Divider sx={{ flex: 1 }} />
            <Chip label={getRoundLabel(round)} size="small" color="primary" variant="filled" />
            <Divider sx={{ flex: 1 }} />
          </Stack>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table size="small" sx={{ tableLayout: "fixed" }}> {/* ← fixed layout */}
                <colgroup>
                <col style={{ width: "40px" }} />   {/* # */}
                <col style={{ width: "35%" }} />    {/* Atleta A */}
                <col style={{ width: "310px" }} />  {/* Marcador — ancho fijo */}
                <col style={{ width: "30%" }} />    {/* Atleta B */}
                <col style={{ width: "110px" }} />  {/* Estado */}
                </colgroup>
                <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                    <TableCell>#</TableCell>
                    <TableCell>Atleta A</TableCell>
                    <TableCell align="center">Marcador</TableCell>
                    <TableCell>Atleta B</TableCell>
                    <TableCell align="center">Estado</TableCell>
                </TableRow>
                </TableHead>
              <TableBody>
                {roundBrackets.map((bracket) => {
                  const [p1Entry, p2Entry] = bracket.participants || [];
                  const winnerRegId = bracket.winner?.registrationId;
                  const p1RegId = p1Entry?.athlete?.registrationId;
                  const p2RegId = p2Entry?.athlete?.registrationId;
                  const s1 = bracket.scores?.participant1?.score ?? "—";
                  const s2 = bracket.scores?.participant2?.score ?? "—";
                  const statusProps = getBracketStatusProps(bracket.status);

                  return (
                    <TableRow key={bracket.bracketId} hover>
                      <TableCell sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                        {bracket.matchNumber}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                            <InstitutionLogo
                            logoUrl={getAthleteInstitutionLogo(p1Entry?.athlete)}
                            name={getAthleteInstitution(p1Entry?.athlete)}
                            size={18}
                            showTooltip
                            />
                            <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={winnerRegId === p1RegId ? 700 : 400} color={winnerRegId === p1RegId ? "success.main" : "text.primary"} noWrap>
                                {getAthleteName(p1Entry?.athlete)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                                {getAthleteInstitution(p1Entry?.athlete)}
                            </Typography>
                            </Box>
                        </Stack>
                        </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={700} sx={{ letterSpacing: 1 }}>
                          {s1} – {s2}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                            <InstitutionLogo
                            logoUrl={getAthleteInstitutionLogo(p2Entry?.athlete)}
                            name={getAthleteInstitution(p2Entry?.athlete)}
                            size={18}
                            showTooltip
                            />
                            <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={winnerRegId === p1RegId ? 700 : 400} color={winnerRegId === p2RegId ? "success.main" : "text.primary"} noWrap>
                                {getAthleteName(p2Entry?.athlete)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                                {getAthleteInstitution(p2Entry?.athlete)}
                            </Typography>
                            </Box>
                        </Stack>
                        </TableCell>
                      <TableCell align="center">
                        <Chip label={statusProps.label} color={statusProps.color} size="small" variant="outlined" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Stack>
  );
};

// ─── Export principal ─────────────────────────────────────────────────────────
const FaseEliminacion = ({ fase, vista }) => {
  const brackets = fase?.brackets || [];
  const podium   = fase?.podium   || [];

  if (!brackets.length) {
    return <Alert severity="info" sx={{ m: 2 }}>No hay combates registrados en esta fase.</Alert>;
  }

  return vista === "llaves"
    ? <VistaLlaves brackets={brackets} />
    : <VistaResultados brackets={brackets} podium={podium} />;
};

export default FaseEliminacion;