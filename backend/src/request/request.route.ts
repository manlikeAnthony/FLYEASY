import { Router } from "express";
import {
  createRequestController,
  getAllRequestsController,
  getRequestByIdController,
  getMyRequestsController,
  getMyRequestByTrackingIdController,
  claimRequestController,
  getRequestMetricsController,
  updateRequestController,
  deleteRequestController,
} from "./request.controller";
import { authenticateUser, authorizeRoles } from "../middlewares/authenticate";
import { asyncHandler } from "../middlewares/async-handler";

const router = Router();

router.post("/", asyncHandler(createRequestController));
router.post(
  "/claim/:id",
  authenticateUser,
  asyncHandler(claimRequestController),
);
router.get(
  "/metrics",
  authenticateUser,
  authorizeRoles("ADMIN"),
  asyncHandler(getRequestMetricsController),
);
router.get(
  "/",
  authenticateUser,
  authorizeRoles("ADMIN"),
  asyncHandler(getAllRequestsController),
);
router.get("/my", authenticateUser, asyncHandler(getMyRequestsController));
router.get("/:id", asyncHandler(getRequestByIdController));
router.get(
  "/track/:trackingId",
  asyncHandler(getMyRequestByTrackingIdController),
);
router.put("/:id", asyncHandler(updateRequestController));
router.delete("/:id", asyncHandler(deleteRequestController));

export default router;
