// Mongoose aur ObjectId validation helper import kar rahe hain
import mongoose, { isValidObjectId } from "mongoose";

// Like model import kar rahe hain likes create/delete karne ke liye
import { Like } from "../Models/Like.model.js";

// Video model import kar rahe hain video existence verify karne ke liye
import { Video } from "../Models/Video.model.js";

// Comment model import kar rahe hain comment check karne ke liye
import { Comment } from "../Models/Comment.model.js";

// Tweet model import kar rahe hain tweet check karne ke liye
import { Tweet } from "../Models/Tweet.model.js";

// Notification model import kar rahe hain
import { Notification } from "../Models/Notification.model.js";
import { sendRealtimeNotification, broadcastNewLike } from "../socket/index.js";

// Error handling utility
import { ApiError } from "../utils/ApiError.js";

// Standard JSON response utility
import { ApiResponse } from "../utils/ApiResponse.js";

// Async error handler wrapper
import { asyncHandler } from "../utils/AsyncHandle.js";

// Redis Cache Invalidation Helper
import { clearRedisCache } from "../utils/redis.js";

/**
 * =========================================================================
 * Controller 1: Toggle Video Like (Video Like / Unlike Karna)
 * Kaam: Video par like add ya remove karna aur exact updated count return karna
 * Method: POST | Route: /api/v1/likes/toggle/v/:videoId | Middleware: verifyJWT
 * =========================================================================
 */
const toggleVideoLike = asyncHandler(async (req, res) => {
    // 1. URL params se videoId nikaali
    const { videoId } = req.params;

    // 2. Format validate kiya
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID format");
    }

    // 3. Video database mein exist karti hai ya nahi check kiya
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // 4. Pehle se like kiya hua hai ya nahi find kiya
    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    });

    // 5. Agar PEHLE SE LIKE HAI => UNLIKE karein
    if (existingLike) {
        await Like.deleteMany({
            video: videoId,
            likedBy: req.user._id
        });
        
        // Remove like notification
        await Notification.deleteMany({
            video: videoId,
            sender: req.user._id,
            type: "like"
        }).catch(() => {});

        const totalLikes = await Like.countDocuments({ video: videoId });
        
        // Broadcast updated like count to all viewers watching the video
        try {
            broadcastNewLike(videoId, { likesCount: totalLikes });
        } catch (sockErr) {
            console.error("Socket like broadcast error:", sockErr);
        }

        // Invalidate single video cache so updated likesCount is refreshed
        clearRedisCache(`cache:video:${videoId}*`);

        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false, likesCount: totalLikes }, "Video unliked successfully"));
    }

    // 6. Agar LIKE NAHI THA => LIKE CREATE karein
    await Like.deleteMany({
        video: videoId,
        likedBy: req.user._id
    });

    await Like.create({
        video: videoId,
        likedBy: req.user._id
    });

    // Create like notification for video owner
    if (video?.owner && video.owner.toString() !== req.user._id.toString()) {
        try {
            const notif = await Notification.create({
                recipient: video.owner,
                sender: req.user._id,
                type: "like",
                title: "New Like",
                message: `${req.user.fullName || req.user.username} liked your video "${video.title?.slice(0, 40)}"`,
                video: videoId,
                thumbnail: video.thumbnail || "",
                link: `/watch?v=${videoId}`
            });
            sendRealtimeNotification(video.owner, notif);
        } catch (notifErr) {
            console.error("Like notification creation error:", notifErr);
        }
    }

    const totalLikes = await Like.countDocuments({ video: videoId });

    // Broadcast updated like count to all viewers watching the video
    try {
        broadcastNewLike(videoId, { likesCount: totalLikes });
    } catch (sockErr) {
        console.error("Socket like broadcast error:", sockErr);
    }

    // Invalidate single video cache so updated likesCount is refreshed
    clearRedisCache(`cache:video:${videoId}*`);

    // 7. isLiked: true aur exact likesCount ke sath response send karein
    return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: true, likesCount: totalLikes }, "Video liked successfully"));
});

/**
 * =========================================================================
 * Controller 2: Toggle Comment Like (Comment Like / Unlike Karna)
 * Kaam: Comment par like toggle karna
 * Method: POST | Route: /api/v1/likes/toggle/c/:commentId | Middleware: verifyJWT
 * =========================================================================
 */
