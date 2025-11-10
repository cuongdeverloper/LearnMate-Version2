import React, { useEffect, useState } from "react";
import { fetchPendingBookings, respondBooking, cancelBooking } from "../ApiTutor";
import { useSelector } from "react-redux";
import "./TutorBookingList.scss";
import { toast } from "react-toastify";
import Modal from "react-modal"; 

Modal.setAppElement("#root"); 

const TutorBookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tutorId = useSelector((state) => state.user.account.id);

  const loadBookings = async () => {
  try {
    const res = await fetchPendingBookings(tutorId);
    const bookingList = Array.isArray(res.bookings) ? res.bookings : [];
    setBookings(bookingList);
  } catch (error) {
    console.error("Lỗi khi load bookings:", error);
    setBookings([]);
  }
};


  const handleResponse = async (id, action, learnerId) => {
    try {
      const res = await respondBooking(id, action, learnerId);
      toast.success(res.data?.message || "Cập nhật thành công 🎉");
      loadBookings();
      closeModal();
    } catch (error) {
     toast.error(error?.message || error.message || "Có lỗi xảy ra khi phản hồi booking");
    }
  };

  const handleCancel = async (id) => {
    const reason = prompt("Lý do hủy buổi học:");
    if (!reason) return;
    try {
      const res = await cancelBooking(id, reason);
      toast.success(res.data?.message || "Đã hủy buổi học thành công");
      loadBookings();
    } catch (error) {
      toast.error(error.message || "Không thể hủy buổi học");
    }
  };
const getStatusColor = (status) => {
  switch(status){
    case "pending": return "bg-yellow-100 text-yellow-800";
    case "approve": return "bg-green-100 text-green-800";
    case "cancelled":
    case "rejected": return "bg-red-100 text-red-800";
    case "completed": return "bg-blue-100 text-blue-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

  const openDetailModal = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedBooking(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    loadBookings();
  }, [tutorId]);

  return (
    <div className="booking-page">
      <header className="booking-header">
        <h1>Danh sách Booking</h1>
        <p>Quản lý các buổi học đang chờ duyệt của bạn</p>
      </header>

      <div className="booking-container">
        {bookings.length === 0 ? (
          <div className="empty-state">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076507.png"
              alt="no booking"
            />
            <p>Hiện tại chưa có booking nào đang chờ duyệt 💭</p>
          </div>
        ) : (
          bookings.map((b) => (
            <div className="booking-card-tutor" key={b._id}>
  <div className="booking-info">
    <h3>{b.learnerId?.username || "Unknown Learner"}</h3>
    <p>Trạng thái: <span className={`status ${b.status}`}>{b.status}</span></p>
    <p>Số buổi học: {b.numberOfSession}</p>
    <p>Số tiền: {b.amount}</p>
  </div>
  <button onClick={() => openDetailModal(b)}>Xem chi tiết</button>
</div>
          ))
        )}
      </div>


      {/* Modal for booking details */}
     <Modal
  isOpen={isModalOpen}
  onRequestClose={closeModal}
  contentLabel="Booking Details"
  className="booking-modal"
  overlayClassName="booking-modal-overlay"
>
  {selectedBooking && (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Chi tiết Booking</h2>
        <button
          className="text-gray-500 hover:text-gray-800 text-xl"
          onClick={closeModal}
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="font-semibold">Learner:</p>
          <p>{selectedBooking.learnerId?.username}</p>
        </div>
        <div>
          <p className="font-semibold">Subject:</p>
          <p>{selectedBooking.subjectId?.name} {selectedBooking.subjectId?.classLevel}</p>
        </div>
        <div>
          <p className="font-semibold">Status:</p>
          <span className={`px-2 py-1 rounded ${getStatusColor(selectedBooking.status)}`}>
            {selectedBooking.status}
          </span>
        </div>
        <div>
          <p className="font-semibold">Address:</p>
          <p>{selectedBooking.address || "Chưa có"}</p>
        </div>
        <div>
          <p className="font-semibold">Amount:</p>
          <p>{selectedBooking.amount}</p>
        </div>
        <div>
          <p className="font-semibold">Deposit:</p>
          <p>{selectedBooking.deposit}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="font-semibold mb-2">Note:</p>
        <p className="text-gray-700">{selectedBooking.note || "Không có"}</p>
      </div>

      <div className="mb-4">
  <p className="font-semibold mb-2">Schedule</p>
  {selectedBooking.scheduleIds?.length > 0 ? (
    (() => {
      // Lọc ra 1 buổi duy nhất cho mỗi thứ
      const uniqueWeekdays = new Map();
      selectedBooking.scheduleIds.forEach((s) => {
        const weekday = new Date(s.date).toLocaleDateString("vi-VN", { weekday: "long" });
        if (!uniqueWeekdays.has(weekday)) {
          uniqueWeekdays.set(weekday, s);
        }
      });

      return (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-1 text-left">Thứ</th>
              <th className="border px-3 py-1 text-left">Thời gian</th>
              <th className="border px-3 py-1 text-left">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {[...uniqueWeekdays.entries()].map(([weekday, s]) => (
              <tr key={s._id} className="hover:bg-gray-50">
                <td className="border px-3 py-1">{weekday}</td>
                <td className="border px-3 py-1">{s.startTime} - {s.endTime}</td>
                <td className="border px-3 py-1">
                  {s.attended ? (
                    <span className="text-green-600 font-semibold">Đã học ✅</span>
                  ) : (
                    <span className="text-yellow-600 font-semibold">Chưa học ⏳</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    })()
  ) : (
    <p>Chưa có lịch học</p>
  )}
</div>



      {selectedBooking.status === "pending" && (
        <div className="flex justify-end gap-2 mb-2">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={() =>
              handleResponse(
                selectedBooking._id,
                "approve",
                selectedBooking.learnerId?._id
              )
            }
          >
            ✔️ Duyệt
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={() =>
              handleResponse(
                selectedBooking._id,
                "rejected",
                selectedBooking.learnerId?._id
              )
            }
          >
            ❌ Từ chối
          </button>
        </div>
      )}

      <div className="flex justify-end">
        <button
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          onClick={closeModal}
        >
          Đóng
        </button>
      </div>
    </>
  )}
</Modal>



    </div>
  );
};

export default TutorBookingList;
