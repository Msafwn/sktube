// Standard ApiResponse utility import kar rahe hain
import { ApiResponse } from "../utils/ApiResponse.js";

// Async error handler wrapper import kar rahe hain
import { asyncHandler } from "../utils/AsyncHandle.js";

/**
 * =========================================================================
 * Controller: Health Check
 * Kaam: Check karna ke backend server aur API running condition mein hai ya nahi
 * Method: GET | Route: /api/v1/healthcheck
 * =========================================================================
 */
const healthcheck = asyncHandler(async (req, res) => {
    // Server status "healthy" aur process uptime (server kitni dair se chal raha hai) response mein bhej rahe hain
    return res
        .status(200)
        .json(
            new ApiResponse(200, { status: "healthy", uptime: process.uptime() }, "Server is up and running")
        );
});

// healthcheck controller export kiya
export { healthcheck };