const toggleCommentLike = asyncHandler(async (req, res) => {
    // 1. URL params se commentId li
    const { commentId } = req.params;

    // 2. Validate format
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID format");
    }

    // 3. Comment exist check
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // 4. Check existing like
    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    });

    // 5. Toggle unlike if already liked
    if (existingLike) {
        await Like.deleteMany({
            comment: commentId,
            likedBy: req.user._id
        });

        // Remove like notification
        await Notification.deleteMany({
            comment: commentId,
            sender: req.user._id,
            type: "like"
        }).catch(() => {});

        const totalLikes = await Like.countDocuments({ comment: commentId });

        // Flush cached comments for this video
        clearRedisCache(`cache:/api/v1/comments/${comment.video}*`);

        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false, likesCount: totalLikes }, "Comment unliked successfully"));
    }

    // 6. Create like if not already liked
    await Like.deleteMany({
        comment: commentId,
        likedBy: req.user._id
    });

    await Like.create({
        comment: commentId,
        likedBy: req.user._id
    });

    if (comment?.owner && comment.owner.toString() !== req.user._id.toString()) {
        try {
            const notif = await Notification.create({
                recipient: comment.owner,
                sender: req.user._id,
                type: "like",
                title: "New Comment Like",
                message: `${req.user.fullName || req.user.username} liked your comment: "${comment.content?.slice(0, 40)}"`,
                video: comment.video,
                comment: commentId,
                link: `/watch?v=${comment.video}`
            });
            sendRealtimeNotification(comment.owner, notif);
        } catch (e) {}
    }

    const totalLikes = await Like.countDocuments({ comment: commentId });

    // Flush cached comments for this video
    clearRedisCache(`cache:/api/v1/comments/${comment.video}*`);

    return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: true, likesCount: totalLikes }, "Comment liked successfully"));
});

/**
 * =========================================================================
 * Controller 3: Toggle Tweet Like (Community Post Like / Unlike Karna)
 * Kaam: Tweet post par like add ya remove karna
 * Method: POST | Route: /api/v1/likes/toggle/t/:tweetId | Middleware: verifyJWT
 * =========================================================================
 */
const toggleTweetLike = asyncHandler(async (req, res) => {
    // 1. URL params se tweetId nikaali
    const { tweetId } = req.params;

    // 2. Validate format
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID format");
    }

    // 3. Tweet existence check
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // 4. Check existing like
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    });

    // 5. Toggle unlike if already liked
    if (existingLike) {
        await Like.deleteMany({
            tweet: tweetId,
            likedBy: req.user._id
        });

        // Remove like notification
        await Notification.deleteMany({
            tweet: tweetId,
            sender: req.user._id,
            type: "like"
        }).catch(() => {});

        const totalLikes = await Like.countDocuments({ tweet: tweetId });
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false, likesCount: totalLikes }, "Tweet unliked successfully"));
    }

    // 6. Create like if not already liked
    await Like.deleteMany({
        tweet: tweetId,
        likedBy: req.user._id
    });

    await Like.create({
        tweet: tweetId,
        likedBy: req.user._id
    });

    // Create like notification for tweet owner (if not liking own tweet)
    if (tweet?.owner && tweet.owner.toString() !== req.user._id.toString()) {
        try {
            const notif = await Notification.create({
                recipient: tweet.owner,
                sender: req.user._id,
                type: "like",
                title: "New Post Like",
                message: `${req.user.fullName || req.user.username} liked your community post: "${tweet.content?.slice(0, 45)}${tweet.content?.length > 45 ? '...' : ''}"`,
                tweet: tweetId,
                link: `/community`
            });
            sendRealtimeNotification(tweet.owner, notif);
        } catch (notifErr) {
            console.error("Tweet like notification creation error:", notifErr);
        }
    }

    const totalLikes = await Like.countDocuments({ tweet: tweetId });

    return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: true, likesCount: totalLikes }, "Tweet liked successfully"));
});

/**
 * =========================================================================
 * Controller 4: Get Liked Videos (Logged-In User Ki Pasand Ki Hui Videos Lana)
 * Kaam: User ne jitni videos like ki hain unki details aur creator info fetch karna
 * Method: GET | Route: /api/v1/likes/videos | Middleware: verifyJWT
 * =========================================================================
 */
const getLikedVideos = asyncHandler(async (req, res) => {
    // Aggregation pipeline chalayi Like collection par
    const likedVideos = await Like.aggregate([
        // Stage 1: Sirf is logged-in user ke video likes filter karein
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: { $exists: true, $ne: null }
            }
        },
        // Stage 2: Videos collection se video details join (lookup) karein
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    // Video ke owner ka name, username, aur avatar fetch karein
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
                    // Owner array ko object mein convert karein
                    {
                        $addFields: {
                            owner: { $first: "$owner" }
                        }
                    }
                ]
            }
        },
        // Stage 3: Video array ko unwind karein
        {
            $unwind: "$video"
        },
        // Stage 4: Clean video fields project karein sath mein like date (likedAt) shamil karein
        {
            $project: {
                _id: "$video._id",
                videoFile: "$video.videoFile",
                thumbnail: "$video.thumbnail",
                title: "$video.title",
                description: "$video.description",
                duration: "$video.duration",
                views: "$video.views",
                isPublished: "$video.isPublished",
                owner: "$video.owner",
                createdAt: "$video.createdAt",
                likedAt: "$createdAt"
            }
        },
        // Stage 5: Sab se aakhir mein like ki hui video sab se pehle (-1) aye
        {
            $sort: {
                likedAt: -1
            }
        }
    ]);

    // 200 response return kiya
    return res
        .status(200)
        .json(
            new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
        );
});

// Controllers export kiye
export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
};
