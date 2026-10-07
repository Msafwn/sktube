// Async error handling wrapper import kar rahe hain
import { asyncHandler } from "../utils/AsyncHandle.js";

// Custom ApiError class error responses handle karne ke liye
import { ApiError } from "../utils/ApiError.js";

// Standard ApiResponse class JSON responses return karne ke liye
import { ApiResponse } from "../utils/ApiResponse.js";

// User database model import kar rahe hain
import { User } from "../Models/User.model.js";
import { Subscription } from "../Models/Subscription.model.js";

// Redis Cache & Invalidation Helpers
import { redis, clearRedisCache } from "../utils/redis.js";

// Cloudinary upload aur delete helper functions
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/Cloudinary.js";

// Mongoose library MongoDB ObjectId aur Aggregation ke liye
import mongoose from "mongoose";

// JSON Web Token library JWT verification ke liye
import jwt from "jsonwebtoken";

// Node.js local file system module
import fs from "fs";

// Google OAuth 2.0 Client
import { OAuth2Client } from "google-auth-library";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Helper: Agar controller validation fail ho jaye to Multer ki upload ki hui local temporary files delete karna
 */
const cleanupLocalFiles = (files) => {
    if (!files) return;
    try {
        Object.values(files).forEach((fileArray) => {
            if (Array.isArray(fileArray)) {
                fileArray.forEach((file) => {
                    if (file?.path && fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path); // Server disk se temporary file delete karna
                    }
                });
            }
        });
    } catch (err) {
        console.error("Error cleaning up local files:", err);
    }
};

/**
 * Helper: User ke liye Access Token aur Refresh Token generate karna aur DB mein refresh token save karna
 */
const generateAccessAndRefreshToken = async (userId) => {
    try {
        // 1. User document find karein
        const user = await User.findById(userId);

        // 2. User model ke methods se Access & Refresh Token generate karein
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // 3. User document mein naya refreshToken save karein
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // 4. Dono tokens return karein
        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
};

/**
 * =========================================================================
 * Controller 1: Register User (Naya Account Create Karna)
 * Kaam: Form data validate karna, avatar/cover Cloudinary par upload karna, aur database me user banana
 * Method: POST | Route: /api/v1/users/register | Middleware: upload.fields
 * =========================================================================
 */
const registerUser = asyncHandler(async (req, res) => {
    // 1. Request body se text fields extract kiye
    const { username, fullName, password, email } = req.body || {};

    // 2. Text fields validation: Koi bhi required field khali na ho
    const missingFields = [];
    if (!email || email.trim() === "") missingFields.push("email");
    if (!fullName || fullName.trim() === "") missingFields.push("fullName");
    if (!username || username.trim() === "") missingFields.push("username");
    if (!password || password.trim() === "") missingFields.push("password");

    if (missingFields.length > 0) {
        cleanupLocalFiles(req.files);
        throw new ApiError(400, `The following required fields are missing: ${missingFields.join(", ")}`);
    }

    // 3. Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        cleanupLocalFiles(req.files);
        throw new ApiError(400, "Please enter a valid email address.");
    }

    // 4. Password aur Username length checks
    if (password.length < 8) {
        cleanupLocalFiles(req.files);
        throw new ApiError(400, "Password must be at least 8 characters long");
    }

    if (username.length < 3) {
        cleanupLocalFiles(req.files);
        throw new ApiError(400, "Username must be at least 3 characters long");
    }

    // 5. Check if user already exists (by email or username)
    const userExist = await User.findOne({
        $or: [{ email: email.toLowerCase().trim() }, { username: username.toLowerCase().trim() }]
    });

    if (userExist) {
        cleanupLocalFiles(req.files);
        throw new ApiError(409, "An account with this email or username already exists.");
    }

    // 6. Multer uploaded files paths get karein
    let avatarLocalPath;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path;
    }

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        cleanupLocalFiles(req.files);
        throw new ApiError(400, "Profile avatar image is required.");
    }

    // 7. Cloudinary par avatar aur optional coverImage upload karein
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed on Cloudinary");
    }

    // 8. User document database mein create karein (Password automatically bcrypt se hash ho jayega)
    const user = await User.create({
        username: username.toLowerCase().trim(),
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        password,
        avatar: avatar.secure_url || avatar.url,
        coverImage: coverImage?.secure_url || coverImage?.url || ""
    });

    // 9. Created user fetch karein aur sensitive fields (password, refreshToken) hide karein
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // 10. 201 Created response send karein
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

