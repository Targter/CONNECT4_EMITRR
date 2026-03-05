// import mongoose from "mongoose";
// export default mongoose.model(
//   "Game",
//   new mongoose.Schema({
//     players: [String],
//     moves: [{ player: String, col: Number }],
//     winner: String,
//     duration: Number,
//     createdAt: { type: Date, default: Date.now },
//   }),
// );

import mongoose from "mongoose";

export default mongoose.model(
  "Game",
  new mongoose.Schema({
    gameId: { type: String, unique: true, sparse: true }, // Added gameId to track safely from Kafka
    players: [String],
    moves: [{ player: String, col: Number }],
    winner: String,
    duration: Number,
    createdAt: { type: Date, default: Date.now },
  }),
);
