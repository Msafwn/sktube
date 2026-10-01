import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandle.js";
import jwt from "jsonwebtoken";
import { User } from "../Models/User.model.js";
import { redis } from "../utils/redis.js";

// Cache authenticated user session in Redis for 5 minutes (300s)
const AUTH_CACHE_TTL = 300;

/**
 * Middleware: Verify JWT Access Token (With Redis Session Caching)
 * Request cookies ya Authorization Bearer header se token read karta hai,
 * Redis se sub-millisecond me user retrieve karta hai (DB query skip hoti hai),
 * aur valid user ko `req.user` par attach karta hai.
 */
export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        // 1. Cookie ya Authorization header se accessToken nikalen
        const token = 
            req.cookies?.accessToken || 
            req.header("Authorization")?.replace(/^Bearer\s+/i, "");

        if (!token) {
            throw new ApiError(401, "Unauthorized Request: No token provided");
        }

        // 2. Token signature verify karein (secret key ke zariye)
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userId = decodedToken?._id;

        if (!userId) {
            throw new ApiError(401, "Invalid access token payload");
        }

        const cacheKey = `cache:auth:user:${userId}`;
        let user = null;

        // 3. Pehle Redis Cache check karein (< 0.2ms)
        try {
            const cachedUser = await redis.get(cacheKey);
            if (cachedUser) {
                user = JSON.parse(cachedUser);
            }
        } catch (redisErr) {
            // Fail-safe: Redis fail hone par MongoDB fallback karega
        }

        // 4. Agar Redis mein nahi hai toh MongoDB se fetch karein
        if (!user) {
            user = await User.findById(userId).select("-password -refreshToken").lean();

            if (!user) {
                throw new ApiError(401, "Invalid or expired access token");
            }

            // User ko Redis mein cache karein
            redis.set(cacheKey, JSON.stringify(user), "EX", AUTH_CACHE_TTL).catch(() => {});
        }

        // 5. Authenticated user ko request object par attach kar dein
        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
});

/**
 * Middleware: Verify Optional JWT Access Token (With Redis Session Caching)
 * Agar token mojood hai to req.user attach karega, agar nahi to baghair error ke next() call karega
 */
export const verifyOptionalJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = 
            req.cookies?.accessToken || 
            req.header("Authorization")?.replace(/^Bearer\s+/i, "");

        if (token) {
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const userId = decodedToken?._id;

            if (userId) {
                const cacheKey = `cache:auth:user:${userId}`;
                let user = null;

                try {
                    const cachedUser = await redis.get(cacheKey);
                    if (cachedUser) {
                        user = JSON.parse(cachedUser);
                    }
                } catch (e) {}

                if (!user) {
                    user = await User.findById(userId).select("-password -refreshToken").lean();
                    if (user) {
                        redis.set(cacheKey, JSON.stringify(user), "EX", AUTH_CACHE_TTL).catch(() => {});
                    }
                }

                if (user) {
                    req.user = user;
                }
            }
        }
    } catch (e) {
        // Ignore invalid token on optional routes
    }
    next();
});


