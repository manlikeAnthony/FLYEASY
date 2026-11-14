import { Request, Response } from "express";
import { successResponse } from "../response";
import { AppCodes } from "../errors/AppCodes";
import { HttpCodes } from "../errors/HttpCodes";
import {
  getNotificationsService, markNotificationReadService, markAllNotificationsReadService,
  getNotificationPreferencesService, updateNotificationPreferencesService, getNotificationChannelStatusService,
} from "./notification.service";
import { processNotificationOutbox } from "./notification.processor";

export const getNotificationsController = async (req: Request, res: Response) => {
  const page = Math.max(1, Math.min(10000, Math.floor(Number(req.query.page)) || 1));
  await processNotificationOutbox();
  const notifications = await getNotificationsService(req.user!.userId, page);
  res.status(HttpCodes.OK).json(successResponse({ message: "Notifications retrieved", data: notifications, code: AppCodes.SUCCESS }));
};
export const markNotificationReadController = async (req: Request, res: Response) => {
  const notification = await markNotificationReadService(req.user!.userId, String(req.params.id));
  res.status(HttpCodes.OK).json(successResponse({ message: "Notification marked read", data: notification, code: AppCodes.SUCCESS }));
};
export const markAllNotificationsReadController = async (req: Request, res: Response) => {
  await markAllNotificationsReadService(req.user!.userId);
  res.status(HttpCodes.OK).json(successResponse({ message: "Notifications marked read", data: null, code: AppCodes.SUCCESS }));
};
export const getNotificationPreferencesController = async (req: Request, res: Response) => {
  const preferences = await getNotificationPreferencesService(req.user!.userId);
  res.status(HttpCodes.OK).json(successResponse({ message: "Notification preferences retrieved", data: preferences, code: AppCodes.SUCCESS }));
};
export const updateNotificationPreferencesController = async (req: Request, res: Response) => {
  const preferences = await updateNotificationPreferencesService(req.user!.userId, req.body);
  res.status(HttpCodes.OK).json(successResponse({ message: "Notification preferences updated", data: preferences, code: AppCodes.SUCCESS }));
};
export const getNotificationChannelStatusController = async (_req: Request, res: Response) => {
  res.status(HttpCodes.OK).json(successResponse({ message: "Notification channel setup", data: getNotificationChannelStatusService(), code: AppCodes.SUCCESS }));
};
