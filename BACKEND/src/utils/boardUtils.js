export const createEmptyBoard = () =>
  Array(6)
    .fill(null)
    .map(() => Array(7).fill(null));
export const isBoardFull = (board) => board[0].every((cell) => cell !== null);
export const dropDisc = (board, col, player) => {
  for (let r = 5; r >= 0; r--) {
    if (!board[r][col]) {
      board[r][col] = player;
      return r;
    }
  }
  return -1; // Column full
};
