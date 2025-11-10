import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  createTutorAvailability,
  deleteTutorAvailability,
  getTutorAvailability,
} from "../ApiTutor";
import './AvailableSchedule.scss'
import Swal from "sweetalert2";

const TutorManageAvailability = () => {
  const [availabilities, setAvailabilities] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);

  const timeSlots = [
    "07:00 - 09:00",
    "09:30 - 11:30",
    "12:00 - 14:00",
    "14:30 - 16:30",
    "17:00 - 19:00",
    "19:30 - 21:30",
  ];

  const weekDays = [0, 1, 2, 3, 4, 5, 6]; // CN - T7

  const fetchAvailabilities = async () => {
    const res = await getTutorAvailability();
    if (res.errorCode === 0) {
      const data = res.data?.data || {};
      setAvailabilities(data.availabilities || []);
      setSchedules(data.schedules || []);
    } else {
      toast.error(res.message);
    }
  };

  useEffect(() => {
    fetchAvailabilities();
  }, []);

  const toggleSlot = (dayOfWeek, slotStr) => {
    const [startTime, endTime] = slotStr.split(" - ");

    const existing = availabilities.find(
      (a) =>
        a.dayOfWeek === dayOfWeek &&
        a.startTime === startTime &&
        a.endTime === endTime
    );

    const found = selectedSlots.find(
      (s) =>
        s.dayOfWeek === dayOfWeek &&
        s.startTime === startTime &&
        s.endTime === endTime
    );

    if (existing) {
      handleDelete(existing._id);
      return;
    }

    if (found) {
      setSelectedSlots(selectedSlots.filter((s) => s !== found));
    } else {
      setSelectedSlots([...selectedSlots, { dayOfWeek, startTime, endTime }]);
    }
  };

  const handleSave = async () => {
    if (!selectedSlots.length) {
      toast.warn("Chưa chọn slot nào!");
      return;
    }

    const confirm = await Swal.fire({
      title: "Xác nhận lưu lịch trống?",
      text: `Bạn có chắc muốn lưu ${selectedSlots.length} khung giờ mới không?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Lưu",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });

    if (!confirm.isConfirmed) return;

    Swal.fire({
      title: "Đang lưu...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const res = await createTutorAvailability(selectedSlots);
    Swal.close();

    if (res.errorCode === 0) {
      Swal.fire({
        icon: "success",
        title: "Đã lưu thành công!",
        text: "Các khung giờ trống đã được thêm.",
        timer: 2000,
        showConfirmButton: false,
      });
      setSelectedSlots([]);
      fetchAvailabilities();
    } else {
      Swal.fire({
        icon: "error",
        title: "Lỗi khi lưu!",
        text: res.message || "Không thể lưu lịch trống.",
      });
    }
  };

  const handleDelete = async (availabilityId) => {
    const confirm = await Swal.fire({
      title: "Xác nhận xoá?",
      text: "Bạn có chắc muốn xoá khung giờ này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#95a5a6",
    });

    if (!confirm.isConfirmed) return;

    Swal.fire({
      title: "Đang xoá...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const res = await deleteTutorAvailability(availabilityId);
    Swal.close();

    if (res.errorCode === 0) {
      Swal.fire({
        icon: "success",
        title: "Đã xoá thành công!",
        text: "Khung giờ trống đã được xoá.",
        timer: 2000,
        showConfirmButton: false,
      });
      fetchAvailabilities();
    } else {
      Swal.fire({
        icon: "error",
        title: "Lỗi khi xoá!",
        text: res.message || "Không thể xoá khung giờ.",
      });
    }
  };

  const getDayLabel = (dayOfWeek) => {
    const labels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return labels[dayOfWeek];
  };

  return (
    <div className="availability-wrapper">
      <h2>Quản lý lịch trống</h2>

      <div className="weekly-schedule-grid">
        <div className="grid-header">
          {weekDays.map((day) => (
            <div key={day} className="grid-header-day">
              {getDayLabel(day)}
            </div>
          ))}
        </div>

        <div className="grid-body">
          {weekDays.map((day) => (
            <div key={day} className="grid-day-column">
              {timeSlots.map((slot) => {
                const [startTime, endTime] = slot.split(" - ");

                const hasSchedule = schedules.find(
                  (s) =>
                    new Date(s.date).getDay() === day &&
                    s.startTime === startTime &&
                    s.endTime === endTime
                );

                const existing = availabilities.find(
                  (a) =>
                    a.dayOfWeek === day &&
                    a.startTime === startTime &&
                    a.endTime === endTime
                );

                const selected = selectedSlots.find(
                  (s) =>
                    s.dayOfWeek === day &&
                    s.startTime === startTime &&
                    s.endTime === endTime
                );

                let cls = "empty";
                let label = "Trống";

                if (hasSchedule) {
                  cls = "busy";
                  label = "Đã có lịch dạy";
                } else if (existing) {
                  cls = "available";
                  label = "Đã mở (bấm để xoá)";
                } else if (selected) {
                  cls = "selected";
                  label = "Sẽ thêm";
                }

                return (
                  <div
                    key={`${day}-${slot}`}
                    className={`schedule-slot ${cls}`}
                    onClick={() => !hasSchedule && toggleSlot(day, slot)}
                  >
                    <div className="slot-time">{slot}</div>
                    <div className="slot-status">{label}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selectedSlots.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <strong>Đã chọn {selectedSlots.length} khung giờ.</strong>
          <button onClick={handleSave} className="btn btn-primary btn-save">
            Lưu lịch trống
          </button>
        </div>
      )}
    </div>
  );
};

export default TutorManageAvailability;
