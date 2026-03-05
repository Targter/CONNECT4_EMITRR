import { io } from "socket.io-client";
const backendUri = import.meta.env.VITE_BACKEND_URI || "http://localhost:3000";
console.log("Fetching leaderboard...", import.meta.env.VITE_BACKEND_URI);
export const socket = io(backendUri, { autoConnect: false });
