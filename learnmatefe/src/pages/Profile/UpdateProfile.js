import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import './UpdateProfile.scss';
import { ApiUpdateProfile } from '../../Service/ApiService/ApiUser';
import { toast } from 'react-toastify';

const UpdateProfile = ({ profile, onUpdate, onCancel,isSocial }) => {
  const [form, setForm] = useState({
    username: profile.username,
    email: profile.email,
    phoneNumber: profile.phoneNumber,
    gender: profile.gender,
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(profile.image);
  const fileInputRef = useRef();
  const access_token = useSelector(state => state.user.account?.access_token);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setForm(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const data = await ApiUpdateProfile(form);
    if (onUpdate) onUpdate(data.user);
    toast.success(data.message)
  } catch (data) {
    toast.danger(data.message)
  }
};

  return (
    <>
      {/* Thay đổi class "update-profile-form" thành "update-profile-container" */}
      <form className="update-profile-container" onSubmit={handleSubmit}>
        {/* Thay đổi class "profile-avatar" thành "update-profile-avatar-section" */}
        <div className="update-profile-avatar-section">
          {/* Thay đổi class "avatar" nếu bạn muốn style riêng, hoặc giữ nguyên nếu không có xung đột */}
          <img src={imagePreview || '/default-avatar.png'} alt="avatar" className="update-profile-avatar-img" />
          {/* Thêm ID cho input và label tương ứng */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            id="update-profile-avatar-upload" // <-- ID MỚI
            className="update-profile-file-input" // <-- CLASS MỚI
          />
          {/* Thay đổi class "update-profile-upload-label" và htmlFor */}
          <label htmlFor="update-profile-avatar-upload" className="update-profile-upload-label">
            Thay đổi ảnh đại diện
          </label>
        </div>

        {/* Thay đổi class "form-group" thành "update-profile-form-group" và các class con */}
        <div className="update-profile-form-group">
          <label className="update-profile-label">Tên đăng nhập:</label>
          <input name="username" value={form.username || ''} onChange={handleChange} className="update-profile-input" />
        </div>
        <div className="update-profile-form-group">
          <label className="update-profile-label">Email:</label>
          <input name="email" value={form.email || ''} onChange={handleChange} disabled={isSocial} className="update-profile-input" />
        </div>
        <div className="update-profile-form-group">
          <label className="update-profile-label">Số điện thoại:</label>
          <input name="phoneNumber" value={form.phoneNumber || ''} onChange={handleChange} className="update-profile-input" />
        </div>
        <div className="update-profile-form-group">
          <label className="update-profile-label">Giới tính:</label>
          <select name="gender" value={form.gender || ''} onChange={handleChange} className="update-profile-select">
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>

        {/* Thay đổi class "profile-actions" thành "update-profile-actions" và các class con */}
        <div className="update-profile-actions">
          <button type="submit" className="update-profile-button btn-primary-save">Lưu</button>
          <button type="button" className="update-profile-button btn-secondary-cancel" onClick={onCancel}>Hủy</button>
        </div>
      </form>
    </>
  );
};

export default UpdateProfile;