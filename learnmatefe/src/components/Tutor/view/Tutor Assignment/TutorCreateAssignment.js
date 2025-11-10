import React, { useState, useEffect } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { getSubjectsByTutor, getAssignmentStorage, createAssignmentStorage } from "../../ApiTutor";
import "./TutorAssignment.scss";

const TutorCreateAssignment = () => {
  const [subjects, setSubjects] = useState([]);
  const [assignmentStorageList, setAssignmentStorageList] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filterSubject, setFilterSubject] = useState(null);
  const [filterTopic, setFilterTopic] = useState(null);
  const [availableTopics, setAvailableTopics] = useState([]);

  useEffect(() => {
    const initData = async () => {
      try {
        const [subRes, storageRes] = await Promise.all([
          getSubjectsByTutor(),
          getAssignmentStorage(),
        ]);
        setSubjects(subRes.subjects || []);
        setAssignmentStorageList(storageRes.data || []);
      } catch {
        toast.error("❌ Lỗi tải dữ liệu!");
      }
    };
    initData();
  }, []);

  useEffect(() => {
    // Lấy topics duy nhất từ danh sách assignment
    const topics = [
      ...new Set((assignmentStorageList || [])
        .map(a => a.topic)
        .filter(Boolean))
    ];
    setAvailableTopics(topics.map(t => ({ label: t, value: t })));
  }, [assignmentStorageList]);

useEffect(() => {
  let filtered = [...assignmentStorageList];

  // Lọc theo môn
  if (filterSubject && filterSubject.value) {
    filtered = filtered.filter(a => a.subjectId?._id === filterSubject.value);
  }

  // Lọc theo topic
  if (filterTopic && filterTopic.value) {
    filtered = filtered.filter(a => a.topic === filterTopic.value);
  }

  setFilteredAssignments(filtered);
}, [filterSubject, filterTopic, assignmentStorageList]);


  const handleCreate = async () => {
    if (!selectedSubject || !title.trim() || !file) {
      return toast.warning("⚠️ Vui lòng nhập tiêu đề, chọn môn và file!");
    }

    const formData = new FormData();
    formData.append("subjectId", selectedSubject.value);
    formData.append("title", title);
    formData.append("topic", topic);
    formData.append("description", description);
    formData.append("file", file);

    setLoading(true);
    try {
      await createAssignmentStorage(formData);
      toast.success("✅ Tạo Assignment Storage thành công!");
      setTitle(""); setTopic(""); setDescription(""); setFile(null); setSelectedSubject(null);
      const updated = await getAssignmentStorage();
      setAssignmentStorageList(updated.data || []);
    } catch {
      toast.error("❌ Lỗi khi tạo Assignment Storage");
    } finally {
      setLoading(false);
    }
  };

  const subjectOptions = subjects.map((s) => ({ value: s._id, label: s.name }));

  return (
    <div className="assignment-dashboard">
      <h2 className="dashboard-title">📂 Tạo Assignment Storage</h2>

      <div className="assignment-form-card">
        <Select
          options={subjectOptions}
          value={selectedSubject}
          onChange={setSelectedSubject}
          placeholder="Chọn môn học"
          className="select-input"
        />

        <input
          type="text"
          placeholder="Tiêu đề bài tập"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-input"
        />

        <input
          type="text"
          placeholder="Topic (tùy chọn)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="text-input"
        />

        <textarea
          placeholder="Mô tả (tùy chọn)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="textarea-input"
        />

        <label className="file-upload">
          {file ? file.name : "Chọn file (.pdf, .doc, .docx)"}
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>

        <button
          onClick={handleCreate}
          disabled={loading}
          className={`btn-submit ${loading ? "loading" : ""}`}
        >
          {loading ? "Đang tạo..." : "💾 Lưu Assignment"}
        </button>
      </div>

      {/* 🔹 Filter danh sách Assignment */}
      <div className="assignment-filter">
        <h3>🔍 Lọc Assignment</h3>
        <div className="filter-row">
          <Select
            options={[{ label: "Tất cả môn", value: "" }, ...subjectOptions]}
            value={filterSubject}
            onChange={setFilterSubject}
            placeholder="Lọc theo môn học"
          />
          <Select
            options={[{ label: "Tất cả topic", value: "" }, ...availableTopics]}
            value={filterTopic}
            onChange={setFilterTopic}
            placeholder="Lọc theo topic"
          />
        </div>
      </div>

      <h3 className="list-title">📘 Danh sách Assignment đã tạo</h3>
      <div className="assignment-list">
        {filteredAssignments.length === 0 && (
          <p className="text-center text-gray-500">Chưa có assignment phù hợp</p>
        )}
        {filteredAssignments.map((a) => (
          <div key={a._id} className="assignment-card">
            <div className="card-header">
              <h4>{a.title}</h4>
              {a.topic && <span className="badge-topic">{a.topic}</span>}
            </div>
            <p className="card-subject">{a.subjectId?.name || "Chưa xác định môn"}</p>
            {a.description && <p className="card-desc">{a.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TutorCreateAssignment;
