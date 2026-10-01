import Redis from "ioredis";

/**
 * =========================================================================
 * Redis Connection & Fail-Safe Cache Service
 * Provides in-memory sub-millisecond query caching with automatic
 * error recovery (falls back to database seamlessly if Redis is offline).
 * =========================================================================
 */

const redisUri = process.env.REDIS_URI || "redis://127.0.0.1:6379";
const isTest = process.env.NODE_ENV === "test";

export const redis = isTest
    ? {
        call: async () => null,
        get: async () => null,
        set: async () => "OK",
        del: async () => 1,
        disconnect: () => {},
        status: "close",
        on: () => {},
        scanStream: () => ({ on: () => {} }),
        pipeline: () => ({ del: () => {}, exec: async () => [] })
    }
    : new Redis(redisUri, {
        maxRetriesPerRequest: 2,
        enableReadyCheck: true,
        retryStrategy(times) {
            // Exponential backoff capped at 3 seconds
            const delay = Math.min(times * 150, 3000);
            return delay;
        }
    });

let isRedisConnected = false;

if (!isTest) {
    redis.on("connect", () => {
        isRedisConnected = true;
        console.log("⚡ [Redis]: Connected to Redis Server successfully.");
    });

    redis.on("ready", () => {
        isRedisConnected = true;
        console.log("⚡ [Redis]: Ready to accept commands.");
    });

    redis.on("error", (err) => {
        isRedisConnected = false;
        console.warn("⚠️ [Redis]: Connection warning (falling back to database):", err.message || err);
    });

    redis.on("close", () => {
        isRedisConnected = false;
    });
}

/**
 * Middleware: redisCache(durationSeconds)
 * Caches GET API responses in Redis.
 * If cached: returns instant response with X-Cache: HIT header.
 * If not cached: fetches from DB, caches in Redis, returns with X-Cache: MISS.
 */
export const redisCache = (durationSeconds = 120, options = {}) => {
    const isUserScoped = options.userScoped ?? false;

    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== "GET" || !isRedisConnected) {
            return next();
        }

        const userSuffix = isUserScoped ? `:user:${req.user?._id?.toString() || "guest"}` : "";
        const cacheKey = `cache:${req.originalUrl || req.url}${userSuffix}`;

        try {
            const cachedData = await redis.get(cacheKey);

            if (cachedData) {
                res.setHeader("X-Cache", "HIT");
                res.setHeader("X-Cache-TTL", `${durationSeconds}s`);
                return res.status(200).json(JSON.parse(cachedData));
            }

            res.setHeader("X-Cache", "MISS");

            // Intercept res.json to store the response in Redis
            const originalJson = res.json.bind(res);

            res.json = (body) => {
                if (res.statusCode === 200 && body?.success !== false) {
                    redis
                        .set(cacheKey, JSON.stringify(body), "EX", durationSeconds)
                        .catch((err) => console.warn("⚠️ [Redis]: Failed to set cache key:", err.message));
                }
                return originalJson(body);
            };

            next();
        } catch (error) {
            console.warn("⚠️ [Redis Cache Middleware Error]:", error.message);
            next();
        }
    };
};

/**
 * Helper: clearRedisCache(pattern)
 * Flushes all cache keys matching a pattern (e.g. "cache:/api/v1/videos*")
 * Useful on publish, update, and delete actions.
 */
export const clearRedisCache = async (pattern = "cache:/api/v1/videos*") => {
    if (!isRedisConnected) return;

    try {
        const stream = redis.scanStream({
            match: pattern,
            count: 100
        });

        stream.on("data", async (keys) => {
            if (keys.length > 0) {
                const pipeline = redis.pipeline();
                keys.forEach((key) => pipeline.del(key));
                await pipeline.exec();
            }
        });

        stream.on("error", (err) => {
            console.warn("⚠️ [Redis]: Cache clear stream warning:", err.message);
        });
    } catch (err) {
        console.warn("⚠️ [Redis]: clearRedisCache error:", err.message);
    }
};
