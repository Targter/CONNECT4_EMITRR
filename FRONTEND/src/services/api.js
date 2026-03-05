import axios from "axios";
const API_URL = import.meta.env.VITE_BACKEND_URI || "http://localhost:3000";
// export const getLeaderboard = async () => {
//   // console.log("Fetching leaderboard...", import.meta.env.VITE_BACKEND_URI);

//   const res = await axios.get(`${backendUri}/api/leaderboard`);
//   return res.data;
// };

// export const getAnalytics = async () => {
//   const backendUri =
//     import.meta.env.VITE_BACKEND_URI || "http://localhost:3000";
//   const res = await axios.get(`${backendUri}/api/analytics`);
//   return res.data;
// };

export const getGlobalAnalytics = async () =>
  (await axios.get(`${API_URL}/analytics/global`)).data;
export const getPlayerAnalytics = async () =>
  (await axios.get(`${API_URL}/analytics/players`)).data;
export const getTrends = async () =>
  (await axios.get(`${API_URL}/analytics/trends`)).data;
