import React, { useEffect, useState } from "react";
import {
  getTutorChangeRequests,
  acceptChangeRequest,
  rejectChangeRequest,
} from "../ApiTutor";
import { toast } from "react-toastify";
import "./TutorChangeRequests.scss";

const TutorChangeRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getTutorChangeRequests();
      setRequests(res.data.changeRequests || []);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải danh sách yêu cầu thay đổi lịch");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await acceptChangeRequest(id);
      toast.success("Đã chấp nhận yêu cầu thay đổi");
      fetchRequests();
    } catch (err) {
      toast.error("Lỗi khi chấp nhận yêu cầu");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectChangeRequest(id);
      toast.info("Đã từ chối yêu cầu thay đổi");
      fetchRequests();
    } catch (err) {
      toast.error("Lỗi khi từ chối yêu cầu");
    }
  };

  if (loading) return <p>Đang tải yêu cầu thay đổi...</p>;

  return (
    <div className="tutor-change-requests">
      <h2>📅 Yêu cầu thay đổi lịch học</h2>

      {requests.length === 0 ? (
        <p>Không có yêu cầu thay đổi nào.</p>
      ) : (
        <table className="change-requests-table">
          <thead>
            <tr>
              <th>Học viên</th>
              <th>Ngày cũ</th>
              <th>Giờ cũ</th>
              <th>Ngày mới</th>
              <th>Giờ mới</th>
              <th>Lý do</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r._id}>
                <td>{r.learnerId?.username || "Ẩn danh"}</td>
                <td>{new Date(r.scheduleId?.date).toLocaleDateString()}</td>
                <td>
                  {r.scheduleId?.startTime} - {r.scheduleId?.endTime}
                </td>
                <td>{new Date(r.newDate).toLocaleDateString()}</td>
                <td>
                  {r.newStartTime} - {r.newEndTime}
                </td>
                <td>{r.reason}</td>
                <td>
                  <span
                    className={`status ${r.status}`}
                  >
                    {r.status === "pending"
                      ? "⏳ Chờ duyệt"
                      : r.status === "approved"
                      ? "✅ Đã duyệt"
                      : "❌ Từ chối"}
                  </span>
                </td>
                <td>
                  {r.status === "pending" ? (
                    <>
                      <button
                        className="btn-accept"
                        onClick={() => handleAccept(r._id)}
                      >
                        Duyệt
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleReject(r._id)}
                      >
                        Từ chối
                      </button>
                    </>
                  ) : (
                    <em>Không khả dụng</em>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TutorChangeRequests;
