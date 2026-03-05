import mongoose from "mongoose";
export default mongoose.model(
  "Game",
  new mongoose.Schema({
    players: [String],
    moves: [{ player: String, col: Number }],
    winner: String,
    duration: Number,
    createdAt: { type: Date, default: Date.now },
  }),
);
