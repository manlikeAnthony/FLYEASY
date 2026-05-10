import api from "./api";
import type { FlightRequest } from "../types/requests";

export const getRequestByTrackingId = async (trackingId: string) => {
  const res = await api.get(`/requests/track/${trackingId}`);
  return res.data as { data: FlightRequest };
};
