import { resendVerificationEmail } from "../../auth.controller";
import User from "../../../models/user.model";
import { HttpCodes } from "../../../errors/HttpCodes";
import { AppCodes } from "../../../errors/AppCodes";
import { resendVerificationEmailService } from "../../../services/auth.service";
import { Request, Response } from "express";
import { sendVerificationEmail } from "../../../utils/email";
import { CustomError } from "../../../errors/CustomError";
import { CustomLogger } from "../../../logger/CustomLogger";

jest.mock("../../../services/auth.service");
jest.mock("../../../utils/email");

describe("Resend Verification Email", () => {
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

    CustomLogger.info = jest.fn();
    CustomLogger.error = jest.fn();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully resend verification email", async () => {
    //arrange
    (resendVerificationEmailService as jest.Mock).mockResolvedValue({
      name: "Anthony",
      email: "test@gmail.com",
      verificationToken: "test_verification_token",
    });

    //act
    await resendVerificationEmail(req as Request, res as Response);

    //assert
    expect(sendVerificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Anthony",
        email: "test@gmail.com",
        verificationToken: "test_verification_token",
        origin: "http://localhost:3000",
      }),
    );
    expect(res.status).toHaveBeenCalledWith(HttpCodes.OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Verification email sent successfully",
        data: {
          name: "Anthony",
          email: "test@gmail.com",
          verificationToken: "test_verification_token",
        },
        code: AppCodes.AUTH_VERIFICATION_EMAIL_SENT,
      }),
    );
  });

  it("should return error if input is invalid", async () => {
    //arrange
    req.body.email = "";

    //act + assert
    await expect(
      resendVerificationEmail(req as Request, res as Response),
    ).rejects.toThrow("missing required input");

    expect(resendVerificationEmailService).not.toHaveBeenCalled();
    expect(customErrorSpy).toHaveBeenCalledWith(
      HttpCodes.BAD_REQUEST,
      AppCodes.MISSING_REQUIRED_FIELD,
      "missing required input",
    );
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("should propagate resendVerificationService error", async () => {
    //arrange
    (resendVerificationEmailService as jest.Mock).mockRejectedValue(
      new Error("something went wrong"),
    );

    //act + assert
    expect(
      resendVerificationEmail(req as Request, res as Response),
    ).rejects.toThrow("something went wrong");

    expect(resendVerificationEmailService).toHaveBeenCalled();
    expect(sendVerificationEmail).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
  it("should return error if email is not sent", async () => {
    //arrange
    (resendVerificationEmailService as jest.Mock).mockResolvedValue({
      name: "Anthony",
      email: "test@gmail.com",
      verificationToken: "test_verification_token",
    });
    (sendVerificationEmail as jest.Mock).mockRejectedValue(
      new Error("failed to send email"),
    );

    // act + assert
    await expect(
      resendVerificationEmail(req as Request, res as Response),
    ).rejects.toThrow("failed to send email");
    expect(resendVerificationEmailService).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
