import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  importQuestionsToStorage,
  getQuestionStorage,
  createQuizStorage,
  getQuizStorage,
  getSubjectsByTutor,
  getBookingsByTutorId,
} from "../../ApiTutor";
import "./TutorCreateQuiz.scss";

const TutorCreateQuiz = () => {
  const [subjects, setSubjects] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [questionStorage, setQuestionStorage] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [quizStorages, setQuizStorages] = useState([]);
  const [isCustomTopic, setIsCustomTopic] = useState(false);
  const [quizTopics, setQuizTopics] = useState([]);
  const [selectedQuizTopic, setSelectedQuizTopic] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [quizTopic, setQuizTopic] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const userId = useSelector((state) => state.user.account.id);

  useEffect(() => {
    (async () => {
      try {
        const [subRes, bookRes, quizStorageRes] = await Promise.all([
          getSubjectsByTutor(),
          getBookingsByTutorId(userId),
          getQuizStorage(),
        ]);
        setSubjects(subRes.subjects || []);
        setBookings(bookRes.bookings || []);
        setQuizStorages(quizStorageRes.quizzes || []);
        setQuizTopics(
          quizStorageRes.topics.map((t) => ({ label: t, value: t }))
        );
      } catch (error) {
        console.error(error);
      }
    })();
  }, [userId]);

  useEffect(() => {
    if (!selectedSubject) return;
    setSelectedTopic("");
    (async () => {
      try {
        const res = await getQuestionStorage(selectedSubject.value, "");
        setQuestionStorage(res.questions || []);
        setTopics(res.topics.map((t) => ({ label: t, value: t })) || []);
      } catch (err) {
        console.error(err);
        setQuestionStorage([]);
        setTopics([]);
      }
    })();
  }, [selectedSubject]);

  useEffect(() => {
    if (!selectedSubject || !selectedTopic) return;
    (async () => {
      try {
        const res = await getQuestionStorage(selectedSubject.value, selectedTopic);
        setQuestionStorage(res.questions || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [selectedTopic, selectedSubject]);

  const handleImportExcel = async () => {
    if (!file || !selectedSubject) {
      toast.error("Vui lòng chọn file và môn học!");
      return;
    }
    try {
      setLoading(true);
      await importQuestionsToStorage(file, selectedSubject.value);
      toast.success("Import câu hỏi thành công!");
      setFile(null);
    } catch {
      toast.error("Lỗi khi import câu hỏi!");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuizStorage = async () => {
    if (!selectedSubject || selectedQuestions.length === 0 || !quizTitle) {
      toast.error("Vui lòng chọn môn, tiêu đề và câu hỏi!");
      return;
    }
    setLoading(true);
    try {
      const res = await createQuizStorage({
        title: quizTitle,
        questionIds: selectedQuestions.map((q) => q._id),
        subjectId: selectedSubject.value,
        topic: quizTopic || selectedTopic,
      });
      if (res?.success) {
        toast.success("Tạo QuizStorage thành công!");
        setQuizStorages((prev) => [...prev, res.quizStorage]);
        setSelectedQuestions([]);
        setQuizTitle("");
        setQuizTopic("");
        setIsCustomTopic(false);
      }
    } catch {
      toast.error("Lỗi khi tạo QuizStorage!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tutor-quiz-dashboard">
      <h2>📘 Quản lý Quiz cho Tutor</h2>
      {/* Import Excel */}
      <div className="panel import-panel">
        <h3>Import câu hỏi từ Excel</h3>
        <Select
          options={subjects.map((s) => ({
            label: `${s.name} (${s.classLevel})`,
            value: s._id,
          }))}
          onChange={setSelectedSubject}
          placeholder="Chọn môn học"
        />
        <label className="file-upload">
          {file ? file.name : "Chọn file Excel..."}
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>
        <button onClick={handleImportExcel} disabled={loading}>
          {loading ? "Đang import..." : "Import Excel"}
        </button>
      </div>

      {/* Chọn Topic */}
      {selectedSubject && topics.length > 0 && (
        <div className="panel topic-panel">
          <h3>Chọn Topic của môn học</h3>
          <Select
            options={[{ label: "Tất cả", value: "" }, ...topics]}
            onChange={(val) => setSelectedTopic(val?.value || "")}
            placeholder="Lọc theo topic câu hỏi"
          />
        </div>
      )}

      {/* Chọn câu hỏi + tạo QuizStorage */}
      {selectedTopic && questionStorage.length > 0 && (
        <div className="panel questions-panel">
          <h3>Chọn câu hỏi để tạo QuizStorage</h3>
          <div className="questions-list">
            {questionStorage.map((q) => (
              <label key={q._id} className="question-card">
                <input
                  type="checkbox"
                  checked={selectedQuestions.some((s) => s._id === q._id)}
                  onChange={(e) =>
                    e.target.checked
                      ? setSelectedQuestions([...selectedQuestions, q])
                      : setSelectedQuestions(
                          selectedQuestions.filter((s) => s._id !== q._id)
                        )
                  }
                />
                <div className="question-content">
                  <p className="question-text">{q.text}</p>
                  <div className="options-grid">
                    {q.options?.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`option-item ${
                          q.correctAnswer === idx ? "correct" : ""
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}. {opt}
                      </div>
                    ))}
                  </div>
                  <div className="question-meta">
                    <span>✅ Đáp án đúng: {String.fromCharCode(65 + q.correctAnswer)}</span>
                    {q.topic && <span>📘 Chủ đề: {q.topic}</span>}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <input
            placeholder="Tên QuizStorage"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            className="input-text"
          />
          <Select
            options={[...topics, { label: "Khác (tự nhập)", value: "custom" }]}
            placeholder="Chọn topic cho QuizStorage"
            onChange={(val) => {
              if (val?.value === "custom") {
                setIsCustomTopic(true);
                setQuizTopic("");
              } else {
                setIsCustomTopic(false);
                setQuizTopic(val?.value || "");
              }
            }}
          />
          {isCustomTopic && (
            <input
              placeholder="Nhập topic mới"
              value={quizTopic}
              onChange={(e) => setQuizTopic(e.target.value)}
              className="input-text"
            />
          )}
          <button onClick={handleCreateQuizStorage} disabled={loading}>
            Tạo QuizStorage
          </button>
        </div>
      )}
    </div>
  );
};

export default TutorCreateQuiz;
