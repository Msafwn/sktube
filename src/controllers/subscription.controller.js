// Mongoose aur ObjectId validation utility import kar rahe hain
import mongoose, { isValidObjectId } from "mongoose";

// Subscription model import kar rahe hain subscriber-channel relationship manage karne ke liye
import { Subscription } from "../Models/Subscription.model.js";

// User model import kar rahe hain channel existence check karne ke liye
import { User } from "../Models/User.model.js";

// Error handling class
import { ApiError } from "../utils/ApiError.js";

// Standard JSON response utility
import { ApiResponse } from "../utils/ApiResponse.js";

// Async error handler wrapper
import { asyncHandler } from "../utils/AsyncHandle.js";

import { Notification } from "../Models/Notification.model.js";
import { sendRealtimeNotification } from "../socket/index.js";
import { clearRedisCache } from "../utils/redis.js";

/**
 * =========================================================================
 * Controller 1: Toggle Subscription (Channel Subscribe / Unsubscribe Karna)
 * Kaam: Agar user pehle se subscribed hai to unsubscribe karein, agar nahi to subscribe karein
 * Method: POST | Route: /api/v1/subscriptions/c/:channelId | Middleware: verifyJWT
 * =========================================================================
 */
const toggleSubscription = asyncHandler(async (req, res) => {
    // 1. URL params se channelId nikaali
    const { channelId } = req.params;

    // 2. Validate kiya ke channelId valid MongoDB ObjectId hai
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID format");
    }

    // 3. User khud ke channel ko subscribe nahi kar sakta
    if (channelId.toString() === req.user._id.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    // 4. Database mein check kiya ke channel (User) exist karta hai ya nahi
    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    // 5. Check kiya ke user pehle se subscribed hai ya nahi
    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    });

    // 6. Agar pehle se subscribed hai => UNSUBSCRIBE karein (Saare duplicate delete karein)
    if (existingSubscription) {
        await Subscription.deleteMany({
            subscriber: req.user._id,
            channel: channelId
        });
        
        // Notification clean karein
        await Notification.deleteMany({
            recipient: channelId,
            sender: req.user._id,
            type: "subscribe"
        }).catch(err => console.error("Notification delete error:", err));

        const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

        // Invalidate cached channel profile and creator stats so subscriber counts refresh
        if (channel?.username) {
            clearRedisCache(`cache:channel:${channel.username.toLowerCase()}*`);
        }
        clearRedisCache(`cache:/api/v1/dashboard/stats:user:${channelId}*`);

        return res
            .status(200)
            .json(new ApiResponse(200, { isSubscribed: false, subscribersCount: totalSubscribers }, "Unsubscribed successfully"));
    }

    // 7. Agar subscribed nahi hai to pehle clean karein aur phir naya Subscription create karein
    await Subscription.deleteMany({
        subscriber: req.user._id,
        channel: channelId
    });

    await Subscription.create({
        subscriber: req.user._id,
        channel: channelId
    });

    // 8. Create notification for channel owner
    try {
        const notif = await Notification.create({
            recipient: channelId,
            sender: req.user._id,
            type: "subscribe",
            title: "New Subscriber",
            message: `${req.user.fullName || req.user.username} subscribed to your channel`,
            link: `/user/${req.user.username}`
        });
        sendRealtimeNotification(channelId, notif);
    } catch (err) {
        console.error("Notification creation error:", err);
    }

    const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

    // Invalidate cached channel profile and creator stats so subscriber counts refresh
    if (channel?.username) {
        clearRedisCache(`cache:channel:${channel.username.toLowerCase()}*`);
    }
    clearRedisCache(`cache:/api/v1/dashboard/stats:user:${channelId}*`);

    return res
        .status(200)
        .json(new ApiResponse(200, { isSubscribed: true, subscribersCount: totalSubscribers }, "Subscribed successfully"));
});

/**
 * =========================================================================
 * Controller 2: Get User Channel Subscribers (Channel Ke Subscribers List Lana)
 * Kaam: Kisi channel ko kis kis user ne subscribe kiya hua hai unki list lana
 * Method: GET | Route: /api/v1/subscriptions/c/:channelId
 * =========================================================================
 */
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    // 1. Channel ID URL se li
    const { channelId } = req.params;

    // 2. Validate format
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID format");
    }

    // 3. Aggregation chala kar subscriber users ki details nikaali
    const subscribers = await Subscription.aggregate([
        // Stage 1: Is channel ke saare subscription records match karein
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        // Stage 2: Subscriber ki ID se user table lookup karein
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
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
        // Stage 3: Subscriber array flatten karein
        {
            $unwind: "$subscriber"
        },
        // Stage 4: Required fields format karein
        {
            $project: {
                _id: "$subscriber._id",
                fullName: "$subscriber.fullName",
                username: "$subscriber.username",
                avatar: "$subscriber.avatar",
                subscribedAt: "$createdAt"
            }
        }
    ]);

    // 4. Return subscribers list
    return res
        .status(200)
        .json(
            new ApiResponse(200, subscribers, "Channel subscribers fetched successfully")
        );
});

/**
 * =========================================================================
 * Controller 3: Get Subscribed Channels (User Ne Kin Channels Ko Subscribe Kiya Hai)
 * Kaam: User ki subscribed channels list lana taake subscriptions feed show ho sake
 * Method: GET | Route: /api/v1/subscriptions/u/:subscriberId
 * =========================================================================
 */
const getSubscribedChannels = asyncHandler(async (req, res) => {
    // 1. URL params se subscriber user ID li
    const { subscriberId } = req.params;

    // 2. Validate format
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid Subscriber ID format");
    }

    // 3. Aggregation run ki
    const subscribedChannels = await Subscription.aggregate([
        // Stage 1: Match records jahan subscriber == subscriberId ho
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        // Stage 2: Channel user ki details lookup karein
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1,
                            coverImage: 1
                        }
                    }
                ]
            }
        },
        // Stage 3: Channel flatten karein
        {
            $unwind: "$channel"
        },
        // Stage 4: Clean channel object project karein
        {
            $project: {
                _id: "$channel._id",
                fullName: "$channel.fullName",
                username: "$channel.username",
                avatar: "$channel.avatar",
                coverImage: "$channel.coverImage",
                subscribedAt: "$createdAt"
            }
        }
    ]);

    // 4. Return subscribed channels list
    return res
        .status(200)
        .json(
            new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully")
        );
});

// Controllers export kiye
export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};
