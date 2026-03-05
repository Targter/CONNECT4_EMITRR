import React, { useState } from "react";
import { Terminal, ArrowRight, ShieldCheck, Cpu, ScanLine } from "lucide-react";

export default function UsernameForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) onSubmit(name.trim());
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Card Container */}
      <div className="relative bg-black/80 border border-neutral-800 rounded-xl overflow-hidden backdrop-blur-xl shadow-2xl">
        {/* Top Decorative Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600"></div>

        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-neutral-900 border border-neutral-700 rounded-lg shadow-inner">
                <Terminal className="w-6 h-6 text-cyan-500" />
              </div>
              <div>
                <h2 className="text-white font-bold tracking-wider text-lg">
                  OPERATOR LOGIN
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
                    System Online
                  </p>
                </div>
              </div>
            </div>
            <Cpu className="w-12 h-12 text-neutral-800 stroke-[1]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Group */}
            <div className="space-y-2">
              <label className="text-[10px] text-cyan-500 font-mono uppercase tracking-widest ml-1 flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" />
                Identity Verification
              </label>

              <div
                className={`relative group transition-all duration-300 ${isFocused ? "transform scale-[1.02]" : ""}`}
              >
                <div
                  className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-500 ${isFocused ? "opacity-60" : ""}`}
                ></div>

                <div className="relative flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-1">
                  <div className="pl-3 pr-2 text-neutral-500 font-mono select-none">
                    {">"}
                  </div>
                  <input
                    type="text"
                    placeholder="ENTER_ALIAS..."
                    className="w-full bg-transparent border-none text-white px-0 py-3 text-sm focus:ring-0 placeholder:text-neutral-700 font-mono tracking-wider outline-0"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    maxLength={12}
                    autoFocus
                    spellCheck="false"
                  />
                  {/* Blinking Cursor Visual (if empty) */}
                  {!name && isFocused && (
                    <div className="absolute left-[130px] top-4 w-2 h-4 bg-cyan-500/50 animate-pulse pointer-events-none"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={!name.trim()}
              className="group relative w-full flex items-center justify-center gap-3 py-4 bg-neutral-100 hover:bg-white text-black disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-lg font-bold text-sm tracking-widest uppercase transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                {name.trim() ? "Establish Link" : "Awaiting Input"}
                <ArrowRight
                  className={`w-4 h-4 transition-transform duration-300 ${name.trim() ? "group-hover:translate-x-1" : ""}`}
                />
              </span>

              {/* Button Hover Shine Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent z-0"></div>
            </button>
          </form>
        </div>

        {/* Footer Status */}
        <div className="bg-neutral-950 border-t border-neutral-900 p-3 flex justify-between items-center text-[9px] text-neutral-600 font-mono uppercase tracking-widest">
          <span className="flex items-center gap-1">
            <ScanLine className="w-3 h-3" />
            V.2.0.4
          </span>
          <span>Secure Protocol</span>
        </div>
      </div>
    </div>
  );
}
