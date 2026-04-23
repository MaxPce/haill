import React from "react";
import {
  Alert, Box, Chip, Divider, Paper,
  Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography,
} from "@mui/material";
import {
  getAthleteName, getAthleteInstitution, getBracketStatusProps,
  getRoundLabel, groupBracketsByRound, getRankMedal,
} from "../categorias.utils";

const VistaLlaves = ({ brackets }) => {
  const roundGroups = groupBracketsByRound(brackets);

  return (
    <Stack spacing={4} sx={{ p: 1 }}>
      {roundGroups.map(([round, roundBrackets]) => (
        <Box key={round}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Divider sx={{ flex: 1 }} />
            <Chip label={getRoundLabel(round)} color="primary" variant="filled" size="small" />
            <Divider sx={{ flex: 1 }} />
          </Stack>

          <Stack direction="row" flexWrap="wrap" spacing={2} useFlexGap>
            {roundBrackets.map((bracket) => {
              const [p1Entry, p2Entry] = bracket.participants || [];
              const winnerRegId = bracket.winner?.registrationId;
              const p1RegId = p1Entry?.athlete?.registrationId;
              const p2RegId = p2Entry?.athlete?.registrationId;
              const s1 = bracket.scores?.participant1?.score;
              const s2 = bracket.scores?.participant2?.score;
              const statusProps = getBracketStatusProps(bracket.status);

              return (
                <Paper
                  key={bracket.bracketId}
                  elevation={2}
                  sx={{ borderRadius: 2, overflow: "hidden", minWidth: 240, maxWidth: 320 }}
                >
                  <Box sx={{ px: 1.5, py: 0.7, bgcolor: "action.selected", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Combate #{bracket.matchNumber}
                    </Typography>
                    <Chip label={statusProps.label} color={statusProps.color} size="small" variant="outlined" sx={{ height: 18, fontSize: "0.6rem" }} />
                  </Box>
                  <Divider />

                  {[
                    { entry: p1Entry, score: s1, isWin: winnerRegId === p1RegId },
                    { entry: p2Entry, score: s2, isWin: winnerRegId === p2RegId },
                  ].map(({ entry, score, isWin }, i) => {
                    const corner = String(entry?.corner || "").toUpperCase();
                    return (
                      <React.Fragment key={i}>
                        {i > 0 && <Divider sx={{ mx: 1.5 }} />}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 1.5, py: 0.9, bgcolor: isWin ? "success.50" : "transparent" }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                            <Chip label={corner || "—"} size="small" variant="outlined" sx={{ minWidth: 34, fontSize: "0.6rem", height: 20 }} />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" fontWeight={isWin ? 700 : 400} noWrap>{getAthleteName(entry?.athlete)}</Typography>
                              <Typography variant="caption" color="text.secondary" noWrap>{getAthleteInstitution(entry?.athlete)}</Typography>
                            </Box>
                          </Stack>
                          <Typography variant="body2" fontWeight={700} color={isWin ? "success.main" : "text.secondary"}>{score ?? "—"}</Typography>
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

const VistaResultados = ({ brackets, podium }) => {
  const roundGroups = groupBracketsByRound(brackets);
  const hasStats = podium.some((p) => p.matchesPlayed > 0 || p.wins > 0 || p.points > 0);

  return (
    <Stack spacing={3} sx={{ p: 1 }}>
      {/* Tabla de posiciones */}
      {podium.length > 0 && (
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ px: 2, py: 1.5, bgcolor: "action.hover" }}>
            <Typography variant="subtitle2" fontWeight={700}>Tabla de posiciones</Typography>
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
                  const rank   = entry.rank ?? idx + 1;
                  const medal  = getRankMedal(rank);
                  const name   = getAthleteName(entry.athlete?.athlete);
                  const inst   = getAthleteInstitution(entry.athlete?.athlete);
                  return (
                    <TableRow key={entry.athlete?.registrationId ?? idx} hover>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          {medal.emoji && <Typography fontSize={15}>{medal.emoji}</Typography>}
                          <Typography variant="body2" fontWeight={rank <= 3 ? 700 : 400}>{rank}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell><Typography variant="body2" fontWeight={600}>{name}</Typography></TableCell>
                      <TableCell><Typography variant="caption" color="text.secondary">{inst}</Typography></TableCell>
                      {hasStats && (
                        <>
                          <TableCell align="center">{entry.matchesPlayed ?? 0}</TableCell>
                          <TableCell align="center">{entry.wins ?? 0}</TableCell>
                          <TableCell align="center">{entry.draws ?? 0}</TableCell>
                          <TableCell align="center">{entry.losses ?? 0}</TableCell>
                          <TableCell align="center">{entry.scoreFor ?? 0}</TableCell>
                          <TableCell align="center">{entry.scoreAgainst ?? 0}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>{entry.points ?? 0}</TableCell>
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

      {/* Combates */}
      {roundGroups.map(([round, roundBrackets]) => (
        <Box key={round}>
            {/* Solo mostrar el separador de ronda si hay más de un grupo de rondas */}
            {roundGroups.length > 1 && (
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <Divider sx={{ flex: 1 }} />
                <Chip label={getRoundLabel(round)} size="small" color="primary" variant="filled" />
                <Divider sx={{ flex: 1 }} />
            </Stack>
            )}
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
                      <TableCell sx={{ color: "text.secondary", fontSize: "0.75rem" }}>{bracket.matchNumber}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={winnerRegId === p1RegId ? 700 : 400} color={winnerRegId === p1RegId ? "success.main" : "text.primary"}>{getAthleteName(p1Entry?.athlete)}</Typography>
                        <Typography variant="caption" color="text.secondary">{getAthleteInstitution(p1Entry?.athlete)}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                            <Typography
                            variant="body2" fontWeight={700}
                            sx={{ width: 28, textAlign: "right", fontVariantNumeric: "tabular-nums" }}
                            >
                            {s1}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ userSelect: "none" }}>–</Typography>
                            <Typography
                            variant="body2" fontWeight={700}
                            sx={{ width: 28, textAlign: "left", fontVariantNumeric: "tabular-nums" }}
                            >
                            {s2}
                            </Typography>
                        </Box>
                        </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={winnerRegId === p2RegId ? 700 : 400} color={winnerRegId === p2RegId ? "success.main" : "text.primary"}>{getAthleteName(p2Entry?.athlete)}</Typography>
                        <Typography variant="caption" color="text.secondary">{getAthleteInstitution(p2Entry?.athlete)}</Typography>
                      </TableCell>
                      <TableCell align="center"><Chip label={statusProps.label} color={statusProps.color} size="small" variant="outlined" /></TableCell>
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

const FaseGrupo = ({ fase, vista }) => {
  const brackets = fase?.brackets || [];
  const podium   = fase?.podium   || [];

  if (!brackets.length) return <Alert severity="info" sx={{ m: 2 }}>No hay combates en esta fase de grupos.</Alert>;

  return vista === "llaves"
    ? <VistaLlaves brackets={brackets} />
    : <VistaResultados brackets={brackets} podium={podium} />;
};

export default FaseGrupo;