import type { Role } from "../auth/user.model";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { verifyToken } from "../utils/jwt";
import { TokenUser } from "../types/token";
import { CustomError } from "../errors/CustomError";
import { AppCodes } from "../errors/AppCodes";
import { HttpCodes } from "../errors/HttpCodes";

export const authenticateUser = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    CustomError.throwError(
      HttpCodes.UNAUTHORIZED,
      AppCodes.AUTH_UNAUTHORIZED,
      "Authentication invalid",
      { route: req.originalUrl },
    );
  }

  try {
    const payload = verifyToken(token) as { user: TokenUser };

    req.user = payload.user;
    next();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Token verification failed";

    CustomError.throwError(
      HttpCodes.UNAUTHORIZED,
      AppCodes.AUTH_UNAUTHORIZED,
      "Authentication code invalid",
      {
        route: req.originalUrl,
        tokenError: message,
      },
    );
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      CustomError.throwError(
        HttpCodes.UNAUTHORIZED,
        AppCodes.AUTH_UNAUTHORIZED,
        "Authentication required",
      );
    }
    const userRole: Role = (req as any).user.role;

    const hasPermission = allowedRoles.includes(userRole);

    if (!hasPermission) {
      CustomError.throwError(
        HttpCodes.FORBIDDEN,
        AppCodes.AUTH_UNAUTHORIZED,
        "Access Denied",
      );
    }
    next();
  };
};
