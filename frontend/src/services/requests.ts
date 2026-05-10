import api from "./api";
import type { FlightRequest } from "../types/requests";

export const createFlightRequest = async (data: Partial<FlightRequest>) => {
  const res = await api.post("/requests", data);
  return res.data;
};

export const getFlightRequests = async () => {
  const res = await api.get("/requests");
  return res.data; // expected shape: { data: FlightRequest[] }
};

export const getAdminMetrics = async (days = 14) => {
  const res = await api.get(`/requests/metrics?days=${days}`);
  return res.data; // expected shape: { data: { total, byStatus, claimed, open, perDay, recentRequests } }
};

export const getMyRequests = async () => {
  const res = await api.get("/requests/my");
  return res.data; // expected shape: { data: FlightRequest[] }
};

export const claimRequest = async (trackingId: string) => {
  const res = await api.post(`/requests/claim/${trackingId}`);
  return res.data;
};

export const updateRequest = async (id: string, payload: Partial<any>) => {
  const res = await api.put(`/requests/${id}`, payload);
  return res.data;
};

export const deleteRequest = async (id: string) => {
  const res = await api.delete(`/requests/${id}`);
  return res.data;
};
