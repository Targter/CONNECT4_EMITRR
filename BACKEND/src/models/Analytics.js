// import mongoose from "mongoose";

// const analyticsSchema = new mongoose.Schema({
//   _id: { type: String, default: "global_metrics" }, // Forces a single, continuous document
//   totalGames: { type: Number, default: 0 },
//   totalMoves: { type: Number, default: 0 },
//   player1Wins: { type: Number, default: 0 }, // Wins by the player who created the match
//   player2Wins: { type: Number, default: 0 }, // Wins by the joining player (or Bot)
//   activeGames: { type: Number, default: 0 },
// });

// export default mongoose.model("Analytics", analyticsSchema);

import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  _id: { type: String, default: "global_metrics" }, // Forces a single, continuous document
  totalGames: { type: Number, default: 0 },
  activeGames: { type: Number, default: 0 },
  totalFinishedGames: { type: Number, default: 0 },
  totalMoves: { type: Number, default: 0 },

  player1Wins: { type: Number, default: 0 },
  player2Wins: { type: Number, default: 0 },

  // Duration tracking
  totalGameDuration: { type: Number, default: 0 },
  longestGame: { type: Number, default: 0 },
  shortestGame: { type: Number, default: 99999999 },

  // Bot & Connection tracking
  botGamesPlayed: { type: Number, default: 0 },
  botWins: { type: Number, default: 0 },
  botLosses: { type: Number, default: 0 },
  disconnects: { type: Number, default: 0 },
  reconnects: { type: Number, default: 0 },

  // Time-based Maps (Using Map for dynamic string keys)
  gamesPerHour: { type: Map, of: Number, default: {} },
  gamesPerDay: { type: Map, of: Number, default: {} },
  movesPerHour: { type: Map, of: Number, default: {} },
});

export default mongoose.model("Analytics", analyticsSchema);