/**
 * =========================================================================
 * Controller 2: Login User (Account Login Karna)
 * Kaam: Credentials check karna, JWT Access & Refresh token issue karna aur Cookies set karna
 * Method: POST | Route: /api/v1/users/login
 * =========================================================================
 */
const loginUser = asyncHandler(async (req, res) => {
    // 1. Request body se email/username aur password extract karein
    const { email, username, password } = req.body || {};

    // 2. Validation
    if (!(username || email)) {
        throw new ApiError(400, "Username or email is required.");
    }

    if (!password) {
        throw new ApiError(400, "Password is required.");
    }

    // 3. User ko find karein (email ya username se)
    const user = await User.findOne({
        $or: [
            { username: username?.toLowerCase().trim() },
            { email: email?.toLowerCase().trim() }
        ]
    });

    // 4. Check if account is currently temporarily locked
    if (user && user.lockUntil && user.lockUntil > Date.now()) {
        const remainingMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / (1000 * 60));
        throw new ApiError(
            423,
            `Account is temporarily locked due to multiple failed login attempts. Please try again after ${remainingMinutes} minute(s).`
        );
    }

    // Agar lock ka waqt guzar chuka hai to attempts reset karein
    if (user && user.lockUntil && user.lockUntil <= Date.now()) {
        user.failedLoginAttempts = 0;
        user.lockUntil = null;
    }

    // 5. Password verification & Failed attempts tracking
    const isPasswordValid = user ? await user.isPasswordCorrect(password) : false;

    if (!user || !isPasswordValid) {
        if (user) {
            const attempts = (user.failedLoginAttempts || 0) + 1;
            user.failedLoginAttempts = attempts;

            // 10 attempts poori hone par 15 minute ke liye account block karein
            if (attempts >= 10) {
                user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 Minutes lockout
                user.failedLoginAttempts = 10;
                await user.save({ validateBeforeSave: false });

                throw new ApiError(
                    423,
                    "Account locked! You have exceeded 10 failed login attempts. Your account has been temporarily blocked for 15 minutes."
                );
            }

            // 6 attempts ke baad (7th, 8th, 9th attempt) user ko warning show karein
            if (attempts > 6) {
                const remainingAttempts = 10 - attempts;
                await user.save({ validateBeforeSave: false });

                throw new ApiError(
                    401,
                    `Invalid credentials. Warning: Your account will be temporarily blocked after 10 failed attempts (${remainingAttempts} attempt(s) remaining).`
                );
            }

            // Pehli 6 attempts par standard generic message
            await user.save({ validateBeforeSave: false });
        }

        throw new ApiError(401, "Invalid user credentials");
    }

    // 6. Successful Login: Agar user pehle ghalat attempts kar chuka tha to reset karein
    if (user.failedLoginAttempts > 0 || user.lockUntil) {
        user.failedLoginAttempts = 0;
        user.lockUntil = null;
        await user.save({ validateBeforeSave: false });
    }

    // 7. Access aur Refresh Token generate karein
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // 6. Response ke liye user object se sensitive fields exclude karein
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // 7. Hardened Secure cookie options (1 Day for Access Token, 10 Days for Refresh Token)
    const baseCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        path: "/"
    };

    const accessTokenOptions = {
        ...baseCookieOptions,
        maxAge: 24 * 60 * 60 * 1000 // 1 Day
    };

    const refreshTokenOptions = {
        ...baseCookieOptions,
        maxAge: 10 * 24 * 60 * 60 * 1000 // 10 Days
    };

    // 8. Cookies set karein aur 200 OK ke sath response return karein
    return res
        .status(200)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser
                },
                "User logged in successfully"
            )
        );
});

/**
 * =========================================================================
 * Controller 3: Logout User (Account Logout Karna)
 * Kaam: Database se refreshToken unset karna aur client cookies clear karna
 * Method: POST | Route: /api/v1/users/logout | Middleware: verifyJWT
 * =========================================================================
 */
