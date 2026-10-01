import { Router } from "express";
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js";
import { verifyJWT, verifyOptionalJWT } from "../Middlewares/auth.middleware.js";
import { actionThrottler } from "../Middlewares/throttler.middleware.js";
import { redisCache } from "../utils/redis.js";

const router = Router();

// Publicly get video comments (with optional user auth for isLiked) / Protected add comment
router
    .route("/:videoId")
    .get(verifyOptionalJWT, redisCache(30, { userScoped: true }), getVideoComments)
    .post(verifyJWT, actionThrottler, addComment);

// Protected update and delete comment
router
    .route("/c/:commentId")
    .patch(verifyJWT, updateComment)
    .delete(verifyJWT, deleteComment);

export default router;
