import React, { useEffect, useState } from 'react';
import { getReviewsByTutor, getReviewsByCourse } from '../../Service/ApiService';
import RatingStar from './RatingStar'; 

const ReviewList = ({ tutorId, courseId, refresh }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        let res;
        if (tutorId) {
          res = await getReviewsByTutor(tutorId);
        } else {
          res = await getReviewsByCourse(courseId);
        }
        setReviews(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [tutorId, courseId, refresh]);

  return (
    <div>
      <h4>Đánh giá:</h4>
      {loading ? <p>Đang tải...</p> : (
        <>
          {Array.isArray(reviews) && reviews.length === 0 && <p>Chưa có đánh giá nào.</p>}
          {Array.isArray(reviews) && reviews.map((r, idx) => (
            <div key={idx} className="review-item" style={{borderBottom: '1px solid #ccc', marginBottom: 8}}>
              <div>
                <b>{r.user?.username || 'Ẩn danh'}</b>
                <RatingStar value={r.rating} readOnly />
              </div>
              <div className="review-comment">{r.comment}</div>
              <div style={{fontSize: 12, color: '#888'}}>{new Date(r.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default ReviewList;
