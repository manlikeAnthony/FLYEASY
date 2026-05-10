import { verifyEmail } from "../../auth.controller";
import { Request, Response } from "express";
import { verifyEmailService } from "../../../services/auth.service";
import { HttpCodes } from "../../../errors/HttpCodes";
import { AppCodes } from "../../../errors/AppCodes";
import { CustomError } from "../../../errors/CustomError";

jest.mock("../../../services/auth.service");

describe("Verify Email Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: {
        token: "verification-token-123",
        email: "test@gmail.com",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should verify email and return success response", async () => {
    // arrange
    (verifyEmailService as jest.Mock).mockResolvedValue(true);
    // act
    await verifyEmail(req as Request, res as Response);
    // assert
    expect(res.status).toHaveBeenCalledWith(HttpCodes.OK);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Email verified successfully",
        data: true,
        code: AppCodes.USER_VERIFIED,
      }),
    );
  });

  it("should handle errors thrown by verifyEmailService", async () => {
    // arrange

    (verifyEmailService as jest.Mock).mockRejectedValue(
      new Error("something went wrong"),
    );

    // act and assert
    await expect(verifyEmail(req as Request, res as Response)).rejects.toThrow(
      "something went wrong",
    );

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("should handle missing token or email", async () => {
    // arrange
    req.body.token = "";
    req.body.email = "";
    // act and assert
    await expect(verifyEmail(req as Request, res as Response)).rejects.toThrow(
      "missing required input",
    );
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
