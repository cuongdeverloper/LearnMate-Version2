// src/pages/profile/ChangePasswordForm.js
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ApiChangePassword } from "../../Service/ApiService/ApiUser";
import "./ChangePasswordForm.scss";

const ChangePasswordForm = ({ onClose }) => {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const accessToken = useSelector((state) => state.user.account?.access_token);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = form;

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.warn("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.warn("Mật khẩu mới và xác nhận không khớp!");
      return;
    }

    setLoading(true);
    try {
      const res = await ApiChangePassword(oldPassword, newPassword, confirmPassword, accessToken);
      toast.success(res.message || "Đổi mật khẩu thành công!");
      setTimeout(() => onClose && onClose(), 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || "Đổi mật khẩu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="change-password-container" onSubmit={handleSubmit}>
      <h3 className="change-password-title">Đổi mật khẩu</h3>

      {["oldPassword", "newPassword", "confirmPassword"].map((field, idx) => (
        <div className="change-password-field" key={idx}>
          <label>
            {field === "oldPassword"
              ? "Mật khẩu cũ"
              : field === "newPassword"
              ? "Mật khẩu mới"
              : "Xác nhận mật khẩu mới"}
          </label>
          <input
            type="password"
            name={field}
            value={form[field]}
            onChange={handleChange}
            required
            autoFocus={idx === 0}
          />
        </div>
      ))}

      <div className="change-password-actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={onClose}
          disabled={loading}
        >
          Hủy
        </button>
      </div>

      <div className="change-password-forgot">
        <button
          type="button"
          className="link-forgot"
          onClick={() => navigate("/forgot-password")}
        >
          Quên mật khẩu?
        </button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
