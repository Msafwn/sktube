// Mongoose aur ObjectId validation helper
import mongoose, { isValidObjectId } from "mongoose";

// Models import kar rahe hain
import { Video } from "../Models/Video.model.js";
import { User } from "../Models/User.model.js";
import { Comment } from "../Models/Comment.model.js";
import { Like } from "../Models/Like.model.js";
import { Subscription } from "../Models/Subscription.model.js";
import { Notification } from "../Models/Notification.model.js";
import { Playlist } from "../Models/Playlist.model.js";

// Error aur response handling utilities
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandle.js";

// Cloudinary upload aur delete helpers
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/Cloudinary.js";

// Redis Cache & Invalidation Helper
import { redis, clearRedisCache } from "../utils/redis.js";

// Node.js file system module
import fs from "fs";

/**
 * Helper: Agar controller mein validation fail ho jaye to Multer ki upload ki hui local files delete karna
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
 * =========================================================================
 * Controller 1: Get All Videos (Videos Fetch Karna With Pagination & Search)
 * Kaam: Pagination, search query, sorting (newest/popular), aur channel filter ke sath published videos return karna
 * Method: GET | Route: /api/v1/videos
 * =========================================================================
 */
const getAllVideos = asyncHandler(async (req, res) => {
    // 1. Strict Pagination & Sanitized Parameters (Capped at 50 max limit)
    const { 
        page = 1, 
        limit = 10, 
        query, 
        sortBy = "createdAt", 
        sortType = "desc", 
        userId 
    } = req.query;

    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10)); // Strict max limit: 50

    const pipeline = [];

    // 2. Search filter: Agar search query ho to title ya description mein case-insensitive search karein
    if (query && query.trim() !== "") {
        pipeline.push({
            $match: {
                $or: [
                    { title: { $regex: query.trim(), $options: "i" } },
                    { description: { $regex: query.trim(), $options: "i" } }
                ]
            }
        });
    }

    // 3. Channel filter: Agar specific user ki videos dekhni hon to owner match karein, warna sirf published videos dein
    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId format");
        }
        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        });
    } else {
        // Public feed ke liye sirf isPublished: true videos dikhayein
        pipeline.push({
            $match: {
                isPublished: true
            }
        });
    }

    // 4. Video Owner Lookup: User collection se video creator ka fullName, username aur avatar shamil karein
    pipeline.push(
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
        {
            $addFields: {
                owner: {
                    $first: "$owner" // Array ko object mein convert kiya
                }
            }
        },
        {
            $project: {
                viewedBy: 0 // Do not send large viewer ID array in feed
            }
        }
    );

    // 5. Sorting Stage: createdAt ya views ke mutabiq asc/desc order mein sort karein
    const sortDirection = sortType?.toLowerCase() === "asc" ? 1 : -1;
    pipeline.push({
        $sort: {
            [sortBy]: sortDirection
        }
    });

    // 6. Aggregate Paginate Options define kiye (strict pagination)
    const options = {
        page: safePage,
        limit: safeLimit,
        customLabels: {
            totalDocs: "totalVideos",
            docs: "videos"
        }
    };

    // 7. Video.aggregatePaginate chala kar paginated result hasil kiya
    const videos = await Video.aggregatePaginate(Video.aggregate(pipeline), options);

    // 8. Success response return kiya
    return res
        .status(200)
        .json(
            new ApiResponse(200, videos, "Videos fetched successfully")
        );
});

/**
 * =========================================================================
 * Controller 2: Publish A Video (Nayi Video Upload & Publish Karna)
 * Kaam: Multer se video aur thumbnail lena, Cloudinary par upload karna aur database me video create karna
 * Method: POST | Route: /api/v1/videos | Middleware: verifyJWT, upload.fields
 * =========================================================================
 */
