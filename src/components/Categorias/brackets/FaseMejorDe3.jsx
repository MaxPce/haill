import React from "react";
import {
  Alert,
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import {
  getAthleteName,
  getAthleteInstitution,
  getBracketStatusProps,
} from "../categorias.utils";

const FaseMejorDe3 = ({ fase }) => {
  const brackets = fase?.brackets || [];

  if (!brackets.length) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No hay combates registrados en esta serie.
      </Alert>
    );
  }

  return (
    <Stack spacing={3} sx={{ p: 2 }}>
      {brackets.map((bracket) => {
        const p1Entry = bracket.participants?.[0];
        const p2Entry = bracket.participants?.[1];
        const p1 = p1Entry?.athlete;
        const p2 = p2Entry?.athlete;
        const p1Name = getAthleteName(p1);
        const p2Name = getAthleteName(p2);
        const p1Inst = getAthleteInstitution(p1);
        const p2Inst = getAthleteInstitution(p2);
        const seriesScore = bracket.seriesScore;
        const winnerRegId = bracket.seriesWinner?.registrationId;
        const statusProps = getBracketStatusProps(bracket.status);

        return (
          <Paper key={bracket.seriesId || bracket.bracketId} variant="outlined" sx={{ borderRadius: 3 }}>
            {/* Cabecera de la serie */}
            <Box
              sx={{
                px: 2,
                py: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1,
                bgcolor: "action.hover",
                borderRadius: "12px 12px 0 0",
              }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                Serie — Combate #{bracket.matchNumber}
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                {seriesScore && (
                  <Typography variant="body2" fontWeight={600} color="text.secondary">
                    {seriesScore.participant1Wins} – {seriesScore.participant2Wins} (victorias)
                  </Typography>
                )}
                <Chip
                  label={statusProps.label}
                  color={statusProps.color}
                  size="small"
                />
              </Stack>
            </Box>

            <Divider />

            {/* Participantes */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ px: 2, pt: 2, pb: 1 }}
              alignItems={{ sm: "center" }}
            >
              {[
                { entry: p1Entry, name: p1Name, inst: p1Inst, isWinner: winnerRegId === p1?.registrationId },
                { entry: p2Entry, name: p2Name, inst: p2Inst, isWinner: winnerRegId === p2?.registrationId },
              ].map(({ name, inst, isWinner: winner }, idx) => (
                <Box
                  key={idx}
                  sx={{
                    flex: 1,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: winner ? "success.50" : "transparent",
                    border: "1px solid",
                    borderColor: winner ? "success.light" : "divider",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {winner && (
                    <EmojiEventsIcon fontSize="small" sx={{ color: "gold" }} />
                  )}
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      {name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {inst}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>

            {/* Tabla de rondas */}
            {bracket.rounds?.length > 0 && (
              <Box sx={{ px: 2, pb: 2 }}>
                <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                  Detalle por rondas
                </Typography>

                <TableContainer component={Box}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "action.hover" }}>
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
                        const roundWinnerRegId = round.winner?.registrationId;
                        const roundWinnerName =
                          roundWinnerRegId === p1?.registrationId
                            ? p1Name
                            : roundWinnerRegId === p2?.registrationId
                            ? p2Name
                            : "—";

                        return (
                          <TableRow key={round.roundNumber} hover>
                            <TableCell>Ronda {round.roundNumber}</TableCell>
                            <TableCell
                              align="center"
                              sx={{ fontWeight: roundWinnerRegId === p1?.registrationId ? 700 : 400 }}
                            >
                              {s1}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ fontWeight: roundWinnerRegId === p2?.registrationId ? 700 : 400 }}
                            >
                              {s2}
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="caption" color="success.main" fontWeight={600}>
                                {roundWinnerName}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Paper>
        );
      })}
    </Stack>
  );
};

export default FaseMejorDe3;