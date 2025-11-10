import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  getSubjectsByTutor,
  getBookingsByTutorId,
  getAssignmentStorage,
  assignMultipleAssignments,
} from "../../ApiTutor";

const TutorAssignAssignment = () => {
  const tutorId = useSelector((state) => state.user.account.id);

  const [subjects, setSubjects] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [storageList, setStorageList] = useState([]);
  const [filteredStorage, setFilteredStorage] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [selectedAssignments, setSelectedAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, bookingRes, storageRes] = await Promise.all([
          getSubjectsByTutor(),
          getBookingsByTutorId(tutorId),
          getAssignmentStorage(),
        ]);
        setSubjects(subRes.subjects || []);
        setBookings(bookingRes.data.bookings || []);
        setStorageList(storageRes.data || []);
        setFilteredStorage(storageRes.data || []);
      } catch {
        toast.error("❌ Lỗi tải dữ liệu!");
      }
    };
    fetchData();
  }, [tutorId]);

  const handleFilter = (subject, topic) => {
    let filtered = [...storageList];
    if (subject) filtered = filtered.filter((a) => a.subjectId?._id === subject);
    if (topic) filtered = filtered.filter((a) => a.topic?.toLowerCase().includes(topic.toLowerCase()));
    setFilteredStorage(filtered);
  };

  const handleSelectAssignment = (id, checked) => {
    if (checked) {
      setSelectedAssignments((prev) => [
        ...prev,
        { assignmentStorageId: id, title: "", openTime: "", deadline: "" },
      ]);
    } else {
      setSelectedAssignments((prev) => prev.filter((a) => a.assignmentStorageId !== id));
    }
  };

  const handleChangeAssignData = (id, field, value) => {
    setSelectedAssignments((prev) =>
      prev.map((a) => (a.assignmentStorageId === id ? { ...a, [field]: value } : a))
    );
  };

  const handleAssign = async () => {
    if (!selectedBookings.length || !selectedAssignments.length)
      return toast.warning("⚠️ Vui lòng chọn học viên và ít nhất 1 Assignment!");

    for (let a of selectedAssignments)
      if (!a.title || !a.openTime || !a.deadline)
        return toast.warning("⚠️ Điền đầy đủ tiêu đề, thời gian mở và hạn nộp!");

    setLoading(true);
    try {
      await assignMultipleAssignments({
        bookingIds: selectedBookings,
        assignments: selectedAssignments,
      });
      toast.success("✅ Giao Assignment thành công!");
      setSelectedBookings([]);
      setSelectedAssignments([]);
    } catch {
      toast.error("❌ Lỗi khi giao Assignment");
    } finally {
      setLoading(false);
    }
  };

  const subjectOptions = subjects.map((s) => ({ value: s._id, label: s.name }));
  const bookingOptions = bookings
    .filter((b) => b.status === "approve")
    .map((b) => ({
      value: b._id,
      label: `${b.subject?.name || ""} - ${b.learner?.username || ""}`,
    }));

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-6">🎯 Giao Assignment</h3>

      {/* Chọn học viên */}
      <div className="mb-6">
        <Select
          isMulti
          options={bookingOptions}
          placeholder="Chọn học viên..."
          value={bookingOptions.filter((b) => selectedBookings.includes(b.value))}
          onChange={(sel) => setSelectedBookings(sel.map((s) => s.value))}
        />
      </div>

      {/* Bộ lọc môn và topic */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Select
          options={[{ value: "", label: "Tất cả môn" }, ...subjectOptions]}
          placeholder="Lọc theo môn"
          onChange={(sel) => {
            setSelectedSubject(sel?.value || "");
            handleFilter(sel?.value || "", topicFilter);
          }}
          className="flex-1"
        />
        <input
          type="text"
          placeholder="Lọc theo topic"
          value={topicFilter}
          onChange={(e) => {
            setTopicFilter(e.target.value);
            handleFilter(selectedSubject, e.target.value);
          }}
          className="flex-1 border border-gray-300 rounded px-3 py-2"
        />
      </div>

      {/* Danh sách storage */}
      <div className="flex flex-col gap-2 mb-6 max-h-64 overflow-y-auto">
        {filteredStorage.length ? (
          filteredStorage.map((a) => (
            <label key={a._id} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={selectedAssignments.some((s) => s.assignmentStorageId === a._id)}
                onChange={(e) => handleSelectAssignment(a._id, e.target.checked)}
                className="w-4 h-4"
              />
              <span>{a.title} – {a.topic}</span>
            </label>
          ))
        ) : (
          <p className="text-gray-500">Không có assignment phù hợp</p>
        )}
      </div>

      {/* Assignment chi tiết */}
      {selectedAssignments.map((a) => (
        <div key={a.assignmentStorageId} className="flex flex-col gap-3 mb-4 border p-4 rounded">
          <input
            type="text"
            placeholder="Tiêu đề assignment"
            value={a.title}
            onChange={(e) => handleChangeAssignData(a.assignmentStorageId, "title", e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="datetime-local"
            value={a.openTime}
            onChange={(e) => handleChangeAssignData(a.assignmentStorageId, "openTime", e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="datetime-local"
            value={a.deadline}
            onChange={(e) => handleChangeAssignData(a.assignmentStorageId, "deadline", e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          />
        </div>
      ))}

      {/* Button giao assignment */}
      <button
        onClick={handleAssign}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 disabled:opacity-50 transition"
      >
        {loading ? "Đang giao..." : "📝 Giao tất cả Assignment"}
      </button>
    </div>
  );
};

export default TutorAssignAssignment;
