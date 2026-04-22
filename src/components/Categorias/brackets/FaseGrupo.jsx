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
import {
  getAthleteName,
  getAthleteInstitution,
  getBracketStatusProps,
  getRoundLabel,
  groupBracketsByRound,
  getRankMedal,
} from "../categorias.utils";

const FaseGrupo = ({ fase }) => {
  const brackets = fase?.brackets || [];
  const podium = fase?.podium || [];
  const roundGroups = groupBracketsByRound(brackets);

  if (!brackets.length) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No hay combates registrados en esta fase de grupos.
      </Alert>
    );
  }

  const hasStats = podium.some(
    (p) => p.matchesPlayed > 0 || p.wins > 0 || p.points > 0
  );

  return (
    <Stack spacing={3} sx={{ p: 2 }}>
      {/* Tabla de posiciones (podium) */}
      {podium.length > 0 && (
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ px: 2, py: 1.5, bgcolor: "action.hover" }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Tabla de posiciones
            </Typography>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "action.selected" }}>
                  <TableCell>#</TableCell>
                  <TableCell>Atleta</TableCell>
                  <TableCell>Universidad</TableCell>
                  {hasStats && (
                    <>
                      <TableCell align="center">PJ</TableCell>
                      <TableCell align="center">G</TableCell>
                      <TableCell align="center">E</TableCell>
                      <TableCell align="center">P</TableCell>
                      <TableCell align="center">GF</TableCell>
                      <TableCell align="center">GC</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Pts</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {podium.map((entry, idx) => {
                  const rank = entry.rank ?? idx + 1;
                  const medal = getRankMedal(rank);
                  const name = getAthleteName(entry.athlete?.athlete);
                  const inst = getAthleteInstitution(entry.athlete?.athlete);

                  return (
                    <TableRow
                      key={entry.athlete?.registrationId ?? idx}
                      hover
                      sx={{ bgcolor: rank <= 3 && entry.rank != null ? "action.hover" : undefined }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          {medal.emoji && (
                            <Typography fontSize={16}>{medal.emoji}</Typography>
                          )}
                          <Typography variant="body2" fontWeight={rank <= 3 ? 700 : 400}>
                            {rank}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {inst}
                        </Typography>
                      </TableCell>
                      {hasStats && (
                        <>
                          <TableCell align="center">{entry.matchesPlayed ?? 0}</TableCell>
                          <TableCell align="center">{entry.wins ?? 0}</TableCell>
                          <TableCell align="center">{entry.draws ?? 0}</TableCell>
                          <TableCell align="center">{entry.losses ?? 0}</TableCell>
                          <TableCell align="center">{entry.scoreFor ?? 0}</TableCell>
                          <TableCell align="center">{entry.scoreAgainst ?? 0}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>
                            {entry.points ?? 0}
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Combates por ronda */}
      {roundGroups.map(([round, roundBrackets]) => (
        <Box key={round}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <Divider sx={{ flex: 1 }} />
            <Chip
              label={getRoundLabel(round)}
              size="small"
              color="primary"
              variant="filled"
            />
            <Divider sx={{ flex: 1 }} />
          </Stack>

          <Stack spacing={1.5}>
            {roundBrackets.map((bracket) => {
              const p1Entry = bracket.participants?.[0];
              const p2Entry = bracket.participants?.[1];
              const winnerRegId = bracket.winner?.registrationId;
              const p1RegId = p1Entry?.athlete?.registrationId;
              const p2RegId = p2Entry?.athlete?.registrationId;
              const s1 = bracket.scores?.participant1?.score ?? "—";
              const s2 = bracket.scores?.participant2?.score ?? "—";
              const statusProps = getBracketStatusProps(bracket.status);

              return (
                <Paper
                  key={bracket.bracketId}
                  variant="outlined"
                  sx={{ borderRadius: 2, overflow: "hidden" }}
                >
                  {/* Header combate */}
                  <Box
                    sx={{
                      px: 2,
                      py: 0.75,
                      bgcolor: "action.hover",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Combate #{bracket.matchNumber}
                    </Typography>
                    <Chip
                      label={statusProps.label}
                      color={statusProps.color}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Divider />

                  {/* Fila atleta 1 */}
                  {[
                    { entry: p1Entry, score: s1, isWin: winnerRegId === p1RegId },
                    { entry: p2Entry, score: s2, isWin: winnerRegId === p2RegId },
                  ].map(({ entry, score, isWin }, i) => {
                    const name = getAthleteName(entry?.athlete);
                    const inst = getAthleteInstitution(entry?.athlete);
                    const corner = String(entry?.corner || "").toUpperCase();

                    return (
                      <React.Fragment key={i}>
                        {i > 0 && <Divider sx={{ mx: 2 }} />}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            px: 2,
                            py: 1,
                            bgcolor: isWin ? "success.50" : "transparent",
                          }}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Chip
                              label={corner || "—"}
                              size="small"
                              variant="outlined"
                              sx={{ minWidth: 36, fontSize: "0.65rem" }}
                            />
                            <Box>
                              <Typography variant="body2" fontWeight={isWin ? 700 : 400}>
                                {name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {inst}
                              </Typography>
                            </Box>
                          </Stack>

                          <Typography
                            variant="body2"
                            fontWeight={700}
                            sx={{ color: isWin ? "success.main" : "text.secondary" }}
                          >
                            {score}
                          </Typography>
                        </Box>
                      </React.Fragment>
                    );
                  })}
                </Paper>
              );
            })}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
};

export default FaseGrupo;