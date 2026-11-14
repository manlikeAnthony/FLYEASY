import crypto from "crypto";
import { isValidObjectId } from "mongoose";
import Notification from "./notification.model";
import Preference from "./notificationPreference.model";
import type { NotificationEvent, NotificationKind } from "../types/notification.types";
import { CustomError } from "../errors/CustomError";
import { AppCodes } from "../errors/AppCodes";
import { HttpCodes } from "../errors/HttpCodes";

export const notificationEvent = (kind: NotificationKind, actorId?: string, actorRole?: string): NotificationEvent => ({
  eventId: crypto.randomUUID(), kind, actorId, actorRole, createdAt: new Date(), publishedAt: null,
});

export const getNotificationsService = async (userId: string, page = 1) => {
  const limit = 20;
  const [items, unread, total] = await Promise.all([
    Notification.find({ recipient: userId }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
      .select("title body href kind readAt createdAt email.status whatsapp.status").lean(),
    Notification.countDocuments({ recipient: userId, readAt: null }),
    Notification.countDocuments({ recipient: userId }),
  ]);
  return { items, unread, total, page, hasMore: page * limit < total };
};

export const markNotificationReadService = async (userId: string, id: string) => {
  if (!isValidObjectId(id)) CustomError.throwError(HttpCodes.NOT_FOUND, AppCodes.RESOURCE_NOT_FOUND, "Notification not found");
  const result = await Notification.findOneAndUpdate({ _id: id, recipient: userId }, { $set: { readAt: new Date() } }, { new: true })
    .select("_id readAt");
  if (!result) CustomError.throwError(HttpCodes.NOT_FOUND, AppCodes.RESOURCE_NOT_FOUND, "Notification not found");
  return result;
};

export const markAllNotificationsReadService = async (userId: string) => {
  await Notification.updateMany({ recipient: userId, readAt: null }, { $set: { readAt: new Date() } });
};

export const getNotificationPreferencesService = async (userId: string) => {
  const preferences = await Preference.findOne({ user: userId }).lean();
  return {
    emailEnabled: preferences?.emailEnabled ?? true,
    whatsappEnabled: preferences?.whatsappEnabled ?? false,
    whatsappNumber: preferences?.whatsappNumber ?? "",
  };
};

export const updateNotificationPreferencesService = async (userId: string, input: Record<string, unknown>) => {
  const { emailEnabled, whatsappEnabled } = input;
  const whatsappNumber = typeof input.whatsappNumber === "string" ? input.whatsappNumber.trim() : "";
  if (typeof emailEnabled !== "boolean" || typeof whatsappEnabled !== "boolean" || (whatsappNumber && !/^\+[1-9]\d{7,14}$/.test(whatsappNumber)) || (whatsappEnabled && (!whatsappNumber || input.whatsappConsent !== true))) {
    CustomError.throwError(HttpCodes.BAD_REQUEST, AppCodes.INVALID_INPUT, "Use an international WhatsApp number and confirm you want journey notifications there.");
  }
  const preferences = await Preference.findOneAndUpdate({ user: userId }, { $set: {
    emailEnabled, whatsappEnabled, whatsappNumber,
    whatsappConsentAt: whatsappEnabled ? new Date() : null,
  } }, { upsert: true, new: true, runValidators: true });
  return { emailEnabled: preferences.emailEnabled, whatsappEnabled: preferences.whatsappEnabled, whatsappNumber: preferences.whatsappNumber };
};

export const getNotificationChannelStatusService = () => ({
  emailConfigured: Boolean(process.env.EMAIL_USER && (process.env.BREVO_API_KEY || process.env.EMAIL_PASS)),
  whatsappConfigured: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM && process.env.TWILIO_WHATSAPP_CONTENT_SID),
});
