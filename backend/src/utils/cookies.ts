import { Response } from "express";
import {
  createAccessToken,
  createRefreshToken,
} from "./jwt";
import { TokenUser } from "../types/token";

interface AttachCookiesArgs {
  res: Response;
  user: TokenUser;
  refreshToken: string;
}

export const attachCookiesToResponse = ({
  res,
  user,
  refreshToken,
}: AttachCookiesArgs) => {
  const accessTokenJWT = createAccessToken(user);
  const refreshTokenJWT = createRefreshToken(user, refreshToken);

  const oneDay = 1000 * 60 * 60 * 24;
  const thirtyDays = 1000 * 60 * 60 * 24 * 30;

  const isProduction = process.env.NODE_ENV === "production";
  const configuredSameSite = process.env.COOKIE_SAME_SITE?.toLowerCase();
  const sameSite =
    configuredSameSite === "strict" ||
    configuredSameSite === "lax" ||
    configuredSameSite === "none"
      ? configuredSameSite
      : isProduction
        ? "none"
        : "lax";
  // Browsers reject SameSite=None cookies unless they are secure. A deployed
  // FlyEasy API must therefore be served through HTTPS.
  const secure =
    sameSite === "none" ||
    process.env.COOKIE_SECURE === "true" ||
    (isProduction && process.env.COOKIE_SECURE !== "false");
  const domain = process.env.COOKIE_DOMAIN?.trim();
  const cookieBase = {
    httpOnly: true,
    secure,
    sameSite: sameSite as "strict" | "lax" | "none",
    path: "/",
    ...(domain ? { domain } : {}),
  };

  res.cookie("accessToken", accessTokenJWT, {
    ...cookieBase,
    expires: new Date(Date.now() + oneDay),
  });
  res.cookie("refreshToken", refreshTokenJWT, {
    ...cookieBase,
    expires: new Date(Date.now() + thirtyDays),
  });

  // Cookie access remains the primary session mechanism. Returning the short-
  // lived access token also lets the client authenticate with a Bearer header
  // where Safari or mobile Chrome blocks a third-party API cookie.
  return accessTokenJWT;
};

export const clearAuthCookies = (res: Response) => {
  const isProduction = process.env.NODE_ENV === "production";
  const configuredSameSite = process.env.COOKIE_SAME_SITE?.toLowerCase();
  const sameSite =
    configuredSameSite === "strict" ||
    configuredSameSite === "lax" ||
    configuredSameSite === "none"
      ? configuredSameSite
      : isProduction
        ? "none"
        : "lax";
  const secure =
    sameSite === "none" ||
    process.env.COOKIE_SECURE === "true" ||
    (isProduction && process.env.COOKIE_SECURE !== "false");
  const domain = process.env.COOKIE_DOMAIN?.trim();
  const options = {
    httpOnly: true,
    secure,
    sameSite: sameSite as "strict" | "lax" | "none",
    path: "/",
    ...(domain ? { domain } : {}),
    expires: new Date(0),
  };
  res.cookie("accessToken", "", options);
  res.cookie("refreshToken", "", options);
};
