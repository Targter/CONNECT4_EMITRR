import express from "express";
import cors from "cors";
import Analytics from "./models/Analytics.js";
import Player from "./models/Player.js";

const app = express();
app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json());

// 3. Trends (Formatted for Recharts Frontend)
app.get("/api/analytics/trends", async (req, res) => {
  try {
    const stats = await Analytics.findById("global_metrics").lean();
    if (!stats) return res.json({ gamesPerHour: [], gamesPerDay: [] });

    // Convert Map Objects into Arrays for Recharts: [{ name: '14:00', value: 8 }]
    const formatMap = (mapObj, suffix = "") => {
      return Object.entries(mapObj || {})
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => ({ name: `${k}${suffix}`, value: v }));
    };

    res.json({
      gamesPerHour: formatMap(stats.gamesPerHour, ":00"),
      gamesPerDay: formatMap(stats.gamesPerDay),
      movesPerHour: formatMap(stats.movesPerHour, ":00"),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/analytics/global", async (req, res) => {
  try {
    const stats = (await Analytics.findById("global_metrics").lean()) || {};
    const avgGameDuration = stats.totalFinishedGames
      ? stats.totalGameDuration / stats.totalFinishedGames
      : 0;
    const avgMoves = stats.totalFinishedGames
      ? stats.totalMoves / stats.totalFinishedGames
      : 0;
    const botWinRate = stats.botGamesPlayed
      ? (stats.botWins / stats.botGamesPlayed) * 100
      : 0;
    const disconnectRate = stats.totalGames
      ? (stats.disconnects / stats.totalGames) * 100
      : 0;
    const reconnectRate = stats.disconnects
      ? (stats.reconnects / stats.disconnects) * 100
      : 0;

    res.json({
      ...stats,
      avgGameDuration,
      avgMoves,
      botWinRate,
      disconnectRate,
      reconnectRate,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 2. Player Leaderboard (Using your field totalWins)
app.get("/api/analytics/players", async (req, res) => {
  try {
    const players = await Player.find()
      .sort({ totalWins: -1 })
      .limit(10)
      .lean();
    const mapped = players.map((p) => ({
      ...p,
      winRate: p.totalGames
        ? ((p.totalWins / p.totalGames) * 100).toFixed(1)
        : 0,
    }));
    res.json(mapped);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default app;
