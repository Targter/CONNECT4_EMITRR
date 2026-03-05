import { startGame } from "./gameService.js";
const queue = [];

export const joinQueue = (player, socket) => {
  // Remove if already in queue
  const existing = queue.findIndex((q) => q.player.id === player.id);
  if (existing !== -1) clearTimeout(queue.splice(existing, 1)[0].timeout);

  // Wait 10s then assign bot
  queue.push({
    player,
    socket,
    timeout: setTimeout(() => handleBotMatch(player.id), 10000),
  });
  checkQueue();
};

export const removeFromQueue = (socketId) => {
  const idx = queue.findIndex((q) => q.socket.id === socketId);
  if (idx !== -1) clearTimeout(queue.splice(idx, 1)[0].timeout);
};

const checkQueue = () => {
  if (queue.length >= 2) {
    const p1 = queue.shift();
    const p2 = queue.shift();
    clearTimeout(p1.timeout);
    clearTimeout(p2.timeout);
    startGame(p1, p2);
  }
};

const handleBotMatch = (playerId) => {
  const idx = queue.findIndex((q) => q.player.id === playerId);
  if (idx !== -1) {
    const p1 = queue.splice(idx, 1)[0];
    const bot = { player: { id: "bot", username: "Bot" }, socket: null };
    startGame(p1, bot, true);
  }
};
