import { joinQueue, removeFromQueue } from "../services/matchmakingService.js";
import {
  processMove,
  handleDisconnect,
  handleReconnect,
  activeGames,
} from "../services/gameService.js";

export const setupSockets = (io) => {
  io.on("connection", (socket) => {
    socket.on("findMatch", (user) => {
      // Check if user is reconnecting to an active game
      for (let [gameId, game] of activeGames.entries()) {
        const p = Object.values(game.players).find(
          (p) => p.username === user.username,
        );
        if (p && !p.socket) {
          if (handleReconnect(gameId, p.id, socket)) return;
        }
      }
      joinQueue({ id: user.username, username: user.username }, socket);
    });

    socket.on("makeMove", ({ gameId, col, username }) =>
      processMove(gameId, username, col),
    );

    socket.on("disconnect", () => {
      removeFromQueue(socket.id);
      for (let [gameId, game] of activeGames.entries()) {
        const p = Object.values(game.players).find(
          (p) => p.socket?.id === socket.id,
        );
        if (p) handleDisconnect(gameId, p.id);
      }
    });
  });
};
