// src/pages/tutor/TutorApplicationForm.js
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import {
  ApiGetAllSubjects,
  submitTutorApplication,
} from "../../Service/ApiService/ApiTutor";
import "./TutorApplicationForm.scss";

const animated = makeAnimated();

// Danh sách 63 tỉnh/thành Việt Nam
const cities = [
  "Hà Nội", "TP Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ",
  "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu",
  "Bắc Ninh", "Bến Tre", "Bình Dương", "Bình Định", "Bình Phước",
  "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông", "Điện Biên",
  "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Tĩnh",
  "Hải Dương", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang",
  "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An",
  "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên",
  "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị",
  "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa",
  "Thừa Thiên - Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang", "Vĩnh Long",
  "Vĩnh Phúc", "Yên Bái",
];

const TutorApplicationForm = () => {
  const [formData, setFormData] = useState({
    experience: "",
    education: "",
    bio: "",
    pricePerHour: "",
    address: "",
    city: "",
    subjects: [],
    languages: "",
    certificates: "",
    cvFile: null,
  });

  const [subjectOptions, setSubjectOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await ApiGetAllSubjects();
        const subjectList = Array.isArray(res) ? res : [];
        const options = subjectList.map((s) => ({
          value: s._id,
          label: `${s.name} (Lớp ${s.classLevel})`,
        }));
        setSubjectOptions(options);
      } catch (err) {
        console.error(err);
        toast.error("Không thể tải danh sách môn học.");
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (selected) => {
    setFormData((prev) => ({
      ...prev,
      subjects: selected.map((s) => s.value),
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, cvFile: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fullLocation = formData.city
      ? `${formData.address.trim()}, ${formData.city}`
      : formData.address.trim();

    try {
      const res = await submitTutorApplication({
        ...formData,
        location: fullLocation,
      });
      if (res?.errorCode === 0) {
        toast.success(res.message || "Đăng ký thành công!");
        setFormData({
          experience: "",
          education: "",
          bio: "",
          pricePerHour: "",
          address: "",
          city: "",
          subjects: [],
          languages: "",
          certificates: "",
          cvFile: null,
        });
      } else {
        toast.error(res?.message || "Gửi đơn thất bại, vui lòng thử lại!");
      }
    } catch (err) {
      console.error("❌ Lỗi khi gửi đơn:", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "Gửi đơn thất bại, vui lòng thử lại!";
      toast.error(message);
    }
  };

  return (
    <div className="tutor-application-container">
      <h2 className="form-title">Đăng ký trở thành gia sư</h2>

      <form className="tutor-application-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Kinh nghiệm</label>
          <textarea name="experience" value={formData.experience} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Học vấn</label>
          <input type="text" name="education" value={formData.education} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Giới thiệu bản thân</label>
          <textarea name="bio" value={formData.bio} onChange={handleChange} />
        </div>

        <div className="form-group-inline">
          <div>
            <label>Địa chỉ chi tiết</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} />
          </div>

          <div>
            <label>Thành phố / Tỉnh</label>
            <select name="city" value={formData.city} onChange={handleChange}>
              <option value="">-- Chọn thành phố --</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Giá mỗi giờ (VNĐ)</label>
          <input type="number" name="pricePerHour" value={formData.pricePerHour} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Môn học</label>
          {loading ? (
            <p className="loading-text">Đang tải danh sách môn học...</p>
          ) : (
            <Select
              closeMenuOnSelect={false}
              components={animated}
              isMulti
              options={subjectOptions}
              value={subjectOptions.filter((opt) => formData.subjects.includes(opt.value))}
              onChange={handleSubjectChange}
              placeholder="Chọn môn dạy..."
              className="tutor-application-select"
            />
          )}
        </div>

        <div className="form-group">
          <label>Ngôn ngữ</label>
          <input
            type="text"
            name="languages"
            value={formData.languages}
            onChange={handleChange}
            placeholder="Ví dụ: Tiếng Anh, Tiếng Việt"
          />
        </div>

        <div className="form-group">
          <label>Chứng chỉ (nếu có)</label>
          <input
            type="text"
            name="certificates"
            value={formData.certificates}
            onChange={handleChange}
            placeholder="Ví dụ: IELTS, TOEIC"
          />
        </div>

        <div className="form-group">
          <label>Upload CV</label>
          <input type="file" name="cvFile" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
        </div>

        <button type="submit" className="submit-btn">
          Gửi đơn đăng ký
        </button>
      </form>
    </div>
  );
};

export default TutorApplicationForm;
