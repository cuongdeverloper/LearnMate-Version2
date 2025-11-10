import React, { useEffect, useState } from "react";
import axios from "../../Service/AxiosCustomize";
import { useSelector } from "react-redux";
import "../../scss/BookingHistory.scss";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaTrashAlt,
  FaCoins,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../components/Layout/Header/Header";

const ConfirmModal = ({ show, onClose, onConfirm, message }) => {
  if (!show) return null;
  return (
    <div className="modal-overlay-cancel">
      <div className="modal-content-cancel">
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-confirm" onClick={onConfirm}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

const BookingHistoryPage = () => {
  const userId = useSelector((state) => state.user.account.id);
  const token = useSelector((state) => state.user.account.access_token);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  useEffect(() => {
    fetchBookingHistory();
  }, []);

  const fetchBookingHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/booking/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedBookings = (res.bookings || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setBookings(sortedBookings);
    } catch (err) {
      console.error("Lỗi lấy lịch sử đặt lịch:", err);
      setError("Không thể tải lịch sử đặt lịch. Vui lòng thử lại sau.");
      toast.error("Không thể tải lịch sử đặt lịch.");
    } finally {
      setLoading(false);
    }
  };

  const confirmCancel = (bookingId) => {
    setSelectedBookingId(bookingId);
    setShowCancelModal(true);
  };

  const handleCloseModal = () => {
    setShowCancelModal(false);
    setSelectedBookingId(null);
  };

  const handleConfirmCancel = async () => {
    setShowCancelModal(false);
    if (!selectedBookingId) return;
    try {
      await axios.patch(
        `/api/booking/bookings/${selectedBookingId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Đã hủy đặt lịch và hoàn tiền !");
      fetchBookingHistory();
    } catch (err) {
      console.error("Lỗi khi hủy đặt lịch:", err);
      let errorMessage = "Đã xảy ra lỗi khi hủy đặt lịch.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setSelectedBookingId(null);
    }
  };

  const renderStatus = (status) => {
    switch (status) {
      case "approve":
        return (
          <span className="status approve">
            <FaCheckCircle /> Đã duyệt
          </span>
        );
      case "cancelled":
        return (
          <span className="status cancelled">
            <FaTimesCircle /> Đã hủy
          </span>
        );
      case "completed":
        return (
          <span className="status completed">
            <FaCheckCircle /> Hoàn thành
          </span>
        );
      case "rejected":
        return (
          <span className="status rejected">
            <FaTimesCircle /> Từ chối
          </span>
        );
      default:
        return (
          <span className="status pending">
            <FaClock /> Chờ duyệt
          </span>
        );
    }
  };

  if (loading)
    return (
      <div className="booking-history-container">
        <p>Đang tải lịch sử đặt lịch...</p>
      </div>
    );
  if (error)
    return (
      <div className="booking-history-container">
        <p>{error}</p>
      </div>
    );

  return (
    <>
      <Header />
      <div className="booking-history-container">
        <h2>Lịch sử đặt lịch của bạn</h2>

        {bookings.length === 0 ? (
          <p className="empty-history">Bạn chưa có lịch sử đặt lịch nào.</p>
        ) : (
          <div className="table-wrapper">
            <table className="booking-table">
              <thead>
                <tr>
                  <th>Gia sư</th>
                  <th>Môn học</th>
                  <th>Số tháng</th>
                  <th>Tổng buổi</th>
                  <th>Tổng tiền</th>
                  <th>Đã thanh toán</th>
                  <th>Còn lại</th>
                  <th>Cọc</th>
                  <th>Trạng thái cọc</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <div className="tutor-info">
                        <img
                          src={b.tutorId?.user?.image || "/default-avatar.png"}
                          alt="avatar"
                        />
                        <span>{b.tutorId?.user?.username || "Không rõ"}</span>
                      </div>
                    </td>
                    <td>{b.subjectName || b.subjectId?.name || "Không rõ"}</td>
                    <td>{b.numberOfMonths}</td>
                    <td>{b.totalSessions || 0}</td>
                    <td>
                      {b.display?.total || `${b.amount?.toLocaleString()} VND`}
                    </td>
                    <td>{b.display?.paid || "-"}</td>
                    <td>{b.display?.remain || "-"}</td>
                    <td>{b.display?.deposit || "0 VND"}</td>
                    <td className="deposit-info">
                      <FaCoins /> {b.depositInfo}
                    </td>
                    <td>{renderStatus(b.status)}</td>
                    <td>{new Date(b.createdAt).toLocaleString()}</td>
                    <td>
                      {b.status === "pending" && (
                        <button
                          className="cancel-button"
                          onClick={() => confirmCancel(b._id)}
                        >
                          <FaTrashAlt /> Hủy
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <ToastContainer position="top-right" autoClose={5000} />

        <ConfirmModal
          show={showCancelModal}
          onClose={handleCloseModal}
          onConfirm={handleConfirmCancel}
          message="Bạn có chắc chắn muốn hủy đặt lịch này? Tiền sẽ được hoàn (nếu đủ điều kiện)."
        />
      </div>
    </>
  );
};

export default BookingHistoryPage;
