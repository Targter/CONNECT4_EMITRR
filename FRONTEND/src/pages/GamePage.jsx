import React, { useEffect, useState } from "react";
import { socket } from "../services/socket.js";
import Board from "../components/Board.jsx";
import UsernameForm from "../components/UsernameForm.jsx";
// import Leaderboard from "../components/Leaderboard.jsx"
// ;
import Leaderboard from "../components/Learderboard.jsx";
export default function GamePage() {
  const [username, setUsername] = useState("");
  const [gameState, setGameState] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, queue, playing, gameover
  const [msg, setMsg] = useState("");

  useEffect(() => {
    socket.on("gameStart", (state) => {
      setGameState(state);
      setStatus("playing");
      setMsg("");
    });
    socket.on("updateBoard", setGameState);
    socket.on("gameOver", (state) => {
      setGameState(state);
      setStatus("gameover");
    });
    socket.on("playerDisconnected", ({ message }) => setMsg(message));
    socket.on("playerReconnected", ({ message }) => setMsg(message));

    return () => {
      socket.off("gameStart");
      socket.off("updateBoard");
      socket.off("gameOver");
      socket.off("playerDisconnected");
      socket.off("playerReconnected");
    };
  }, []); // Hook dependencies closed properly here

  const handleFindMatch = (name) => {
    setUsername(name);
    socket.connect();
    socket.emit("findMatch", { username: name });
    setStatus("queue");
  };

  const handleColumnClick = (col) => {
    // Only allow moves if it's the player's turn and the game is active
    if (status !== "playing" || gameState.turn !== username) return;
    socket.emit("makeMove", { gameId: gameState.id, col, username });
  };

  const playAgain = () => {
    setGameState(null);
    setStatus("idle");
    setMsg("");
    socket.disconnect(); // Disconnect and wait for them to click "Find Match" again
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      {/* STATE: IDLE (Home Screen) */}
      {status === "idle" && (
        <div className="w-full max-w-md flex flex-col items-center space-y-8">
          <UsernameForm onSubmit={handleFindMatch} />
          <Leaderboard />
        </div>
      )}

      {/* STATE: QUEUE (Matchmaking) */}
      {status === "queue" && (
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-xl font-bold text-yellow-400 animate-pulse text-center">
            Searching for opponent...
            <br />
            <span className="text-sm text-slate-400 font-normal">
              If no player joins in 10s, a Bot will challenge you.
            </span>
          </div>
        </div>
      )}

      {/* STATE: PLAYING or GAMEOVER */}
      {(status === "playing" || status === "gameover") && gameState && (
        <div className="flex flex-col items-center space-y-6 w-full max-w-2xl">
          {/* Header: Player vs Player */}
          <div className="flex justify-between items-center w-full text-lg font-bold bg-slate-800 p-4 rounded-xl border-2 border-slate-700 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full shadow-inner"></div>
              <span className="text-slate-200">
                {gameState.players[0].username}
              </span>
            </div>
            <div className="text-slate-500 font-black px-4">VS</div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-200">
                {gameState.players[1]?.username || "Bot"}
              </span>
              <div className="w-4 h-4 bg-yellow-400 rounded-full shadow-inner"></div>
            </div>
          </div>

          {/* Disconnect Warning Messages */}
          {msg && (
            <div className="text-red-400 font-bold bg-red-900/30 border border-red-500/50 px-6 py-3 rounded-lg animate-pulse">
              ⚠️ {msg}
            </div>
          )}

          {/* Turn/Winner Indicator */}
          <div className="text-2xl font-black text-center h-8">
            {status === "gameover" ? (
              <span
                className={
                  gameState.winner === username
                    ? "text-green-400"
                    : gameState.winner === "draw"
                      ? "text-slate-300"
                      : "text-red-500"
                }
              >
                {gameState.winner === "draw"
                  ? "It's a Draw! 🤝"
                  : gameState.winner === username
                    ? "You Won! 🎉"
                    : "You Lost! 💀"}
              </span>
            ) : (
              <span
                className={
                  gameState.turn === username
                    ? "text-yellow-400"
                    : "text-slate-500"
                }
              >
                {gameState.turn === username
                  ? "Your Turn"
                  : "Opponent is thinking..."}
              </span>
            )}
          </div>

          {/* The Game Board */}
          <Board
            board={gameState.board}
            players={gameState.players}
            onColumnClick={handleColumnClick}
          />

          {/* Play Again Button */}
          {status === "gameover" && (
            <button
              onClick={playAgain}
              className="mt-8 px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg font-bold text-white transition-all transform hover:scale-105 shadow-lg"
            >
              Return to Lobby
            </button>
          )}
        </div>
      )}
    </div>
  );
}
