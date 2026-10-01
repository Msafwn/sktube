import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../utils/redis.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Helper: Create Redis Store instance for Rate Limiting
 */
const createStore = (prefix) => {
    return new RedisStore({
        sendCommand: (...args) => redis.call(...args),
        prefix: `rl:${prefix}:`
    });
};

/**
 * 1. General API Rate Limiter
 * Applied across all /api/v1/ routes
 * Limit: 100 requests per 15 minutes per IP (Backed by Redis)
 */
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Max 100 requests per window
    standardHeaders: 'draft-8', // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    store: createStore("general"),
    passOnStoreError: true, // Fail-safe: if Redis fails, requests continue without crashing
    handler: (req, res, next) => {
        next(new ApiError(429, "Too many requests from this IP, please try again after 15 minutes."));
    },
});

/**
 * 2. Strict Authentication Rate Limiter
 * Applied to sensitive Auth routes (/api/v1/users/login, /api/v1/users/register)
 * Limit: 20 failed attempts per 15 minutes per IP (Backed by Redis)
 * Protects against brute-force password cracking while allowing account-level lockout flow
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 20, // Max 20 attempts per IP
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Only count failed attempts towards the limit
    store: createStore("auth"),
    passOnStoreError: true,
    handler: (req, res, next) => {
        next(new ApiError(429, "Too many login/registration attempts from this IP. Please wait 15 minutes before trying again."));
    },
});

/**
 * 3. Video / Media Upload Rate Limiter
 * Applied to media upload endpoints (/api/v1/videos/publish, etc.)
 * Limit: 15 uploads per hour per IP (Backed by Redis)
 */
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 15,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    store: createStore("upload"),
    passOnStoreError: true,
    handler: (req, res, next) => {
        next(new ApiError(429, "Upload limit reached. You can only upload 15 videos per hour."));
    },
});
