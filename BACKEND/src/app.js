import express from "express";
import cors from "cors";
import Player from "./models/Player.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/leaderboard", async (req, res) => {
  try {
    const players = await Player.find().sort({ totalWins: -1 }).limit(10);
    res.json(players);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
export default app;
