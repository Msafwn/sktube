import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import { ApiError } from "./utils/ApiError.js";
import { generalLimiter } from "./Middlewares/rateLimiter.middleware.js";
import { speedThrottler } from "./Middlewares/throttler.middleware.js";
import { securitySanitizer } from "./Middlewares/sanitize.middleware.js";

const app = express();

// Enable trust proxy for NGINX reverse proxy & accurate client IP in rate limiters
app.set("trust proxy", 1);

// Force HTTPS redirection in production environments (Strict 301 Permanent Redirect)
app.use((req, res, next) => {
    if (process.env.NODE_ENV === "production") {
        const isSecure = req.secure || req.headers["x-forwarded-proto"] === "https";
        if (!isSecure) {
            return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
        }
    }
    next();
});

// ==========================================
// 1. ENTERPRISE SECURITY & HEADERS (Helmet)
// ==========================================
// Apply Helmet for 15+ Secure HTTP Response Headers, HSTS enforcement & hide Express signature
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Disabled for Cloudinary video streaming & Socket.IO WebSockets
    hsts: {
        maxAge: 31536000, // 1 Year in seconds (Forces browser to strictly use HTTPS)
        includeSubDomains: true,
        preload: true
    }
}));

// CORS Configuration (Allow Web, Mobile App & Local Network IPs)
app.use(cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
}));

// ==========================================
// 2. BODY PARSING & LIMITS (DoS Prevention)
// ==========================================
// Request body JSON parsing (max: 16kb)
app.use(express.json({ limit: "16kb" }));

// URL-encoded form data parsing (max: 16kb)
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Static files (public folder)
app.use(express.static("Public"));

// Secure Cookies parsing (with signed cookie secret support)
app.use(cookieParser(process.env.COOKIE_SECRET || process.env.ACCESS_TOKEN_SECRET));

// ==========================================
// 3. DATA SANITIZATION & RATE LIMITING
// ==========================================
// Unified Express 5 Sanitizer: NoSQL Injection + XSS + Parameter Pollution (HPP)
app.use(securitySanitizer);

// Apply Speed Throttling & General Rate Limiter across all API endpoints
app.use("/api/v1", speedThrottler, generalLimiter);


// ==========================================
// 4. ROUTES IMPORT & DECLARATION
// ==========================================
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import likeRouter from "./routes/like.routes.js";
import commentRouter from "./routes/comment.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import notificationRouter from "./routes/notification.routes.js";

// Routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/notifications", notificationRouter);


// ==========================================
// 5. 404 & GLOBAL ERROR HANDLING
// ==========================================
// 404 Route Handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
            data: err.data
        });
    }

    return res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: [],
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});

export { app };