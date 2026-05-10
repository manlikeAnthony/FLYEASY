import { resetPassword } from "../../auth.controller";
import { resetPasswordService } from "../../../services/auth.service";
import { HttpCodes } from "../../../errors/HttpCodes";
import { AppCodes } from "../../../errors/AppCodes";
import { CustomError } from "../../../errors/CustomError";
import { Request, Response } from "express";
import { CustomLogger } from "../../../logger/CustomLogger";

jest.mock("../../../services/auth.service");

describe("Reset Password Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let customErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    req = {
      body: {
        email: "test@gmail.com",
        token: "valid_token",
        password: "newpassword123",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    customErrorSpy = jest.spyOn(CustomError, "throwError");

    CustomLogger.error = jest.fn();
    CustomLogger.info = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should reset password successfully", async () => {
    (resetPasswordService as jest.Mock).mockResolvedValue(undefined);

    await resetPassword(req as Request, res as Response);

    expect(resetPasswordService).toHaveBeenCalledWith({
      email: "test@gmail.com",
      token: "valid_token",
      password: "newpassword123",
    });

    expect(res.status).toHaveBeenCalledWith(HttpCodes.OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Password reset successfully",
        data: null,
        code: AppCodes.AUTH_PASSWORD_RESET_SUCCESS,
      }),
    );
  });

  it("should return error if required fields are missing", async () => {
    req.body.password = "";

    await expect(
      resetPassword(req as Request, res as Response),
    ).rejects.toThrow(
      "Email, token, and new password are required",
    );

    expect(resetPasswordService).not.toHaveBeenCalled();
    expect(customErrorSpy).toHaveBeenCalled();
  });

  it("should propagate service error", async () => {
    (resetPasswordService as jest.Mock).mockRejectedValue(
      new Error("reset failed"),
    );

    await expect(
      resetPassword(req as Request, res as Response),
    ).rejects.toThrow("reset failed");

    expect(res.status).not.toHaveBeenCalled();
  });
});