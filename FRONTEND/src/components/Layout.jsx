import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart2,
  Settings,
  Zap,
  LogOut,
  Hexagon,
} from "lucide-react";

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Arena" },
    { path: "/analytics", icon: BarChart2, label: "Telemetry" },
    // { path: "/settings", icon: Settings, label: "System" },
  ];

  return (
    // H-SCREEN & OVERFLOW-HIDDEN ensures no window scrollbars ever.
    <div className="h-screen w-screen bg-black text-white font-sans selection:bg-cyan-500/30 flex overflow-hidden relative">
      {/* --- GLOBAL BACKGROUND LAYERS --- */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay z-0"></div>

      {/* --- SIDEBAR --- */}
      <aside className="w-16 lg:w-64 bg-neutral-950/80 backdrop-blur-md border-r border-neutral-800 flex flex-col justify-between relative z-20 h-full">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-neutral-800 shrink-0">
          <div className="relative group cursor-pointer">
            <Hexagon
              className="w-8 h-8 text-cyan-500 fill-cyan-500/10 group-hover:rotate-180 transition-transform duration-700"
              strokeWidth={1.5}
            />
            <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white">
            CONNECT<span className="text-cyan-500">4</span> ARENA
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 flex flex-col gap-2 px-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  relative group flex items-center justify-center lg:justify-start gap-4 px-3 py-3 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? "bg-neutral-800 text-white shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-neutral-700"
                      : "text-neutral-500 hover:text-neutral-200 hover:bg-neutral-900"
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-500 rounded-r-full shadow-[0_0_10px_cyan]"></div>
                )}
                <item.icon
                  className={`w-5 h-5 ${isActive ? "text-cyan-400" : "group-hover:text-cyan-500/50"} transition-colors`}
                />
                <span
                  className={`hidden lg:block text-sm font-medium tracking-wide ${isActive ? "text-cyan-100" : ""}`}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 shrink-0">
          <div className="hidden lg:flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] text-neutral-500 font-mono uppercase">
                Online
              </span>
            </div>
            <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          </div>
        </div>
      </aside>

      {/* --- MAIN VIEWPORT --- */}
      <main className="flex-1 h-full relative z-10 overflow-hidden flex flex-col">
        {/* We use flex-1 and overflow-hidden here to constrain pages to the viewport height */}
        <Outlet />
      </main>
    </div>
  );
}
