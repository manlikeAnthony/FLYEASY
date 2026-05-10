// src/middlewares/error-handler.ts
import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/CustomError";
import { AppCodes } from "../errors/AppCodes";
import { HttpCodes } from "../errors/HttpCodes";
import { CustomLogger } from "../logger/CustomLogger";

export const errorHandlerMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // 🔥 Always log first (raw error)
  CustomLogger.error("GlobalErrorHandler", AppCodes.UNKNOWN_ERROR, {
    message: err instanceof Error ? err.message : "Unknown error",
    stack: err instanceof Error ? err.stack : undefined,
  });

  // ✅ Custom error
  if (err instanceof CustomError) {
    return res.status(err.httpCode).json({
      success: false,
      code: err.appCode,
      message: err.message,
      details: err.details ?? null,
    });
  }

  let httpCode = HttpCodes.INTERNAL_SERVER_ERROR;
  let appCode = AppCodes.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong, try again later";

  // ✅ Mongoose Validation
  if ((err as any)?.name === "ValidationError") {
    httpCode = HttpCodes.BAD_REQUEST;
    appCode = AppCodes.VALIDATION_FAILED;

    message = Object.values((err as any).errors)
      .map((item: any) => item.message)
      .join(", ");
  }

  // ✅ Duplicate key
  if ((err as any)?.code === 11000) {
    httpCode = HttpCodes.BAD_REQUEST;
    appCode = AppCodes.DUPLICATE_RESOURCE;

    const field = Object.keys((err as any).keyValue)[0];
    message = `${field} already exists`;
  }

  // ✅ Cast error
  if ((err as any)?.name === "CastError") {
    httpCode = HttpCodes.BAD_REQUEST;
    appCode = AppCodes.INVALID_ID;

    message = `Invalid ID: ${(err as any).value}`;
  }

  return res.status(httpCode).json({
    success: false,
    code: appCode,
    message,
  });
};