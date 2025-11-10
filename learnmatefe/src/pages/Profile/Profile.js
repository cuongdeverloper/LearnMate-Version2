// src/pages/profile/Profile.js
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { toast } from "react-toastify";
import {
  ApiGetProfile,
  ApiUpdateProfile,
} from "../../Service/ApiService/ApiUser";
import {
  ApiGetMyTutor,
  ApiGetAllSubjects,
  ApiUpdateTutor,
} from "../../Service/ApiService/ApiTutor";
import  ChangePasswordForm  from "./ChangePasswordForm"; // Nếu file riêng, giữ import
import "./Profile.scss";

const animatedComponents = makeAnimated();

const Profile = () => {
  const navigate = useNavigate();
  const access_token = useSelector((s) => s.user.account?.access_token);

  const [profile, setProfile] = useState(null);
  const [tutorData, setTutorData] = useState(null);
  const [allSubjects, setAllSubjects] = useState([]);
  const [isSocial, setIsSocial] = useState(false);
  const [mode, setMode] = useState("view"); // view | editUser | editTutor | changePassword

  const [formUser, setFormUser] = useState({});
  const [formTutor, setFormTutor] = useState({});
  const [imagePreview, setImagePreview] = useState("");
  const fileRef = useRef();

  // 🔹 Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await ApiGetProfile();
        setProfile(res);
        setIsSocial(res.socialLogin);
        setFormUser({
          username: res.username,
          email: res.email,
          phoneNumber: res.phoneNumber,
          gender: res.gender,
          image: null,
        });
        setImagePreview(res.image);
      } catch (e) {
        console.error(e);
        navigate("/signin");
      }
    };
    fetchProfile();
  }, [navigate]);

  // 🔹 Fetch tutor + subjects
  useEffect(() => {
    if (profile?.role !== "tutor") return;
    const fetchTutor = async () => {
      try {
        const [tutorRes, subjectsRes] = await Promise.all([
          ApiGetMyTutor(),
          ApiGetAllSubjects(),
        ]);
        setTutorData(tutorRes);
        setAllSubjects(subjectsRes);
        setFormTutor({
          bio: tutorRes.bio || "",
          subjects: tutorRes.subjects?.map((s) => s._id) || [],
          pricePerHour: tutorRes.pricePerHour || "",
          location: tutorRes.location || "",
          languages: tutorRes.languages?.join(", ") || "",
        });
      } catch (err) {
        toast.error("Không thể tải thông tin gia sư.");
      }
    };
    fetchTutor();
  }, [profile]);

  // 🧩 Handle change user
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setFormUser((p) => ({ ...p, [name]: value }));
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormUser((p) => ({ ...p, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 🧩 Handle change tutor
  const handleTutorChange = (e) => {
    const { name, value } = e.target;
    setFormTutor((p) => ({ ...p, [name]: value }));
  };
  const handleSubjectsChange = (opts) => {
    setFormTutor((p) => ({ ...p, subjects: opts.map((o) => o.value) }));
  };

  // 🔹 Submit update user
  const handleSubmitUser = async (e) => {
    e.preventDefault();
    try {
      const data = await ApiUpdateProfile(formUser);
      setProfile(data.user);
      toast.success(data.message || "Cập nhật hồ sơ thành công!");
      setMode("view");
    } catch (err) {
      toast.error("Cập nhật thất bại!");
    }
  };

  // 🔹 Submit update tutor
  const handleSubmitTutor = async (e) => {
    e.preventDefault();
    try {
      const res = await ApiUpdateTutor(tutorData._id, {
        ...formTutor,
        languages: formTutor.languages.split(",").map((l) => l.trim()),
      });
      toast.success("Cập nhật thông tin gia sư thành công!");
      setTutorData(res);
      setMode("view");
    } catch {
      toast.error("Cập nhật thất bại!");
    }
  };

  if (!profile)
    return <div className="profile-loading">Đang tải thông tin...</div>;

  return (
    <div className="profile-wrapper">
      {/* 🔸 Header */}
      <h2 className="profile-header">Hồ sơ cá nhân</h2>

      {/* 🔸 Chế độ xem hồ sơ */}
      {mode === "view" && (
        <div className="profile-card">
          <div className="profile-avatar-section">
            <img
              src={profile.image || "/default-avatar.png"}
              alt="avatar"
              className="profile-avatar"
            />
          </div>

          <div className="profile-info">
            <div><strong>Tên đăng nhập:</strong> {profile.username}</div>
            <div><strong>Email:</strong> {profile.email}</div>
            <div><strong>Số điện thoại:</strong> {profile.phoneNumber || "Chưa có"}</div>
            <div><strong>Giới tính:</strong> {profile.gender || "Chưa rõ"}</div>
            <div><strong>Vai trò:</strong> {profile.role}</div>
          </div>

          <div className="profile-actions">
            <button onClick={() => setMode("editUser")} className="btn-primary">
              Chỉnh sửa
            </button>
            {!isSocial && (
              <button onClick={() => setMode("changePassword")} className="btn-secondary">
                Đổi mật khẩu
              </button>
            )}
            {profile.role === "student" && (
              <button onClick={() => navigate("/tutor-application")} className="btn-outline">
                Trở thành gia sư
              </button>
            )}
            {profile.role === "tutor" && (
              <button onClick={() => setMode("editTutor")} className="btn-outline">
                Cập nhật hồ sơ gia sư
              </button>
            )}
          </div>
        </div>
      )}

      {/* 🔸 Form chỉnh sửa user */}
      {mode === "editUser" && (
        <form className="profile-form" onSubmit={handleSubmitUser}>
          <div className="profile-avatar-edit">
            <img src={imagePreview || "/default-avatar.png"} alt="" />
            <label htmlFor="upload">Thay ảnh đại diện</label>
            <input
              type="file"
              id="upload"
              accept="image/*"
              ref={fileRef}
              onChange={handleImageChange}
            />
          </div>
          <input name="username" value={formUser.username} onChange={handleUserChange} placeholder="Tên đăng nhập" />
          <input name="email" value={formUser.email} disabled={isSocial} onChange={handleUserChange} placeholder="Email" />
          <input name="phoneNumber" value={formUser.phoneNumber || ""} onChange={handleUserChange} placeholder="Số điện thoại" />
          <select name="gender" value={formUser.gender} onChange={handleUserChange}>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
          <div className="form-actions">
            <button type="submit" className="btn-primary">Lưu</button>
            <button type="button" className="btn-secondary" onClick={() => setMode("view")}>Hủy</button>
          </div>
        </form>
      )}

      {/* 🔸 Form chỉnh sửa gia sư */}
      {mode === "editTutor" && (
        <form className="profile-form" onSubmit={handleSubmitTutor}>
          <textarea
            name="bio"
            value={formTutor.bio}
            onChange={handleTutorChange}
            placeholder="Giới thiệu bản thân..."
          />
          <Select
            isMulti
            closeMenuOnSelect={false}
            components={animatedComponents}
            options={allSubjects.map((s) => ({
              value: s._id,
              label: `${s.name} (${s.classLevel})`,
            }))}
            value={allSubjects
              .filter((s) => formTutor.subjects.includes(s._id))
              .map((s) => ({ value: s._id, label: `${s.name} (${s.classLevel})` }))}
            onChange={handleSubjectsChange}
          />
          <input name="pricePerHour" value={formTutor.pricePerHour} onChange={handleTutorChange} placeholder="Giá mỗi giờ (VND)" />
          <input name="location" value={formTutor.location} onChange={handleTutorChange} placeholder="Khu vực" />
          <input name="languages" value={formTutor.languages} onChange={handleTutorChange} placeholder="Ngôn ngữ (phân tách bằng dấu phẩy)" />
          <div className="form-actions">
            <button type="submit" className="btn-primary">Lưu</button>
            <button type="button" className="btn-secondary" onClick={() => setMode("view")}>Hủy</button>
          </div>
        </form>
      )}

      {/* 🔸 Đổi mật khẩu */}
      {mode === "changePassword" && (
        <ChangePasswordForm onClose={() => setMode("view")} />
      )}
    </div>
  );
};

export default Profile;
