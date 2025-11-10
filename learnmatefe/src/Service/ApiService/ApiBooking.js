import { toast } from 'react-toastify';
import axios from '../AxiosCustomize';
import Cookies from 'js-cookie';
export const finishBooking = async (bookingId) => {
    try {
      const token = Cookies.get("accessToken");
  
      if (!token) {
        return { success: false, message: "Bạn chưa đăng nhập." };
      }
  
      const response = await axios.patch(`/api/booking/bookings/${bookingId}/finish`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      return { success: true, data: response };
    } catch (error) {
      console.error("Lỗi hoàn tất khóa học:", error);
      const message = error.response?.data?.message || "Lỗi hoàn tất khóa học.";
      return { success: false, message };
    }
  };
  export const getMaterialsByBookingId = async (bookingId) => {
    try {
      const token = Cookies.get("accessToken");
  
      if (!token) {
        return { success: false, message: "Bạn chưa đăng nhập." };
      }
  
      const response = await axios.get(`/api/tutor/materials/booking/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // ✅ Lấy trực tiếp mảng data từ API
      return { success: true, data: Array.isArray(response.data.data) ? response.data.data : [] };
    } catch (error) {
      console.error("Lỗi khi tải tài liệu học tập:", error);
      const message = error.response?.data?.message || "Không thể tải tài liệu học tập.";
      return { success: false, message };
    }
  };
  

export const getMyBookings = async () => {
    try {
      const token = Cookies.get("accessToken");
  
      if (!token) {
        console.warn("Không có token xác thực");
        return { success: false, message: "Chưa đăng nhập" };
      }
  
      const response = await axios.get('/api/booking/bookings/my-courses', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      return { success: true, data: response };
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khóa học:", error);
      const message = error.response?.message || "Không thể tải danh sách khóa học";
      return { success: false, message };
    }
  };
  export const reportBooking = async (bookingId, reason) => {
    try {
      const token = Cookies.get("accessToken"); 
  
      const response = await axios.post(
        '/api/booking/report', // URL
        { 
          targetType: 'booking',
          targetId: bookingId,
          reason: reason
        },
        { 
          headers: {
            Authorization: `Bearer ${token}` 
          }
        }
      );
      return response; 
    } catch (error) {
      console.error("Error reporting booking:", error);
      return { success: false, message: error.response?.data?.message || "Lỗi khi gửi báo cáo từ client." };
    }
  };
  export const fetchBookingDetailsApi = async (bookingId) => {
    try {
      const response = await axios.get(`/api/booking/bookings/${bookingId}`);
      return response; 
    } catch (error) {
      console.error("Error fetching booking details:", error);
      return null;
    }
  };
  export  const getBookingsByTutorId = async (tutorId) => {
    try {
      const token = Cookies.get("accessToken");
  
      if (!token) {
        window.open("/signin", "_blank");
        return;
      }
  
      const response = await axios.get(`/tutor/${tutorId}/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      return response;
    } catch (error) {
      console.error("Error fetching bookings by tutorId:", error);
      return null;
    }
  };
export const requestChangeSchedule = async (bookingId, payload) => {
  try {
    const token = Cookies.get("accessToken");
    if (!token) {
      window.open("/signin", "_blank");
      return { success: false, message: "Vui lòng đăng nhập trước." };
    }

    const response = await axios.post(
      `/api/booking/bookings/${bookingId}/request-change`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response; 
  } catch (error) {
    console.error("🚨 Lỗi khi gửi yêu cầu đổi lịch:", error);

    const message =
      error.response?.data?.message ||
      error.response?.statusText ||
      error.message ||
      "Không thể gửi yêu cầu đổi lịch.";

    return { success: false, message };
  }
};

  
  export const getMyChangeRequests = async () => {
    try {
      const token = Cookies.get("accessToken");
      if (!token) {
        window.open("/signin", "_blank");
        return { success: false, message: "Unauthorized. Please sign in." };
      }
  
      const res = await axios.get(`/api/booking/bookings/change-requests/my-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      return res;
    } catch (err) {
      console.error("❌ Error in getMyChangeRequests:", err);
      return {
        success: false,
        message: err.response?.message || "Error fetching change requests.",
      };
    }
  };
  export const createReview = async (data) => {
    try {
      const response = await axios.post('/api/booking/review', data);
      return response;
    } catch (error) {
      console.error("Error creating review:", error);
      throw error;
    }
  };
 export const handlePayMonthly = async (bookingId) => {
  try {
    const res = await axios.post("/api/payment/payMonthly", { bookingId });
    return res; // Trả về dữ liệu cho component
  } catch (error) {
    console.error("Lỗi khi thanh toán:", error);
    return { success: false, message: "Lỗi khi thanh toán." };
  }
};
