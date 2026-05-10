import {
  getAllUsers,
  getCurrentUser,
  getSingleUser,
  getUserMetrics,
  deleteUser,
} from "./user.controller";
import { Router } from "express";
import { authenticateUser, authorizeRoles } from "../middlewares/authenticate";
import { asyncHandler } from "../middlewares/async-handler";

const router = Router();

router
  .route("/")
  .get(authenticateUser, authorizeRoles("ADMIN"), asyncHandler(getAllUsers));

router
  .route("/metrics")
  .get(authenticateUser, authorizeRoles("ADMIN"), asyncHandler(getUserMetrics));

// router
//   .route("/admins")
//   .get(authenticateUser, authorizeRoles("ADMIN"), asyncHandler(getAllAdmins));

router
  .route("/current-user")
  .get(authenticateUser, asyncHandler(getCurrentUser));

router
  .route("/:id")
  .get(authenticateUser, authorizeRoles("ADMIN"), asyncHandler(getSingleUser));
router
  .route("/:id")
  .delete(authenticateUser, authorizeRoles("ADMIN"), asyncHandler(deleteUser));

export default router;
