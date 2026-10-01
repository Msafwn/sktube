import { Router } from "express";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import {
  getUserNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications
} from "../controllers/notification.controller.js";

const router = Router();

// Apply verifyJWT to all notification routes
router.use(verifyJWT);

router.route("/").get(getUserNotifications);
router.route("/unread-count").get(getUnreadCount);
router.route("/read-all").patch(markAllNotificationsAsRead);
router.route("/clear-all").delete(clearAllNotifications);
router.route("/:notificationId/read").patch(markNotificationAsRead);
router.route("/:notificationId").delete(deleteNotification);

export default router;