const logoutUser = asyncHandler(async (req, res) => {
    // 1. Database se logged-in user ka refreshToken remove karein
    if (req.user?._id) {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1 // Field completely delete kar di
                }
            },
            {
                new: true
            }
        );
    }

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        path: "/"
    };

    // Invalidate cached auth user session in Redis
    if (req.user?._id) {
        clearRedisCache(`cache:auth:user:${req.user._id}*`);
    }

    // 2. Client browser ki cookies clear karein
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out successfully")
        );
});

/**
 * =========================================================================
 * Controller 4: Refresh Access Token (Expired Session Refresh Karna)
 * Kaam: Refresh token verify karke naya access token aur refresh token issue karna
 * Method: POST | Route: /api/v1/users/refresh-token
 * =========================================================================
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
    // 1. Cookies ya body se incoming refresh token nikaala
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request: Refresh token is required");
    }

    try {
        // 2. JWT verify karein secret key ke sath
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        // 3. User document find karein
        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid or expired session token");
        }

        // 4. Match verify karein (Agar user exists aur valid signature hai to tokens refresh karein)
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

        const baseCookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            path: "/"
        };

        const accessTokenOptions = {
            ...baseCookieOptions,
            maxAge: 24 * 60 * 60 * 1000 // 1 Day
        };

        const refreshTokenOptions = {
            ...baseCookieOptions,
            maxAge: 10 * 24 * 60 * 60 * 1000 // 10 Days
        };

        // 5. Cookies set karein aur naye tokens return karein
        return res
            .status(200)
            .cookie("accessToken", accessToken, accessTokenOptions)
            .cookie("refreshToken", newRefreshToken, refreshTokenOptions)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken
                    },
                    "Access token refreshed successfully"
                )
            );

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token");
    }
});

/**
 * =========================================================================
 * Controller 5: Change Current Password (Password Tabdeel Karna)
 * Kaam: Purana password verify karke naya password database me save karna
 * Method: POST | Route: /api/v1/users/change-password | Middleware: verifyJWT
 * =========================================================================
 */
const changeCurrentPassword = asyncHandler(async (req, res) => {
    // 1. Request body se passwords nikaalein
    const { oldPassword, newPassword } = req.body || {};

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Both old password and new password are required");
    }

    if (newPassword.length < 8) {
        throw new ApiError(400, "New password must be at least 8 characters long");
    }

    // 2. User DB se find karein
    const user = await User.findById(req.user?._id);

    // 3. Old password compare karein
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Current password entered is incorrect.");
    }

    // 4. Naya password assign karein (pre-save hook hash karega)
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    // Invalidate cached auth user session in Redis
    clearRedisCache(`cache:auth:user:${req.user._id}*`);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

/**
 * =========================================================================
 * Controller 6: Get Current User (Logged-In User Profile Profile Data)
 * Kaam: verifyJWT ke zariye req.user ko return karna
 * Method: GET | Route: /api/v1/users/current-user | Middleware: verifyJWT
 * =========================================================================
 */
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

/**
 * =========================================================================
 * Controller 7: Update Account Details (Name Aur Email Update Karna)
 * Kaam: User ka fullName aur email database mein update karna
 * Method: PATCH | Route: /api/v1/users/update-account | Middleware: verifyJWT
 * =========================================================================
 */
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body || {};

    if (!fullName || !email) {
        throw new ApiError(400, "All fields (fullName, email) are required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format");
    }

    // User document update karein
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName.trim(),
                email: email.toLowerCase().trim()
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    // Invalidate cached channel profile and auth user session
    if (user?.username) {
        clearRedisCache(`cache:channel:${user.username.toLowerCase()}*`);
    }
    clearRedisCache(`cache:auth:user:${req.user?._id}*`);

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));
});

/**
 * =========================================================================
 * Controller 8: Update User Avatar (Profile Picture Change Karna)
 * Kaam: Naya avatar Cloudinary par upload karna aur purana avatar delete karna
 * Method: PATCH | Route: /api/v1/users/avatar | Middleware: verifyJWT, upload.single
 * =========================================================================
 */
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // 1. Purana avatar URL save karein
    const oldAvatarUrl = req.user?.avatar;

    // 2. Naya avatar Cloudinary par upload karein
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    const avatarUrl = avatar?.secure_url || avatar?.url;

    if (!avatarUrl) {
        throw new ApiError(400, "Error while uploading avatar to Cloudinary");
    }

    // 3. Database mein naya avatar URL update karein
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatarUrl
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    // 4. Purana avatar Cloudinary se delete karein
    if (oldAvatarUrl) {
        await deleteFromCloudinary(oldAvatarUrl);
    }

    // Invalidate cached channel profile and auth user session
    if (user?.username || req.user?.username) {
        const u = user?.username || req.user?.username;
        clearRedisCache(`cache:channel:${u.toLowerCase()}*`);
    }
    clearRedisCache(`cache:auth:user:${req.user?._id}*`);

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

