import { Request, Response } from "express";
import {
  createRequestService,
  getAllRequestsService,
  getRequestByIdService,
  getMyRequestsService,
  getRequestByTrackingIdService,
  claimRequestService,
  // getRequestStatsService,
  updateRequestStatusService,
  updateRequestService,
  deleteRequestService,
  getRequestStatsService,
} from "./request.service";
import { CustomError } from "../errors/CustomError";
import { AppCodes } from "../errors/AppCodes";
import { HttpCodes } from "../errors/HttpCodes";
import { successResponse } from "../response";
import { parseRequestQuery } from "../query/request/requestQuery";
import type { Params, TrackingParams } from "../types/auth.types";
import crypto from "crypto";
import RequestFlight from "./request.model";

function generateTrackingId(length = 6) {
  return crypto.randomBytes(4).toString("hex").slice(0, length);
}

export const createRequestController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { name, from, to, date, budget, contact } = req.body;

  if (!name || !from || !to || !date || !contact) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.MISSING_REQUIRED_FIELD,
      "Missing required fields: name, from, to, date, contact",
    );
  }

  let trackingId = "";
  let exists = true;

  while (exists) {
    trackingId = generateTrackingId();
    const existingRequest = await RequestFlight.findOne({ trackingId });
    if (!existingRequest) {
      exists = false;
    }
  }

  const request = await createRequestService({
    name,
    from,
    to,
    date,
    budget,
    contact,
    trackingId,
  });

  res.status(201).json({
    id: request._id,
    trackingId: request.trackingId,
    status: request.status,
  });
};

export const getAllRequestsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestQuery = parseRequestQuery(req);
  const requests = await getAllRequestsService(requestQuery);

  res.status(200).json(
    successResponse({
      message: "Requests retrieved successfully",
      data: requests,
      code: AppCodes.REQUESTS_RETRIEVED,
    }),
  );
};

export const getRequestByIdController = async (
  req: Request<Params>,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const request = await getRequestByIdService(id);

  if (!request) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.REQUEST_NOT_FOUND,
      "Request not found",
    );
  }

  res.status(200).json(
    successResponse({
      message: "Request retrieved successfully",
      data: request,
      code: AppCodes.REQUEST_RETRIEVED,
    }),
  );
};

export const getMyRequestsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user?.userId;
  const requestQuery = parseRequestQuery(req);

  if (!userId) {
    CustomError.throwError(
      HttpCodes.UNAUTHORIZED,
      AppCodes.AUTH_UNAUTHORIZED,
      "User not authenticated",
    );
  }

  const requests = await getMyRequestsService(userId, requestQuery);

  res.status(200).json(
    successResponse({
      message: "Your requests retrieved successfully",
      data: requests,
      code: AppCodes.MY_REQUESTS_RETRIEVED,
    }),
  );
};

export const getMyRequestByTrackingIdController = async (
  req: Request<TrackingParams>,
  res: Response,
) => {
  const { trackingId } = req.params;

  if (!trackingId) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.MISSING_REQUIRED_FIELD,
      "Missing request id",
    );
  }

  const request = await getRequestByTrackingIdService(trackingId);

  if (!request) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.REQUEST_NOT_FOUND,
      "Request not found",
    );
  }

  res.status(200).json(
    successResponse({
      message: "Request retrieved successfully",
      data: request,
      code: AppCodes.REQUEST_RETRIEVED,
    }),
  );
};

export const claimRequestController = async (
  req: Request<Params>,
  res: Response,
) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!userId) {
    CustomError.throwError(
      HttpCodes.UNAUTHORIZED,
      AppCodes.AUTH_UNAUTHORIZED,
      "User not authenticated",
    );
  }
  if (!id) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.MISSING_REQUIRED_FIELD,
      "Missing request id",
    );
  }

  const request = await claimRequestService(id, userId);

  res.status(200).json({
    message: "Request successfully claimed",
    data: request,
  });
};

export const updateRequestStatusController = async (
  req: Request<Params>,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.MISSING_REQUIRED_FIELD,
      "Missing request id",
    );
  }

  if (!status) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.MISSING_REQUIRED_FIELD,
      "Missing required field: status",
    );
  }

  const updatedRequest = await updateRequestStatusService(id, status);

  if (!updatedRequest) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.REQUEST_NOT_FOUND,
      "Request not found",
    );
  }

  res.status(200).json(
    successResponse({
      message: "Request status updated successfully",
      data: updatedRequest,
      code: AppCodes.REQUEST_STATUS_UPDATED,
    }),
  );
};

export const updateRequestController = async (
  req: Request<Params>,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const { name, from, to, date, budget, contact } = req.body;

  if (!id) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.MISSING_REQUIRED_FIELD,
      "Missing request id",
    );
  }

  const updatedRequest = await updateRequestService(id, {
    name,
    from,
    to,
    date,
    budget,
    contact,
  });

  if (!updatedRequest) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.REQUEST_NOT_FOUND,
      "Request not found",
    );
  }

  res.status(200).json(
    successResponse({
      message: "Request updated successfully",
      data: updatedRequest,
      code: AppCodes.REQUEST_UPDATED,
    }),
  );
};

export const deleteRequestController = async (
  req: Request<Params>,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.MISSING_REQUIRED_FIELD,
      "Missing request id",
    );
  }

  const deletedRequest = await deleteRequestService(id);

  if (!deletedRequest) {
    CustomError.throwError(
      HttpCodes.NOT_FOUND,
      AppCodes.REQUEST_NOT_FOUND,
      "Request not found",
    );
  }

  res.status(200).json(
    successResponse({
      message: "Request deleted successfully",
      data: deletedRequest,
      code: AppCodes.REQUEST_DELETED,
    }),
  );
};

export const getRequestMetricsController = async (
  req: Request,
  res: Response,
) => {
  const days = Number(req.query.days) || 14;
  const metrics = await getRequestStatsService(days);

  res.status(200).json(
    successResponse({
      message: "Request metrics fetched",
      data: metrics,
      code: AppCodes.SUCCESS,
    }),
  );
};
