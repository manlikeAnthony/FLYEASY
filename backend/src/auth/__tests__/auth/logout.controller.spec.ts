import { logout } from "../../auth.controller";
import { logoutService } from "../../../services/auth.service";
import { HttpCodes } from "../../../errors/HttpCodes";
import { AppCodes } from "../../../errors/AppCodes";
import { Request, Response } from "express";

jest.mock("../../../services/auth.service");

describe("Logout Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      user: {
        userId: "user-id",
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

  it("should logout user successfully and clear cookies", async () => {
    // arrange
    (logoutService as jest.Mock).mockResolvedValue(undefined);

    // act
    await logout(req as Request, res as Response);

    // assert
    expect(logoutService).toHaveBeenCalledWith("user-id");

    expect(res.cookie).toHaveBeenCalledWith(
      "accessToken",
      "logout",
      expect.objectContaining({
        httpOnly: true,
        expires: expect.any(Date),
      }),
    );

    expect(res.cookie).toHaveBeenCalledWith(
      "refreshToken",
      "logout",
      expect.objectContaining({
        httpOnly: true,
        expires: expect.any(Date),
      }),
    );

    expect(res.status).toHaveBeenCalledWith(HttpCodes.OK);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Logged out successfully",
        data: null,
        code: AppCodes.AUTH_LOGOUT_SUCCESS,
      }),
    );
  });

  it("should handle missing userId gracefully", async () => {
    // arrange
    req.user = undefined;

    // act
    await logout(req as Request, res as Response);

    // assert
    expect(logoutService).toHaveBeenCalledWith(undefined);

    expect(res.status).toHaveBeenCalledWith(HttpCodes.OK);
    expect(res.json).toHaveBeenCalled();
  });

  it("should propagate logoutService error", async () => {
    // arrange
    (logoutService as jest.Mock).mockRejectedValue(
      new Error("logout failed"),
    );

    // act + assert
    await expect(
      logout(req as Request, res as Response),
    ).rejects.toThrow("logout failed");

    expect(res.cookie).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});