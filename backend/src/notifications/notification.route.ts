import { Router } from "express";
import { authenticateUser, authorizeRoles } from "../middlewares/authenticate";
import { asyncHandler } from "../middlewares/async-handler";
import {
  getNotificationsController, markNotificationReadController, markAllNotificationsReadController,
  getNotificationPreferencesController, updateNotificationPreferencesController, getNotificationChannelStatusController,
} from "./notification.controller";

const router = Router();
router.use(authenticateUser);
router.route("/").get(asyncHandler(getNotificationsController));
router.route("/preferences").get(asyncHandler(getNotificationPreferencesController)).put(asyncHandler(updateNotificationPreferencesController));
router.route("/channels").get(authorizeRoles("ADMIN"), asyncHandler(getNotificationChannelStatusController));
router.route("/read-all").patch(asyncHandler(markAllNotificationsReadController));
router.route("/:id/read").patch(asyncHandler(markNotificationReadController));
export default router;
