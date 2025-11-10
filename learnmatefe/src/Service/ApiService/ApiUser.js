import { toast } from "react-toastify";
import axios from "../AxiosCustomize";
import Cookies from "js-cookie";
const getUserBalance = async () => {
  try {
    const token = Cookies.get("accessToken");

    if (!token) {
      console.warn("Không có token, không thể lấy số dư người dùng");
      return null;
    }

    const response = await axios.get("/api/payment/me/info", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.user?.balance !== undefined) {
      return response.user.balance;
    } else {
      throw new Error("Không có thông tin số dư trong phản hồi");
    }
  } catch (error) {
    console.error("Lỗi khi lấy số dư người dùng:", error);
    return null;
  }
};
const ApiChangePassword = async (oldPassword, newPassword, confirmPassword) => {
  const token = Cookies.get("accessToken");

  if (!token) {
    throw new Error("Access token not found");
  }

  try {
    const response = await axios.post(
      "/change-password",
      { oldPassword, newPassword, confirmPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  } catch (error) {
    console.error("Change password failed:", error);
    throw error;
  }
};
const ApiUpdateProfile = async (form) => {
  const formData = new FormData();
  Object.entries(form).forEach(([key, value]) => {
    if (value !== null) {
      formData.append(key, value);
    }
  });

  const access_token = Cookies.get("accessToken");

  if (!access_token) {
    throw new Error("Access token not found");
  }

  try {
    const response = await axios.put("/api/learner/update-profile", formData, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    console.error("Update profile failed:", error);
    throw error;
  }
};
const ApiGetProfile = async () => {
  const token = Cookies.get("accessToken");

  if (!token) {
    throw new Error("No access token found");
  }

  try {
    const response = await axios.get("/api/learner/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

const ApiGetUserByUserId = async (userId) => {
  try {
    const token = Cookies.get("accessToken");

    if (!token) {
      window.open("/signin", "_blank");
      return;
    }

    const response = await axios.get(`/api/message/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.error("Error get user:", error);
    return null;
  }
};

const getAllMyCourses = async () => {
  try {
    const token = Cookies.get("accessToken");

    if (!token) {
      window.open("/signin", "_blank");
      return;
    }

    const response = await axios.get("/api/booking/bookings/my-courses", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.error("Error get user:", error);
    return null;
  }
};

export {
  getUserBalance,
  ApiChangePassword,
  ApiUpdateProfile,
  ApiGetProfile,
  ApiGetUserByUserId,
  getAllMyCourses,
};
