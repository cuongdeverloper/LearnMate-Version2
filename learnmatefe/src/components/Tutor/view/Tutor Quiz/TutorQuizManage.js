import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { getSubjectsByTutor, getQuizzesByTutorWithStatus } from "../../ApiTutor";
import "./TutorQuizManage.scss";

const TutorQuizManage = () => {
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [topics, setTopics] = useState([]);
  const [topic, setTopic] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // new filter
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getSubjectsByTutor();
        setSubjects(res.subjects || []);
      } catch (err) {
        console.error(err);
        toast.error("Không thể load danh sách môn học");
      }
    })();
  }, []);

  useEffect(() => {
    if (!subjectId) {
      setQuizzes([]);
      setTopics([]);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const res = await getQuizzesByTutorWithStatus(subjectId, topic);
        if (!res.success) throw new Error(res.message);

        let data = res.data || [];

        // filter theo status nếu có
        if (statusFilter) {
          if (statusFilter === "done") data = data.filter((q) => q.attempted);
          if (statusFilter === "not_done") data = data.filter((q) => !q.attempted);
        }

        setQuizzes(data);

        const uniqueTopics = [...new Set(data.map((q) => q.topic).filter(Boolean))];
        setTopics(uniqueTopics.map((t) => ({ label: t, value: t })));
      } catch (err) {
        console.error(err);
        toast.error("Không thể load quiz");
      } finally {
        setLoading(false);
      }
    })();
  }, [subjectId, topic, statusFilter]);

  return (
    <div className="quiz-manage-container">
      <h2>📊 Quản lý Quiz Học sinh</h2>

      <div className="filters">
        <Select
          options={subjects.map((s) => ({ value: s._id, label: s.name }))}
          onChange={(val) => { setSubjectId(val?.value || ""); setTopic(""); }}
          placeholder="Chọn môn học"
        />
        {topics.length > 0 && (
          <Select
            options={[{ label: "Tất cả", value: "" }, ...topics]}
            onChange={(val) => setTopic(val?.value || "")}
            placeholder="Chọn topic"
          />
        )}
        <Select
          options={[
            { label: "Tất cả", value: "" },
            { label: "Đã làm", value: "done" },
            { label: "Chưa làm", value: "not_done" },
          ]}
          onChange={(val) => setStatusFilter(val?.value || "")}
          placeholder="Trạng thái"
        />
      </div>

      <div className="quiz-grid">
        {loading ? (
          <p className="loading">Đang tải...</p>
        ) : quizzes.length === 0 ? (
          <p className="no-data">Không có quiz</p>
        ) : (
          quizzes.map((q) => (
            <div key={q._id} className={`quiz-card ${q.attempted ? "done" : "not-done"}`}>
              <h3>{q.title}</h3>
              <p className="subject">{q.subject?.name}</p>
              <p className="topic">{q.topic || "Chưa phân loại"}</p>
              <p className="learner">{q.booking?.learnerId?.username || "Chưa gán"}</p>
              <p className={`status ${q.attempted ? "done" : "not-done"}`}>
                {q.attempted ? "✅ Đã làm" : "❌ Chưa làm"}
              </p>
              <div className="stats">
                <span>Attempts: {q.attemptsCount || 0}</span>
                <span>Điểm: {q.attempted ? q.score + "/100" : "-"}</span>
              </div>
              <div className="time">
                <span>Mở: {new Date(q.openTime).toLocaleString("vi-VN")}</span>
                <span>Đóng: {new Date(q.closeTime).toLocaleString("vi-VN")}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TutorQuizManage;
