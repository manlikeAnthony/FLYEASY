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
  
const isProd = process.env.NODE_ENV === "production";

res.cookie("accessToken", accessTokenJWT, {
  httpOnly: true,
  secure: isProd,              // ONLY true in production
  sameSite: isProd ? "none" : "lax",
  path: "/",
  expires: new Date(Date.now() + oneDay),
});


res.cookie("refreshToken", refreshTokenJWT, {
  httpOnly: true,
  secure: isProd,              // ONLY true in production
  sameSite: isProd ? "none" : "lax",
  path: "/",
  expires: new Date(Date.now() + thirtyDays),
});
};
