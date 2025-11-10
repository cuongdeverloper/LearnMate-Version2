import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./BookingSchedule.scss";
import { useSelector } from "react-redux";
import { addSlotsToBooking, deleteScheduleSlot, fetchBusySlotsByBookingId } from "../../../Service/ApiService/ApiSchedule";
import { getBookingsByTutorId } from "../../../components/Tutor/ApiTutor";
import { fetchBookingDetailsApi } from "../../../Service/ApiService/ApiBooking";

const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
const timeSlots = [
  "07:00 - 09:00",
  "09:30 - 11:30",
  "12:00 - 14:00",
  "14:30 - 16:30",
  "17:00 - 19:00",
  "19:30 - 21:30",
];

const getWeekDays = (monday) => {
  const days = [];
  const base = new Date(monday);
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
};

const BookingSchedule = () => {
  const tutorId = useSelector((state) => state.user.account.id);
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    return monday.toISOString().slice(0, 10);
  });

  const [bookings, setBookings] = useState([]);
  const [bookingId, setBookingId] = useState("");
  const [bookingDetails, setBookingDetails] = useState(null);
  const [busySlots, setBusySlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [currentBookedSlotsCount, setCurrentBookedSlotsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("incomplete"); 

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await getBookingsByTutorId(tutorId);
        setBookings(res.bookings);
      } catch (error) {
        toast.error("Không thể tải danh sách booking.");
      }
    };
    if (tutorId) fetchBookings();
  }, [tutorId]);

  useEffect(() => {
    if (!bookingId) return;
     const fetchBookingDetails = async () => {
    const res = await fetchBookingDetailsApi(bookingId);
    if (res) setBookingDetails(res);
    else toast.error("Không thể tải thông tin khóa học.");
  };
    fetchBookingDetails();
  }, [bookingId]);

  useEffect(() => {
    if (!bookingId) return;
    loadBusySlots();
  }, [bookingId, weekStart]);

