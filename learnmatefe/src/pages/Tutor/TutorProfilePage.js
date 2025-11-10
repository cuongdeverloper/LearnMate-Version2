// src/pages/TutorProfilePage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../Service/AxiosCustomize";
import {
  FaStar,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBook,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./TutorProfilePage.scss";

export default function TutorProfilePage() {
  const { tutorId } = useParams();
  const [tutor, setTutor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTutor();
  }, [tutorId]);

  const fetchTutor = async () => {
    try {
      const res = await axios.get(`/api/learner/tutors/${tutorId}`);
      setTutor(res.tutor);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin gia sư:", error);
      toast.error("Không thể tải thông tin gia sư.");
      navigate("/tutor");
    }
  };

  if (!tutor) {
    return <div className="loading">Đang tải thông tin gia sư...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img
          className="profile-avatar"
          src={
            tutor?.user?.image ||
            "https://i.pravatar.cc/150?img=" +
              (Math.floor(Math.random() * 70) + 1)
          }
          alt={tutor.user?.username || "Gia sư"}
        />
        <div className="profile-info">
          <h2>{tutor.user?.username}</h2>
          <div className="profile-rating">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                color={i < Math.round(tutor.rating) ? "#ffc107" : "#e4e5e9"}
              />
            ))}
            <span>
              {tutor.rating ? tutor.rating.toFixed(1) : "Chưa có đánh giá"}
            </span>
          </div>
          <p>
            <FaMapMarkerAlt /> {tutor.location || "Địa điểm chưa cập nhật"}
          </p>
          <p>
            <FaGraduationCap /> {tutor.education || "Thông tin học vấn chưa có"}
          </p>
          <div className="profile-price">
            {tutor.pricePerHour?.toLocaleString() || "Liên hệ"} VND / buổi
          </div>
        </div>
      </div>

      <div className="profile-body">
        <section className="profile-section">
          <h3>📖 Môn dạy</h3>
          <p>
            {tutor.subjects?.length
              ? tutor.subjects
                  .map((s) => `${s.name} lớp ${s.classLevel}`)
                  .join(", ")
              : "Đang cập nhật"}
          </p>
        </section>

        <section className="profile-section">
          <h3>🎓 Giới thiệu</h3>
          <p>
            {tutor.bio ||
              "Gia sư nhiệt tình, chuyên nghiệp, cam kết giúp học sinh tiến bộ nhanh chóng."}
          </p>
        </section>

        <section className="profile-section">
          <h3>📜 Chứng chỉ</h3>
          {tutor.certifications && tutor.certifications.length > 0 ? (
            <ul>
              {tutor.certifications.map((cert, idx) => (
                <li key={idx}>
                  <FaBook /> {cert.title} - {cert.issuedBy} ({cert.year})
                </li>
              ))}
            </ul>
          ) : (
            <p>Chưa có chứng chỉ</p>
          )}
        </section>
      </div>

      <div className="profile-actions">
        <button
          className="btn-book"
          onClick={() => navigate(`/book/${tutorId}`)}
        >
          Đặt Lịch Ngay
        </button>
        <button className="btn-back" onClick={() => navigate("/tutor")}>
          Quay lại danh sách
        </button>
      </div>
    </div>
  );
}
