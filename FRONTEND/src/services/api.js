import axios from "axios";
export const getLeaderboard = async () => {
  const res = await axios.get("http://localhost:3000/api/leaderboard");
  return res.data;
};
