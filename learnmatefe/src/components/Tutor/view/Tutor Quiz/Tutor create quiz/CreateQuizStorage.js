import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import {
  getQuestionStorage,
  createQuizStorage,
  getSubjectsByTutor,
} from "../../../ApiTutor";

const CreateQuizStorage = () => {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questionsByTopic, setQuestionsByTopic] = useState({}); // { topicName: [questionList] }
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [randomCounts, setRandomCounts] = useState({}); // { topicName: number }
  const [newTopic, setNewTopic] = useState(""); // topic mới nếu nhập tay

  // 🔹 Lấy danh sách môn học
  useEffect(() => {
    getSubjectsByTutor().then((res) => setSubjects(res.subjects || []));
  }, []);

  // 🔹 Lấy danh sách topic khi chọn subject
  useEffect(() => {
    if (!selectedSubject) return;
    getQuestionStorage(selectedSubject.value, "")
      .then((res) =>
        setTopics(res.topics.map((t) => ({ label: t, value: t })) || [])
      )
      .catch(() => setTopics([]));
  }, [selectedSubject]);

  // 🔹 Khi chọn topic => load câu hỏi cho từng topic
  useEffect(() => {
    if (!selectedSubject || selectedTopics.length === 0) return;
    const fetchQuestions = async () => {
      const newData = { ...questionsByTopic };
      for (const t of selectedTopics) {
        if (!newData[t.value]) {
          const res = await getQuestionStorage(selectedSubject.value, t.value);
          newData[t.value] = res.questions || [];
        }
      }
      setQuestionsByTopic(newData);
    };
    fetchQuestions();
  }, [selectedTopics, selectedSubject]);

  // 🔹 Random câu hỏi trong 1 topic cụ thể
  const handleRandomSelect = (topic) => {
    const topicQuestions = questionsByTopic[topic] || [];
    const n = Number(randomCounts[topic] || 0);

    if (isNaN(n) || n <= 0) {
      toast.warn("Số lượng phải lớn hơn 0!");
      return;
    }
    if (n > topicQuestions.length) {
      toast.warn(`Không đủ câu hỏi trong ${topic}!`);
      return;
    }

    const shuffled = [...topicQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, n);

    // Cộng dồn các topic khác
    setSelectedQuestions((prev) => {
      const filtered = prev.filter((q) => q.topic !== topic);
      return [...filtered, ...selected.map((q) => ({ ...q, topic }))];
    });

    toast.info(`Đã chọn ngẫu nhiên ${n} câu từ "${topic}".`);
  };

  // 🔹 Lưu QuizStorage
  const handleCreateQuizStorage = async () => {
    if (!quizTitle || selectedQuestions.length === 0) {
      toast.error("Vui lòng nhập tiêu đề và chọn ít nhất 1 câu hỏi!");
      return;
    }

    // Nếu nhập topic mới thì lấy tên đó, ngược lại dùng danh sách topic đã chọn
    const topicName =
      newTopic.trim() !== ""
        ? newTopic.trim()
        : selectedTopics.map((t) => t.value).join(", ");

    try {
      setLoading(true);
      await createQuizStorage({
        title: quizTitle,
        subjectId: selectedSubject.value,
        topic: topicName,
        questionIds: selectedQuestions.map((q) => q._id),
      });
      toast.success("Tạo QuizStorage thành công!");
      setSelectedQuestions([]);
      setQuizTitle("");
      setNewTopic("");
      setSelectedTopics([]);
    } catch {
      toast.error("Tạo thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-blue-600 flex items-center gap-2">
        🧩 Tạo QuizStorage
      </h2>

      {/* 🔸 Chọn môn */}
      <Select
        options={subjects.map((s) => ({
          label: `${s.name} (${s.classLevel})`,
          value: s._id,
        }))}
        onChange={setSelectedSubject}
        placeholder="Chọn môn học"
      />

      {/* 🔸 Chọn nhiều topic */}
      {topics.length > 0 && (
        <Select
          options={topics}
          isMulti
          onChange={setSelectedTopics}
          placeholder="Chọn một hoặc nhiều topic"
        />
      )}

      {/* 🔸 Nhập topic mới nếu muốn */}
      <input
        type="text"
        value={newTopic}
        onChange={(e) => setNewTopic(e.target.value)}
        placeholder="(Tùy chọn) Nhập topic cho gói quiz"
        className="w-full border border-gray-300 rounded-lg px-3 py-2"
      />

      {/* 🔸 Nhập tên QuizStorage */}
      <input
        type="text"
        value={quizTitle}
        onChange={(e) => setQuizTitle(e.target.value)}
        placeholder="Tên QuizStorage"
        className="w-full border border-gray-300 rounded-lg px-3 py-2"
      />

      {/* 🔸 Random câu hỏi theo từng topic */}
      {selectedTopics.map((t) => (
        <div key={t.value} className="border rounded-lg p-3 bg-gray-50 space-y-2">
          <h3 className="text-lg font-medium text-blue-700">
            🎯 {t.value} ({questionsByTopic[t.value]?.length || 0} câu hỏi)
          </h3>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={randomCounts[t.value] || ""}
              onChange={(e) =>
                setRandomCounts({
                  ...randomCounts,
                  [t.value]: e.target.value,
                })
              }
              placeholder="Số lượng random"
              className="border rounded-lg px-2 py-1 w-32"
            />
            <button
              onClick={() => handleRandomSelect(t.value)}
              className="px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500"
            >
             Random từ {t.value}
            </button>
          </div>
        </div>
      ))}

      {/* 🔸 Tổng hợp thông tin */}
      {selectedQuestions.length > 0 && (
        <p className="text-gray-600">
          Tổng số câu hỏi đã chọn:{" "}
          <span className="font-semibold text-green-600">
            {selectedQuestions.length}
          </span>
        </p>
      )}

      {/* 🔸 Nút lưu */}
      <button
        onClick={handleCreateQuizStorage}
        disabled={loading}
        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
      >
        {loading ? "Đang tạo..." : "💾 Tạo QuizStorage"}
      </button>
    </div>
  );
};

export default CreateQuizStorage;