const publishAVideo = asyncHandler(async (req, res) => {
    // 1. Text fields extract kiye
    const { title, description } = req.body || {};

    // 2. Title validation
    if (!title || title.trim() === "") {
        cleanupLocalFiles(req.files);
        throw new ApiError(400, "Video title is required.");
    }

    // 3. Description validation
    if (!description || description.trim() === "") {
        cleanupLocalFiles(req.files);
        throw new ApiError(400, "Video description is required.");
    }

    // 4. Multer se aayi hui local file paths nikaalein
    const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    const videoFile = req.files?.videoFile?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0];

    if (!videoFileLocalPath) {
        cleanupLocalFiles(req.files);
        throw new ApiError(400, "Video file is required.");
    }

    if (!thumbnailLocalPath) {
        cleanupLocalFiles(req.files);
        throw new ApiError(400, "Thumbnail image is required.");
    }

    // Cloudinary Free Tier Video Limit: 100MB
    if (videoFile && videoFile.size > 100 * 1024 * 1024) {
        cleanupLocalFiles(req.files);
        const sizeMB = (videoFile.size / (1024 * 1024)).toFixed(1);
        throw new ApiError(400, `Video file size (${sizeMB}MB) exceeds Cloudinary limit of 100MB. Please upload a video under 100MB.`);
    }

    // 5. Dono files ko Cloudinary cloud storage par parallel upload kiya
    const [videoUpload, thumbnailUpload] = await Promise.all([
        uploadOnCloudinary(videoFileLocalPath, "video"),
        uploadOnCloudinary(thumbnailLocalPath, "image")
    ]);

    const videoUrl = videoUpload?.secure_url || videoUpload?.url;
    const thumbnailUrl = thumbnailUpload?.secure_url || thumbnailUpload?.url;

    if (!videoUrl) {
        throw new ApiError(500, "Error while uploading video file to Cloudinary. Please check file size or internet connection.");
    }

    if (!thumbnailUrl) {
        throw new ApiError(500, "Error while uploading thumbnail to Cloudinary");
    }

    // 6. Database mein naya Video document create kiya
    const video = await Video.create({
        videoFile: videoUrl,
        thumbnail: thumbnailUrl,
        title: title.trim(),
        description: description.trim(),
        duration: videoUpload.duration || 0, // Video duration in seconds
        isPublished: true,
        owner: req.user._id // Logged in creator
    });

    // 7. Created video ke owner details populate karein
    const createdVideo = await Video.findById(video._id).populate("owner", "fullName username avatar");

    if (!createdVideo) {
        throw new ApiError(500, "Video creation failed, please try again");
    }

    // 8. Notify all subscribers of this channel about the new upload
    try {
        const subscribers = await Subscription.find({ channel: req.user._id });
        if (subscribers && subscribers.length > 0) {
            const notifDocs = subscribers.map((sub) => ({
                recipient: sub.subscriber,
                sender: req.user._id,
                type: "video_upload",
                title: "New Video Upload",
                message: `${req.user.fullName || req.user.username} uploaded a new video: "${title.trim().slice(0, 45)}"`,
                video: video._id,
                thumbnail: thumbnailUpload.url || "",
                link: `/watch?v=${video._id}`
            }));
            await Notification.insertMany(notifDocs);
        }
    } catch (notifErr) {
        console.error("Subscribers video upload notification error:", notifErr);
    }

    // 9. Flush video feed and creator stats cache so new video appears instantly
    clearRedisCache("cache:/api/v1/videos*");
    clearRedisCache(`cache:/api/v1/dashboard/stats:user:${req.user._id}*`);

    // 10. 201 Created response return kiya
    return res
        .status(201)
        .json(
            new ApiResponse(201, createdVideo, "Video published successfully")
        );
});

/**
 * =========================================================================
 * Controller 3: Get Video By ID (Single Video Watch Page)
 * Kaam: Video details lana, views barhana (+1), owner ke subscribers count karna, aur watch history me save karna
 * Method: GET | Route: /api/v1/videos/:videoId
 * =========================================================================
 */
