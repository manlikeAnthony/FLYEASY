import { forgotPassword } from "../../auth.controller";
import { forgotPasswordService } from "../../../services/auth.service";
import { sendResetPasswordEmail } from "../../../utils/email";
import { HttpCodes } from "../../../errors/HttpCodes";
import { AppCodes } from "../../../errors/AppCodes";
import { CustomError } from "../../../errors/CustomError";
import { Request, Response } from "express";
import { CustomLogger } from "../../../logger/CustomLogger";

jest.mock("../../../services/auth.service");
jest.mock("../../../utils/email");

describe("Forgot Password Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let customErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    req = {
      body: {
        email: "test@gmail.com",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    customErrorSpy = jest.spyOn(CustomError, "throwError");

    CustomLogger.error = jest.fn();
    CustomLogger.info = jest.fn()
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should send reset password email successfully", async () => {
    (forgotPasswordService as jest.Mock).mockResolvedValue({
      name: "Anthony",
      email: "test@gmail.com",
      passwordToken: "reset_token",
    });

    await forgotPassword(req as Request, res as Response);

    expect(sendResetPasswordEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Anthony",
        email: "test@gmail.com",
        token: "reset_token",
        origin: "http://localhost:3000",
      }),
    );

    expect(res.status).toHaveBeenCalledWith(HttpCodes.OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Password reset email sent successfully",
        data: null,
        code: AppCodes.SUCCESS,
      }),
    );
  });

  it("should return error if email is missing", async () => {
    req.body.email = "";

    await expect(
      forgotPassword(req as Request, res as Response),
    ).rejects.toThrow("Email is required");

    expect(forgotPasswordService).not.toHaveBeenCalled();
    expect(customErrorSpy).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should not send email if user does not exist", async () => {
    (forgotPasswordService as jest.Mock).mockResolvedValue(null);

    await forgotPassword(req as Request, res as Response);

    expect(sendResetPasswordEmail).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCodes.OK);
  });

  it("should propagate service error", async () => {
    (forgotPasswordService as jest.Mock).mockRejectedValue(
      new Error("service failed"),
    );

    await expect(
      forgotPassword(req as Request, res as Response),
    ).rejects.toThrow("service failed");

    expect(sendResetPasswordEmail).not.toHaveBeenCalled();
  });

  it("should throw if email sending fails", async () => {
    (forgotPasswordService as jest.Mock).mockResolvedValue({
      name: "Anthony",
      email: "test@gmail.com",
      passwordToken: "reset_token",
    });

    (sendResetPasswordEmail as jest.Mock).mockRejectedValue(
      new Error("email failed"),
    );

    await expect(
      forgotPassword(req as Request, res as Response),
    ).rejects.toThrow("email failed");

    expect(res.status).not.toHaveBeenCalled();
  });
});