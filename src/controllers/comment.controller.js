// Mongoose aur ObjectId validation helper import kar rahe hain
import mongoose, { isValidObjectId } from "mongoose";

// Comment model import kar rahe hain comments table ke liye
import { Comment } from "../Models/Comment.model.js";

// Video model import kar rahe hain video existence verify karne ke liye
import { Video } from "../Models/Video.model.js";

// Like model import kar rahe hain comment likes cleanup aur count ke liye
import { Like } from "../Models/Like.model.js";

// Notification model import kar rahe hain
import { Notification } from "../Models/Notification.model.js";
import { 
    sendRealtimeNotification, 
    broadcastNewComment, 
    broadcastDeleteComment 
} from "../socket/index.js";

// Error utility
import { ApiError } from "../utils/ApiError.js";

// Standard JSON response utility
import { ApiResponse } from "../utils/ApiResponse.js";

// Async handler wrapper
import { asyncHandler } from "../utils/AsyncHandle.js";

// Redis Cache Invalidation Helper
import { clearRedisCache } from "../utils/redis.js";

/**
 * =========================================================================
 * Controller 1: Get Video Comments (Video Ke Comments Pagination Ke Sath Lana)
 * Kaam: Video par kiye gaye saare comments + comment karne wale ka naam/avatar + likes count fetch karna
 * Method: GET | Route: /api/v1/comments/:videoId
 * =========================================================================
 */
const getVideoComments = asyncHandler(async (req, res) => {
    // 1. Strict Pagination & Sanitized Parameters (Capped at 50 max limit)
    const { videoId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20)); // Strict max limit: 50

    // 2. Video ID validate ki
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID format");
    }

    // 3. Check kiya ke kya video database mein exist karti hai (lightweight query with select and lean)
    const video = await Video.findById(videoId).select("_id").lean();
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // 4. Comment collection par Aggregation pipeline tayyar ki
    const commentsAggregate = Comment.aggregate([
        // Stage 1: Sirf is specific video ke comments match karein
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        // Stage 2: User collection se comment ke owner ka name, username, aur avatar fetch karein
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
        // Stage 3: Likes collection se is comment par kitne likes hain lookup karein
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        // Stage 4: Owner object flatten karein, likesCount aur isLiked calculate karein
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
        // Stage 5: Raw likes array project out karein
        {
            $project: {
                likes: 0
            }
        },
        // Stage 6: Sab se naye comments sab se ooper (-1) sort hon
        {
            $sort: {
                createdAt: -1
            }
        }
    ]);

    // 5. Pagination options define kiye (strict pagination)
    const options = {
        page: safePage,
        limit: safeLimit,
        customLabels: {
            totalDocs: "totalComments",
            docs: "comments"
        }
    };

    // 6. mongoose-aggregate-paginate ke through paginated comments result generate kiya
    const comments = await Comment.aggregatePaginate(commentsAggregate, options);

    // 7. Paginated comments response return kiya
    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

/**
 * =========================================================================
 * Controller 2: Add Comment (Video Par Naya Comment Karna)
 * Kaam: Logged in user ka naya comment create karna aur database mein save karna
 * Method: POST | Route: /api/v1/comments/:videoId | Middleware: verifyJWT
 * =========================================================================
 */
