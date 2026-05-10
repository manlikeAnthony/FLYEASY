import type { TokenUser } from "../types/token";
import { CustomError } from "../errors/CustomError";
import { Types } from "mongoose";
import { AppCodes } from "../errors/AppCodes";
import { HttpCodes } from "../errors/HttpCodes";

export const checkPermissions = (
  requestUser: TokenUser,
  resourseUserId: Types.ObjectId,
): void => {
  if (!requestUser || !requestUser.userId) {
    CustomError.throwError(
      HttpCodes.UNAUTHORIZED,
      AppCodes.AUTH_UNAUTHORIZED,
      "Invalid authentication context",
    );
  }
  if (requestUser.role === "ADMIN") return;
  if (requestUser.userId === resourseUserId.toString()) return;

  CustomError.throwError(
    HttpCodes.UNAUTHORIZED,
    AppCodes.AUTH_UNAUTHORIZED,
    "not authorized to access this route",
  );
};
