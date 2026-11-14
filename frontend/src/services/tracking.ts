import api from "./api";
import type { FlightRequest } from "../types/requests";

export const getRequestByTrackingId = async (trackingId: string, contact?: string) => {
  const res = await api.post(`/requests/track/${encodeURIComponent(trackingId)}`, { contact });
  return res.data as { data: FlightRequest };
};
