// src/components/Review/RatingStar.js
import React, { useState } from "react";
import "./RatingStar.scss";

const labels = ["Tệ", "Không tốt", "Bình thường", "Tốt", "Xuất sắc"];

const RatingStar = ({ value, onChange, readOnly = false }) => {
  const [hover, setHover] = useState(null);

  return (
    <div className="rating-star">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${(hover || value) >= star ? "filled" : ""}`}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(null)}
          onClick={() => !readOnly && onChange && onChange(star)}
          style={{ cursor: readOnly ? "default" : "pointer" }}
        >
          ★
        </span>
      ))}
      <div className="star-label">
        {hover ? labels[hover - 1] : labels[value - 1]}
      </div>
    </div>
  );
};

export default RatingStar;
