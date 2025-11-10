// BookingPage.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../Service/AxiosCustomize";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../scss/BookingPage.scss";
import { useSelector } from "react-redux";
import { getUserBalance } from "../../Service/ApiService/ApiUser";
import {
  getReviewsByTutor,
  getTutorById,
} from "../../Service/ApiService/ApiTutor";
import Header from "../../components/Layout/Header/Header";
import { ApiCreateConversation } from "../../Service/ApiService/ApiMessage";

export default function BookingPage() {
  const { tutorId } = useParams();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [numberOfMonths, setNumberOfMonths] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [balance, setBalance] = useState(null);
  const [note, setNote] = useState("");
  const [reviews, setReviews] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [availabilities, setAvailabilities] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [addressDetail, setAddressDetail] = useState("");
  const [province, setProvince] = useState("");
  const [schedules, setSchedules] = useState([]);
  const provinces = [
    "An Giang",
    "Bà Rịa - Vũng Tàu",
    "Bắc Giang",
    "Bắc Kạn",
    "Bạc Liêu",
    "Bắc Ninh",
    "Bến Tre",
    "Bình Dương",
    "Bình Định",
    "Bình Phước",
    "Bình Thuận",
    "Cà Mau",
    "Cao Bằng",
    "Đắk Lắk",
    "Đắk Nông",
    "Điện Biên",
    "Đồng Nai",
    "Đồng Tháp",
    "Gia Lai",
    "Hà Giang",
    "Hà Nam",
    "Hà Nội",
    "Hà Tĩnh",
    "Hải Dương",
    "Hải Phòng",
    "Hậu Giang",
    "Hòa Bình",
    "Hưng Yên",
    "Khánh Hòa",
    "Kiên Giang",
    "Kon Tum",
    "Lai Châu",
    "Lâm Đồng",
    "Lạng Sơn",
    "Lào Cai",
    "Long An",
    "Nam Định",
    "Nghệ An",
    "Ninh Bình",
    "Ninh Thuận",
    "Phú Thọ",
    "Phú Yên",
    "Quảng Bình",
    "Quảng Nam",
    "Quảng Ngãi",
    "Quảng Ninh",
    "Quảng Trị",
    "Sóc Trăng",
    "Sơn La",
    "Tây Ninh",
    "Thái Bình",
    "Thái Nguyên",
    "Thanh Hóa",
    "Thừa Thiên Huế",
    "Tiền Giang",
    "TP Hồ Chí Minh",
    "Trà Vinh",
    "Tuyên Quang",
    "Vĩnh Long",
    "Vĩnh Phúc",
    "Yên Bái",
    "Đà Nẵng",
    "Cần Thơ",
  ];

  const userId = useSelector((state) => state.user.account.id);
  const token = useSelector((state) => state.user.account.access_token);
  const navigate = useNavigate();

  const timeSlots = [
    "07:00 - 09:00",
    "09:30 - 11:30",
    "12:00 - 14:00",
    "14:30 - 16:30",
    "17:00 - 19:00",
    "19:30 - 21:30",
  ];

  // Lấy ngày hiện tại làm tuần gốc
  const [weekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const weekStartDate = new Date(today.setDate(diff));
    weekStartDate.setHours(0, 0, 0, 0);
    return weekStartDate;
  });

  const handleChatNow = async () => {
    try {
      const res = await ApiCreateConversation(tutor.user._id);
      if (res) navigate(`/messenger/${res._id}`);
      else toast.error("Không thể tạo cuộc trò chuyện");
    } catch (err) {
      toast.error("Lỗi khi bắt đầu trò chuyện");
    }
  };

  // Load dữ liệu gia sư, số dư, đánh giá
  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const res = await getTutorById(tutorId);
        if (res?.tutor) {
          setTutor(res.tutor);
          setSubjects(res.tutor.subjects || []);
        } else toast.error("Không thể tải thông tin gia sư");
      } catch {
        toast.error("Lỗi khi tải thông tin gia sư");
      }
    };
    const fetchBalance = async () => {
      try {
        const b = await getUserBalance();
        if (b !== null && b !== undefined) setBalance(b);
      } catch {
        toast.error("Không thể lấy thông tin số dư");
      }
    };
    const fetchReviews = async () => {
      try {
        const res = await getReviewsByTutor(tutorId);
        if (res) setReviews(res);
      } catch {
        toast.error("Lỗi khi tải đánh giá");
      }
    };
    if (tutorId) {
      fetchTutor();
      fetchBalance();
      fetchReviews();
    }
  }, [tutorId]);

  // Lấy lịch trống tuần hiện tại (chỉ tuần gốc, không chuyển tuần)
  const fetchAvailabilities = async () => {
    if (!tutorId || !weekStart) return;
    try {
      const params = { weekStart: weekStart.toISOString().split("T")[0] };
      const res = await axios.get(`/api/tutor/${tutorId}/availability`, {
        params,
      });

      const data = res?.data ?? res;
      setAvailabilities(data.availabilities || []);
      setSchedules(data.schedules || []);
      setSelectedSlots([]);
    } catch {
      toast.error("Lỗi khi tải lịch trống");
      setAvailabilities([]);
      setSchedules([]);
    }
  };

  useEffect(() => {
    fetchAvailabilities();
  }, [tutorId, weekStart]);

  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() + ((i - today.getDay() + 7) % 7));
      days.push(day);
    }
    return days;
  };

  const toggleSlot = (slotId) =>
    setSelectedSlots((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId]
    );

  const handleBooking = async () => {
    if (!selectedSubject) return toast.warn("Vui lòng chọn môn học");
    if (selectedSlots.length === 0)
      return toast.warn("Vui lòng chọn ít nhất 1 lịch trống");
    if (!province || !addressDetail)
      return toast.warn("Vui lòng nhập địa chỉ học");
    setLoading(true);
    try {
      const totalSessions = selectedSlots.length * numberOfMonths * 4;
      const totalAmount = tutor.pricePerHour * totalSessions;

      // Tiền 1 tháng học
      const monthlyPayment =
        numberOfMonths > 0 ? Math.round(totalAmount / numberOfMonths) : 0;

      // Nếu học > 1 tháng thì cọc = 1 tháng cuối, còn nếu chỉ học 1 tháng thì không cần cọc
      const deposit = numberOfMonths > 1 ? monthlyPayment : 0;

      // Tổng thanh toán ban đầu = tháng đầu + (cọc nếu có)
      const initialPayment = monthlyPayment + deposit;
      if (balance < initialPayment) {
        toast.error("Số dư không đủ để thanh toán tháng đầu và tiền cọc.");
        setLoading(false);
        return;
      }

      const address = `${addressDetail}, ${province}`.trim();

      const res = await axios.post(
        `/api/learner/bookings/${tutorId}`,
        {
          amount: totalAmount,
          monthlyPayment,
          deposit,
          initialPayment,
          numberOfMonths,
          note,
          subjectId: selectedSubject,
          availabilityIds: selectedSlots,
          addressDetail,
          province,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const body = res?.data ?? res;
      if (body?.success || body?.bookingId) {
        toast.success("Đặt lịch thành công!");
        setBalance((prev) =>
          typeof prev === "number" ? prev - initialPayment : prev
        );
        await fetchAvailabilities();
        setSelectedSlots([]);
      } else toast.error(body?.message || "Đặt lịch thất bại");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Đặt lịch thất bại");
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const renderTutorInfo = () => {
    const user = tutor?.user;

    // Dữ liệu môn học
    const subjectsList =
      subjects && subjects.length > 0
        ? subjects
        : [{ name: "Đang cập nhật", classLevel: "" }];

    return (
      <div className="tutor-card-elevated">
        {/* Ảnh đại diện */}
        <div className="tutor-avatar-wrapper">
          <img
            src={
              user?.image ||
              `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1
              }`
            }
            alt={`Ảnh đại diện của ${user?.username || "Gia sư"}`}
            className="tutor-avatar"
          />
        </div>

        {/* Thông tin chi tiết */}
        <div className="tutor-info-section">
          <h2 className="tutor-name">
            {user?.username || "Gia sư chuyên nghiệp"}
          </h2>

          {/* Môn học hiển thị dạng thẻ */}
          <div className="tutor-subjects">
            <i className="fa fa-book"></i>

            <div className="subjects-list">
              {subjectsList.map((s, index) => (
                <div key={index} className="subject-card">
                  {s.name}{" "}
                  {s.classLevel && (
                    <span className="class-tag">Lớp {s.classLevel}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="tutor-price">
            <i className="fa fa-tag"></i>
            <span className="label">Giá:</span>{" "}
            <span className="highlight">
              {tutor?.pricePerHour?.toLocaleString()} VND / giờ
            </span>
          </p>

          <p className="tutor-description">
            <i className="fa fa-info-circle"></i>
            <span className="label">Mô tả:</span>{" "}
            {tutor?.description ||
              "Gia sư tận tâm, giàu kinh nghiệm, sẵn sàng hỗ trợ bạn đạt mục tiêu học tập."}
          </p>

          {/* Thông tin phụ */}
          <div className="tutor-contact">
            <div className="contact-item">
              <i className="fa fa-envelope"></i>
              <span className="contact-label">Email:</span>
              <span className="contact-value">
                {user?.email || "Liên hệ qua Chat"}
              </span>
            </div>
            <div className="contact-item">
              <i className="fa fa-phone"></i>
              <span className="contact-label">SĐT:</span>
              <span className="contact-value">
                {user?.phoneNumber || "Đã ẩn"}
              </span>
            </div>
            <div className="contact-item">
              <i className="fa fa-user"></i>
              <span className="contact-label">Giới tính:</span>
              <span className="contact-value">
                {user?.gender || "Không rõ"}
              </span>
            </div>
          </div>

          <button className="btn-chat-now" onClick={handleChatNow}>
            <i className="fa fa-comment"></i> Trò chuyện ngay
          </button>
        </div>
      </div>
    );
  };

  // --- Tính toán lại dựa theo mô hình thanh toán tháng đầu + cọc ---
  const totalSessions = selectedSlots.length * numberOfMonths * 4;
  const totalAmount = tutor ? tutor.pricePerHour * totalSessions : 0;

  // Tiền 1 tháng học
  const monthlyPayment =
    numberOfMonths > 0 ? Math.round(totalAmount / numberOfMonths) : 0;

  // Nếu học > 1 tháng thì cọc = 1 tháng cuối, còn nếu chỉ học 1 tháng thì không cần cọc
  const deposit = numberOfMonths > 1 ? monthlyPayment : 0;

  // Tổng thanh toán ban đầu = tháng đầu + (cọc nếu có)
  const initialPayment = monthlyPayment + deposit;

  return (
    <>
      <Header />
      <div className="booking-wrapper">
        <div className="side-panel left-panel">
          <h3>Đánh giá từ học viên</h3>
          {reviews.length ? (
            <ul className="review-list">
              {reviews.map((r) => (
                <li key={r._id}>
                  {r.user?.username || "Ẩn danh"}: {r.comment}
                </li>
              ))}
            </ul>
          ) : (
            <p>Chưa có đánh giá nào.</p>
          )}
        </div>

        <div className="booking-container">
          <div className="booking-card">
            <h2>Xác nhận đặt lịch học</h2>
            {tutor ? renderTutorInfo() : <p>Đang tải...</p>}

            <div className="form-group">
              <label>Chọn môn học</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">--Chọn môn--</option>
                {subjects.map((sub) => (
                  <option key={sub._id} value={sub._id}>
                    {sub.name} lớp {sub.classLevel}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Số tháng học</label>
              <input
                type="number"
                min={1}
                value={numberOfMonths}
                onChange={(e) => setNumberOfMonths(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Hình thức thanh toán</label>
              <p>
                {numberOfMonths > 1 ? (
                  <>
                    Bạn sẽ thanh toán <strong>tháng đầu tiên</strong> và đặt cọc
                    thêm <strong>1 tháng cuối</strong> (sẽ được trừ vào tháng
                    học cuối cùng).
                  </>
                ) : (
                  <>
                    Bạn sẽ thanh toán <strong>tháng đầu tiên</strong> (không cần
                    đặt cọc vì chỉ học 1 tháng).
                  </>
                )}
              </p>
            </div>

            <div className="form-group">
              <label className="schedule-title">Chọn lịch trống</label>

              <div className="weekly-schedule-grid">
                <div className="grid-header">
                  {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(
                    (dayName, idx) => (
                      <div key={idx} className="grid-header-day">
                        {dayName}
                      </div>
                    )
                  )}
                </div>

                <div className="grid-body">
                  {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((dayName, idx) => {
                    const dayOfWeek = idx === 6 ? 0 : idx + 1;
                    return (
                      <div key={idx} className="grid-day-column">
                        {timeSlots.map((slotStr) => {
                          const [startTime, endTime] = slotStr.split(" - ").map((s) => s.trim());

                          const avail = availabilities.find(
                            (a) =>
                              a.dayOfWeek === dayOfWeek &&
                              a.startTime === startTime &&
                              a.endTime === endTime
                          );

                          const bookedSchedule = schedules.find(
                            (s) =>
                              new Date(s.date).getDay() === dayOfWeek &&
                              s.startTime === startTime &&
                              s.endTime === endTime
                          );

                          const isSelected = avail && selectedSlots.includes(avail._id);

                          // Xác định class:
                          // - available: slot trống
                          // - selected: slot trống đã chọn
                          // - no-slot: slot không có lịch trống hoặc đã book
                          const cls = avail
                            ? isSelected
                              ? "selected"
                              : "available"
                            : "no-slot"; // slot không trống hoặc đã book

                          // Nếu slot có avail nhưng đã book, cũng set class "no-slot"
                          const finalCls = avail && (avail.isBooked || avail.bookingId || bookedSchedule)
                            ? "no-slot"
                            : cls;

                          return (
                            <div
                              key={`${dayName}-${slotStr}`}
                              className={`schedule-slot ${finalCls}`}
                              onClick={() => {
                                if (!avail || finalCls === "no-slot") return; // không click được
                                toggleSlot(avail._id);
                              }}
                            >
                              <span className="slot-time">{slotStr}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}

                </div>
              </div>

              <div className="selected-info">
                <strong>Đã chọn:</strong> {selectedSlots.length} khung giờ
              </div>
            </div>

            <div className="form-group">
              <label>Địa chỉ chi tiết</label>
              <input
                type="text"
                placeholder="Nhập địa chỉ chi tiết"
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Chọn tỉnh/thành</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              >
                <option value="">--Chọn tỉnh/thành--</option>
                {provinces.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Ghi chú</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
              ></textarea>
            </div>

            <div className="form-group">
              <label>Số dư tài khoản</label>
              <input
                type="text"
                value={
                  balance !== null && balance !== undefined
                    ? balance.toLocaleString() + " VND"
                    : ""
                }
                disabled
              />
            </div>

            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={loading || !tutor}
              className="btn-booking"
            >
              {loading ? "Đang xử lý..." : "Đặt lịch học"}
            </button>
          </div>
        </div>

        <div className="side-panel right-panel">
          <h3 className="panel-title">
            <i className="fa fa-handshake"></i> Cam kết từ gia sư
          </h3>



          <div className="guarantee-section">
            {/* Nhóm 1: Cam kết chính */}
            <div className="guarantee-item">
              <div className="icon-wrapper punctual">
                <i className="fa fa-clock"></i>
              </div>
              <div className="guarantee-text">
                <h4>Đúng giờ & chuyên nghiệp</h4>
                <p>
                  Gia sư luôn đảm bảo bắt đầu buổi học đúng giờ, duy trì thái độ chuyên nghiệp và
                  tôn trọng thời gian của học viên. Mọi thay đổi về lịch học đều được thông báo trước tối thiểu 24 giờ.
                </p>
              </div>
            </div>

            <div className="guarantee-item">
              <div className="icon-wrapper prepared">
                <i className="fa fa-book-open"></i>
              </div>
              <div className="guarantee-text">
                <h4>Chuẩn bị bài kỹ lưỡng</h4>
                <p>
                  Trước mỗi buổi học, gia sư dành thời gian nghiên cứu chương trình, lựa chọn ví dụ thực tế,
                  và chuẩn bị bài tập phù hợp với năng lực từng học viên để đảm bảo buổi học hiệu quả nhất.
                </p>
              </div>
            </div>

            <div className="guarantee-item">
              <div className="icon-wrapper support">
                <i className="fa fa-headset"></i>
              </div>
              <div className="guarantee-text">
                <h4>Hỗ trợ tận tình ngoài giờ</h4>
                <p>
                  Gia sư sẵn sàng hỗ trợ học viên giải đáp câu hỏi ngoài giờ học thông qua chat hoặc email.
                  Luôn đồng hành và động viên học viên trong quá trình đạt mục tiêu học tập dài hạn.
                </p>
              </div>
            </div>

            {/* Nhóm 2: Cam kết bổ sung */}
            <div className="guarantee-item">
              <div className="icon-wrapper quality">
                <i className="fa fa-graduation-cap"></i>
              </div>
              <div className="guarantee-text">
                <h4>Cam kết chất lượng giảng dạy</h4>
                <p>
                  Mỗi buổi học được thiết kế để mang lại kiến thức vững chắc, ứng dụng thực tế và
                  phát triển tư duy độc lập cho học viên. Học viên có thể yêu cầu điều chỉnh phương pháp nếu cần.
                </p>
              </div>
            </div>

            <div className="guarantee-item">
              <div className="icon-wrapper tracking">
                <i className="fa fa-line-chart"></i>
              </div>
              <div className="guarantee-text">
                <h4>Theo dõi tiến bộ học tập</h4>
                <p>
                  Sau mỗi giai đoạn học, gia sư cung cấp nhận xét chi tiết về điểm mạnh, điểm cần cải thiện
                  và đề xuất phương pháp luyện tập phù hợp để học viên tiến bộ rõ rệt.
                </p>
              </div>
            </div>

            <div className="guarantee-item">
              <div className="icon-wrapper feedback">
                <i className="fa fa-comments"></i>
              </div>
              <div className="guarantee-text">
                <h4>Phản hồi nhanh & thân thiện</h4>
                <p>
                  Gia sư phản hồi tin nhắn hoặc yêu cầu trong vòng 12 giờ. Luôn giữ thái độ tích cực,
                  hỗ trợ tận tâm và sẵn sàng lắng nghe ý kiến từ học viên và phụ huynh.
                </p>
              </div>
            </div>
          </div>

          {/* Phần tin tưởng */}
          <div className="tutor-promise-footer">
            <i className="fa fa-star"></i>
            <p>
              Với mỗi cam kết, gia sư hướng đến việc mang lại trải nghiệm học tập tốt nhất – nơi học viên cảm thấy được tôn trọng, được truyền cảm hứng và đạt được tiến bộ thực sự.
            </p>
          </div>
        </div>

      </div>

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content-booking">
            {" "}
            {/* Đổi tên class trở lại là .modal-content để dễ áp dụng SCSS */}
            <h3>XÁC NHẬN THANH TOÁN & ĐẶT LỊCH</h3>
            {/* THÔNG BÁO QUAN TRỌNG VỀ THANH TOÁN */}
            <p className="modal-intro-text">
              Vui lòng kiểm tra kỹ chi tiết thanh toán. Sau khi xác nhận, số
              tiền
              <strong> {initialPayment.toLocaleString()} VND </strong> (gồm tiền
              tháng đầu tiên và tiền cọc) sẽ được **trừ ngay lập tức** khỏi số
              dư tài khoản của bạn.
            </p>
            <div className="payment-details">
              {/* DÒNG CHI TIẾT */}
              <p>
                <strong>Tổng thời hạn học:</strong>{" "}
                <span>{numberOfMonths} tháng</span>
              </p>
              <p>
                <strong>Số buổi/khung giờ đã chọn:</strong>{" "}
                <span>{selectedSlots.length} buổi/tuần</span>
              </p>
              <p>
                <strong>Tổng số buổi dự kiến (2h/buổi):</strong>{" "}
                <span>{totalSessions} buổi</span>
              </p>
              <p className="line-item">
                <strong>Tổng giá trị khóa học:</strong>{" "}
                <span className="value-total">
                  {totalAmount.toLocaleString()} VND
                </span>
              </p>
              <p className="line-item">
                <strong>Thanh toán hàng tháng:</strong>{" "}
                <span className="value-monthly">
                  {monthlyPayment.toLocaleString()} VND
                </span>
              </p>
              {numberOfMonths > 1 && (
                <p className="line-item">
                  <strong>Tiền cọc (Tháng cuối):</strong>
                  <span className="value-deposit">
                    {deposit.toLocaleString()} VND
                  </span>
                </p>
              )}

              {/* DÒNG TỔNG THANH TOÁN BAN ĐẦU (NỔI BẬT) */}
              <div className="initial-payment-total">
                <p>
                  <strong style={{ fontSize: "1.1em" }}>
                    TỔNG THANH TOÁN BAN ĐẦU:
                  </strong>
                  <span className="value-initial">
                    {initialPayment.toLocaleString()} VND
                  </span>
                </p>
              </div>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn btn-secondary"
              >
                HỦY BỎ
              </button>
              <button
                onClick={handleBooking}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT LỊCH"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
