export const checkWin = (board, player) => {
  const ROWS = 6,
    COLS = 7;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== player) continue;
      // Right, Down, Down-Right, Down-Left
      if (
        c + 3 < COLS &&
        board[r][c + 1] === player &&
        board[r][c + 2] === player &&
        board[r][c + 3] === player
      )
        return true;
      if (
        r + 3 < ROWS &&
        board[r + 1][c] === player &&
        board[r + 2][c] === player &&
        board[r + 3][c] === player
      )
        return true;
      if (
        r + 3 < ROWS &&
        c + 3 < COLS &&
        board[r + 1][c + 1] === player &&
        board[r + 2][c + 2] === player &&
        board[r + 3][c + 3] === player
      )
        return true;
      if (
        r + 3 < ROWS &&
        c - 3 >= 0 &&
        board[r + 1][c - 1] === player &&
        board[r + 2][c - 2] === player &&
        board[r + 3][c - 3] === player
      )
        return true;
    }
  }
  return false;
};
