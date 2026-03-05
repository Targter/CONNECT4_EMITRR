import React, { useState } from "react";
export default function UsernameForm({ onSubmit }) {
  const [name, setName] = useState("");
  return (
    <div className="flex flex-col items-center p-8 bg-slate-800 rounded-xl shadow-xl border border-slate-700">
      <h1 className="text-4xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-400">
        Connect 4
      </h1>
      <input
        type="text"
        placeholder="Enter Username"
        className="px-4 py-2 rounded bg-slate-900 border border-slate-600 focus:outline-none focus:border-red-500 mb-4 text-center"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        onClick={() => name.trim() && onSubmit(name.trim())}
        className="w-full py-2 bg-gradient-to-r from-red-500 to-yellow-500 rounded font-bold text-slate-900 hover:opacity-90 transition"
      >
        Find Match
      </button>
    </div>
  );
}
