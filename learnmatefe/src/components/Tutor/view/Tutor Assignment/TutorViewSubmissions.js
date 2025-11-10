import React, { useEffect, useState } from "react";
import { getAssignmentSubmissions, gradeSubmittedAssignment } from "../../ApiTutor";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const TutorViewSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getAssignmentSubmissions();
      setSubmissions(res || []);
    } catch {
      toast.error("❌ Lỗi tải bài nộp!");
    }
  };

  const handleGrade = async (assignmentId) => {
    const { value: formValues } = await Swal.fire({
      title: "Chấm điểm bài nộp",
      html: `
        <input id="grade" class="swal2-input" placeholder="Điểm (0-10)">
        <textarea id="feedback" class="swal2-textarea" placeholder="Nhận xét..."></textarea>
      `,
      focusConfirm: false,
      preConfirm: () => ({
        grade: document.getElementById("grade").value,
        feedback: document.getElementById("feedback").value,
      }),
    });

    if (!formValues?.grade) return toast.warning("⚠️ Nhập điểm!");

    try {
      await gradeSubmittedAssignment({
        assignmentId,
        grade: Number(formValues.grade),
        feedback: formValues.feedback,
      });

      toast.success("✅ Đã chấm điểm!");
      fetchData();
    } catch {
      toast.error("❌ Lỗi khi chấm!");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">📥 Danh sách bài nộp</h2>

      {submissions.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">Chưa có bài nộp nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Học viên</th>
                <th className="py-3 px-4 text-left">Tiêu đề</th>
                <th className="py-3 px-4 text-left">File</th>
                <th className="py-3 px-4 text-left">Thời gian nộp</th>
                <th className="py-3 px-4 text-left">Điểm</th>
                <th className="py-3 px-4 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s, idx) => (
                <tr
                  key={s._id}
                  className={`border-b hover:bg-gray-100 ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                >
                  <td className="py-3 px-4">{s.learnerId?.username || "—"}</td>
                  <td className="py-3 px-4">{s.title || "—"}</td>
                  <td className="py-3 px-4">
                    {s.fileUrl ? (
                      <a
                        href={s.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        📄 Xem
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {s.submittedAt ? new Date(s.submittedAt).toLocaleString("vi-VN") : "—"}
                  </td>
                  <td className="py-3 px-4 font-medium">{s.grade ?? "—"}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleGrade(s._id)}
                      className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors"
                    >
                      ✏️ Chấm điểm
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

export default TutorViewSubmissions;
