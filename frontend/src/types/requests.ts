export type FlightRequest = {
  _id?: string;
  id?: string;
  trackingId?: string;
  name: string;
  from: string;
  to: string;
  date: string;
  budget?: number;
  contact: string;
  status?: "pending" | "processing" | "completed" | "rejected";
  user?: { email?: string; name?: string } | string;
  createdAt?: string;
};

export type FlightRequestForm = {
  name: string;
  from: string;
  to: string;
  date: string;
  budget: string; // string because input field
  contact: string;
};
