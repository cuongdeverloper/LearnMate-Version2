import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import Select from "react-select";
import { importQuestionsToStorage, getSubjectsByTutor } from "../../../ApiTutor";

const ImportQuestions = () => {
  const [file, setFile] = useState(null);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSubjectsByTutor()
      .then((res) => setSubjects(res.subjects || []))
      .catch(() => toast.error("Không tải được danh sách môn học"));
  }, []);

  const handleFileUpload = (e) => {
  const uploadedFile = e.target.files?.[0];
  if (!uploadedFile) return;
  setFile(uploadedFile);

  const reader = new FileReader();

  reader.onload = (evt) => {
    const data = evt.target?.result;
    if (!data) return;

    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const formatted = sheet.map((row) => {
      // Excel có thể để số 0-3 => convert sang A-D
      let ans = row.correctAnswer ?? row["Đáp án"] ?? "";
      if (typeof ans === "number") {
        ans = ["A", "B", "C", "D"][ans] || "";
      } else ans = ans.toString().trim().toUpperCase();

      return {
        text: row.text || row["Câu hỏi"] || "",
        topic: row.topic || row["Chủ đề"] || "",
        optionA: row.optionA || row["A"] || "",
        optionB: row.optionB || row["B"] || "",
        optionC: row.optionC || row["C"] || "",
        optionD: row.optionD || row["D"] || "",
        correctAnswer: ans,
      };
    });

    setPreviewQuestions(formatted);
    console.log(formatted);
  };

  reader.readAsArrayBuffer(uploadedFile);
};



  const handleDelete = (index) => {
    setPreviewQuestions(previewQuestions.filter((_, i) => i !== index));
  };

  const handleEdit = (index, field, value) => {
    const updated = [...previewQuestions];
    updated[index] = { ...updated[index], [field]: value }; // clone để reactive
    setPreviewQuestions(updated);
  };

  const handleSaveToStorage = async () => {
  if (!selectedSubject || previewQuestions.length === 0) {
    toast.error("Vui lòng chọn môn và kiểm tra danh sách câu hỏi!");
    return;
  }

  try {
    setLoading(true);

    const payload = {
      subjectId: selectedSubject.value,
      questions: previewQuestions.map(q => ({
        text: q.text,
        topic: q.topic,
        options: [q.optionA, q.optionB, q.optionC, q.optionD],
        correctAnswer: "ABCD".indexOf(q.correctAnswer.toUpperCase()),
      })),
    };

    await importQuestionsToStorage(payload); // Gửi JSON
    toast.success("Lưu câu hỏi vào QuestionStorage thành công!");
    setFile(null);
    setPreviewQuestions([]);
  } catch (err) {
    console.error(err);
    toast.error("Import thất bại!");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="bg-white shadow-md rounded-2xl p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-blue-600 flex items-center gap-2">
        📥 Import Câu Hỏi Từ Excel
      </h2>

      {/* Chọn môn */}
      <Select
        options={subjects.map((s) => ({
          label: `${s.name} (${s.classLevel})`,
          value: s._id,
        }))}
        onChange={setSelectedSubject}
        placeholder="Chọn môn học"
      />

      {/* Upload file */}
      <label className="cursor-pointer border border-dashed border-gray-300 p-4 rounded-lg text-gray-600 hover:bg-blue-50 transition">
        {file ? (
          <span className="font-medium text-blue-600">{file.name}</span>
        ) : (
          "📂 Chọn file Excel..."
        )}
        <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} hidden />
      </label>

      {/* Preview */}
      {previewQuestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-medium text-gray-700">
            Danh sách câu hỏi (chưa lưu)
          </h4>

          <div className="space-y-2 max-h-[550px] overflow-y-auto">
            {previewQuestions.map((q, idx) => {
              const expanded = expandedIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:shadow-sm transition"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                      <span className="font-semibold text-gray-700">
                        {idx + 1}.
                      </span>
                      <input
                        value={q.text}
                        onChange={(e) =>
                          handleEdit(idx, "text", e.target.value)
                        }
                        className="font-medium text-gray-800 bg-transparent w-[600px] border-b border-dashed border-gray-300 focus:border-blue-400 outline-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setExpandedIndex(expanded ? null : idx)
                        }
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        {expanded ? "Ẩn chi tiết ▲" : "Xem chi tiết 👁️"}
                      </button>
                      <button
                        onClick={() => handleDelete(idx)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ❌ Xóa
                      </button>
                    </div>
                  </div>

                  {/* Chi tiết */}
                  {expanded && (
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div className="col-span-2">
                        <label className="block text-gray-600 font-medium mb-1">
                          Chủ đề:
                        </label>
                        <input
                          value={q.topic}
                          onChange={(e) =>
                            handleEdit(idx, "topic", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-md px-2 py-1 focus:ring-1 focus:ring-blue-400 outline-none"
                        />
                      </div>

                      {["optionA", "optionB", "optionC", "optionD"].map(
                        (opt, i) => (
                          <div key={opt}>
                            <label className="block text-gray-600 font-medium mb-1">
                              {`Đáp án ${String.fromCharCode(65 + i)}`}
                            </label>
                            <input
                              value={q[opt] || ""}
                              onChange={(e) =>
                                handleEdit(idx, opt, e.target.value)
                              }
                              className="w-full border border-gray-300 rounded-md px-2 py-1 focus:ring-1 focus:ring-blue-400 outline-none"
                            />
                          </div>
                        )
                      )}

                      <div className="col-span-2">
                        <label className="block text-gray-600 font-medium mb-1">
                          Đáp án đúng:
                        </label>
                        <select
                          value={q.correctAnswer || ""}
                          onChange={(e) =>
                            handleEdit(idx, "correctAnswer", e.target.value)
                          }
                          className="border border-gray-300 rounded-md px-2 py-1 w-40 focus:ring-1 focus:ring-blue-400 outline-none"
                        >
                          <option value="">Chọn</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                        {q.correctAnswer && (
                          <span className="ml-3 text-green-600 font-semibold">
                            ✅ Hiện tại: {q.correctAnswer}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSaveToStorage}
            disabled={loading}
            className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Đang lưu..." : "💾 Lưu vào QuestionStorage"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImportQuestions;