/**
 * =========================================================================
 * Controller 9: Update User Cover Image (Channel Banner Change Karna)
 * Kaam: Nayi cover image upload karna aur purani cover image delete karna
 * Method: PATCH | Route: /api/v1/users/cover-image | Middleware: verifyJWT, upload.single
 * =========================================================================
 */
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is required");
    }

    const oldCoverImageUrl = req.user?.coverImage;

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    const coverImageUrl = coverImage?.secure_url || coverImage?.url;

    if (!coverImageUrl) {
        throw new ApiError(400, "Error while uploading cover image to Cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImageUrl
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    if (oldCoverImageUrl) {
        await deleteFromCloudinary(oldCoverImageUrl);
    }

    // Invalidate cached channel profile and auth user session
    if (user?.username || req.user?.username) {
        const u = user?.username || req.user?.username;
        clearRedisCache(`cache:channel:${u.toLowerCase()}*`);
    }
    clearRedisCache(`cache:auth:user:${req.user?._id}*`);

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover image updated successfully"));
});

/**
 * =========================================================================
 * Controller 10: Get User Channel Profile (Channel Page Profile Stats)
 * Kaam: Username se channel ke subscribers count, subscribedTo count aur isSubscribed boolean fetch karna
 * Method: GET | Route: /api/v1/users/c/:username | Middleware: verifyJWT
 * =========================================================================
 */
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing in URL parameter");
    }

    const cleanUsername = username.toLowerCase().trim();
    const cacheKey = `cache:channel:${cleanUsername}`;

    let baseChannel = null;
    let isCacheHit = false;

    // 1. Redis Cache check for base channel data (skips heavy subscriptions joins)
    try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            baseChannel = JSON.parse(cachedData);
            isCacheHit = true;
        }
    } catch (err) {
        // Fail-safe: fallback to MongoDB
    }

    // 2. Cache miss: fetch from MongoDB via aggregation pipeline
    if (!baseChannel) {
        const channel = await User.aggregate([
            // Step A: Username match karein
            {
                $match: {
                    username: cleanUsername
                }
            },
            // Step B: Subscriptions collection se channel ke subscribers join karein
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            // Step C: Channels join karein jin ko is user ne subscribe kiya hai
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo"
                }
            },
            // Step D: Total subscriber counts calculate karein
            {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers"
                    },
                    channelsSubscribedToCount: {
                        $size: "$subscribedTo"
                    }
                }
            },
            // Step E: Response project karein
            {
                $project: {
                    fullName: 1,
                    username: 1,
                    subscribersCount: 1,
                    channelsSubscribedToCount: 1,
                    avatar: 1,
                    coverImage: 1,
                    email: 1,
                    createdAt: 1
                }
            }
        ]);

        if (!channel?.length) {
            throw new ApiError(404, "Channel does not exist");
        }

        baseChannel = channel[0];

        // Redis mein base channel cache karein (120 seconds TTL)
        redis.set(cacheKey, JSON.stringify(baseChannel), "EX", 120).catch(() => {});
    }

    // 3. User-Specific Dynamic State (isSubscribed)
    // Evaluated via ultra-fast indexed query (< 0.5ms) to prevent cross-user state leaks
    let isSubscribed = false;
    if (req.user?._id) {
        const subExists = await Subscription.exists({
            channel: baseChannel._id,
            subscriber: req.user._id
        });
        isSubscribed = Boolean(subExists);
    }

    const finalChannel = {
        ...baseChannel,
        isSubscribed
    };

    res.setHeader("X-Cache", isCacheHit ? "HIT" : "MISS");
    res.setHeader("X-Cache-TTL", "120s");

    return res
        .status(200)
        .json(
            new ApiResponse(200, finalChannel, "User channel profile fetched successfully")
        );
});

