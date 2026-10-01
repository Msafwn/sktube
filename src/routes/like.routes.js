import { Router } from "express";
import {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
} from "../controllers/like.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { actionThrottler } from "../Middlewares/throttler.middleware.js";

const router = Router();

// Sabhi like routes protected hain (verifyJWT required + actionThrottler against spam)
router.use(verifyJWT, actionThrottler);

// Toggle Video Like
router.route("/toggle/v/:videoId").post(toggleVideoLike);

// Toggle Comment Like
router.route("/toggle/c/:commentId").post(toggleCommentLike);

// Toggle Tweet Like
router.route("/toggle/t/:tweetId").post(toggleTweetLike);

// Get All Liked Videos by Current User
router.route("/videos").get(getLikedVideos);

export default router;
