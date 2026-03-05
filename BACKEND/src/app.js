// import express from "express";
// import cors from "cors";
// import Analytics from "./models/Analytics.js";
// import Player from "./models/Player.js";

// const app = express();
// app.use(
//   cors({
//     origin: "*",
//   }),
// );
// app.use(express.json());

// // 3. Trends (FIX 2: Padded data so charts ALWAYS render)
// app.get("/api/analytics/trends", async (req, res) => {
//   try {
//     const stats = (await Analytics.findById("global_metrics").lean()) || {};
//     const mapObjHour = stats.gamesPerHour || {};
//     const mapObjDay = stats.gamesPerDay || {};

//     const gamesPerHour = [];
//     const gamesPerDay = [];
//     const now = new Date();

//     // Generate the last 6 hours ensuring Recharts has a baseline
//     for (let i = 5; i >= 0; i--) {
//       const d = new Date(now.getTime() - i * 60 * 60 * 1000);
//       const hr = d.getHours().toString().padStart(2, "0");
//       gamesPerHour.push({ name: `${hr}:00`, value: mapObjHour[hr] || 0 });
//     }

//     // Generate the last 5 days
//     for (let i = 4; i >= 0; i--) {
//       const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
//       const dayKey = d.toISOString().split("T")[0]; // "2026-03-05"
//       const shortDay = dayKey.split("-").slice(1).join("/"); // "03/05"
//       gamesPerDay.push({ name: shortDay, value: mapObjDay[dayKey] || 0 });
//     }

//     res.json({ gamesPerHour, gamesPerDay });
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });
// app.get("/api/analytics/global", async (req, res) => {
//   try {
//     const stats = (await Analytics.findById("global_metrics").lean()) || {};
//     const avgGameDuration = stats.totalFinishedGames
//       ? stats.totalGameDuration / stats.totalFinishedGames
//       : 0;
//     const avgMoves = stats.totalFinishedGames
//       ? stats.totalMoves / stats.totalFinishedGames
//       : 0;
//     const botWinRate = stats.botGamesPlayed
//       ? (stats.botWins / stats.botGamesPlayed) * 100
//       : 0;
//     const disconnectRate = stats.totalGames
//       ? (stats.disconnects / stats.totalGames) * 100
//       : 0;
//     const reconnectRate = stats.disconnects
//       ? (stats.reconnects / stats.disconnects) * 100
//       : 0;

//     res.json({
//       ...stats,
//       avgGameDuration,
//       avgMoves,
//       botWinRate,
//       disconnectRate,
//       reconnectRate,
//     });
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// // 2. Player Leaderboard (Using your field totalWins)
// app.get("/api/analytics/players", async (req, res) => {
//   try {
//     const players = await Player.find()
//       .sort({ totalWins: -1 })
//       .limit(10)
//       .lean();
//     const mapped = players.map((p) => ({
//       ...p,
//       winRate: p.totalGames
//         ? ((p.totalWins / p.totalGames) * 100).toFixed(1)
//         : 0,
//     }));
//     res.json(mapped);
//   } catch (e) {
//     res.status(500).json({ error: e.message });
//   }
// });

// export default app;

import express from "express";
import cors from "cors";
import Analytics from "./models/Analytics.js";
import Player from "./models/Player.js";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// --- 1. TRENDS ENDPOINT (Fixed for Maps) ---
app.get("/api/analytics/trends", async (req, res) => {
  try {
    const stats = (await Analytics.findById("global_metrics").lean()) || {};

    // Mongoose Map becomes a plain object with .lean()
    const mapObjHour = stats.gamesPerHour || {};
    const mapObjDay = stats.gamesPerDay || {};
    const mapObjMoves = stats.movesPerHour || {};

    const gamesPerHour = [];
    const movesPerHour = []; // Added moves per hour
    const gamesPerDay = [];

    const now = new Date();

    // 1. Generate Last 12 Hours Data
    // We look back 12 hours. If DB has data, use it; otherwise 0.
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hrKey = d.getHours().toString(); // e.g., "14"
      const displayLabel = `${hrKey.padStart(2, "0")}:00`;

      gamesPerHour.push({
        name: displayLabel,
        value: mapObjHour[hrKey] || 0,
      });

      movesPerHour.push({
        name: displayLabel,
        value: mapObjMoves[hrKey] || 0,
      });
    }

    // 2. Generate Last 7 Days Data
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayKey = d.toISOString().split("T")[0]; // "2026-03-05"
      const displayLabel = dayKey.split("-").slice(1).join("/"); // "03/05"

      gamesPerDay.push({
        name: displayLabel,
        value: mapObjDay[dayKey] || 0,
      });
    }
    // console.log("gamesPerHour:", gamesPerHour); 
    // console.log("gamesPerDay:", gamesPerDay);
    // console.log("movesPerHour:", movesPerHour); // Log moves per hour

    res.json({ gamesPerHour, gamesPerDay, movesPerHour });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// --- 2. GLOBAL STATS ENDPOINT ---
app.get("/api/analytics/global", async (req, res) => {
  try {
    const stats = (await Analytics.findById("global_metrics").lean()) || {};

    // Prevent Division by Zero
    const finished = stats.totalFinishedGames || 0;
    const total = stats.totalGames || 0;
    const botGames = stats.botGamesPlayed || 0;
    const disconnects = stats.disconnects || 0;

    const avgGameDuration =
      finished > 0 ? stats.totalGameDuration / finished : 0;
    const avgMoves = finished > 0 ? stats.totalMoves / finished : 0;
    const botWinRate = botGames > 0 ? (stats.botWins / botGames) * 100 : 0;
    const disconnectRate = total > 0 ? (disconnects / total) * 100 : 0;
    const reconnectRate =
      disconnects > 0 ? (stats.reconnects / disconnects) * 100 : 0;

    res.json({
      ...stats,
      avgGameDuration, // Send in ms, let frontend format it
      avgMoves,
      botWinRate,
      disconnectRate,
      reconnectRate,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- 3. LEADERBOARD ENDPOINT ---
app.get("/api/analytics/players", async (req, res) => {
  try {
    // Sort by wins desc, limit 10
    const players = await Player.find()
      .sort({ totalWins: -1 })
      .limit(10)
      .lean();

    const mapped = players.map((p) => ({
      username: p.username,
      wins: p.totalWins || 0,
      gamesPlayed: p.totalGames || 0,
      winRate:
        p.totalGames > 0
          ? ((p.totalWins / p.totalGames) * 100).toFixed(1)
          : "0.0",
    }));

    res.json(mapped);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default app;