/**
 * =========================================================================
 * Controller 11: Get Watch History (User Ki Dekhi Hui Videos Ki History)
 * Kaam: User ki watch history array se videos aur unke creators fetch karna
 * Method: GET | Route: /api/v1/users/history | Middleware: verifyJWT
 * =========================================================================
 */
const getWatchHistory = asyncHandler(async (req, res) => {
    // Strict Pagination & Sanitized Parameters (Capped at 50 max limit)
    const { page = 1, limit = 50 } = req.query;
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 50)); // Strict max limit: 50
    const skip = (safePage - 1) * safeLimit;

    const user = await User.findById(req.user._id)
        .select({ watchHistory: { $slice: [skip, safeLimit] } })
        .populate({
            path: "watchHistory",
            select: "-viewedBy",
            populate: {
                path: "owner",
                select: "fullName username avatar"
            }
        })
        .lean();

    // Valid existing videos filter karein (agar koi deleted video ho to exclude ho jaye)
    const validHistory = (user?.watchHistory || []).filter(v => v !== null && v._id);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                validHistory,
                "User watch history fetched successfully"
            )
        );
});

/**
 * =========================================================================
 * Controller 12: Clear Watch History (User Ki Saari Watch History Clear Karna)
 * Method: DELETE | Route: /api/v1/users/history | Middleware: verifyJWT
 * =========================================================================
 */
const clearWatchHistory = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: { watchHistory: [] }
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Watch history cleared successfully"));
});

/**
 * =========================================================================
 * Controller 13: Remove Video From History (Ek Specific Video History Se Hatana)
 * Method: DELETE | Route: /api/v1/users/history/:videoId | Middleware: verifyJWT
 * =========================================================================
 */
const removeVideoFromWatchHistory = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    await User.findByIdAndUpdate(req.user._id, {
        $pull: { watchHistory: videoId }
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video removed from watch history successfully"));
});

/**
 * =========================================================================
 * Controller: Google OAuth 2.0 Login / Registration
 * Kaam: Google credential verify karna, existing user find karna ya naya banana, aur JWT tokens issue karna
 * Method: POST | Route: /api/v1/users/google-login
 * =========================================================================
 */
const googleLogin = asyncHandler(async (req, res) => {
    const { credential, idToken } = req.body || {};
    const token = credential || idToken;

    if (!token) {
        throw new ApiError(400, "Google credential token is required");
    }

    let payload;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        payload = ticket.getPayload();
    } catch (error) {
        throw new ApiError(401, "Google token verification failed: " + (error?.message || "Invalid Token"));
    }

    if (!payload || !payload.email) {
        throw new ApiError(400, "Invalid Google token payload");
    }

    const { sub: googleId, email, name, picture } = payload;

    // 1. Check if user exists by googleId or email
    let user = await User.findOne({
        $or: [{ googleId }, { email: email.toLowerCase().trim() }]
    });

    if (user) {
        // Agar user pehle normal email se bana tha aur googleId link nahi tha, to link karein
        if (!user.googleId) {
            user.googleId = googleId;
            if (!user.avatar) user.avatar = picture;
            await user.save({ validateBeforeSave: false });
        }
    } else {
        // Naya User create karein (Unique username generate karein)
        const baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
        let uniqueUsername = baseUsername;
        let counter = 1;
        while (await User.findOne({ username: uniqueUsername })) {
            uniqueUsername = `${baseUsername}${Math.floor(100 + Math.random() * 900)}${counter}`;
            counter++;
        }

        user = await User.create({
            username: uniqueUsername,
            fullName: name || "Google User",
            email: email.toLowerCase().trim(),
            avatar: picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
            coverImage: "",
            googleId
        });
    }

    // 2. Access aur Refresh Token generate karein
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // 3. User object se sensitive fields exclude karein
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // 4. Secure Cookies configure karein
    const baseCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        path: "/"
    };

    const accessTokenOptions = {
        ...baseCookieOptions,
        maxAge: 24 * 60 * 60 * 1000 // 1 Day
    };

    const refreshTokenOptions = {
        ...baseCookieOptions,
        maxAge: 10 * 24 * 60 * 60 * 1000 // 10 Days
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "Google login successful"
            )
        );
});

// Controllers export kiye
export {
    registerUser,
    loginUser,
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
    removeVideoFromWatchHistory,
    googleLogin
};