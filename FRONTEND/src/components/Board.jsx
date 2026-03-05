import React, { useState } from "react";
import Cell from "./Cell.jsx";
import { ChevronDown } from "lucide-react";

export default function Board({
  board,
  players,
  winningCells = [],
  onColumnClick,
}) {
  const [hoveredCol, setHoveredCol] = useState(null);

  const getDiscColor = (playerId) => {
    if (!playerId) return null;
    const playerIndex = players.findIndex(
      (p) => p.username === playerId || p.id === playerId,
    );
    return playerIndex === 0 ? "red" : "yellow";
  };

  const isWinning = (r, c) =>
    winningCells.some(([winR, winC]) => winR === r && winC === c);

  return (
    // Height full and Aspect Ratio ensures it stays contained within the parent flexbox
    <div className="h-full w-full max-h-[80vh] flex flex-col items-center justify-center p-2">
      {/* Targeting Indicators */}
      <div className="flex gap-2 mb-1 w-full max-w-[500px] justify-between px-2 h-6 shrink-0">
        {Array(7)
          .fill(null)
          .map((_, colIdx) => (
            <div key={colIdx} className="flex-1 flex justify-center">
              <ChevronDown
                className={`w-5 h-5 transition-all ${hoveredCol === colIdx ? "text-cyan-400 opacity-100 translate-y-1" : "text-neutral-600 opacity-0"}`}
              />
            </div>
          ))}
      </div>

      {/* The Board Chassis */}
      <div className="relative bg-neutral-900 border-4 border-neutral-800 rounded-lg p-2 shadow-2xl aspect-[7/6] h-full max-h-full">
        {/* The Grid */}
        <div
          className="h-full w-full grid grid-cols-7 grid-rows-6 gap-1.5 bg-neutral-950 p-1.5 rounded border border-neutral-800"
          onMouseLeave={() => setHoveredCol(null)}
        >
          {board.map((row, rIdx) =>
            row.map((playerId, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                className="relative group w-full h-full"
                onMouseEnter={() => setHoveredCol(cIdx)}
                onClick={() => onColumnClick(cIdx)}
              >
                <Cell
                  value={getDiscColor(playerId)}
                  isWinningCell={isWinning(rIdx, cIdx)}
                  isHoveredColumn={hoveredCol === cIdx}
                />
              </div>
            )),
          )}
        </div>
      </div>

      {/* Stand Base */}
      <div className="w-[60%] h-3 bg-neutral-800 rounded-b-xl opacity-50 shrink-0 mt-1"></div>
    </div>
  );
}
