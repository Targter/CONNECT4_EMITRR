import {
  createEmptyBoard,
  dropDisc,
  isBoardFull,
} from "../utils/boardUtils.js";
import { checkWin } from "../utils/winChecker.js";
import { emitEvent } from "../kafka/producer.js";
import { getBotMove } from "./botService.js";
import Game from "../models/Game.js";
import Player from "../models/Player.js";

export const activeGames = new Map();

const getSanitized = (game) => ({
  id: game.id,
  board: game.board,
  turn: game.turn,
  winner: game.winner,
  players: Object.values(game.players).map((p) => ({
    id: p.id,
    username: p.username,
    disc: p.disc,
  })),
});

const notifyPlayers = (game, event, data) =>
  Object.values(game.players).forEach((p) => p.socket?.emit(event, data));

export const startGame = (p1, p2, isBot = false) => {
  const id = "game_" + Date.now();
  const game = {
    id,
    board: createEmptyBoard(),
    players: {
      [p1.player.id]: { ...p1.player, disc: "red", socket: p1.socket },
      [p2.player.id]: { ...p2.player, disc: "yellow", socket: p2.socket },
    },
    turn: p1.player.id,
    isBot,
    startTime: Date.now(),
    moves: [],
    disconnectTimeouts: {},
  };
  activeGames.set(id, game);
  notifyPlayers(game, "gameStart", getSanitized(game));
  emitEvent("game_started", {
    gameId: id,
    players: [p1.player.id, p2.player.id],
  });
};

export const processMove = async (gameId, playerId, col) => {
  const game = activeGames.get(gameId);
  if (!game || game.turn !== playerId || game.winner) return;

  if (dropDisc(game.board, col, playerId) === -1) return; // Column full
  game.moves.push({ player: playerId, col });
  emitEvent("move_made", { gameId, playerId, col });

  if (checkWin(game.board, playerId)) await finishGame(game, playerId);
  else if (isBoardFull(game.board)) await finishGame(game, "draw");
  else {
    game.turn = Object.keys(game.players).find((id) => id !== playerId);
    notifyPlayers(game, "updateBoard", getSanitized(game));

    // Bot Response
    if (game.isBot && game.turn === "bot") {
      setTimeout(
        () =>
          processMove(gameId, "bot", getBotMove(game.board, "bot", playerId)),
        500,
      );
    }
  }
};

export const finishGame = async (game, winnerId) => {
  game.winner = winnerId;
  const duration = Date.now() - game.startTime;
  notifyPlayers(game, "gameOver", getSanitized(game));
  emitEvent("game_finished", { gameId: game.id, winner: winnerId, duration });

  try {
    await Game.create({
      players: Object.keys(game.players),
      moves: game.moves,
      winner: winnerId,
      duration,
    });
    for (let pid of Object.keys(game.players).filter((id) => id !== "bot")) {
      await Player.updateOne(
        { username: game.players[pid].username },
        { $inc: { totalGames: 1, totalWins: winnerId === pid ? 1 : 0 } },
        { upsert: true },
      );
    }
  } catch (e) {
    console.error("Save error:", e);
  }
  activeGames.delete(game.id);
};

export const handleDisconnect = (gameId, playerId) => {
  const game = activeGames.get(gameId);
  if (!game) return;
  emitEvent("player_disconnected", { gameId, playerId });
  game.players[playerId].socket = null;

  // 30 sec forfeit timeout
  game.disconnectTimeouts[playerId] = setTimeout(() => {
    const oppId = Object.keys(game.players).find((id) => id !== playerId);
    finishGame(game, oppId);
  }, 30000);
  notifyPlayers(game, "playerDisconnected", {
    playerId,
    message: "Opponent disconnected. Waiting 30s...",
  });
};

export const handleReconnect = (gameId, playerId, socket) => {
  const game = activeGames.get(gameId);
  if (!game) return false;
  clearTimeout(game.disconnectTimeouts[playerId]);
  game.players[playerId].socket = socket;
  socket.emit("gameStart", getSanitized(game));
  notifyPlayers(game, "playerReconnected", {
    playerId,
    message: "Opponent reconnected!",
  });
  return true;
};
