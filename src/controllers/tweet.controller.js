// Mongoose aur ObjectId validation helper import kar rahe hain
import mongoose, { isValidObjectId } from "mongoose";

// Tweet model import kar rahe hain community posts database me save aur read karne ke liye
import { Tweet } from "../Models/Tweet.model.js";

// User model import kar rahe hain user details ke liye
import { User } from "../Models/User.model.js";

// Like model import kar rahe hain post likes count aur toggle karne ke liye
import { Like } from "../Models/Like.model.js";

// Notification model import kar rahe hain
import { Notification } from "../Models/Notification.model.js";

// Error handling class
import { ApiError } from "../utils/ApiError.js";

// Standard JSON response class
import { ApiResponse } from "../utils/ApiResponse.js";

// Async handler wrapper
import { asyncHandler } from "../utils/AsyncHandle.js";

/**
 * =========================================================================
 * Controller 0: Get All Tweets (Community Feed Ke Saare Tweets Lana)
 * Method: GET | Route: /api/v1/tweets
 * =========================================================================
 */
const getAllTweets = asyncHandler(async (req, res) => {
    // 1. Strict Pagination & Sanitized Parameters (Capped at 50 max limit)
    const { page = 1, limit = 30 } = req.query;
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20)); // Strict max limit: 50

    const tweets = await Tweet.aggregate([
        // Stage 1: User details join karein
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        // Stage 2: Likes details join karein
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes"
            }
        },
        // Stage 3: Add calculated fields
        {
            $addFields: {
                owner: { $first: "$owner" },
                likesCount: { $size: "$likes" },
                isLiked: {
                    $cond: {
                        if: {
                            $in: [
                                req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null,
                                "$likes.likedBy"
                            ]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        // Stage 4: Project fields
        {
            $project: {
                likes: 0
            }
        },
        // Stage 5: Sort newest first
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $skip: (safePage - 1) * safeLimit
        },
        {
            $limit: safeLimit
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

/**
 * =========================================================================
 * Controller 1: Create Tweet (Nayi Community Post Banana)
 * Kaam: Logged in user ka message/content database mein create karna
 * Method: POST | Route: /api/v1/tweets | Middleware: verifyJWT
 * =========================================================================
 */
const createTweet = asyncHandler(async (req, res) => {
    // 1. Request body se content nikaala
    const { content } = req.body || {};

    // 2. Validate kiya ke content khali ya sirf spaces na ho
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Post content is required.");
    }

    // 3. Database mein naya Tweet document create kiya owner ke sath
    const tweet = await Tweet.create({
        content: content.trim(),
        owner: req.user._id // verifyJWT se aane wala user ID
    });

    // 4. Created tweet ke owner ki details (fullName, username, avatar) populate ki
    const populatedTweet = await Tweet.findById(tweet._id).populate(
        "owner",
        "fullName username avatar"
    );

    // 5. 201 Created status ke sath client ko return kiya
    return res
        .status(201)
        .json(new ApiResponse(201, populatedTweet, "Tweet created successfully"));
});

/**
 * =========================================================================
 * Controller 2: Get User Tweets (Kisi Specific User Ki Posts Fetch Karna)
 * Kaam: Target user ki saari posts + total likes + current user ka like status lana
 * Method: GET | Route: /api/v1/tweets/user/:userId
 * =========================================================================
 */
const getUserTweets = asyncHandler(async (req, res) => {
    // 1. URL params se userId nikaali
    const { userId } = req.params;

    // 2. Validate kiya ke kya userId ek valid MongoDB ObjectId hai
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID format.");
    }

    // 3. Aggregation pipeline run ki taake tweets + owner + likes aik sath calculate ho sakein
    const tweets = await Tweet.aggregate([
        // Stage 1: Sirf is user ki posts filter karein
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        // Stage 2: User collection se owner ki details (fullName, username, avatar) join karein
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        // Stage 3: Likes collection se is tweet par kitne likes hain join karein
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes"
            }
        },
        // Stage 4: Owner object ko flatten karein, likes count aur isLiked (kya current user ne like kiya hai) calculate karein
        {
            $addFields: {
                owner: { $first: "$owner" },
                likesCount: { $size: "$likes" },
                isLiked: {
                    $cond: {
                        if: {
                            $in: [
                                req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null,
                                "$likes.likedBy"
                            ]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        // Stage 5: Raw likes array ko response se remove kiya taake payload light rahe
        {
            $project: {
                likes: 0
            }
        },
        // Stage 6: Newest posts pehle (-1) sort kiye
        {
            $sort: {
                createdAt: -1
            }
        }
    ]);

    // 4. 200 Success status ke sath tweets list return ki
    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
});

/**
 * =========================================================================
 * Controller 3: Update Tweet (Community Post Edit Karna)
 * Kaam: Sirf post ka owner apni post ka text update kar sake
 * Method: PATCH | Route: /api/v1/tweets/:tweetId | Middleware: verifyJWT
 * =========================================================================
 */
const updateTweet = asyncHandler(async (req, res) => {
    // 1. URL params se tweetId aur body se naya content nikaala
    const { tweetId } = req.params;
    const { content } = req.body || {};

    // 2. Validate tweetId format
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID format");
    }

    // 3. Validate content
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Post content cannot be empty.");
    }

    // 4. Atomic update using $set & ownership verification
    const existingTweet = await Tweet.findById(tweetId).select("owner").lean();
    if (!existingTweet) {
        throw new ApiError(404, "Post not found.");
    }

    // 5. Security check: Kya logged in user hi is post ka owner hai?
    if (existingTweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to update this post.");
    }

    // 6. Content update using atomic $set & lean()
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { $set: { content: content.trim() } },
        { new: true }
    ).lean();

    // 7. Updated tweet return kiya
    return res
        .status(200)
        .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});

/**
 * =========================================================================
 * Controller 4: Delete Tweet (Community Post Delete Karna)
 * Kaam: Post aur us se jude saare likes database se clean karna
 * Method: DELETE | Route: /api/v1/tweets/:tweetId | Middleware: verifyJWT
 * =========================================================================
 */
const deleteTweet = asyncHandler(async (req, res) => {
    // 1. URL params se tweetId nikaali
    const { tweetId } = req.params;

    // 2. Validate ID format
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID format");
    }

    // 3. Database mein tweet check kiya
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // 4. Security check: Owner verification
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this tweet");
    }

    // 5. Tweet document delete kiya
    await Tweet.findByIdAndDelete(tweetId);

    // 6. Is tweet ke saare likes aur notifications bhi database se delete kar diye (clean up)
    await Like.deleteMany({ tweet: tweetId });
    await Notification.deleteMany({ tweet: tweetId }).catch(() => {});

    // 7. 200 Success message client ko send kiya
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet and associated data deleted successfully"));
});

// Saare controllers export kar diye
export {
    getAllTweets,
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
};
