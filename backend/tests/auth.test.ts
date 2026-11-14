import Token from "../src/auth/token.model";
import User from "../src/auth/user.model";
import { loginService, logoutService } from "../src/auth/auth.service";
import { authenticateUser } from "../src/middlewares/authenticate";
import { createAccessToken } from "../src/utils/jwt";
import { attachCookiesToResponse } from "../src/utils/cookies";

const userId = "507f191e810c19729de860ea";

afterEach(() => jest.restoreAllMocks());

describe("browser-safe authentication", () => {
  test("accepts a Bearer access token when a browser does not send API cookies", () => {
    const req = {
      get: jest.fn().mockReturnValue(
        `Bearer ${createAccessToken({ userId, role: "USER", name: "Mobile traveler" })}`,
      ),
      cookies: {},
    } as any;
    const next = jest.fn();

    authenticateUser(req, {} as any, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ userId, role: "USER" });
  });

  test("creates a distinct refresh session for every successful device login", async () => {
    const user = {
      _id: { toString: () => userId },
      name: "Daniella",
      role: "USER",
      isVerified: true,
      comparePassword: jest.fn().mockResolvedValue(true),
    };
    jest.spyOn(User, "findOne").mockResolvedValue(user as never);
    const create = jest.spyOn(Token, "create").mockResolvedValue({} as never);

    const first = await loginService(
      { email: "traveler@example.com", password: "secret" },
      { userAgent: "Android Chrome" },
    );
    const second = await loginService(
      { email: "traveler@example.com", password: "secret" },
      { userAgent: "iPhone Safari" },
    );

    expect(create).toHaveBeenCalledTimes(2);
    expect(first.refreshToken).not.toBe(second.refreshToken);
    expect(create.mock.calls[0][0]).toMatchObject({ user: user._id });
    expect(create.mock.calls[1][0]).toMatchObject({ user: user._id });
  });

  test("logout revokes only its matching refresh session", async () => {
    const removeOne = jest.spyOn(Token, "deleteOne").mockResolvedValue({} as never);
    const removeAll = jest.spyOn(Token, "deleteMany");

    await logoutService(userId, "this-device-only");

    expect(removeOne).toHaveBeenCalledWith({ user: userId, refreshToken: "this-device-only" });
    expect(removeAll).not.toHaveBeenCalled();
  });

  test("enforces secure cookies whenever cross-site SameSite=None is selected", () => {
    const priorNodeEnv = process.env.NODE_ENV;
    const priorSameSite = process.env.COOKIE_SAME_SITE;
    process.env.NODE_ENV = "production";
    process.env.COOKIE_SAME_SITE = "none";
    const cookie = jest.fn();

    attachCookiesToResponse({
      res: { cookie } as any,
      user: { userId, role: "USER", name: "Mobile traveler" },
      refreshToken: "refresh-token",
    });

    expect(cookie.mock.calls[0][2]).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    if (priorNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = priorNodeEnv;
    if (priorSameSite === undefined) delete process.env.COOKIE_SAME_SITE;
    else process.env.COOKIE_SAME_SITE = priorSameSite;
  });
});
