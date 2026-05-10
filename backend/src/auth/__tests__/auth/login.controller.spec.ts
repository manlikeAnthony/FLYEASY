import { login } from "../../auth.controller";
import { loginService } from "../../../services/auth.service";
import { attachCookiesToResponse } from "../../../utils/cookies";
import { Request, Response } from "express";
import { HttpCodes } from "../../../errors/HttpCodes";
import { AppCodes } from "../../../errors/AppCodes";

jest.mock("../../../services/auth.service");
jest.mock("../../../utils/jwt");

jest.mock("../../../utils/cookies", () => ({
  attachCookiesToResponse: jest.fn(),
}));

describe("Login Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: {
        email: "test@gmail.com",
        password: "secret",
      },
      ip: "127.0.0.1",
      headers: {
        "user-agent": "jest-agent",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should login user, attach cookies and return response", async () => {
    // arrange
    (loginService as jest.Mock).mockResolvedValue({
      tokenUser: {
        id: "123",
        name: "Anthony",
        email: "test@gmail.com",
      },
      refreshToken: "refresh-token-123",
    });

    // act
    await login(req as Request, res as Response);

    // assert
    expect(loginService).toHaveBeenCalledWith(req.body, {
      ip: "127.0.0.1",
      userAgent: "jest-agent",
    });

    expect(attachCookiesToResponse).toHaveBeenCalledWith({
      res,
      user: {
        id: "123",
        name: "Anthony",
        email: "test@gmail.com",
      },
      refreshToken: "refresh-token-123",
    });

    expect(res.status).toHaveBeenCalledWith(HttpCodes.OK);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "User logged in successfully",
        data: {
          id: "123",
          name: "Anthony",
          email: "test@gmail.com",
        },
        code: AppCodes.AUTH_LOGIN_SUCCESS,
      }),
    );
  });

  it("should propagate error if loginService fails", async () => {
    // arrange
    (loginService as jest.Mock).mockRejectedValue(
      new Error("invalid credentials"),
    );

    // act + assert
    await expect(login(req as Request, res as Response)).rejects.toThrow(
      "invalid credentials",
    );

    expect(attachCookiesToResponse).not.toHaveBeenCalled();
  });

  it("should not attach cookies if service fails before token generation", async () => {
    // arrange
    (loginService as jest.Mock).mockRejectedValue(
      new Error("service failure"),
    );

    // act + assert
    await expect(login(req as Request, res as Response)).rejects.toThrow(
      "service failure",
    );

    expect(attachCookiesToResponse).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});