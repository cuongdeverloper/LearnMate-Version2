import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  getSubjectsByTutor,
  getBookingsByTutorId,
  getQuizStorage,
  createQuizFromStorage,
} from "../../ApiTutor";
import "./TutorAssignQuiz.scss";

const TutorAssignQuiz = () => {
  const [subjects, setSubjects] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [quizStorages, setQuizStorages] = useState([]);
  const [quizTopics, setQuizTopics] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedQuizStorage, setSelectedQuizStorage] = useState(null);
  const [selectedBookings, setSelectedBookings] = useState([]);

  const [openTime, setOpenTime] = useState("");
  const [duration, setDuration] = useState(1800);
  const [quizTitle, setQuizTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const userId = useSelector((state) => state.user.account.id);

  // 🔹 Load subjects & bookings
  useEffect(() => {
    (async () => {
      try {
        const [subRes, bookRes] = await Promise.all([
          getSubjectsByTutor(),
          getBookingsByTutorId(userId),
        ]);
        setSubjects(subRes.subjects || []);
        const approvedBookings = (bookRes.data.bookings || []).filter(
          (b) => b.status === "approve"
        );
        setBookings(approvedBookings);
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải dữ liệu môn học / học viên");
      }
    })();
  }, [userId]);

  // 🔹 Load quizStorage khi chọn môn
  useEffect(() => {
    if (!selectedSubject) return;

    (async () => {
      try {
        const res = await getQuizStorage(selectedSubject.value, "");
        const filtered = (res.quizzes || []).filter(
          (q) => q.subjectId?._id === selectedSubject.value
        );
        setQuizStorages(filtered);

        const subjectTopics = [
          ...new Set(filtered.map((q) => q.topic).filter(Boolean)),
        ];
        setQuizTopics(subjectTopics.map((t) => ({ label: t, value: t })));

        setSelectedTopic("");
        setSelectedQuizStorage(null);
      } catch (err) {
        console.error(err);
        setQuizStorages([]);
        setQuizTopics([]);
      }
    })();
  }, [selectedSubject]);

  // 🔹 Lọc quiz theo topic
  useEffect(() => {
    if (!selectedSubject) return;
    (async () => {
      try {
        const res = await getQuizStorage(selectedSubject.value, selectedTopic);
        let filtered = (res.quizzes || []).filter(
          (q) => q.subjectId?._id === selectedSubject.value
        );
        if (selectedTopic) filtered = filtered.filter((q) => q.topic === selectedTopic);
        setQuizStorages(filtered);
      } catch (err) {
        console.error(err);
        setQuizStorages([]);
      }
    })();
  }, [selectedTopic, selectedSubject]);

  // 🔹 Gán quiz cho nhiều booking
  const handleAssignQuiz = async () => {
    if (!selectedQuizStorage || selectedBookings.length === 0 || !openTime) {
      toast.error("Vui lòng chọn quiz, học viên và thời gian mở!");
      return;
    }

    try {
      setLoading(true);
      for (const bId of selectedBookings) {
        const res = await createQuizFromStorage({
          quizStorageId: selectedQuizStorage.value,
          bookingId: bId,
          title: quizTitle || selectedQuizStorage.label,
          duration,
          openTime,
        });
        if (!res?.success) {
          toast.error(`Gán quiz thất bại cho học viên ${bId}`);
        }
      }
      toast.success("🎉 Quiz đã được tạo và gán thành công!");
      setQuizTitle("");
      setSelectedBookings([]);
      setOpenTime("");
      setSelectedQuizStorage(null);
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi khi gán quiz!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assign-quiz-container">
      <h2>🧩 Gán Quiz cho Học viên</h2>

      <div className="form-section">
        <label>Môn học</label>
        <Select
          options={subjects.map((s) => ({
            label: `${s.name} ${s.classLevel || ""}`,
            value: s._id,
          }))}
          onChange={setSelectedSubject}
          placeholder="Chọn môn học"
        />
      </div>

      {quizTopics.length > 0 && (
        <div className="form-section">
          <label>Topic</label>
          <Select
            options={[{ label: "Tất cả", value: "" }, ...quizTopics]}
            onChange={(val) => setSelectedTopic(val?.value || "")}
            placeholder="Chọn topic"
          />
        </div>
      )}

      <div className="form-section">
        <label>QuizStorage</label>
        <Select
          options={quizStorages.map((q) => ({
            label: `${q.name} (${q.topic || "Không có topic"})`,
            value: q._id,
          }))}
          onChange={setSelectedQuizStorage}
          placeholder="Chọn quiz"
        />
      </div>

      <div className="form-section">
        <label>Chọn học viên</label>
        <div className="booking-grid">
          {bookings.map((b) => {
            const selected = selectedBookings.includes(b._id);
            return (
              <div
                key={b._id}
                className={`booking-card ${selected ? "selected" : ""}`}
                onClick={() => {
                  if (selected) {
                    setSelectedBookings(selectedBookings.filter((id) => id !== b._id));
                  } else {
                    setSelectedBookings([...selectedBookings, b._id]);
                  }
                }}
              >
                <strong>{b.learner?.username}</strong>
                <span>{b.subject?.name} - Lớp {b.subject?.classLevel}</span>
                <span>{new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="form-section">
        <label>Thời gian mở</label>
        <input
          type="datetime-local"
          value={openTime}
          onChange={(e) => setOpenTime(e.target.value)}
        />
      </div>

      <div className="form-section">
        <label>Thời lượng (giây)</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        />
      </div>

      <div className="form-section">
        <label>Tiêu đề Quiz (tùy chọn)</label>
        <input
          type="text"
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
          placeholder="Nhập tiêu đề quiz"
        />
      </div>

      <button
        onClick={handleAssignQuiz}
        disabled={loading}
        className={`btn-assign ${loading ? "loading" : ""}`}
      >
        {loading ? "Đang gán..." : "Gán Quiz cho học viên"}
      </button>
    </div>
  );
};

export default TutorAssignQuiz;
