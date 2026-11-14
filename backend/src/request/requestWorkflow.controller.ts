import { Request, Response } from "express";
import { successResponse } from "../response";
import { HttpCodes } from "../errors/HttpCodes";
import { AppCodes } from "../errors/AppCodes";
import { stopRequestWhatsAppService, getRequestWorkspaceService, addRequestMessageService, sendRequestQuoteService, decideRequestQuoteService, searchFlightOffersService, searchAirportsService } from "./requestWorkflow.service";
import { processNotificationOutbox } from "../notifications/notification.processor";

export const getRequestWorkspaceController = async (req: Request, res: Response) => {
  const request = await getRequestWorkspaceService(String(req.params.id), req.user!);
  res.status(HttpCodes.OK).json(successResponse({ message: "Request workspace retrieved", data: request, code: AppCodes.SUCCESS }));
};
export const addRequestMessageController = async (req: Request, res: Response) => {
  await addRequestMessageService(String(req.params.id), req.user!, req.body.text);
  await processNotificationOutbox();
  res.status(201).json(successResponse({ message: "Message sent", data: null, code: AppCodes.SUCCESS }));
};
export const sendRequestQuoteController = async (req: Request, res: Response) => {
  await sendRequestQuoteService(String(req.params.id), req.user!, req.body);
  await processNotificationOutbox();
  res.status(HttpCodes.OK).json(successResponse({ message: "Quote sent for customer review", data: null, code: AppCodes.SUCCESS }));
};
export const decideRequestQuoteController = async (req: Request, res: Response) => {
  const request = await decideRequestQuoteService(String(req.params.id), req.user!, req.body.decision);
  await processNotificationOutbox();
  res.status(HttpCodes.OK).json(successResponse({ message: "Quote decision saved", data: request, code: AppCodes.SUCCESS }));
};
export const searchFlightOffersController = async (req: Request, res: Response) => {
  const result = await searchFlightOffersService(req.query);
  res.status(HttpCodes.OK).json({ ...successResponse({ message: "Flight offers retrieved", data: result.offers, code: AppCodes.SUCCESS }), environment: result.environment });
};
export const searchAirportsController = async (req: Request, res: Response) => {
  const airports = await searchAirportsService(String(req.query.keyword || "").trim());
  res.status(HttpCodes.OK).json(successResponse({ message: "Airports retrieved", data: airports, code: AppCodes.SUCCESS }));
};

export const stopRequestWhatsAppController = async (req: Request, res: Response) => {
  await stopRequestWhatsAppService(String(req.params.trackingId), req.body.contact);
  res.status(HttpCodes.OK).json(successResponse({ message: "WhatsApp updates stopped for this request", data: null, code: AppCodes.SUCCESS }));
};