const getVideoById = asyncHandler(async (req, res) => {
    // 1. URL params se videoId nikaali
    const { videoId } = req.params;

    // 2. Validate format
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID format");
    }

    // 3. User logged-in hone par Watch History save karein, unique viewer track karein aur views increment karein
    if (req.user?._id) {
        // Remove previous occurrence and place at position 0 (Newest watched video first)
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { watchHistory: new mongoose.Types.ObjectId(videoId) }
        });
        await User.findByIdAndUpdate(req.user._id, {
            $push: {
                watchHistory: {
                    $each: [new mongoose.Types.ObjectId(videoId)],
                    $position: 0
                }
            }
        });

        // Check if this user has already been recorded as a viewer
        const alreadyViewed = await Video.exists({
            _id: new mongoose.Types.ObjectId(videoId),
            viewedBy: req.user._id
        });

        if (!alreadyViewed) {
            // First time this registered user watches the video
            await Video.findByIdAndUpdate(videoId, {
                $addToSet: { viewedBy: req.user._id },
                $inc: { views: 1 }
            });
        }
    } else {
        // Guest view increment: throttle using cookie so multiple re-renders/refreshes don't spam views
        const guestViewKey = `viewed_${videoId}`;
        if (!req.cookies?.[guestViewKey]) {
            try {
                res.cookie(guestViewKey, "1", { 
                    maxAge: 1000 * 60 * 30, // 30 minutes throttle
                    httpOnly: true, 
                    sameSite: "lax" 
                });
            } catch (e) {
                // ignore cookie errors
            }
            await Video.findByIdAndUpdate(videoId, {
                $inc: { views: 1 }
            });
        }
    }

    // 4. Redis Cache Check for Base Video Metadata (Heavy joins avoid karne ke liye)
    const cacheKey = `cache:video:${videoId}`;
    let baseVideo = null;
    let isCacheHit = false;

    try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            baseVideo = JSON.parse(cachedData);
            isCacheHit = true;
        }
    } catch (err) {
        // Fail-safe: Redis unavailable hone par MongoDB fallback karega
    }

    if (!baseVideo) {
        // Aggregation pipeline chalayi taake video + owner subscribers + likes count aik call me mil jaye
        const video = await Video.aggregate([
            // Stage 1: Match target video
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(videoId)
                }
            },
            // Stage 2: Owner lookup with total subscribers count
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {
                            $lookup: {
                                from: "subscriptions",
                                localField: "_id",
                                foreignField: "channel",
                                as: "subscribers"
                            }
                        },
                        {
                            $addFields: {
                                subscribersCount: { $size: "$subscribers" }
                            }
                        },
                        {
                            $project: {
                                fullName: 1,
                                username: 1,
                                avatar: 1,
                                subscribersCount: 1
                            }
                        }
                    ]
                }
            },
            // Stage 3: Likes lookup on this video
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "likes"
                }
            },
            // Stage 4: Add calculated fields
            {
                $addFields: {
                    owner: { $first: "$owner" },
                    likesCount: { $size: "$likes" }
                }
            },
            // Stage 5: Project out raw likes and internal viewer ID array
            {
                $project: {
                    likes: 0,
                    viewedBy: 0
                }
            }
        ]);

        if (!video?.length) {
            throw new ApiError(404, "Video not found");
        }

        baseVideo = video[0];

        // Redis mein base video cache karein (60 seconds TTL)
        redis.set(cacheKey, JSON.stringify(baseVideo), "EX", 60).catch(() => {});
    }

    // 5. User-Specific Dynamic State (isLiked, isSubscribed)
    // Yeh dynamic fields user to user change hoti hain, is liye inhein real-time indexed queries se fetch karte hain (<1ms)
    let isLiked = false;
    let isSubscribed = false;

    if (req.user?._id) {
        const [likeExists, subExists] = await Promise.all([
            Like.exists({ video: videoId, likedBy: req.user._id }),
            Subscription.exists({ channel: baseVideo.owner?._id, subscriber: req.user._id })
        ]);
        isLiked = Boolean(likeExists);
        isSubscribed = Boolean(subExists);
    }

    const finalVideo = {
        ...baseVideo,
        isLiked,
        isSubscribed
    };

    res.setHeader("X-Cache", isCacheHit ? "HIT" : "MISS");
    res.setHeader("X-Cache-TTL", "60s");

    // 6. Return complete video details
    return res
        .status(200)
        .json(
            new ApiResponse(200, finalVideo, "Video fetched successfully")
        );
});

/**
 * =========================================================================
 * Controller 4: Update Video (Video Ka Title, Description Ya Thumbnail Update Karna)
 * Kaam: Sirf video owner ko edit karne dena aur nayi thumbnail aane par purani Cloudinary se delete karna
 * Method: PATCH | Route: /api/v1/videos/:videoId | Middleware: verifyJWT, upload.single("thumbnail")
 * =========================================================================
 */
