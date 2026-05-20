import { Request, Response } from "express";
import crypto from "crypto";
import User from "./user.model";
import Token, { TokenDocument } from "./token.model";
import { attachCookiesToResponse, createTokenUser } from "../utils";
import { CustomError } from "../errors/CustomError";
import { AppCodes } from "../errors/AppCodes";
import { HttpCodes } from "../errors/HttpCodes";
import { successResponse } from "../response";
import {
  registerService,
  loginService,
  logoutService,
  verifyEmailService,
  resendVerificationEmailService,
  forgotPasswordService,
  resetPasswordService,
} from "./auth.service";
import { CustomLogger } from "../logger/CustomLogger";
import {
  registerDTO,
  loginDTO,
  verifyEmailDTO,
  resendVerificationEmailDTO,
  forgotPasswordDTO,
  resetPasswordDTO,
} from "../dto/auth";

import { sendVerificationEmail, sendResetPasswordEmail } from "../utils/email";

export const register = async (req: Request, res: Response) => {
  const dto : registerDTO = req.body;

  const { user, verificationToken } = await registerService(dto);

  sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: verificationToken,
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  }).catch((err) => {
    CustomLogger.error("Error sending verification email:", err);
  });

  res.status(HttpCodes.CREATED).json(
    successResponse({
      message: "User registered successfully , Check your email to verify your account",
      data: null,
      code: AppCodes.USER_CREATED,
    }),
  );
};

export const login = async (req: Request, res: Response) => {
  const dto :loginDTO = req.body;
  
  const { tokenUser, refreshToken } = await loginService(dto, {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  res.status(HttpCodes.OK).json(
    successResponse({
      message: "User logged in successfully",
      data: tokenUser,
      code: AppCodes.AUTH_LOGIN_SUCCESS,
    }),
  );
};

export const logout = async (req: Request, res: Response) => {
  await logoutService(req.user?.userId);

  const cookieOptions = {
    httpOnly: true,
    expires: new Date(0),
  };

  res.cookie("accessToken", "logout", cookieOptions);
  res.cookie("refreshToken", "logout", cookieOptions);

  res.status(HttpCodes.OK).json(
    successResponse({
      message: "Logged out successfully",
      data: null,
      code: AppCodes.AUTH_LOGOUT_SUCCESS,
    }),
  );
};

export const verifyEmail = async (req: Request, res: Response) => {
  const dto : verifyEmailDTO = req.body;

  const { token, email } = dto;
  if (!token || !email) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.MISSING_REQUIRED_FIELD,
      "missing required input",
    );
  }
  const user = await verifyEmailService(token, email);
  res.status(HttpCodes.OK).json(
    successResponse({
      message: "Email verified successfully",
      data: user,
      code: AppCodes.USER_VERIFIED,
    }),
  );
};

export const resendVerificationEmail = async (req: Request, res: Response) => {
  const dto : resendVerificationEmailDTO = {
    email: req.body.email,
  };
  if (!dto.email) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.MISSING_REQUIRED_FIELD,
      "missing required input",
    );
  }
  const user = await resendVerificationEmailService(dto.email);

  if (user) {
    await sendVerificationEmail({
      name: user.name,
      email: user.email,
      verificationToken: user.verificationToken,
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
    });
  }

  res.status(HttpCodes.OK).json(
    successResponse({
      message: "Verification email sent successfully",
      data: user,
      code: AppCodes.AUTH_VERIFICATION_EMAIL_SENT,
    }),
  );
};

export const forgotPassword = async (req: Request, res: Response) => {
  const dto : forgotPasswordDTO = req.body;
  const { email } = dto;
  if (!email) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.MISSING_REQUIRED_FIELD,
      "Email is required",
    );
  }

  const user = await forgotPasswordService(email);
  if (user) {
    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      token: user.passwordToken,
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
    });
  }
  res.status(HttpCodes.OK).json(
    successResponse({
      message: "Password reset email sent successfully",
      data: null,
      code: AppCodes.SUCCESS,
    }),
  );
};

export const resetPassword = async (req: Request, res: Response) => {
  const dto : resetPasswordDTO = req.body;
  const { email, token, password } = dto;
  if (!email || !token || !password) {
    CustomError.throwError(
      HttpCodes.BAD_REQUEST,
      AppCodes.MISSING_REQUIRED_FIELD,
      "Email, token, and new password are required",
    );
  }
  await resetPasswordService({ email, token, password });

  res.status(HttpCodes.OK).json(
    successResponse({
      message: "Password reset successfully",
      data: null,
      code: AppCodes.AUTH_PASSWORD_RESET_SUCCESS,
    }),
  );
};
