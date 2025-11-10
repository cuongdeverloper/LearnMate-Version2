import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  uploadMaterial,
  getMaterialsForBooking,
  getBookingsByTutorId,
} from "../ApiTutor";
import "./MaterialUploader.scss";

const MaterialUploader = () => {
  const tutorId = useSelector((state) => state.user?.account?.id);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [materials, setMaterials] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadBookings = async () => {
    if (!tutorId) return;
    try {
      const res = await getBookingsByTutorId(tutorId);
      const data = res?.data?.bookings || [];
      const filtered = data.filter(
        (b) => b.status === "approve" || b.status === "completed"
      );
      const unique = [...new Map(filtered.map((b) => [b._id, b])).values()];
      setBookings(unique);
    } catch {
      toast.error("Không thể tải danh sách khóa học");
    }
  };

  useEffect(() => {
    loadBookings();
  }, [tutorId]);

  const fetchMaterials = async (id) => {
    try {
      const res = await getMaterialsForBooking(id);
      const list = Array.isArray(res?.data) ? res.data : [];
      setMaterials([...new Map(list.map((m) => [m._id, m])).values()]);
    } catch {
      toast.error("Không thể tải danh sách tài liệu");
    }
  };

  useEffect(() => {
    if (bookingId) fetchMaterials(bookingId);
    else setMaterials([]);
  }, [bookingId]);

  const handleUpload = async () => {
    if (!file || !title || !bookingId) {
      toast.warn("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      const res = await uploadMaterial({ bookingId, title, description, file });
      if (res.errorCode === 0) {
        toast.success("Tải tài liệu thành công!");
        setFile(null);
        setTitle("");
        setDescription("");
        fetchMaterials(bookingId);
      } else toast.error(res.message || "Lỗi upload!");
    } catch {
      toast.error("Lỗi hệ thống khi tải tài liệu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="material-dashboard">
      <div className="dashboard-header">
        <h2>📚 Quản lý tài liệu giảng dạy</h2>
        <p>Chia sẻ tài liệu cho từng khóa học đã duyệt hoặc hoàn thành</p>
      </div>

      <div className="upload-panel">
        <div className="form-group">
          <label>Chọn khóa học:</label>
          <select value={bookingId} onChange={(e) => setBookingId(e.target.value)}>
            <option value="">-- Chọn khóa học --</option>
            {bookings.map((bk) => (
              <option key={bk._id} value={bk._id}>
                {`${bk.subject?.name || "Môn học"} (${bk.subject?.classLevel || ""}) - ${bk.learner?.username || "Học viên"} (${dayjs(bk.startDate).format("DD/MM")} → ${dayjs(bk.endDate).format("DD/MM")})`}
              </option>
            ))}
          </select>
        </div>

        {/* Khu vực upload file đẹp */}
        <div
          className="upload-dropzone"
          onClick={() => document.getElementById("fileInput").click()}
        >
          <input
            id="fileInput"
            type="file"
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files[0])}
          />
          {file ? (
            <p>📄 {file.name}</p>
          ) : (
            <p>📁 Kéo thả file vào đây hoặc bấm để chọn</p>
          )}
        </div>

        <div className="form-group">
          <label>Tiêu đề:</label>
          <input
            type="text"
            placeholder="Nhập tiêu đề tài liệu..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Mô tả:</label>
          <textarea
            placeholder="Mô tả ngắn gọn nội dung..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          className={`btn-upload ${loading ? "loading" : ""}`}
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "⏳ Đang tải..." : "📤 Tải lên"}
        </button>
      </div>

      <div className="materials-section">
        <h3>📁 Danh sách tài liệu</h3>
        {materials.length === 0 ? (
          <p className="empty-text">Chưa có tài liệu cho khóa học này.</p>
        ) : (
          <div className="materials-grid">
            {materials.map((mat) => (
              <div key={mat._id} className="material-card">
                <div className="card-header">
                  <h4>{mat.title}</h4>
                </div>
                <div className="card-body">
                  <p>{mat.description || "Không có mô tả"}</p>
                  <a
                    href={mat.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-link"
                  >
                    🔗 Xem tài liệu
                  </a>
                </div>
                <div className="card-footer">
                  <span className="file-type">{mat.fileType}</span>
                  <span className="upload-date">
                    {dayjs(mat.createdAt).format("DD/MM/YYYY HH:mm")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialUploader;
