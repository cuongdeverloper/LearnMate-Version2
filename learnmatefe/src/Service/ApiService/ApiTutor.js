import { toast } from 'react-toastify';
import axios from '../AxiosCustomize';
import Cookies from 'js-cookie';

const getTutorById = async (tutorId) => {
    try {
      const response = await axios.get(`/api/learner/tutors/${tutorId}`);
      return response;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin gia sư:', error);
      return null;
    }
  };
const getReviewsByTutor = async (tutorId) => {
    try {
      const response = await axios.get(`/api/learner/tutors/${tutorId}/reviews`);
      return response;
    } catch (error) {
      console.error("Error fetching reviews by tutor:", error);
      throw error;
    }
  };
  export const getTutorActiveStatus = async () => {
    const token = Cookies.get("accessToken");
  
    if (!token) {
      return { success: false, message: "Unauthorized" };
    }
  
    try {
      const res = await axios.get('/api/tutor/active-status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res;
    } catch (error) {
      console.error("Lỗi lấy trạng thái tutor:", error);
      return { success: false, message: error?.response?.message || "Lỗi server" };
    }
  };
  export const updateTutorActiveStatus = async (active) => {
    const token = Cookies.get("accessToken");
  
    if (!token) {
      return { success: false, message: "Unauthorized" };
    }
  
    try {
      const res = await axios.put('/api/tutor/active-status', { active }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res;
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái tutor:", error);
      return { success: false, message: error?.response?.message || "Lỗi cập nhật" };
    }
  };
  export const submitTutorApplication = async (formData) => {
    try {
      const token = Cookies.get("accessToken");
      if (!token) throw new Error("Unauthorized: No access token");
  
      const data = new FormData();
  
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => data.append(key, v));
        } else if (value !== null && value !== undefined) {
          data.append(key, value);
        }
      });
  
      const response = await axios.post("/api/tutor/application", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      return response;
    } catch (error) {
      console.error("❌ Error submitting tutor application:");
      if (error.response) {
        console.error("📡 Status:", error.response.status);
        console.error("🧾 Data:", error.response.data);
        console.error("🧠 Message:", error.response.data.message || error.message);
      } else {
        console.error("🚨 Không có response:", error.message);
      }
      throw error; // để FE xử lý tiếp
    }
  };
  
  export const ApiGetMyTutor = async () => {
    try {
      const token = Cookies.get("accessToken");
      const res = await axios.get("/api/tutor/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res;
    } catch (err) {
      throw err.response || err;
    }
  };
  
  export const ApiUpdateTutor = async (tutorId, payload) => {
    try {
      const token = Cookies.get("accessToken");
      const res = await axios.put(`/api/tutor/${tutorId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res;
    } catch (err) {
      throw err.response || err;
    }
  };
  
  export const ApiGetAllSubjects = async () => {
    try {
      const res = await axios.get("/api/tutor/subjects");
      console.log(res)
      return res;
    } catch (err) {
      throw err.response || err;
    }
  };
export {getTutorById,getReviewsByTutor}  
