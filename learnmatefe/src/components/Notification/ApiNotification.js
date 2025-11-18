import axios from "../../Service/AxiosCustomize";
import Cookies from "js-cookie";

// Lấy thông báo
export const fetchNotifications = async ({ page = 1, limit = 10, unreadOnly = false } = {}) => {
  const token = Cookies.get("accessToken");

  if (!token) {
    return { errorCode: 1, message: "Unauthorized" };
  }
  try {
    const res = await axios.get("/api/notifications", {
      params: { page, limit, unreadOnly },
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching notifications:", err);
    throw err;
  }
};

// Lấy số thông báo chưa đọc
export const fetchUnreadCount = async () => {
  const token = Cookies.get("accessToken");

  if (!token) {
    return { errorCode: 1, message: "Unauthorized" };
  }
  try {
    const res = await axios.get("/api/notifications/unread-count",{
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching unread count:", err);
    throw err;
  }
};

// Đánh dấu 1 thông báo đã đọc
export const markNotificationAsRead = async (notificationId) => {
  const token = Cookies.get("accessToken");

  if (!token) {
    return { errorCode: 1, message: "Unauthorized" };
  }
  try {
    const res = await axios.patch(`/api/notifications/${notificationId}/read`,{
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error marking notification as read:", err);
    throw err;
  }
};

// Đánh dấu tất cả thông báo đã đọc
export const markAllNotificationsAsRead = async () => {
  const token = Cookies.get("accessToken");

  if (!token) {
    return { errorCode: 1, message: "Unauthorized" };
  }
  try {
    const res = await axios.patch(`/api/notifications/read-all`,{
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error marking all notifications as read:", err);
    throw err;
  }
};

// Xóa thông báo
export const deleteNotification = async (notificationId) => {
  const token = Cookies.get("accessToken");

  if (!token) {
    return { errorCode: 1, message: "Unauthorized" };
  }
  try {
    const res = await axios.delete(`/api/notifications/${notificationId}`,{
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error deleting notification:", err);
    throw err;
  }
};
