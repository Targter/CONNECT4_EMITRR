import React from "react";

export default function Cell({ value, isWinningCell, onClick }) {
  const isRed = value === "red";
  const isYellow = value === "yellow";

  // Base cell styles
  let cellStyle =
    "w-full h-full rounded-full shadow-inner transition-all duration-300 ";

  if (isRed)
    cellStyle +=
      "bg-red-500 animate-drop " + (isWinningCell ? "glow-red scale-110" : "");
  else if (isYellow)
    cellStyle +=
      "bg-yellow-400 animate-drop " +
      (isWinningCell ? "glow-yellow scale-110" : "");
  else cellStyle += "bg-slate-800/80";

  return (
    <div
      onClick={onClick}
      className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-700/50 rounded-lg p-1.5 flex justify-center items-center cursor-pointer hover:bg-slate-600 transition-colors relative overflow-hidden"
    >
      <div className={cellStyle}></div>
    </div>
  );
}
