import { Router } from "express";
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";

const router = Router();

// Toggle Subscription (Protected) & Get Channel Subscribers
router
    .route("/c/:channelId")
    .get(getUserChannelSubscribers)
    .post(verifyJWT, toggleSubscription);

// Get All Channels Subscribed by User
router.route("/u/:subscriberId").get(getSubscribedChannels);

export default router;
