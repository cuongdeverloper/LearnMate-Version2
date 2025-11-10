// src/components/Review/ReviewForm.js
import React, { useState } from "react";
import { createReview } from "../../Service/ApiService/ApiBooking";
import RatingStar from "./RatingStar";
import "./ReviewForm.scss";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ReviewForm = ({ tutorId, courseId }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tutorId || !courseId) {
      toast.warn("Thiếu thông tin gia sư hoặc khóa học");
      return;
    }

    try {
      setLoading(true);
      await createReview({ tutor: tutorId, course: courseId, rating, comment });
      toast.success("Gửi đánh giá thành công!", {
        onClose: () => navigate("/tutor"),
        autoClose: 2000,
      });
      setRating(5);
      setComment("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-form-card">
      <h2 className="review-title">✨ Đánh giá khóa học của bạn</h2>
      <p className="review-subtitle">
        Cảm ơn bạn đã hoàn thành khóa học! Hãy chia sẻ trải nghiệm của bạn để
        giúp các học viên khác nhé.
      </p>

      <form className="review-form" onSubmit={handleSubmit}>
        <div className="rating-section">
          <label>Đánh giá chất lượng gia sư:</label>
          <RatingStar value={rating} onChange={setRating} />
        </div>

        <div className="comment-section">
          <label>Nhận xét của bạn:</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            placeholder="Ví dụ: Gia sư rất tận tâm, bài giảng dễ hiểu..."
          />
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? "Đang gửi..." : "Gửi đánh giá"}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
