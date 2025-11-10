import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ReviewForm from './ReviewForm';

const ReviewCoursePage = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const tutorId = location.state?.tutorId;

  if (!tutorId) {
    return <div>Không tìm thấy gia sư</div>;
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <h2>Đánh giá khóa học</h2>
      <ReviewForm courseId={bookingId} tutorId={tutorId} />
    </div>
  );
};

export default ReviewCoursePage; 