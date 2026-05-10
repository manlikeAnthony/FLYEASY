import api from "./api";

export const getUserMetrics = async (days = 14) => {
  const res = await api.get(`/users/metrics?days=${days}`);
  return res.data; // expected shape: { data: { total, verified, perDay, recentUsers } }
};
