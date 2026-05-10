import { Schema, model, Document } from "mongoose";
import crypto from "crypto";

export type RequestStatus = "pending" | "processing" | "completed" | "rejected";

export interface RequestDocument extends Document {
  name: string;
  from: string;
  to: string;
  date: Date;
  budget?: number;
  contact: string;

  status: RequestStatus;
  trackingId: string;

  user?: Schema.Types.ObjectId;
  claimedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema = new Schema<RequestDocument>(
  {
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

export const Request = model<RequestDocument>("Request", RequestSchema);
export default Request;
