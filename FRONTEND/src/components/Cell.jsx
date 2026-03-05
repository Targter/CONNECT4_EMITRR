import React from "react";
export default function Cell({ value, onClick }) {
  const color =
    value === "red"
      ? "bg-red-500"
      : value === "yellow"
        ? "bg-yellow-400"
        : "bg-slate-800";
  return (
    <div
      onClick={onClick}
      className="w-10 h-10 sm:w-14 sm:h-14 bg-slate-700 rounded-lg p-1.5 flex justify-center items-center cursor-pointer hover:bg-slate-600 transition-colors"
    >
      <div className={`w-full h-full rounded-full shadow-inner ${color}`}></div>
    </div>
  );
}
