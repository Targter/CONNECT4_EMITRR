import { checkWin } from "../utils/winChecker.js";
import { dropDisc } from "../utils/boardUtils.js";

export const getBotMove = (board, botId, opponentId) => {
  const COLS = 7;
  // 1. Play winning move
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] !== null) continue;
    const temp = board.map((r) => [...r]);
    dropDisc(temp, c, botId);
    if (checkWin(temp, botId)) return c;
  }
  // 2. Block opponent
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] !== null) continue;
    const temp = board.map((r) => [...r]);
    dropDisc(temp, c, opponentId);
    if (checkWin(temp, opponentId)) return c;
  }
  // 3. Prefer center to edge
  for (let c of [3, 2, 4, 1, 5, 0, 6]) {
    if (board[0][c] === null) return c;
  }
  return 0;
};
