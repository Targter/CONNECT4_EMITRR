// import mongoose from "mongoose";
// export default mongoose.model(
//   "Player",
//   new mongoose.Schema({
//     username: { type: String, required: true, unique: true },
//     totalWins: { type: Number, default: 0 },
//     totalGames: { type: Number, default: 0 },
//     losses: { type: Number, default: 0 },
//     draws: { type: Number, default: 0 },
//     totalMoves: { type: Number, default: 0 },
//   }),
// );

import mongoose from "mongoose";

export default mongoose.model(
  "Player",
  new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    totalWins: { type: Number, default: 0 },
    totalGames: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    totalMoves: { type: Number, default: 0 },
  }),
);
