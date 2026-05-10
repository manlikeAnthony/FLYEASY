import { register } from "../../auth.controller";
import { registerService } from "../../../services/auth.service";
import { sendVerificationEmail } from "../../../utils/email";
import { Request, response, Response } from "express";
import { HttpCodes } from "../../../errors/HttpCodes";
import { AppCodes } from "../../../errors/AppCodes";
import { CustomLogger } from "../../../logger/CustomLogger";

jest.mock("../../../utils/email");
jest.mock("../../../services/auth.service");

describe("Register Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      body: {
        name: "Anthony",
        email: "test@gmail.com",
        password: "secret",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.spyOn(CustomLogger, "info").mockImplementation(() => {});
    jest.spyOn(CustomLogger, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should register user and send email", async () => {
    const dto = {
      name: "Anthony",
      email: "test@gmail.com",
      password: "secret",
    };

    //arrange
    (registerService as jest.Mock).mockResolvedValue({
      user: dto,
      verificationToken: "token123",
    });

    //act
    await register(req as Request, res as Response);

    //assert
    expect(registerService).toHaveBeenCalledWith(dto);

    expect(sendVerificationEmail).toHaveBeenCalledWith({
      name: dto.name,
      email: dto.email,
      verificationToken: "token123",
      origin: "http://localhost:3000",
    });

    expect(res.status).toHaveBeenCalledWith(HttpCodes.CREATED);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message:
          "User registered successfully , Check your email to verify your account",
        data: null,
        code: AppCodes.USER_CREATED,
      }),
    );
    expect(res.json).toHaveBeenCalledTimes(1);
  });

  it("should propagate error if registerService fails", async () => {
    //arrange
    (registerService as jest.Mock).mockRejectedValue(
      new Error("something went wrong"),
    );

    //act
    await expect(register(req as Request, res as Response)).rejects.toThrow(
      "something went wrong",
    );

    expect(sendVerificationEmail).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should still successfully register user even if email sending fails", async () => {
    //arrange
    const dto = {
      name: "Anthony",
      email: "test@gmail.com",
      password: "secret",
    };

    //act
    (registerService as jest.Mock).mockResolvedValue({
      user: dto,
      verificationToken: "token123",
    });

    (sendVerificationEmail as jest.Mock).mockRejectedValue(
      new Error("Email service failed"),
    );

    await register(req as Request, res as Response);

    //assert
    expect(registerService).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(HttpCodes.CREATED);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message:
          "User registered successfully , Check your email to verify your account",
        data: null,
        code: AppCodes.USER_CREATED,
      }),
    );

    expect(CustomLogger.error).toHaveBeenCalledWith(
      "Error sending verification email:",
      expect.any(Error),
    );
    expect(res.json).toHaveBeenCalledTimes(1);
  });
});
