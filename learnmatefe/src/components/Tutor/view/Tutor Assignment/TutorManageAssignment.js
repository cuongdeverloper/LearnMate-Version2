import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";
import { getMyAssignments, deleteAssignedAssignment } from "../../ApiTutor";

const TutorManageAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await getMyAssignments();
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      if (!data.length) {
        toast.info("Chưa có assignment nào!");
        setAssignments([]);
        setFilteredAssignments([]);
        return;
      }

      setAssignments(data);
      setFilteredAssignments(data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách assignment!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...assignments];
    if (selectedSubject)
      filtered = filtered.filter((a) => a.subjectId?.name === selectedSubject);
    if (selectedLearner)
      filtered = filtered.filter(
        (a) => a.learnerId?.username === selectedLearner
      );
    if (statusFilter) filtered = filtered.filter((a) => a.status === statusFilter);
    setFilteredAssignments(filtered);
  }, [selectedSubject, selectedLearner, statusFilter, assignments]);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Xác nhận xoá?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#95a5a6",
    });

    if (!confirm.isConfirmed) return;

    try {
      await deleteAssignedAssignment(id);
      setAssignments((prev) => prev.filter((a) => a._id !== id));
      toast.success("Đã xoá assignment!");
    } catch (error) {
      console.error(error);
      toast.error("Xoá thất bại!");
    }
  };

  // Lấy options từ data
  const subjectOptions = [
    ...new Set(assignments.map((a) => a.subjectId?.name || "Khác")),
  ];
  const learnerOptions = [
    ...new Set(assignments.map((a) => a.learnerId?.username || "Không rõ")),
  ];
  const statusOptions = ["pending", "submitted", "graded"];

  // Label trạng thái đẹp
  const statusLabel = {
    pending: "Chưa nộp",
    submitted: "Đã nộp",
    graded: "Đã chấm",
  };

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-800",
    submitted: "bg-blue-100 text-blue-800",
    graded: "bg-green-100 text-green-800",
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-1">Quản lý Assignment</h2>
        <p className="text-gray-500">Kiểm soát các bài tập đã giao cho học viên</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        {subjectOptions.map((subj) => (
          <button
            key={subj}
            onClick={() => setSelectedSubject(selectedSubject === subj ? null : subj)}
            className={`px-4 py-2 rounded-full border ${
              selectedSubject === subj
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            } transition`}
          >
            {subj}
          </button>
        ))}

        {learnerOptions.map((learner) => (
          <button
            key={learner}
            onClick={() =>
              setSelectedLearner(selectedLearner === learner ? null : learner)
            }
            className={`px-4 py-2 rounded-full border ${
              selectedLearner === learner
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            } transition`}
          >
            {learner}
          </button>
        ))}

        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() =>
              setStatusFilter(statusFilter === status ? null : status)
            }
            className={`px-4 py-2 rounded-full border ${
              statusFilter === status
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            } transition`}
          >
            {statusLabel[status]}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <ClipLoader color="#3B82F6" size={50} />
          <p className="text-gray-500 mt-4">Đang tải dữ liệu...</p>
        </div>
      ) : !filteredAssignments.length ? (
        <p className="text-center text-gray-500 py-10">
          Không có assignment nào phù hợp.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                {["Tiêu đề", "Môn học", "Học viên", "Ngày giao", "Hạn nộp", "Trạng thái", "Hành động"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-3 text-gray-700 font-medium text-sm"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((a) => (
                <tr
                  key={a._id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-3 text-gray-700">{a.title}</td>
                  <td className="px-6 py-3 text-gray-700">
                    {a.subjectId
                      ? `${a.subjectId.name} ${a.subjectId.classLevel || ""}`
                      : "—"}
                  </td>
                  <td className="px-6 py-3 text-gray-700">
                    {a.learnerId?.username || "—"}
                  </td>
                  <td className="px-6 py-3 text-gray-700">
                    {a.openTime
                      ? new Date(a.openTime).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="px-6 py-3 text-gray-700">
                    {a.deadline
                      ? new Date(a.deadline).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Không có"}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${statusColor[a.status]}`}
                    >
                      {statusLabel[a.status] || "Chưa nộp"}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-3 py-1 rounded"
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TutorManageAssignment;
