import React from "react";
import Cell from "./Cell.jsx";

export default function Board({ board, players, onColumnClick }) {
  const getDisc = (playerId) => players.find((p) => p.id === playerId)?.disc;
  return (
    <div className="bg-slate-800 p-3 sm:p-5 rounded-2xl shadow-2xl inline-block border-4 border-slate-700">
      <div className="grid grid-cols-7 gap-2">
        {board.map((row, rIdx) =>
          row.map((playerId, cIdx) => (
            <Cell
              key={`${rIdx}-${cIdx}`}
              value={getDisc(playerId)}
              onClick={() => onColumnClick(cIdx)}
            />
          )),
        )}
      </div>
    </div>
  );
}
