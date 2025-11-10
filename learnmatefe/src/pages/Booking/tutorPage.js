// src/pages/TutorListPage.js
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "../../Service/AxiosCustomize";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaStar } from "react-icons/fa";
import { FaBookmark, FaShoppingBag } from "react-icons/fa";
import { toast } from "react-toastify"; // Import toast
import "../../scss/TutorListPage.scss";

const classSubjectsMap = {
  1: ["Math", "Tiếng Việt"],
  2: ["Toán", "Tiếng Việt", "Tiếng Anh"],
  3: ["Toán", "Tiếng Việt", "Tiếng Anh"],
  4: ["Toán", "Tiếng Việt", "Tiếng Anh", "Khoa học"],
  5: ["Toán", "Tiếng Việt", "Tiếng Anh", "Khoa học", "Lịch Sử"],
  6: ["Toán", "Văn", "Tiếng Anh", "Vật Lý"],
  7: ["Toán", "Văn", "Tiếng Anh", "Vật Lý", "Hóa Học", "Sinh Học"],
  8: ["Toán", "Văn", "Tiếng Anh", "Vật Lý", "Hóa Học", "Sinh Học", "Lịch Sử"],
  9: ["Toán", "Văn", "Tiếng Anh", "Vật Lý", "Hóa Học", "Sinh Học", "Địa Lý"],
  10: ["Toán", "Văn", "Tiếng Anh", "Lý", "Hóa", "Sinh", "Tin Học"],
  11: ["Toán", "Văn", "Tiếng Anh", "Lý", "Hóa", "Sinh", "Tin Học"],
  12: ["Toán", "Văn", "Tiếng Anh", "Lý", "Hóa", "Sinh", "Tin Học"],
};