const addComment = asyncHandler(async (req, res) => {
    // 1. URL params se videoId aur body se content nikaala
    const { videoId } = req.params;
    const { content, parentComment } = req.body || {};

    // 2. Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID format");
    }

    // 3. Validate content
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required.");
    }

    // 4. Video existence check
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // 5. Naya comment / reply create kiya
    const commentData = {
        content: content.trim(),
        video: videoId,
        owner: req.user._id
    };

    const rawParentId = typeof parentComment === "object" && parentComment?._id ? parentComment._id : parentComment;

    if (rawParentId && isValidObjectId(rawParentId)) {
        commentData.parentComment = new mongoose.Types.ObjectId(rawParentId);
    }

    const comment = await Comment.create(commentData);

    // 6. Notification create karein (Agar reply hai to parent comment owner ko, agar video comment hai to video owner ko)
    if (rawParentId && isValidObjectId(rawParentId)) {
        const parent = await Comment.findById(rawParentId);
        if (parent?.owner && parent.owner.toString() !== req.user._id.toString()) {
            try {
                const notif = await Notification.create({
                    recipient: parent.owner,
                    sender: req.user._id,
                    type: "comment",
                    title: "New Reply",
                    message: `${req.user.fullName || req.user.username} replied to your comment: "${content.trim().slice(0, 60)}"`,
                    video: videoId,
                    comment: comment._id,
                    thumbnail: video.thumbnail || "",
                    link: `/watch?v=${videoId}`
                });
                sendRealtimeNotification(parent.owner, notif);
            } catch (notifErr) {
                console.error("Reply notification error:", notifErr);
            }
        }
    } else if (video?.owner && video.owner.toString() !== req.user._id.toString()) {
        try {
            const notif = await Notification.create({
                recipient: video.owner,
                sender: req.user._id,
                type: "comment",
                title: "New Comment",
                message: `${req.user.fullName || req.user.username} commented on your video "${video.title?.slice(0, 30)}": "${content.trim().slice(0, 60)}"`,
                video: videoId,
                comment: comment._id,
                thumbnail: video.thumbnail || "",
                link: `/watch?v=${videoId}`
            });
            sendRealtimeNotification(video.owner, notif);
        } catch (notifErr) {
            console.error("Comment notification creation error:", notifErr);
        }
    }

    // 7. Created comment ke owner details populate kiye
    const populatedComment = await Comment.findById(comment._id).populate(
        "owner",
        "fullName username avatar"
    );

    // 8. Broadcast real-time comment to all viewers in this video stream room
    try {
        const commentObj = populatedComment?.toObject ? populatedComment.toObject() : populatedComment;
        broadcastNewComment(videoId, commentObj);
    } catch (sockErr) {
        console.error("Socket comment broadcast error:", sockErr);
    }

    // Flush cached comments for this video
    clearRedisCache(`cache:/api/v1/comments/${videoId}*`);

    // 9. 201 Created response send kiya
    return res
        .status(201)
        .json(new ApiResponse(201, populatedComment, "Comment added successfully"));
});

/**
 * =========================================================================
 * Controller 3: Update Comment (Pehle Se Likha Comment Edit Karna)
 * Kaam: Sirf comment ka owner apna comment update kar sake
 * Method: PATCH | Route: /api/v1/comments/c/:commentId | Middleware: verifyJWT
 * =========================================================================
 */
const updateComment = asyncHandler(async (req, res) => {
    // 1. URL params se commentId aur body se updated text nikaala
    const { commentId } = req.params;
    const { content } = req.body || {};

    // 2. Validate comment ID
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID format");
    }

    // 3. Validate content
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Updated comment content cannot be empty");
    }

    // 4. Atomic update using $set & ownership verification
    const existingComment = await Comment.findById(commentId).select("owner video").lean();
    if (!existingComment) {
        throw new ApiError(404, "Comment not found");
    }

    if (existingComment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to edit this comment");
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { $set: { content: content.trim() } },
        { new: true }
    ).lean();

    // Flush cached comments for this video
    clearRedisCache(`cache:/api/v1/comments/${existingComment.video}*`);

    // 5. Success response
    return res
        .status(200)
        .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

/**
 * =========================================================================
 * Controller 4: Delete Comment (Comment Delete Karna)
 * Kaam: Comment aur us se jude likes ko database se delete karna
 * Method: DELETE | Route: /api/v1/comments/c/:commentId | Middleware: verifyJWT
 * =========================================================================
 */
const deleteComment = asyncHandler(async (req, res) => {
    // 1. URL params se commentId nikaali
    const { commentId } = req.params;

    // 2. Validate comment ID
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID format");
    }

    // 3. Database mein comment find kiya
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // 4. Video find karein taake check kar saken ke kya logged in user is video ka owner hai
    const video = await Video.findById(comment.video);

    const isCommentAuthor = comment.owner.toString() === req.user._id.toString();
    const isVideoOwner = video && video.owner.toString() === req.user._id.toString();

    // 5. Security check: Comment author YA Video owner dono me se koi bhi delete kar sakta hai
    if (!isCommentAuthor && !isVideoOwner) {
        throw new ApiError(403, "You do not have permission to delete this comment.");
    }

    // 6. Comment document aur uske saare child replies delete karein
    await Comment.findByIdAndDelete(commentId);
    await Comment.deleteMany({ parentComment: commentId });

    // 7. Is comment par aaye hue saare likes aur notifications clean kar diye
    await Like.deleteMany({ comment: commentId });
    await Notification.deleteMany({ comment: commentId }).catch(() => {});

    // 8. Broadcast real-time comment deletion to all viewers
    try {
        broadcastDeleteComment(comment.video, commentId);
    } catch (sockErr) {
        console.error("Socket delete comment broadcast error:", sockErr);
    }

    // Flush cached comments for this video
    clearRedisCache(`cache:/api/v1/comments/${comment.video}*`);

    // 9. Success message return kiya
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

// Controllers export kar rahe hain
export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};
