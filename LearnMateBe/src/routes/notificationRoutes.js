const express = require("express");
const RouteNotification = express.Router();
const notificationController = require("../controller/Notification/NotificationController");
const { checkAccessToken } = require("../middleware/JWTAction");

// Lấy danh sách thông báo của user (có phân trang & filter unread)
RouteNotification.get(
  "/",
  checkAccessToken,
  notificationController.getUserNotifications
);

// Đánh dấu 1 thông báo đã đọc
RouteNotification.patch(
  "/:notificationId/read",
  checkAccessToken,
  notificationController.markNotificationAsRead
);

// Đánh dấu tất cả thông báo đã đọc
RouteNotification.patch(
  "/read-all",
  checkAccessToken,
  notificationController.markAllNotificationsAsRead
);

// Lấy số thông báo chưa đọc
RouteNotification.get(
  "/unread-count",
  checkAccessToken,
  notificationController.getUnreadCount
);

// Xóa 1 thông báo
RouteNotification.delete(
  "/:notificationId",
  checkAccessToken,
  notificationController.deleteNotification
);

module.exports = RouteNotification;