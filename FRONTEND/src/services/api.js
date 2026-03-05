import axios from "axios";
export const getLeaderboard = async () => {
  const backendUri =
    import.meta.env.VITE_BACKEND_URI || "http://localhost:3000";
  console.log("Fetching leaderboard...", import.meta.env.VITE_BACKEND_URI);

  const res = await axios.get(`${backendUri}/api/leaderboard`);
  return res.data;
};
