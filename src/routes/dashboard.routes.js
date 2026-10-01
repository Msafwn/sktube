import { Router } from "express";
import {
    getChannelStats,
    getChannelVideos
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { redisCache } from "../utils/redis.js";

const router = Router();

// Sabhi dashboard routes authenticated user ke liye hain
router.use(verifyJWT);

router.route("/stats").get(redisCache(60, { userScoped: true }), getChannelStats);
router.route("/videos").get(getChannelVideos);

export default router;
