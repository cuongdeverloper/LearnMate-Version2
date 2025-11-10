// src/pages/SavedTutorsPage.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../Service/AxiosCustomize";
import { useSelector } from "react-redux";
import { FaStar, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import "../../scss/SavedTutorsPage.scss"; // đổi scss riêng

export default function SavedTutorsPage() {
  const [savedTutors, setSavedTutors] = useState([]);
  const navigate = useNavigate();
  const accessToken = useSelector((state) => state.user.account.access_token);

  const fetchSavedTutors = useCallback(async () => {
    if (!accessToken) {
      setSavedTutors([]);
      return;
    }
    try {
      const res = await axios.get(`/api/learner/saved-tutors`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setSavedTutors(res || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách gia sư đã lưu:", error);
      toast.error("Không thể tải danh sách. Vui lòng thử lại.");
      setSavedTutors([]);
    }
  }, [accessToken, navigate]);

  useEffect(() => {
    fetchSavedTutors();
  }, [fetchSavedTutors]);

  const handleRemoveFromList = async (tutorId) => {
    try {
      await axios.delete(`/api/learner/saved-tutors/${tutorId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      fetchSavedTutors();
      toast.success("Đã xóa gia sư khỏi danh sách.");
    } catch (error) {
      console.error("Lỗi khi xóa gia sư:", error);
      toast.error("Không thể xóa gia sư.");
    }
  };

  return (
    <div className="saved-tutors-page">
      <header className="saved-tutors-header">
        <h1>Gia Sư Đã Lưu</h1>
        <p>Dưới đây là danh sách các gia sư bạn đã quan tâm.</p>
      </header>

      <main className="saved-tutors-main">
        {savedTutors.length === 0 ? (
          <p className="saved-tutors-empty">Bạn chưa lưu gia sư nào.</p>
        ) : (
          <div className="saved-tutors-grid">
            {savedTutors.map((tutor) => (
              <div key={tutor._id} className="saved-tutor-card">
                <img
                  className="saved-tutor-avatar"
                  src={
                    tutor.user?.image ||
                    `https://i.pravatar.cc/150?img=${
                      Math.floor(Math.random() * 70) + 1
                    }`
                  }
                  alt={tutor.user?.username || "Gia sư"}
                />
                <div className="saved-tutor-info">
                  <h3>{tutor.user?.username || "Chưa có tên"}</h3>
                  <div className="saved-tutor-rating">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        color={
                          i < Math.round(tutor.rating) ? "#ffc107" : "#e4e5e9"
                        }
                      />
                    ))}
                    <span>
                      {tutor.rating
                        ? tutor.rating.toFixed(1)
                        : "Chưa có đánh giá"}
                    </span>
                  </div>
                  <p>
                    <strong>Môn dạy:</strong>{" "}
                    {tutor.subjects?.length
                      ? tutor.subjects
                          .map((s) => `${s.name} lớp ${s.classLevel}`)
                          .join(", ")
                      : "Đang cập nhật"}
                  </p>
                  <p className="saved-tutor-bio">
                    {tutor.bio ||
                      "Gia sư tận tâm, nhiệt tình và chuyên nghiệp."}
                  </p>
                  <div className="saved-tutor-price">
                    Giá: {tutor.pricePerHour?.toLocaleString() || "Liên hệ"} VND
                    / giờ
                  </div>
                  <div className="saved-tutor-actions">
                    <button
                      className="btn-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromList(tutor._id);
                      }}
                    >
                      <FaTrash /> Xóa
                    </button>
                    <button
                      className="btn-book"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/book/${tutor._id}`);
                      }}
                    >
                      Đặt Lịch
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
