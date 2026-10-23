import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandle.js";

/**
 * =========================================================================
 * Controller: Health Check
 * Kaam: Check karna ke backend server aur API running condition mein hai ya nahi
 * Method: GET | Route: /api/v1/healthcheck
 * =========================================================================
 */
const healthcheck = asyncHandler(async (req, res) => {
    const isDbConnected = mongoose.connection.readyState === 1;

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    status: "healthy",
                    uptime: process.uptime(),
                    timestamp: new Date().toISOString(),
                    database: isDbConnected ? "connected" : "disconnected"
                },
                "Server is up and running"
            )
        );
});

export { healthcheck };
