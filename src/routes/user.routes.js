import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    googleLogin,
    logoutUser, 
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    clearWatchHistory,
    removeVideoFromWatchHistory
} from "../controllers/User.controller.js";
import { upload } from "../Middlewares/multer.middlewares.js";
import { verifyJWT, verifyOptionalJWT } from "../Middlewares/auth.middleware.js";
import { authLimiter } from "../Middlewares/rateLimiter.middleware.js";

const router = Router();

// ==========================================
// UNPROTECTED ROUTES (Public)
// ==========================================

// Register Route (Multipart/form-data for avatar & coverImage with strict rate limiting)
router.route("/register").post(
    authLimiter,
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

// Login Route (With strict brute-force rate limiting)
router.route("/login").post(authLimiter, loginUser);

// Google OAuth Login Route
router.route("/google-login").post(authLimiter, googleLogin);

// Refresh Access Token Route
router.route("/refresh-token").post(refreshAccessToken);


// ==========================================
// SECURED ROUTES (Protected by verifyJWT)
// ==========================================

// Logout Route
router.route("/logout").post(verifyJWT, logoutUser);

// Change Password Route
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

// Get Current Logged-in User Profile
router.route("/current-user").get(verifyJWT, getCurrentUser);

// Update Account Details (fullName, email)
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

// Update Avatar Image (Multipart/form-data with single "avatar" file)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

// Update Cover Image (Multipart/form-data with single "coverImage" file)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

// Get User Channel Profile by Username (Public + Optional Auth for isSubscribed)
router.route("/c/:username").get(verifyOptionalJWT, getUserChannelProfile);

// Get & Clear User Watch History
router.route("/history").get(verifyJWT, getWatchHistory).delete(verifyJWT, clearWatchHistory);

// Remove specific video from Watch History
router.route("/history/:videoId").delete(verifyJWT, removeVideoFromWatchHistory);

export default router;