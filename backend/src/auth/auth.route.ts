import { Router } from "express";
import {
  register,
  login,
  logout,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
} from "./auth.controller";
import { authenticateUser } from "../middlewares/authenticate";
import { asyncHandler } from "../middlewares/async-handler";
import { validate } from "../middlewares/validator.middleware";
import { registerSchema, loginSchema, verifyEmailSchema,resendVerificationEmailSchema,forgotPasswordSchema, resetPasswordSchema } from "../validator/auth.validation";
const router = Router();

router.post("/register",validate(registerSchema) ,asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));
router.delete("/logout", authenticateUser, asyncHandler(logout));
router.post("/verify-email", asyncHandler(verifyEmail));
router.post("/forgot-password", validate(forgotPasswordSchema), asyncHandler(forgotPassword));
router.post("/reset-password", validate(resetPasswordSchema), asyncHandler(resetPassword));
router.post(
  "/resend-verification-email",
  validate(resendVerificationEmailSchema),
  asyncHandler(resendVerificationEmail),
);

export default router;
