import { Router } from "express";
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controller.js";
import { verifyJWT, verifyOptionalJWT } from "../Middlewares/auth.middleware.js";
import { upload } from "../Middlewares/multer.middlewares.js";
import { uploadLimiter } from "../Middlewares/rateLimiter.middleware.js";
import { redisCache } from "../utils/redis.js";

const router = Router();

// ==========================================
// VIDEO ROUTES
// ==========================================

// Get All Videos (Public + 120s Redis Cache) & Publish Video (Secured + Rate Limited + Multer fields)
router
    .route("/")
    .get(redisCache(120), getAllVideos)
    .post(
        verifyJWT,
        uploadLimiter,
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1
            },
            {
                name: "thumbnail",
                maxCount: 1
            }
        ]),
        publishAVideo
    );

// Video operations by ID
router
    .route("/:videoId")
    .get(verifyOptionalJWT, getVideoById)
    .delete(verifyJWT, deleteVideo)
    .patch(verifyJWT, upload.single("thumbnail"), updateVideo);

// Toggle publish status (Public/Private)
router
    .route("/toggle/publish/:videoId")
    .patch(verifyJWT, togglePublishStatus);

export default router;
