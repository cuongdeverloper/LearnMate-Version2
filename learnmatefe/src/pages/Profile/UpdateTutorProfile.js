import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import {
  ApiGetMyTutor,
  ApiUpdateTutor,
  ApiGetAllSubjects,
} from "../../Service/ApiService/ApiTutor";
import "./UpdateTutorProfile.scss";

const animatedComponents = makeAnimated();

const UpdateTutorProfile = ({ onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    bio: "",
    subjects: [],
    pricePerHour: "",
    location: "",
    languages: [],
  });

  const [allSubjects, setAllSubjects] = useState([]);
  const [tutorId, setTutorId] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch tutor info + subjects
  useEffect(() => {
    const fetchTutorAndSubjects = async () => {
      try {
        setLoading(true);
        const [tutorRes, subjectsRes] = await Promise.all([
          ApiGetMyTutor(),
          ApiGetAllSubjects(),
        ]);

        if (tutorRes) {
          setTutorId(tutorRes._id);
          setFormData({
            bio: tutorRes.bio || "",
            subjects: tutorRes.subjects?.map((s) => s._id) || [],
            pricePerHour: tutorRes.pricePerHour || "",
            location: tutorRes.location || "",
            languages: tutorRes.languages || [],
          });
        }
        setAllSubjects(subjectsRes || []);
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải dữ liệu gia sư hoặc môn học.");
      } finally {
        setLoading(false);
      }
    };

    fetchTutorAndSubjects();
  }, []);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle multi-select change (React Select)
  const handleSubjectsChange = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      subjects: selectedOptions.map((opt) => opt.value),
    }));
  };

  // ✅ Handle languages input
  const handleLanguagesChange = (e) => {
    const langs = e.target.value.split(",").map((l) => l.trim());
    setFormData((prev) => ({ ...prev, languages: langs }));
  };

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tutorId) return toast.error("Không tìm thấy ID gia sư.");
    try {
      setLoading(true);
      const res = await ApiUpdateTutor(tutorId, formData);
      toast.success("Cập nhật thông tin gia sư thành công!");
      onUpdate?.(res);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.message || "Cập nhật thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-tutor-profile-container">
      <form className="update-tutor-profile-form" onSubmit={handleSubmit}>
        <h2 className="update-tutor-profile-title">Cập nhật thông tin Gia sư</h2>

        {/* Bio */}
        <div className="update-tutor-profile-group">
          <label className="update-tutor-profile-label">Giới thiệu (Bio)</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Giới thiệu ngắn gọn về bản thân..."
            className="update-tutor-profile-textarea"
          />
        </div>

        {/* Subjects */}
        <div className="update-tutor-profile-group">
          <label className="update-tutor-profile-label">Môn giảng dạy</label>
          <Select
            isMulti
            closeMenuOnSelect={false}
            components={animatedComponents}
            options={allSubjects.map((s) => ({
              value: s._id,
              label: `${s.name} (${s.classLevel})`,
            }))}
            value={allSubjects
              .filter((s) => formData.subjects.includes(s._id))
              .map((s) => ({
                value: s._id,
                label: `${s.name} (${s.classLevel})`,
              }))}
            onChange={handleSubjectsChange}
            placeholder="Chọn môn dạy..."
            className="update-tutor-profile-select"
            classNamePrefix="react-select"
          />
        </div>

        {/* Price per hour */}
        <div className="update-tutor-profile-group">
          <label className="update-tutor-profile-label">Giá mỗi giờ (VND)</label>
          <input
            type="number"
            name="pricePerHour"
            value={formData.pricePerHour}
            onChange={handleChange}
            placeholder="VD: 200000"
            className="update-tutor-profile-input"
          />
        </div>

        {/* Location */}
        <div className="update-tutor-profile-group">
          <label className="update-tutor-profile-label">Khu vực</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="VD: TP.HCM, Hà Nội..."
            className="update-tutor-profile-input"
          />
        </div>

        {/* Languages */}
        <div className="update-tutor-profile-group">
          <label className="update-tutor-profile-label">Ngôn ngữ (phân tách bằng dấu phẩy)</label>
          <input
            type="text"
            value={formData.languages.join(", ")}
            onChange={handleLanguagesChange}
            placeholder="VD: English, Vietnamese"
            className="update-tutor-profile-input"
          />
        </div>

        {/* Buttons */}
        <div className="update-tutor-profile-actions">
          <button
            type="submit"
            className="update-tutor-profile-btn save"
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
          <button
            type="button"
            className="update-tutor-profile-btn cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateTutorProfile;
