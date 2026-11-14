import { Router } from "express";
import { authenticateUser, authorizeRoles } from "../middlewares/authenticate";
import { asyncHandler } from "../middlewares/async-handler";
import { getOwnerContactController, updateOwnerContactController } from "./contact.controller";

const router = Router();
router.route("/")
  .get(asyncHandler(getOwnerContactController))
  .put(authenticateUser, authorizeRoles("ADMIN"), asyncHandler(updateOwnerContactController));
export default router;
