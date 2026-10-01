// Mongoose library import kar rahe hain database operations aur ObjectId casting ke liye
import mongoose from "mongoose";

// Video database model import kar rahe hain video collection se data lene ke liye
import { Video } from "../Models/Video.model.js";

// Subscription model import kar rahe hain channel ke subscribers count karne ke liye
import { Subscription } from "../Models/Subscription.model.js";

// Like model import kar rahe hain videos par total likes calculate karne ke liye
import { Like } from "../Models/Like.model.js";

// Custom ApiError class import kar rahe hain structured error responses throw karne ke liye
import { ApiError } from "../utils/ApiError.js";

// Custom ApiResponse class import kar rahe hain uniform standard JSON response bhejne ke liye
import { ApiResponse } from "../utils/ApiResponse.js";

// asyncHandler wrapper import kar rahe hain taake try-catch baar baar na likhna parhe aur async errors catch ho sakein
import { asyncHandler } from "../utils/AsyncHandle.js";

/**
 * =========================================================================
 * Controller: Get Channel Statistics (Creator Dashboard Stats)
 * Kaam: Channel ke Total Videos, Total Views, Total Subscribers aur Total Likes nikaalna
 * Method: GET | Route: /api/v1/dashboard/stats | Middleware: verifyJWT
 * =========================================================================
 */
const getChannelStats = asyncHandler(async (req, res) => {
    // 1. Logged in user / creator ki ID verifyJWT middleware se req.user se nikaali
    const userId = req.user._id;

    // 2. MongoDB Aggregation Pipeline chalayi Video collection par total videos aur views calculate karne ke liye
    const videoStats = await Video.aggregate([
        // Stage 1: Sirf wahi videos filter karein jinka owner yeh logged in user hai
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        // Stage 2: Sab filtered videos ko group karke total count ($sum: 1) aur views ka sum ($sum: "$views") calculate karein
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" }
            }
        }
    ]);

    // 3. Subscription collection se count kiya ke kitne users ne is channel ko subscribe kiya hua hai
    const totalSubscribers = await Subscription.countDocuments({
        channel: userId
    });

    // 4. Like collection par aggregation chalayi taake is creator ki saari videos par total kitne likes hain pata lage
    const totalLikes = await Like.aggregate([
        // Stage 1: Like document ke 'video' field ko Video collection ke saath join (lookup) kiya
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        // Stage 2: Array ko single object mein unwind / flatten kiya
        {
            $unwind: "$video"
        },
        // Stage 3: Match kiya ke video ka owner wahi logged in user hona chahiye
        {
            $match: {
                "video.owner": new mongoose.Types.ObjectId(userId)
            }
        },
        // Stage 4: Saare matching likes ko group karke unka total sum calculate kiya
        {
            $group: {
                _id: null,
                totalLikesCount: { $sum: 1 }
            }
        }
    ]);

    // 5. Final stats object prepare kiya (agar koi data na ho to default 0 assign kiya)
    const stats = {
        totalVideos: videoStats[0]?.totalVideos || 0,
        totalViews: videoStats[0]?.totalViews || 0,
        totalSubscribers: totalSubscribers || 0,
        totalLikes: totalLikes[0]?.totalLikesCount || 0
    };

    // 6. 200 Success status aur stats ke sath client ko response bhej diya
    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
});

/**
 * =========================================================================
 * Controller: Get Channel Videos (Creator Content Manager)
 * Kaam: Logged in creator ki upload ki hui saari videos fetch karna taake dashboard table me show hon
 * Method: GET | Route: /api/v1/dashboard/videos | Middleware: verifyJWT
 * =========================================================================
 */
const getChannelVideos = asyncHandler(async (req, res) => {
    // 1. Logged in creator ki ID req.user se li
    const userId = req.user._id;

    // 2. Video database collection mein search kiya jahan owner == userId ho aur newest first (-1) sort kiya (using lean & excluding viewedBy array)
    const videos = await Video.find({ owner: userId })
        .select("-viewedBy")
        .sort({ createdAt: -1 })
        .lean();

    // 3. 200 Success status aur videos list ke sath client ko response send kiya
    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

// Controllers ko export kar rahe hain taake routes file mein use ho sakein
export {
    getChannelStats,
    getChannelVideos
};