export default function TutorListPage() {
  const [tutors, setTutors] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [filters, setFilters] = useState({
    name: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
  });

  // Lấy accessToken từ Redux store
  const accessToken = useSelector((state) => state.user.account.access_token);
  // Thay vì loggedInUser, chúng ta có thể lấy các thông tin cần thiết (như avatar) từ token nếu nó được lưu ở đó,
  // hoặc fetch từ API /me nếu cần. Hiện tại, để đơn giản, chúng ta sẽ dùng ảnh mặc định cho avatar.

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [savedTutorIds, setSavedTutorIds] = useState([]);

  const navigate = useNavigate();

  // Hàm để lấy danh sách gia sư đã lưu từ backend
  const fetchSavedTutorIds = useCallback(async () => {
    // // Chỉ kiểm tra sự tồn tại của accessToken
    if (!accessToken) {
      setSavedTutorIds([]);
      return;
    }
    try {
      const res = await axios.get(`/api/learner/saved-tutors`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // API trả về mảng các đối tượng tutor, ta chỉ cần ID của chúng
      setSavedTutorIds((res || []).map((tutor) => tutor?._id));
    } catch (error) {
      console.error("Lỗi khi lấy danh sách gia sư đã lưu:", error);
      if (error.response && error.response.status === 401) {
        toast.error(
          "Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại."
        ); // Thay thế alert
        navigate("/login");
      }
      setSavedTutorIds([]);
    }
  }, [navigate]);

  useEffect(() => {
    fetchTutors();
    // Chỉ gọi fetchSavedTutorIds nếu có accessToken
    if (accessToken) {
      fetchSavedTutorIds();
    } else {
      setSavedTutorIds([]); // Reset nếu không có token
    }
  }, [accessToken, fetchSavedTutorIds]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Đảm bảo click vào avatar không đóng dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); // Bỏ dependency dropdownRef nếu không cần thiết, hoặc đảm bảo nó ổn định

  const fetchTutors = async (filterParams = {}) => {
    try {
      const currentFilters = {
        ...filterParams,
        class: selectedClass,
        subject: selectedSubject,
      };

      const cleanFilters = Object.fromEntries(
        Object.entries(currentFilters).filter(
          ([_, value]) => value !== "" && value !== null
        )
      );

      const res = await axios.get("/api/learner/tutors", {
        params: cleanFilters,
      });

      const activeTutors = (res.tutors || []).filter(
        (tutor) => tutor.active === true
      );
      setTutors(activeTutors);
    } catch (error) {
      toast.error("Lấy danh sách tutor thất bại"); // Thay thế alert
      console.error(error);
    }
  };

  const handleClassSelect = (grade) => {
    if (selectedClass === grade) {
      setSelectedClass(null);
      setSelectedSubject("");
      fetchTutors(filters);
    } else {
      setSelectedClass(grade);
      setSelectedSubject("");
      fetchTutors({ ...filters, class: grade, subject: "" });
    }
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    fetchTutors({
      ...filters,
      class: selectedClass,
      subject,
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value ?? "" }));
  };

  const handleFilterApply = () => {
    fetchTutors({
      ...filters,
      class: selectedClass,
      subject: selectedSubject,
    });
  };

  // Hàm xử lý việc thêm/xóa gia sư vào danh sách lưu trên database
  const handleToggleSavedTutor = async (e, tutor) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra thẻ cha (card)

    // Chỉ kiểm tra accessToken
    if (!accessToken) {
      toast.info("Bạn cần đăng nhập để lưu gia sư!"); // Thay thế alert
      navigate("/signin");
      return;
    }

    const isAlreadySaved = savedTutorIds.includes(tutor._id);

    try {
      if (isAlreadySaved) {
        const res = await axios.delete(
          `/api/learner/saved-tutors/${tutor._id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setSavedTutorIds((prev) => prev.filter((id) => id !== tutor._id));
        toast.success(res.message || "Đã xóa gia sư khỏi danh sách lưu."); // Thay thế alert, thêm fallback message
      } else {
        const res = await axios.post(
          `/api/learner/saved-tutors/${tutor._id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setSavedTutorIds((prev) => [...prev, tutor._id]);
        toast.success(res.message || "Đã thêm gia sư vào danh sách lưu!"); // Thay thế alert, thêm fallback message
      }
    } catch (error) {
      console.error(
        "Lỗi khi cập nhật danh sách gia sư đã lưu:",
        error.response?.data || error.message
      );
      if (error.response && error.response.status === 401) {
        toast.error(
          "Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại."
        ); // Thay thế alert
        navigate("/login");
      } else {
        toast.error(
          `Không thể cập nhật danh sách gia sư: ${
            error.response?.data?.message || "Lỗi không xác định"
          }`
        ); // Thay thế alert
      }
    }
  };

  const handleBookNowClick = (e, tutorId) => {
    e.stopPropagation();
    navigate(`/book/${tutorId}`);
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Tìm Gia Sư Hoàn Hảo Của Bạn</h1>
        <p className="sub-title">
          Khám phá danh sách gia sư chất lượng cao, phù hợp với mọi nhu cầu học
          tập.
        </p>
      </header>

      <div className="main-layout">
        <aside className="sidebar-grade-subject">
          <div className="grade-select">
            <label>Chọn lớp học:</label>
            <div className="grade-options-vertical">
              {[...Array(12)].map((_, i) => (
                <div key={i + 1}>
                  <button
                    className={`grade-btn ${
                      selectedClass === i + 1 ? "selected" : ""
                    }`}
                    onClick={() => handleClassSelect(i + 1)}
                  >
                    Lớp {i + 1}
                  </button>
                  {selectedClass === i + 1 && (
                    <div className="subject-options-vertical">
                      {(classSubjectsMap[i + 1] || []).map((subj, idx) => (
                        <button
                          key={idx}
                          className={`subject-btn ${
                            selectedSubject === subj ? "selected" : ""
                          }`}
                          onClick={() => handleSubjectSelect(subj)}
                        >
                          {subj}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="main-content">
          <section className="filter-section">
            <div className="filter-main">
              <div className="filter-row">
                <div className="filter-group">
                  <label htmlFor="name">Tên Gia Sư</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={filters.name}
                    onChange={handleFilterChange}
                    placeholder="Tìm theo tên..."
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="minPrice">Giá tối thiểu</label>
                  <input
                    id="minPrice"
                    type="number"
                    name="minPrice"
                    value={filters.minPrice ?? ""}
                    onChange={handleFilterChange}
                    placeholder="VND"
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="maxPrice">Giá tối đa</label>
                  <input
                    id="maxPrice"
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice ?? ""}
                    onChange={handleFilterChange}
                    placeholder="VND"
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="minRating">Đánh giá tối thiểu</label>
                  <input
                    id="minRating"
                    type="number"
                    name="minRating"
                    step="0.1"
                    min="0"
                    max="5"
                    value={filters.minRating ?? ""}
                    onChange={handleFilterChange}
                    placeholder="0.0 - 5.0"
                  />
                </div>
                <div className="filter-group">
                  <label htmlFor="location">Khu vực</label>
                  <input
                    id="location"
                    type="text"
                    name="location"
                    value={filters.location ?? ""}
                    onChange={handleFilterChange}
                    placeholder="VD: Hà Nội, TP.HCM..."
                  />
                </div>
                <div className="filter-group filter-btn-group">
                  <button
                    onClick={handleFilterApply}
                    className="btn btn-primary btn-filter"
                  >
                    Lọc Gia Sư
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="tutor-list-section">
            {tutors.length === 0 ? (
              <p className="no-result">
                Không tìm thấy gia sư phù hợp với tiêu chí của bạn.
              </p>
            ) : (
              <div className="tutor-list">
                {tutors.map((tutor) => {
                  const isSaved = savedTutorIds.includes(tutor._id);
                  return (
                    <div
                      key={tutor._id}
                      className="tutor-card"
                      onClick={() => navigate(`/tutor/profile/${tutor._id}`)}
                    >
                      <img
                        className="tutor-avatar"
                        src={
                          tutor?.user?.image ||
                          "https://i.pravatar.cc/100?img=" +
                            (Math.floor(Math.random() * 70) + 1)
                        }
                        alt={tutor.user?.username || "Gia sư"}
                      />
                      <div className="tutor-info">
                        <h3>{tutor.user?.username || "Gia sư chưa có tên"}</h3>
                        <div className="rating">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className="star-icon"
                              color={
                                i < Math.round(tutor.rating)
                                  ? "#ffc107"
                                  : "#e4e5e9"
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
                        <p>
                          <strong>Khu vực:</strong>{" "}
                          {tutor.location || "Chưa cập nhật"}
                        </p>
                        <p className="tutor-desc">
                          {tutor.bio ||
                            "Gia sư chuyên nghiệp, tận tâm, cam kết giúp học sinh tiến bộ trong thời gian ngắn nhất."}
                        </p>
                        <div className="tutor-price">
                          Giá:{" "}
                          {tutor.pricePerHour?.toLocaleString() || "Liên hệ"}{" "}
                          VND / buổi
                        </div>
                        <div className="tutor-actions">
                          <button
                            className={`btn-add-to-list ${
                              isSaved ? "added" : ""
                            }`}
                            onClick={(e) => handleToggleSavedTutor(e, tutor)}
                          >
                            {isSaved ? "Đã lưu" : "Lưu vào danh sách"}
                          </button>
                          <button
                            className="btn-book"
                            onClick={(e) => handleBookNowClick(e, tutor._id)}
                          >
                            Đặt Lịch Ngay
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
