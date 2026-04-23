import React from "react";
import {
  Alert, Box, Chip, Divider, Paper,
  Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import {
  getAthleteName, getAthleteInstitution, getBracketStatusProps,
} from "../categorias.utils";

const ParticipantBox = ({ entry, isWin }) => {
  const name = getAthleteName(entry?.athlete);
  const inst = getAthleteInstitution(entry?.athlete);
  const corner = String(entry?.corner || "").toLowerCase();
  const cornerColor = corner === "blue" ? "#1565c0" : "#bdbdbd";

  return (
    <Box
      sx={{
        flex: 1, p: 2, borderRadius: 2,
        bgcolor: isWin ? "success.50" : "action.hover",
        border: "1px solid", borderColor: isWin ? "success.light" : "divider",
        display: "flex", alignItems: "center", gap: 1.5,
      }}
    >
      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: cornerColor, flexShrink: 0 }} />
      <Box>
        {isWin && <EmojiEventsIcon sx={{ color: "gold", fontSize: 16, mb: -0.5, mr: 0.5 }} />}
        <Typography variant="body2" fontWeight={isWin ? 700 : 400}>{name}</Typography>
        <Typography variant="caption" color="text.secondary">{inst}</Typography>
      </Box>
    </Box>
  );
};

// Vista llaves: Serie visual con resultado global + cada ronda
const VistaLlaves = ({ brackets }) => (
  <Stack spacing={3} sx={{ p: 1 }}>
    {brackets.map((bracket) => {
      const [p1Entry, p2Entry] = bracket.participants || [];
      const p1 = p1Entry?.athlete;
      const p2 = p2Entry?.athlete;
      const seriesScore = bracket.seriesScore;
      const statusProps = getBracketStatusProps(bracket.status);

      return (
        <Paper key={bracket.seriesId || bracket.bracketId} elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
          {/* Header */}
          <Box sx={{ px: 2.5, py: 1.5, bgcolor: "primary.main", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle2" fontWeight={700} color="white">
              Serie Mejor de 3 — Combate #{bracket.matchNumber}
            </Typography>
            <Chip label={statusProps.label} size="small" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 600 }} />
          </Box>

          {/* Marcador global de la serie */}
          {seriesScore && (
            <Box sx={{ bgcolor: "primary.50", px: 3, py: 2, textAlign: "center" }}>
              <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ letterSpacing: 2 }}>
                {seriesScore.participant1Wins} – {seriesScore.participant2Wins}
              </Typography>
              <Typography variant="caption" color="text.secondary">victorias en la serie</Typography>
            </Box>
          )}

          <Divider />

          {/* Participantes */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ p: 2 }}>
            <ParticipantBox entry={p1Entry} isWin={seriesScore?.participant1Wins > seriesScore?.participant2Wins} />
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>VS</Typography>
            </Box>
            <ParticipantBox entry={p2Entry} isWin={seriesScore?.participant2Wins > seriesScore?.participant1Wins} />
          </Stack>

          {/* Rondas individuales */}
          {bracket.rounds?.length > 0 && (
            <Box sx={{ px: 2, pb: 2 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="overline" color="text.secondary">Desglose por rondas</Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {bracket.rounds.map((round) => {
                  const s1 = round.scores?.participant1?.score ?? "—";
                  const s2 = round.scores?.participant2?.score ?? "—";
                  const rWinner = round.winner?.registrationId;
                  const isP1Win = rWinner === p1?.registrationId;
                  const isP2Win = rWinner === p2?.registrationId;

                  return (
                    <Box
                      key={round.roundNumber}
                      sx={{
                        display: "flex", alignItems: "center", gap: 1.5,
                        px: 2, py: 1, borderRadius: 2,
                        bgcolor: "action.hover", border: "1px solid", borderColor: "divider",
                      }}
                    >
                      <Chip label={`R${round.roundNumber}`} size="small" variant="outlined" sx={{ minWidth: 32 }} />

                        {/* Nombre atleta izquierda */}
                        <Typography variant="caption" color="text.secondary" sx={{ flex: 1, textAlign: "right" }} noWrap>
                        {getAthleteName(p1)}
                        </Typography>

                        {/* Scores con ancho fijo — evita que el "–" se desplace */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                        <Typography
                            variant="body2"
                            fontWeight={isP1Win ? 700 : 400}
                            color={isP1Win ? "success.main" : "text.secondary"}
                            sx={{ width: 28, textAlign: "right", fontVariantNumeric: "tabular-nums" }}
                        >
                            {s1}
                        </Typography>
                        <Typography variant="body2" color="text.disabled" sx={{ userSelect: "none" }}>–</Typography>
                        <Typography
                            variant="body2"
                            fontWeight={isP2Win ? 700 : 400}
                            color={isP2Win ? "success.main" : "text.secondary"}
                            sx={{ width: 28, textAlign: "left", fontVariantNumeric: "tabular-nums" }}
                        >
                            {s2}
                        </Typography>
                        </Box>

                        {/* Nombre atleta derecha */}
                        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }} noWrap>
                        {getAthleteName(p2)}
                        </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}
        </Paper>
      );
    })}
  </Stack>
);

// Vista resultados: tabla de rondas más formal
const VistaResultados = ({ brackets }) => (
  <Stack spacing={3} sx={{ p: 1 }}>
    {brackets.map((bracket) => {
      const [p1Entry, p2Entry] = bracket.participants || [];
      const p1 = p1Entry?.athlete;
      const p2 = p2Entry?.athlete;
      const p1Name = getAthleteName(p1);
      const p2Name = getAthleteName(p2);
      const seriesScore = bracket.seriesScore;

      return (
        <Paper key={bracket.seriesId} variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ px: 2, py: 1.5, bgcolor: "action.hover", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Combate #{bracket.matchNumber} — Serie Mejor de 3
            </Typography>
            {seriesScore && (
              <Typography variant="body2" fontWeight={700} color="primary.main">
                {seriesScore.participant1Wins} – {seriesScore.participant2Wins}
              </Typography>
            )}
          </Box>

          {bracket.rounds?.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.selected" }}>
                    <TableCell>Ronda</TableCell>
                    <TableCell align="center">{p1Name}</TableCell>
                    <TableCell align="center">{p2Name}</TableCell>
                    <TableCell align="center">Ganador</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bracket.rounds.map((round) => {
                    const s1 = round.scores?.participant1?.score ?? "—";
                    const s2 = round.scores?.participant2?.score ?? "—";
                    const rWinnerId = round.winner?.registrationId;
                    const isP1Win  = rWinnerId === p1?.registrationId;
                    const isP2Win  = rWinnerId === p2?.registrationId;

                    return (
                      <TableRow key={round.roundNumber} hover>
                        <TableCell>Ronda {round.roundNumber}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: isP1Win ? 700 : 400, color: isP1Win ? "success.main" : "inherit" }}>{s1}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: isP2Win ? 700 : 400, color: isP2Win ? "success.main" : "inherit" }}>{s2}</TableCell>
                        <TableCell align="center">
                          <Typography variant="caption" fontWeight={600} color="success.main">
                            {isP1Win ? p1Name : isP2Win ? p2Name : "—"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      );
    })}
  </Stack>
);

const FaseMejorDe3 = ({ fase, vista }) => {
  const brackets = fase?.brackets || [];
  if (!brackets.length) return <Alert severity="info" sx={{ m: 2 }}>No hay combates en esta serie.</Alert>;

  return vista === "llaves"
    ? <VistaLlaves brackets={brackets} />
    : <VistaResultados brackets={brackets} />;
};

export default FaseMejorDe3;