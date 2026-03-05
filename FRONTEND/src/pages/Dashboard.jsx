import React, { useEffect, useState } from "react";
import { socket } from "../services/socket.js";
import { getGlobalAnalytics } from "../services/api.js";
import Board from "../components/Board.jsx";
import UsernameForm from "../components/UsernameForm.jsx";
import Leaderboard from "../components/Leaderboard.jsx";
import {
  Trophy,
  Activity,
  Hash,
  Zap,
  Users,
  Clock,
  Cpu,
  ShieldAlert,
  MonitorPlay,
} from "lucide-react";

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const [gameState, setGameState] = useState(null);
  const [status, setStatus] = useState("idle");
  const [stats, setStats] = useState({
    totalGames: 0,
    totalMoves: 0,
    activeGames: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getGlobalAnalytics();
        setStats(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    socket.on("gameStart", (state) => {
      setGameState(state);
      setStatus("playing");
    });
    socket.on("updateBoard", setGameState);
    socket.on("gameOver", (state) => {
      setGameState(state);
      setStatus("gameover");
    });
    return () => {
      clearInterval(interval);
      socket.off();
    };
  }, []);

  const handleFindMatch = (name) => {
    setUsername(name);
    socket.connect();
    socket.emit("findMatch", { username: name });
    setStatus("queue");
  };

  const handleColumnClick = (col) => {
    if (status !== "playing" || gameState.turn !== username) return;
    socket.emit("makeMove", { gameId: gameState.id, col, username });
  };

  const isMyTurn = gameState?.turn === username;

  return (
    // H-FULL + OVERFLOW-HIDDEN ensures this fits in the Layout <main>
    <div className="h-full w-full p-4 lg:p-6 flex flex-col lg:flex-row gap-4 overflow-hidden">
      {/* --- LEFT PANEL: GAME ARENA (Flex-3) --- */}
      <div className="flex-[3] relative flex flex-col bg-neutral-900/30 backdrop-blur-md border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header (Fixed Height) */}
        <div className="h-14 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-950/50">
          <div className="flex items-center gap-2">
            <MonitorPlay className="w-5 h-5 text-cyan-500" />
            <h2 className="text-sm font-bold text-white tracking-widest uppercase">
              Live Feed
            </h2>
          </div>
          {status !== "idle" && (
            <div className="text-[10px] font-mono text-green-500 animate-pulse">
              ● LIVE CONNECTION
            </div>
          )}
        </div>

        {/* Main Content Area (Fills remaining height) */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-4 min-h-0">
          {/* STATE: IDLE */}
          {status === "idle" && (
            <div className="w-full max-w-md z-10">
              <UsernameForm onSubmit={handleFindMatch} />
            </div>
          )}

          {/* STATE: QUEUE */}
          {status === "queue" && (
            <div className="text-center space-y-6 z-10">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-neutral-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold text-white tracking-widest">
                SEARCHING...
              </h3>
            </div>
          )}

          {/* STATE: PLAYING / GAMEOVER */}
          {(status === "playing" || status === "gameover") && gameState && (
            <div className="w-full h-full flex flex-col">
              {/* HUD (Top) */}
              <div className="flex justify-between items-center mb-2 px-4 h-16 shrink-0">
                {/* Player 1 */}
                <div
                  className={`flex flex-col border-l-2 pl-3 ${gameState.turn === gameState.players[0].username ? "border-red-500" : "border-neutral-700"}`}
                >
                  <span className="text-[10px] text-neutral-500 uppercase">
                    Player 01
                  </span>
                  <span
                    className={`text-lg font-bold font-mono ${gameState.turn === gameState.players[0].username ? "text-red-400" : "text-neutral-400"}`}
                  >
                    {gameState.players[0].username}
                  </span>
                </div>

                {/* VS Badge */}
                <div className="text-2xl font-black text-neutral-800 italic">
                  VS
                </div>

                {/* Player 2 */}
                <div
                  className={`flex flex-col items-end border-r-2 pr-3 ${gameState.turn !== gameState.players[0].username ? "border-yellow-500" : "border-neutral-700"}`}
                >
                  <span className="text-[10px] text-neutral-500 uppercase">
                    Player 02
                  </span>
                  <span
                    className={`text-lg font-bold font-mono ${gameState.turn !== gameState.players[0].username ? "text-yellow-400" : "text-neutral-400"}`}
                  >
                    {gameState.players[1]?.username || "CPU"}
                  </span>
                </div>
              </div>

              {/* Board Container (Scales to fit) */}
              <div className="flex-1 flex items-center justify-center min-h-0 relative">
                {status === "gameover" && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-lg animate-in fade-in">
                    <div className="bg-neutral-900 border border-neutral-700 p-6 rounded-xl text-center shadow-2xl">
                      <h2 className="text-3xl font-black text-white mb-1">
                        {gameState.winner === "draw"
                          ? "DRAW"
                          : gameState.winner === username
                            ? "VICTORY"
                            : "DEFEAT"}
                      </h2>
                      <button
                        onClick={() => {
                          setStatus("idle");
                          setGameState(null);
                          socket.disconnect();
                        }}
                        className="mt-4 px-6 py-2 bg-white text-black font-bold rounded hover:bg-neutral-200"
                      >
                        RESET SYSTEM
                      </button>
                    </div>
                  </div>
                )}
                <Board
                  board={gameState.board}
                  players={gameState.players}
                  winningCells={gameState.winningCells || []}
                  onColumnClick={handleColumnClick}
                />
              </div>

              {/* Footer Status */}
              <div className="h-8 shrink-0 flex items-center justify-center">
                <p
                  className={`text-sm font-mono tracking-widest ${isMyTurn ? "text-cyan-400 animate-pulse" : "text-neutral-600"}`}
                >
                  {isMyTurn
                    ? ">> AWAITING INPUT <<"
                    : "CALCULATING OPPONENT MOVE..."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- RIGHT PANEL: ANALYTICS (Flex-1) --- */}
      <div className="flex-1 flex flex-col gap-4 min-w-[300px]">
        {/* Stats Section (Fixed Height) */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-cyan-500" />
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
              Network Stats
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-neutral-900 p-3 rounded border border-neutral-800">
              <p className="text-[10px] text-neutral-500 uppercase">Matches</p>
              <p className="text-lg font-mono text-white">{stats.totalGames}</p>
            </div>
            <div className="bg-neutral-900 p-3 rounded border border-neutral-800">
              <p className="text-[10px] text-neutral-500 uppercase">Active</p>
              <p className="text-lg font-mono text-green-400">
                {stats.activeGames}
              </p>
            </div>
          </div>
        </div>

        {/* Leaderboard Section (Fills remaining height) */}
        <div className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl flex flex-col min-h-0 overflow-hidden">
          <div className="p-3 border-b border-neutral-800 bg-neutral-900 flex justify-between items-center shrink-0">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
              <Trophy className="w-3 h-3 text-yellow-500" /> Top Operators
            </span>
          </div>

          {/* SCROLLABLE AREA: This div allows scrolling ONLY inside the leaderboard */}
          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            <Leaderboard />
          </div>
        </div>
      </div>
    </div>
  );
}
