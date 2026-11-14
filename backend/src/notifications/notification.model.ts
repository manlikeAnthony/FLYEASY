import { Schema, model, Types } from "mongoose";
import type { DeliveryStatus, NotificationKind } from "../types/notification.types";

export interface NotificationRecord {
  recipient?: Types.ObjectId;
  request: Types.ObjectId;
  eventId: string;
  recipientKey: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string;
  readAt?: Date | null;
  email: DeliveryRecord;
  whatsapp: DeliveryRecord;
  createdAt: Date;
}
export interface DeliveryRecord {
  to: string;
  status: DeliveryStatus;
  attempts: number;
  nextAttemptAt: Date;
  lockedUntil?: Date | null;
  providerId?: string;
}
const DeliverySchema = new Schema<DeliveryRecord>({
  to: { type: String, default: "", select: false },
  status: { type: String, enum: ["pending", "processing", "submitted", "failed", "disabled"], default: "disabled" },
  attempts: { type: Number, default: 0 },
  nextAttemptAt: { type: Date, default: Date.now },
  lockedUntil: Date,
  providerId: { type: String, select: false },
}, { _id: false });
const NotificationSchema = new Schema<NotificationRecord>({
  recipient: { type: Schema.Types.ObjectId, ref: "User", index: true },
  request: { type: Schema.Types.ObjectId, ref: "Request", required: true },
  eventId: { type: String, required: true },
  recipientKey: { type: String, required: true, select: false },
  kind: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  href: { type: String, required: true },
  readAt: { type: Date, default: null },
  email: { type: DeliverySchema, default: () => ({}) },
  whatsapp: { type: DeliverySchema, default: () => ({}) },
}, { timestamps: true });
NotificationSchema.index({ eventId: 1, recipientKey: 1 }, { unique: true });
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ "email.status": 1, "email.nextAttemptAt": 1 });
NotificationSchema.index({ "whatsapp.status": 1, "whatsapp.nextAttemptAt": 1 });
export default model<NotificationRecord>("Notification", NotificationSchema);
