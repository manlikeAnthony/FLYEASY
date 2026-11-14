export type FlightRequest = {
  whatsappOptIn?: boolean;
  messages?: { author: string; role: string; text: string; createdAt: string }[];
  history?: { status: string; createdAt: string }[];
  quote?: { airline: string; amount: number; currency: string; details: string; decision: string };
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
  contact: string;
};
