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
import { authenticateUser, authorizeRoles, optionalAuthentication } from "../middlewares/authenticate";
import { asyncHandler } from "../middlewares/async-handler";

import requestWorkflowRouter from "./requestWorkflow.route";
import { trackingLimit } from "./tracking";
const router = Router();
router.use(requestWorkflowRouter);

router.post("/", optionalAuthentication, asyncHandler(createRequestController));
router.post(
  "/claim/:id",
  authenticateUser,
  trackingLimit,
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
  trackingLimit,
  asyncHandler(getMyRequestByTrackingIdController),
);
router.post("/track/:trackingId", trackingLimit, asyncHandler(getMyRequestByTrackingIdController));
router.put("/:id", authenticateUser, authorizeRoles("ADMIN"), asyncHandler(updateRequestController));
router.delete("/:id", authenticateUser, authorizeRoles("ADMIN"), asyncHandler(deleteRequestController));

export default router;
