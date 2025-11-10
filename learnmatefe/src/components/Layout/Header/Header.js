import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaShoppingBag, FaComments, FaChalkboardTeacher } from "react-icons/fa";
import axios from "../../../Service/AxiosCustomize";
import "./Header.scss";
import {
  getTutorActiveStatus,
  updateTutorActiveStatus,
} from "../../../Service/ApiService/ApiTutor";
import { Button } from "antd";

const Header = () => {
  const navigate = useNavigate();
  const accessToken = useSelector((state) => state.user.account.access_token);
  const role = useSelector((state) => state.user.account.role);
  const [showDropdown, setShowDropdown] = useState(false);
  const [savedTutorIds, setSavedTutorIds] = useState([]);
  const dropdownRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  const [user, setUser] = useState(null);
  useEffect(() => {
    const fetchTutorStatus = async () => {
      if (role === "tutor" && accessToken) {
        try {
          const res = await getTutorActiveStatus();
          setIsActive(res.active);
        } catch (err) {
          console.error("Lỗi lấy trạng thái tutor:", err);
        }
      }
    };
    fetchTutorStatus();
  }, [role, accessToken]);
  const toggleTutorStatus = async () => {
    try {
      const newStatus = !isActive;
      await updateTutorActiveStatus(newStatus);
      setIsActive(newStatus);
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái tutor:", err);
    }
  };
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/learner/profile", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setUser(res);
      } catch (err) {
        console.error("Lỗi lấy profile:", err);
      }
    };
    if (accessToken) fetchProfile();
  }, [accessToken]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="custom-header">
      <div className="header-inner">
        <Link to="/" className="logo-text">
          <FaChalkboardTeacher className="logo-icon" />
          LearnMate
        </Link>

        <nav className="nav-links">
          <Link to="/tutor">Tìm gia sư</Link>
          <Link to="/community">Cộng đồng</Link>
          {accessToken && (
            <Link to="/messenger">
               Trò chuyện
            </Link>
          )}
          {accessToken && <Link to="/user/my-courses">Khóa học</Link>}
          {accessToken && <Link to="/user/bookinghistory">Lịch sử</Link>}
          {role === "tutor" && (
            <Link to="/TutorDashboard">BookingManagement</Link>
          )}
          {role === "admin" && <Link to="/admin/dashboard">Admin</Link>}
        </nav>

        <div className="header-right">
          {accessToken ? (
            <>
              <div
                className="cart-icon"
                onClick={() => navigate("/saved-tutors")}
              >
                <FaShoppingBag />
                {savedTutorIds.length > 0 && (
                  <span className="cart-badge">{savedTutorIds.length}</span>
                )}
              </div>
              {role === "tutor" && (
                <div className={`tutor-status-toggle ${isActive ? "active" : "inactive"}`}>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={toggleTutorStatus}
                    />
                    <span className="slider round"></span>
                  </label>
                  <span className="status-label">
                    {isActive ? "Đang nhận học viên" : "Tạm ẩn"}
                  </span>
                </div>
              )}

              <div className="avatar-group" ref={dropdownRef}>
                {user && (
                  <div className="flex items-center">
                    <img
                      src={user.image || "https://i.pravatar.cc/150?img=32"}
                      alt="avatar"
                      className="avatar-img"
                      onClick={() => setShowDropdown(!showDropdown)}
                    />
                    <span className="username-text">{user.username}</span>
                  </div>
                )}
                {showDropdown && (
                  <ul className="dropdown-menu">
                    <li
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/profile");
                      }}
                    >
                      Trang cá nhân
                    </li>
                    <li
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/user/paymentinfo");
                      }}
                    >
                      Thanh toán
                    </li>
                    <li
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/user/bookinghistory");
                      }}
                    >
                      Lịch sử đặt lịch
                    </li>
                    <li
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/user/my-courses");
                      }}
                    >
                      Khóa học của tôi
                    </li>
                    <li
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/signin");
                      }}
                    >
                      Đăng xuất
                    </li>
                  </ul>
                )}
              </div>
            </>
          ) : (
            <div className="auth-btns">
              <button
                className="btn-outline"
                onClick={() => navigate("/signin")}
              >
                Đăng nhập
              </button>
              <button
                className="btn-filled"
                onClick={() => navigate("/signup")}
              >
                Đăng ký
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
