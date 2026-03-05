import React, { useEffect, useState } from "react";
import { getPlayerAnalytics } from "../services/api.js";
import { Trophy, Medal, Shield } from "lucide-react";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      getPlayerAnalytics()
        .then((data) => {
          setLeaders(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    };

    fetchData();
    // Refresh leaderboard every 10 seconds to keep rank live
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-48 space-y-2">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-[10px] text-cyan-500 font-mono uppercase tracking-widest animate-pulse">
          Syncing Database...
        </span>
      </div>
    );
  }

  if (leaders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 border border-dashed border-neutral-800 rounded-lg bg-neutral-900/20">
        <Shield className="w-8 h-8 text-neutral-600 mb-2" />
        <div className="text-xs text-neutral-500 font-mono uppercase tracking-widest">
          No Telemetry Data Found
        </div>
      </div>
    );
  }

  // Helper to determine rank icon/color
  const getRankStyle = (index) => {
    switch (index) {
      case 0:
        return {
          icon: <Trophy className="w-3 h-3" />,
          color: "text-yellow-400",
          border: "border-yellow-500/50",
          bg: "bg-yellow-500/10",
        };
      case 1:
        return {
          icon: <Medal className="w-3 h-3" />,
          color: "text-neutral-300",
          border: "border-neutral-400/50",
          bg: "bg-white/5",
        };
      case 2:
        return {
          icon: <Medal className="w-3 h-3" />,
          color: "text-amber-600",
          border: "border-amber-700/50",
          bg: "bg-amber-900/20",
        };
      default:
        return {
          icon: <span className="text-[10px] font-mono">#{index + 1}</span>,
          color: "text-neutral-500",
          border: "border-neutral-800",
          bg: "bg-neutral-900/40",
        };
    }
  };

  return (
    <div className="w-full flex flex-col h-full">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-3 py-2 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="col-span-1 text-[10px] text-neutral-500 font-bold uppercase tracking-widest text-center">
          Rnk
        </div>
        <div className="col-span-5 text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
          Operator
        </div>
        <div className="col-span-2 text-[10px] text-neutral-500 font-bold uppercase tracking-widest text-center">
          Wins
        </div>
        <div className="col-span-4 text-[10px] text-neutral-500 font-bold uppercase tracking-widest text-right">
          Performance
        </div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {leaders.map((l, i) => {
          const winRate =
            l.totalGames > 0
              ? Math.round((l.totalWins / l.totalGames) * 100)
              : 0;
          const styles = getRankStyle(i);

          return (
            <div
              key={i}
              className={`group grid grid-cols-12 gap-4 items-center p-2 rounded-lg border ${styles.border} ${styles.bg} hover:bg-neutral-800 hover:border-neutral-600 transition-all duration-300 cursor-default`}
            >
              {/* Rank Column */}
              <div className={`col-span-1 flex justify-center ${styles.color}`}>
                {styles.icon}
              </div>

              {/* Player Name */}
              <div className="col-span-5 flex items-center gap-3 overflow-hidden">
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center bg-black border border-neutral-700 shadow-inner group-hover:border-cyan-500/50 transition-colors`}
                >
                  <span className="text-[10px] font-bold text-neutral-300 group-hover:text-cyan-400">
                    {l.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-neutral-200 truncate group-hover:text-white transition-colors">
                  {l.username}
                </span>
              </div>

              {/* Wins & Games */}
              <div className="col-span-2 flex flex-col items-center justify-center leading-none">
                <span className="text-sm font-mono font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {l.totalWins}
                </span>
                <span className="text-[9px] text-neutral-600 font-mono">
                  /{l.totalGames}
                </span>
              </div>

              {/* Win Rate Bar */}
              <div className="col-span-4 flex flex-col justify-center gap-1.5">
                <div className="flex justify-between items-end">
                  <span className="text-[9px] text-neutral-500 font-mono uppercase">
                    Win Rate
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold ${winRate >= 50 ? "text-green-400" : "text-neutral-400"}`}
                  >
                    {winRate}%
                  </span>
                </div>

                <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-neutral-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out relative ${
                      winRate >= 60
                        ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                        : winRate >= 40
                          ? "bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                          : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                    }`}
                    style={{ width: `${winRate}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
