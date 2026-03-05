import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  getGlobalAnalytics,
  getPlayerAnalytics,
  getTrends,
} from "../services/api.js";
import {
  Activity,
  Clock,
  Zap,
  Target,
  ServerCrash,
  Cpu,
  ShieldAlert,
  Trophy,
  Network,
  ChevronUp,
  AlertCircle,
  Radio,
} from "lucide-react";

// --- Custom Tooltip Component ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-950 border border-neutral-700 p-3 rounded-lg shadow-xl backdrop-blur-md">
        <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest mb-1">
          {label}
        </p>
        <p className="text-sm font-bold text-cyan-400 font-mono">
          {payload[0].value.toLocaleString()}{" "}
          <span className="text-[10px] text-white">UNITS</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [global, setGlobal] = useState(null);
  const [players, setPlayers] = useState([]);
  const [trends, setTrends] = useState({ gamesPerHour: [], gamesPerDay: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [gData, pData, tData] = await Promise.all([
          getGlobalAnalytics(),
          getPlayerAnalytics(),
          getTrends(),
        ]);

        setGlobal(gData);
        setPlayers(pData);
        setTrends({
          gamesPerHour: tData.gamesPerHour || [],
          gamesPerDay: tData.gamesPerDay || [],
        });
        setError(false);
      } catch (e) {
        console.error("Telemetry Error:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 5000); // Live poll every 5s
    return () => clearInterval(interval);
  }, []);

  // Helper to format duration (Backend sends ms)
  const formatTime = (ms) => {
    if (!ms || isNaN(ms)) return "0s";
    return ms > 60000
      ? `${(ms / 60000).toFixed(1)}m`
      : `${(ms / 1000).toFixed(0)}s`;
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 bg-black">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-cyan-500 font-mono text-xs uppercase tracking-widest animate-pulse">
          Establishing Uplink...
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 bg-black">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <div className="text-red-500 font-mono text-sm uppercase tracking-widest">
          Telemetry Stream Offline
        </div>
        <p className="text-neutral-600 text-xs font-mono">
          Check Backend Connection
        </p>
      </div>
    );
  }

  return (
    // MAIN CONTAINER: Fits 100% height, prevents window scroll
    <div className="h-full w-full bg-black flex flex-col p-4 lg:p-6 gap-4 overflow-hidden relative">
      {/* --- Header --- */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neutral-900 border border-neutral-700 rounded-lg">
            <Activity className="text-cyan-400 w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-widest uppercase leading-none">
              System Telemetry
            </h1>
            <p className="text-[10px] text-neutral-500 font-mono mt-1">
              REAL-TIME DATA NODE
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-full">
          <Radio className="w-4 h-4 text-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-neutral-300 tracking-widest">
            LIVE
          </span>
        </div>
      </div>

      {/* --- KPI Cards (Top Row) --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {[
          {
            label: "Total Matches",
            val: global?.totalGames || 0,
            icon: Target,
            color: "text-blue-400",
          },
          {
            label: "Active Arenas",
            val: global?.activeGames || 0,
            icon: Zap,
            color: "text-green-400",
            pulse: true,
          },
          {
            label: "Avg Duration",
            val: formatTime(global?.avgGameDuration),
            icon: Clock,
            color: "text-yellow-400",
          },
          {
            label: "Total Moves",
            val: (global?.totalMoves || 0).toLocaleString(),
            icon: Network,
            color: "text-purple-400",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-neutral-900/50 backdrop-blur border border-neutral-800 p-4 rounded-xl flex flex-col justify-between group hover:border-neutral-600 transition-colors"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
                {s.label}
              </span>
              <s.icon
                className={`w-4 h-4 ${s.color} ${s.pulse ? "animate-pulse" : ""}`}
              />
            </div>
            <span className="text-2xl font-mono font-bold text-white group-hover:scale-105 transition-transform origin-left">
              {s.val}
            </span>
          </div>
        ))}
      </div>

      {/* --- Main Content Grid --- */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Left Column: Charts (Scrollable) */}
        <div className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
          {/* Chart 1: Hourly Traffic */}
          <div className="bg-neutral-900/30 border border-neutral-800 p-5 rounded-xl min-h-[300px] flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-3 h-3 text-cyan-500" /> Hourly Throughput
              </h3>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends.gamesPerHour}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#262626"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#525252"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#525252"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#ffffff05" }}
                    content={<CustomTooltip />}
                  />
                  <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Daily Volume */}
          <div className="bg-neutral-900/30 border border-neutral-800 p-5 rounded-xl min-h-[300px] flex flex-col">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ChevronUp className="w-3 h-3 text-purple-500" /> Daily Volume
            </h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends.gamesPerDay}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#262626"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#525252"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#525252"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Insights & Leaderboard (Fixed Height / Flex) */}
        <div className="flex flex-col gap-4 min-h-0">
          {/* System Health */}
          <div className="bg-neutral-900/50 border border-neutral-800 p-5 rounded-xl shrink-0">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-neutral-500" /> Infrastructure
            </h3>
            <div className="space-y-4">
              {/* Bot Efficiency */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-neutral-500">Bot Win Rate</span>
                  <span
                    className={`font-mono font-bold ${global?.botWinRate > 50 ? "text-red-400" : "text-green-400"}`}
                  >
                    {Number(global?.botWinRate || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${global?.botWinRate > 50 ? "bg-red-500" : "bg-green-500"}`}
                    style={{ width: `${global?.botWinRate || 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Drops */}
              <div className="flex justify-between items-center text-xs pt-2 border-t border-neutral-800">
                <span className="text-neutral-500 flex items-center gap-1">
                  <ServerCrash className="w-3 h-3" /> Drops
                </span>
                <span className="font-mono font-bold text-yellow-500">
                  {Number(global?.disconnectRate || 0).toFixed(1)}%
                </span>
              </div>

              {/* Recoveries */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Recoveries
                </span>
                <span className="font-mono font-bold text-cyan-500">
                  {Number(global?.reconnectRate || 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="p-4 border-b border-neutral-800 bg-neutral-900">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" /> Top Operators
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {players.length === 0 && (
                <div className="text-[10px] text-neutral-600 font-mono text-center mt-4">
                  NO DATA FOUND
                </div>
              )}
              {players.map((p, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-neutral-950 hover:bg-neutral-900 p-2 rounded border border-neutral-800 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-yellow-500 text-black" : "bg-neutral-800 text-neutral-400"}`}
                    >
                      {i + 1}
                    </div>
                    <span className="text-xs font-bold text-neutral-300 group-hover:text-white truncate max-w-[100px]">
                      {p.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono">
                    <span className="text-yellow-500">{p.wins}W</span>
                    <span
                      className={
                        Number(p.winRate) >= 50
                          ? "text-green-500"
                          : "text-neutral-500"
                      }
                    >
                      {p.winRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
