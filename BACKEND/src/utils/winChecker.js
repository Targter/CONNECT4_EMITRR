export const checkWin = (board, player) => {
  const ROWS = 6,
    COLS = 7;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== player) continue;
      // Right
      if (
        c + 3 < COLS &&
        board[r][c + 1] === player &&
        board[r][c + 2] === player &&
        board[r][c + 3] === player
      )
        return [
          [r, c],
          [r, c + 1],
          [r, c + 2],
          [r, c + 3],
        ];
      // Down
      if (
        r + 3 < ROWS &&
        board[r + 1][c] === player &&
        board[r + 2][c] === player &&
        board[r + 3][c] === player
      )
        return [
          [r, c],
          [r + 1, c],
          [r + 2, c],
          [r + 3, c],
        ];
      // Down-Right
      if (
        r + 3 < ROWS &&
        c + 3 < COLS &&
        board[r + 1][c + 1] === player &&
        board[r + 2][c + 2] === player &&
        board[r + 3][c + 3] === player
      )
        return [
          [r, c],
          [r + 1, c + 1],
          [r + 2, c + 2],
          [r + 3, c + 3],
        ];
      // Down-Left
      if (
        r + 3 < ROWS &&
        c - 3 >= 0 &&
        board[r + 1][c - 1] === player &&
        board[r + 2][c - 2] === player &&
        board[r + 3][c - 3] === player
      )
        return [
          [r, c],
          [r + 1, c - 1],
          [r + 2, c - 2],
          [r + 3, c - 3],
        ];
    }
  }
  return false; // No win
};
