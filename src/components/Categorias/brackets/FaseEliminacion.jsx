import React from "react";
import {
  Alert,
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import {
  getAthleteName,
  getAthleteInstitution,
  getBracketStatusProps,
  getRoundLabel,
  groupBracketsByRound,
  getRankMedal,
} from "../categorias.utils";

const MatchCard = ({ bracket }) => {
  const p1Entry = bracket.participants?.[0];
  const p2Entry = bracket.participants?.[1];
  const p1 = p1Entry?.athlete;
  const p2 = p2Entry?.athlete;

  const p1RegId = p1?.registrationId;
  const p2RegId = p2?.registrationId;
  const winnerRegId = bracket.winner?.registrationId;

  const s1 = bracket.scores?.participant1?.score ?? "—";
  const s2 = bracket.scores?.participant2?.score ?? "—";
  const statusProps = getBracketStatusProps(bracket.status);

  const AthleteRow = ({ entry, score, isWin }) => {
    const name = getAthleteName(entry?.athlete);
    const inst = getAthleteInstitution(entry?.athlete);
    const corner = String(entry?.corner || "").toLowerCase();
    const cornerColor = corner === "blue" ? "#1565c0" : corner === "white" ? "#e0e0e0" : "#9e9e9e";

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 1,
          bgcolor: isWin ? "success.50" : "transparent",
          borderRadius: 1,
          gap: 1,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: cornerColor,
              border: "1px solid",
              borderColor: "divider",
              flexShrink: 0,
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={isWin ? 700 : 400}
              noWrap
            >
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
          sx={{ minWidth: 28, textAlign: "right", color: isWin ? "success.main" : "text.secondary" }}
        >
          {score}
        </Typography>
      </Box>
    );
  };

  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: 2, overflow: "hidden", minWidth: 260, maxWidth: 360 }}
    >
      <Box
        sx={{
          px: 1.5,
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
        <Chip label={statusProps.label} color={statusProps.color} size="small" variant="outlined" />
      </Box>

      <Divider />

      <Box sx={{ py: 0.5 }}>
        <AthleteRow entry={p1Entry} score={s1} isWin={winnerRegId === p1RegId} />
        <Divider sx={{ mx: 1 }} />
        <AthleteRow entry={p2Entry} score={s2} isWin={winnerRegId === p2RegId} />
      </Box>
    </Paper>
  );
};

const FaseEliminacion = ({ fase }) => {
  const brackets = fase?.brackets || [];
  const podium = fase?.podium || [];
  const roundGroups = groupBracketsByRound(brackets);

  if (!brackets.length) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No hay combates registrados en esta fase.
      </Alert>
    );
  }

  return (
    <Stack spacing={3} sx={{ p: 2 }}>
      {/* Podio si está disponible */}
      {podium.some((p) => p.rank != null) && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
            🏆 Podio
          </Typography>

          <Stack spacing={1}>
            {podium
              .filter((p) => p.rank != null)
              .sort((a, b) => a.rank - b.rank)
              .map((entry) => {
                const medal = getRankMedal(entry.rank);
                const name = getAthleteName(entry.athlete?.athlete);
                const inst = getAthleteInstitution(entry.athlete?.athlete);

                return (
                  <Box
                    key={entry.athlete?.registrationId}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      px: 2,
                      py: 1.25,
                      borderRadius: 2,
                      bgcolor: "action.hover",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography fontSize={22}>{medal.emoji}</Typography>
                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        {medal.label} — {name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {inst}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
          </Stack>
        </Paper>
      )}

      {/* Rondas agrupadas */}
      {roundGroups.map(([round, roundBrackets]) => (
        <Box key={round}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <Divider sx={{ flex: 1 }} />
            <Chip
              label={getRoundLabel(round)}
              size="small"
              variant="filled"
              color="primary"
            />
            <Divider sx={{ flex: 1 }} />
          </Stack>

          <Stack
            direction="row"
            flexWrap="wrap"
            spacing={2}
            useFlexGap
            justifyContent={{ xs: "center", md: "flex-start" }}
          >
            {roundBrackets.map((bracket) => (
              <MatchCard
                key={bracket.bracketId || bracket.matchNumber}
                bracket={bracket}
              />
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
};

export default FaseEliminacion;