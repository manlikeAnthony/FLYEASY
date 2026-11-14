import { Schema, model, Document, Types } from "mongoose";


import type { NotificationEvent } from "../types/notification.types";

export type RequestStatus = "pending" | "processing" | "completed" | "rejected";

export interface RequestDocument extends Document {
  notificationEvents: NotificationEvent[];
  whatsappOptIn?: boolean;
  messages: { author: string; role: string; text: string; createdAt: Date }[];
  history: { status: string; createdAt: Date }[];
  quote?: { airline: string; amount: number; currency: string; details: string; decision: string };
  name: string;
  from: string;
  to: string;
  date: Date;
  budget?: number;
  contact: string;

  status: RequestStatus;
  trackingId: string;

  user?: Types.ObjectId;
  claimedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema = new Schema<RequestDocument>(
  {
    notificationEvents: [{ eventId: String, kind: String, actorId: String, actorRole: String, createdAt: Date, publishedAt: { type: Date, default: null } }],
    whatsappOptIn: { type: Boolean, default: false },
    messages: [{ author: String, role: String, text: String, createdAt: { type: Date, default: Date.now } }],
    history: [{ status: String, createdAt: { type: Date, default: Date.now } }],
    quote: { airline: String, amount: Number, currency: String, details: String, decision: { type: String, enum: ["pending", "accepted", "declined"] } },
    name: {
      type: String,
      required: true,
      trim: true,
    },

    from: {
      type: String,
      required: true,
      trim: true,
    },

    to: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    budget: {
      type: Number,
    },

    contact: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "processing", "completed", "rejected"],
      default: "pending",
    },
    trackingId: {
      type: String,
      unique: true,
      required: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    claimedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

RequestSchema.index({ "notificationEvents.publishedAt": 1 });

export const Request = model<RequestDocument>("Request", RequestSchema);
export default Request;
