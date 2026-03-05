import React, { useEffect, useState } from "react";
import { getLeaderboard } from "../services/api.js";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  useEffect(() => {
    getLeaderboard().then(setLeaders).catch(console.error);
  }, []);

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-xl w-full max-w-sm mt-8 border border-slate-700">
      <h3 className="text-xl font-bold mb-4 text-center">Top Players</h3>
      <div className="space-y-2">
        {leaders.length === 0 ? (
          <p className="text-slate-400 text-center">No games played yet</p>
        ) : (
          leaders.map((l, i) => (
            <div
              key={i}
              className="flex justify-between bg-slate-700 px-4 py-2 rounded"
            >
              <span className="font-semibold text-slate-200">
                {i + 1}. {l.username}
              </span>
              <span className="text-yellow-400 font-bold">
                {l.totalWins} Wins
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
