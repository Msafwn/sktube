import mongoose, { isValidObjectId } from "mongoose";
import { Notification } from "../Models/Notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandle.js";

/**
 * =========================================================================
 * Controller 1: Get User Notifications (User Ki Sabhi Notifications Fetch Karna)
 * Method: GET | Route: /api/v1/notifications | Middleware: verifyJWT
 * =========================================================================
 */
const getUserNotifications = asyncHandler(async (req, res) => {
  // Strict pagination & sanitized parameters (Capped at 50 max limit)
  const { type, page = 1, limit = 30 } = req.query;
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20)); // Strict max limit: 50

  const matchFilter = { recipient: new mongoose.Types.ObjectId(req.user._id) };

  if (type && type !== "all") {
    matchFilter.type = type;
  }

  const notifications = await Notification.find(matchFilter)
    .populate("sender", "fullName username avatar")
    .populate("video", "title thumbnail isLive duration")
    .populate("tweet", "content")
    .sort({ createdAt: -1 })
    .skip((safePage - 1) * safeLimit)
    .limit(safeLimit)
    .lean();

  const totalNotifications = await Notification.countDocuments(matchFilter);
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        totalNotifications,
        unreadCount,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
      },
      "Notifications fetched successfully"
    )
  );
});

/**
 * =========================================================================
 * Controller 2: Get Unread Count (Unread Badges Count Karna)
 * Method: GET | Route: /api/v1/notifications/unread-count | Middleware: verifyJWT
 * =========================================================================
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { unreadCount }, "Unread count fetched"));
});

/**
 * =========================================================================
 * Controller 3: Mark Notification As Read
 * Method: PATCH | Route: /api/v1/notifications/:notificationId/read | Middleware: verifyJWT
 * =========================================================================
 */
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  if (!isValidObjectId(notificationId)) {
    throw new ApiError(400, "Invalid Notification ID");
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, notification, "Notification marked as read"));
});

/**
 * =========================================================================
 * Controller 4: Mark All Notifications As Read
 * Method: PATCH | Route: /api/v1/notifications/read-all | Middleware: verifyJWT
 * =========================================================================
 */
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "All notifications marked as read"));
});

/**
 * =========================================================================
 * Controller 5: Delete Notification
 * Method: DELETE | Route: /api/v1/notifications/:notificationId | Middleware: verifyJWT
 * =========================================================================
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  if (!isValidObjectId(notificationId)) {
    throw new ApiError(400, "Invalid Notification ID");
  }

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: req.user._id
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Notification deleted successfully"));
});

/**
 * =========================================================================
 * Controller 6: Clear All Notifications
 * Method: DELETE | Route: /api/v1/notifications/clear-all | Middleware: verifyJWT
 * =========================================================================
 */
const clearAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ recipient: req.user._id });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "All notifications cleared"));
});

export {
  getUserNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications
};
