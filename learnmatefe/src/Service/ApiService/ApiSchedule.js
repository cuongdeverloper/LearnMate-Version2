import { toast } from 'react-toastify';
import axios from '../AxiosCustomize';
import Cookies from 'js-cookie';
export const getMyWeeklySchedules = async (weekStartDate) => {
  try {
    const token = Cookies.get("accessToken");

    if (!token) {
      return { success: false, message: "Bạn chưa đăng nhập." };
    }

    const response = await axios.get(`/api/booking/schedule/my-weekly-schedules`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { success: true, data: response };
  } catch (error) {
    console.error("Lỗi khi tải toàn bộ lịch học:", error);
    const message = error.response?.message || "Không thể tải lịch học";
    return { success: false, message };
  }
  };

  export const markScheduleAttendance = async (scheduleId, attended) => {
    try {
      const token = Cookies.get("accessToken");
  
      if (!token) {
        return { success: false, message: "Bạn chưa đăng nhập." };
      }
  
      const response = await axios.patch(
        `/api/booking/schedule/${scheduleId}/attendance`,
        { attended: Boolean(attended) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      return { success: true, data: response };
    } catch (error) {
      console.error("Lỗi khi điểm danh:", error);
      const message = error.response?.data?.message || "Lỗi không xác định khi điểm danh.";
      return { success: false, message };
    }
  };
  export const fetchBusySlotsByBookingId = async (bookingId, weekStart) => {
    try {
      const response = await axios.get(`api/booking/schedule/booking/${bookingId}/busy-slots?weekStart=${weekStart}`);
      return response;
    } catch (error) {
      console.error("Error fetching busy slots:", error);
      return null;
    }
  };

export const addSlotsToBooking = async (bookingId, slots) => {
  try {
    const res = await axios.post(`/api/booking/schedule/booking/${bookingId}/add-slots`, {
      slots,
    });
    return res;
  } catch (error) {
    console.error("Error adding slots:", error);
    toast.error(error.response?.data?.message || "Thêm lịch thất bại");
    throw error;
  }
};

export const deleteScheduleSlot = async (scheduleId) => {
  try {
    const res = await axios.delete(`/api/booking/schedule/${scheduleId}`);
    return res;
  } catch (error) {
    console.error("Error deleting slot:", error);
    toast.error(error.response?.data?.message || "Xóa slot thất bại");
    throw error;
  }
};