const loadBusySlots = async () => {
  try {
    const res = await fetchBusySlotsByBookingId(bookingId, weekStart);
    if (res) {
      setBusySlots(res);
      const count = res.filter(slot => slot.bookingId === bookingId).length;
      setCurrentBookedSlotsCount(count);
      setSelectedSlots(new Set());
    } else {
      toast.error("Không thể tải lịch bận.");
    }
  } catch (err) {
    toast.error("Không thể tải lịch bận.");
  }
};

  const totalSessionsAllowed = bookingDetails?.numberOfSessions || 0;
  const remainingSessionsToBook = totalSessionsAllowed - currentBookedSlotsCount;
  const weekDays = getWeekDays(weekStart);

  const busyMap = new Map();
  busySlots.forEach((slot) => {
    const dateKey = slot.date.slice(0, 10);
    const key = `${dateKey}|${slot.startTime}`;
    busyMap.set(key, slot);
  });

  const toggleSlot = (date, timeSlot) => {
    const startTime = timeSlot.split(" - ")[0];
    const key = `${date}|${startTime}`;
    if (busyMap.get(key)) return;

    setSelectedSlots((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        if (newSet.size < remainingSessionsToBook) {
          newSet.add(key);
        } else {
          toast.warn(`Bạn chỉ có thể chọn thêm ${remainingSessionsToBook} buổi học.`);
        }
      }
      return newSet;
    });
  };

  const handleAddSchedule = async () => {
  if (selectedSlots.size === 0) {
    toast.info("Vui lòng chọn ít nhất 1 ô giờ để thêm lịch.");
    return;
  }
  if (currentBookedSlotsCount + selectedSlots.size > totalSessionsAllowed) {
    toast.error(`Tổng số buổi sau khi thêm sẽ vượt quá ${totalSessionsAllowed} buổi.`);
    return;
  }

  const slotsByDate = {};
  Array.from(selectedSlots).forEach((key) => {
    const [date, startTime] = key.split("|");
    if (!slotsByDate[date]) slotsByDate[date] = [];
    slotsByDate[date].push(startTime);
  });

  const slotsToSave = [];
  for (const date in slotsByDate) {
    const currentDaySlots = slotsByDate[date].sort();
    let i = 0;
    while (i < currentDaySlots.length) {
      let currentStartTime = currentDaySlots[i];
      let currentEndTime = timeSlots.find(slot => slot.startsWith(currentStartTime))?.split(" - ")[1];
      let j = i + 1;
      while (j < currentDaySlots.length) {
        const prevSlot = timeSlots.find(slot => slot.startsWith(currentDaySlots[j - 1]));
        const currentSlot = timeSlots.find(slot => slot.startsWith(currentDaySlots[j]));
        if (timeSlots.indexOf(currentSlot) === timeSlots.indexOf(prevSlot) + 1) {
          currentEndTime = currentSlot.split(" - ")[1];
          j++;
        } else break;
      }
      slotsToSave.push({ date, startTime: currentStartTime, endTime: currentEndTime });
      i = j;
    }
  }

  setLoading(true);
  try {
    let response = await addSlotsToBooking(bookingId, slotsToSave); 
    toast.success("Thêm lịch thành công!");
    loadBusySlots();
  } catch (err) {
  } finally {
    setLoading(false);
  }
};

 const handleDeleteSlot = async (scheduleId) => {
  if (!window.confirm("Bạn có chắc muốn xóa slot này?")) return;
  try {
    let response = await deleteScheduleSlot(scheduleId); 
    toast.success("Xóa slot thành công!");
    loadBusySlots();
  } catch (err) {
  }
};

  const completedBookings = bookings.filter(b => b.completed);
  const incompleteBookings = bookings.filter(b => !b.completed);

  return (
    <div className="booking-schedule-container">
      <h2 className="heading">Quản lý lịch học</h2>

      {/* Tabs */}
      <div className="tab-buttons">
        <button className={activeTab === 'incomplete' ? 'active' : ''} onClick={() => setActiveTab('incomplete')}>
          Chưa hoàn thành
        </button>
        <button className={activeTab === 'completed' ? 'active' : ''} onClick={() => setActiveTab('completed')}>
          Đã hoàn thành
        </button>
      </div>

      {/* Select Booking */}
      <div className="booking-selector">
        <label>Chọn khoá học:</label>
        <select value={bookingId} onChange={(e) => setBookingId(e.target.value)}>
          <option value="">-- Chọn booking --</option>
          {(activeTab === 'incomplete' ? incompleteBookings : completedBookings).map((bk) => (
            <option key={bk._id} value={bk._id}>
              {bk?.learnerId?.username} - {bk?.learnerId?.email || bk?.note}
            </option>
          ))}
        </select>
      </div>

      {!bookingId ? (
        <p>Vui lòng chọn một booking để xem và chỉnh sửa lịch học.</p>
      ) : (
        <>
          <div className="booking-summary">
            {bookingDetails ? (
              <p>
                Tổng số buổi được đặt: <strong>{totalSessionsAllowed}</strong> |
                Đã xếp lịch: <strong>{currentBookedSlotsCount}</strong> |
                Còn lại: <strong>{remainingSessionsToBook}</strong>
              </p>
            ) : <p>Đang tải thông tin booking...</p>}
          </div>

          <div className="week-start-picker">
            <label>
              Chọn ngày bắt đầu tuần (Thứ 2):{" "}
              <input
                type="date"
                value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}
              />
            </label>
          </div>

          <table className="schedule-grid">
            <thead>
              <tr>
                <th>Khung giờ / Ngày</th>
                {weekDays.map((date) => (
                  <th key={date}>
                    {date} <br />
                    <small>{dayNames[(new Date(date).getDay() + 6) % 7]}</small>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((timeSlot) => (
                <tr key={timeSlot}>
                  <td className="time-slot">{timeSlot}</td>
                  {weekDays.map((date) => {
                    const startTime = timeSlot.split(" - ")[0];
                    const key = `${date}|${startTime}`;
                    const slot = busyMap.get(key);
                    const isSelected = selectedSlots.has(key);
                    const isBusy = !!slot;
                    const isOwnBooking = slot?.bookingId === bookingId;

                    let className = "slot-cell";
                    if (isBusy) className += isOwnBooking ? " busy-own" : " busy-other";
                    else if (isSelected) className += " selected";
                    else className += " available";

                    return (
                      <td
                        key={key}
                        className={className}
                        onClick={() => {
                          if (!isBusy && remainingSessionsToBook > 0) toggleSlot(date, timeSlot);
                          else if (!isBusy) toast.warn("Bạn đã xếp đủ số buổi.");
                        }}
                      >
                        {isBusy ? (
                          <>
                            <span>{isOwnBooking ? "Đã đặt (Bạn)" : "Đã đặt"}</span>
                            {isOwnBooking && (
                              <button
                                className="delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSlot(slot._id);
                                }}
                              >
                                X
                              </button>
                            )}
                          </>
                        ) : (
                          isSelected && <span>✓</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="button-container">
            <button
              onClick={handleAddSchedule}
              disabled={loading || selectedSlots.size === 0 || remainingSessionsToBook <= 0}
            >
              {loading ? "Đang lưu..." : "Lưu các slot mới"}
            </button>
          </div>
        </>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default BookingSchedule;
