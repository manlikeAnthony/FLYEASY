import { Schema, model, Document, Types } from "mongoose";

export interface TokenDocument extends Document {
  refreshToken: string;
  user: Types.ObjectId;
  userAgent?: string;
  ip?: string;
  isValid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TokenSchema = new Schema<TokenDocument>(
  {
    refreshToken: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userAgent: {
      type: String,
    },
    ip: {
      type: String,
    },
    isValid: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const Token = model<TokenDocument>("Token" , TokenSchema);

export default Token