import { Router } from "express";
import { authenticateUser, authorizeRoles } from "../middlewares/authenticate";
import { asyncHandler } from "../middlewares/async-handler";
import { trackingLimit } from "./tracking";
import { stopRequestWhatsAppController, getRequestWorkspaceController, addRequestMessageController, sendRequestQuoteController, decideRequestQuoteController, searchFlightOffersController, searchAirportsController } from "./requestWorkflow.controller";

const router = Router();
router.route("/:id/workspace").get(authenticateUser, asyncHandler(getRequestWorkspaceController));
router.route("/:id/messages").post(authenticateUser, asyncHandler(addRequestMessageController));
router.route("/:id/quote").put(authenticateUser, authorizeRoles("ADMIN"), asyncHandler(sendRequestQuoteController));
router.route("/:id/quote/decision").post(authenticateUser, asyncHandler(decideRequestQuoteController));
router.route("/flight-search").get(authenticateUser, authorizeRoles("ADMIN"), asyncHandler(searchFlightOffersController));
router.route("/airports").get(authenticateUser, authorizeRoles("ADMIN"), asyncHandler(searchAirportsController));
router.route("/track/:trackingId/stop-whatsapp").post(trackingLimit, asyncHandler(stopRequestWhatsAppController));
export default router;