const updateVideo = asyncHandler(async (req, res) => {
    // 1. Params, text fields aur thumbnail path nikaali
    const { videoId } = req.params;
    const { title, description } = req.body || {};
    const thumbnailLocalPath = req.file?.path;

    // 2. Validate format
    if (!isValidObjectId(videoId)) {
        if (thumbnailLocalPath && fs.existsSync(thumbnailLocalPath)) fs.unlinkSync(thumbnailLocalPath);
        throw new ApiError(400, "Invalid Video ID format");
    }

    // 3. Check at least one field provided
    if (!title && !description && !thumbnailLocalPath) {
        throw new ApiError(400, "At least one field (title, description, or thumbnail) is required to update");
    }

    // 4. Video find karein
    const video = await Video.findById(videoId);

    if (!video) {
        if (thumbnailLocalPath && fs.existsSync(thumbnailLocalPath)) fs.unlinkSync(thumbnailLocalPath);
        throw new ApiError(404, "Video not found");
    }

    // 5. Security check: Owner verification
    if (video.owner.toString() !== req.user?._id.toString()) {
        if (thumbnailLocalPath && fs.existsSync(thumbnailLocalPath)) fs.unlinkSync(thumbnailLocalPath);
        throw new ApiError(403, "You do not have permission to update this video");
    }

    // 6. Agar nayi thumbnail upload hui hai to Cloudinary par upload karein aur purani delete karein
    let updatedThumbnailUrl = video.thumbnail;
    if (thumbnailLocalPath) {
        const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);
        if (!thumbnailUpload?.url) {
            throw new ApiError(500, "Error while uploading new thumbnail to Cloudinary");
        }

        // Purani thumbnail image Cloudinary se delete karna
        if (video.thumbnail) {
            await deleteFromCloudinary(video.thumbnail, "image");
        }
        updatedThumbnailUrl = thumbnailUpload.url;
    }

    // 7. Database document update karein
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title: title?.trim() || video.title,
                description: description?.trim() || video.description,
                thumbnail: updatedThumbnailUrl
            }
        },
        { new: true }
    ).populate("owner", "fullName username avatar");

    // Invalidate cached video lists and single video cache so explore/watch pages update immediately
    clearRedisCache("cache:/api/v1/videos*");
    clearRedisCache(`cache:video:${videoId}*`);

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedVideo, "Video updated successfully")
        );
});

/**
 * =========================================================================
 * Controller 5: Delete Video (Video Delete Karna)
 * Kaam: Cloudinary se video aur thumbnail delete karna, database se video, comments aur likes clean karna
 * Method: DELETE | Route: /api/v1/videos/:videoId | Middleware: verifyJWT
 * =========================================================================
 */
const deleteVideo = asyncHandler(async (req, res) => {
    // 1. URL params se videoId li
    const { videoId } = req.params;

    // 2. Validate format
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID format");
    }

    // 3. Video database mein check ki
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // 4. Owner verification
    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this video");
    }

    // 5. Cloudinary se Video file aur Thumbnail delete kiye
    if (video.videoFile) {
        await deleteFromCloudinary(video.videoFile, "video");
    }
    if (video.thumbnail) {
        await deleteFromCloudinary(video.thumbnail, "image");
    }

    // 6. Database se Video delete ki
    await Video.findByIdAndDelete(videoId);

    // 7. Cascade Cleanups: Is video ke saare comments, likes aur notifications clean up kiye
    await Comment.deleteMany({ video: videoId });
    await Like.deleteMany({ video: videoId });
    await Notification.deleteMany({ video: videoId }).catch(() => {});

    // 8. Saari playlists aur users ki watch history se ye deleted video pull/remove karein
    await Playlist.updateMany(
        { videos: videoId },
        { $pull: { videos: videoId } }
    ).catch(() => {});

    await User.updateMany(
        { watchHistory: videoId },
        { $pull: { watchHistory: videoId } }
    ).catch(() => {});

    // Invalidate cached video lists, single video cache, and creator dashboard stats
    clearRedisCache("cache:/api/v1/videos*");
    clearRedisCache(`cache:video:${videoId}*`);
    clearRedisCache(`cache:/api/v1/dashboard/stats:user:${video.owner}*`);

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Video and all associated data deleted successfully from Cloudinary and Database")
        );
});

/**
 * =========================================================================
 * Controller 6: Toggle Publish Status (Video Public / Draft Toggle Karna)
 * Kaam: Video ki visibility (isPublished boolean) ko true se false ya false se true karna
 * Method: PATCH | Route: /api/v1/videos/toggle/publish/:videoId | Middleware: verifyJWT
 * =========================================================================
 */
const togglePublishStatus = asyncHandler(async (req, res) => {
    // 1. Video ID URL se li
    const { videoId } = req.params;

    // 2. Validate format
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID format");
    }

    // 3. Find video existence and ownership check (lightweight projection)
    const existingVideo = await Video.findById(videoId).select("owner isPublished").lean();

    if (!existingVideo) {
        throw new ApiError(404, "Video not found");
    }

    // 4. Security check
    if (existingVideo.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to change publish status of this video");
    }

    // 5. Atomic boolean toggle using $set & lean()
    const newStatus = !existingVideo.isPublished;
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: { isPublished: newStatus } },
        { new: true }
    ).select("isPublished").lean();

    // Invalidate cached video lists and single video cache so explore/watch pages update immediately
    clearRedisCache("cache:/api/v1/videos*");
    clearRedisCache(`cache:video:${videoId}*`);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                { isPublished: updatedVideo.isPublished }, 
                `Video ${updatedVideo.isPublished ? "published" : "unpublished"} successfully`
            )
        );
});

// Saare controllers export kar rahe hain
export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};
