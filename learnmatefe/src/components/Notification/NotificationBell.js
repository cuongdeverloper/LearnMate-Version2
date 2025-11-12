import React, { useEffect, useState, useRef } from "react";
import { FaBell } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../../SocketContext";
import * as notificationApi from "./ApiNotification";
import { useSelector } from "react-redux";
import "./NotificationBell.scss";

const NotificationBell = () => {
  const { socket } = useSocket();
  const userId = useSelector((state) => state.user.account.id);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const loadNotifications = async () => {
    const res = await notificationApi.fetchNotifications(userId);
    if (res.errorCode === 0) {
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.notifications.filter((n) => !n.isRead).length);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // socket realtime
  useEffect(() => {
    if (!socket) return;
    socket.on("getNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });
    return () => socket.off("getNotification");
  }, [socket]);

  // click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    await notificationApi.markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(prev - 1, 0));
  };

  const handleDelete = async (id) => {
    await notificationApi.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  return (
    <div className="notification-container" ref={dropdownRef}>
      <div
        className="bell-wrapper"
        onClick={() => setShowDropdown((prev) => !prev)}
      >
        <FaBell className="bell-icon" />
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            className="notification-dropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="dropdown-header">
              <h4>Thông báo</h4>
              {notifications.length > 0 && (
                <button
                  className="clear-btn"
                  onClick={() => setNotifications([])}
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="empty-state">Không có thông báo</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`notification-item ${
                      n.isRead ? "" : "unread"
                    }`}
                  >
                    <div
                      className="content"
                      onClick={() => handleMarkAsRead(n._id)}
                    >
                      <h5>{n.title}</h5>
                      <p>{n.message}</p>
                      <span className="time">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(n._id)}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
