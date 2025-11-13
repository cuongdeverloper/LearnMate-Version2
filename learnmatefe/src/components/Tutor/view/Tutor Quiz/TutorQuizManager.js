import React, { useState } from "react";
import ImportQuestions from "./Tutor create quiz/ImportQuestion";
import CreateQuizStorage from "./Tutor create quiz/CreateQuizStorage";
import TutorAssignQuiz from "./TutorAssignQuiz";
import TutorQuizManage from "./TutorQuizManage";

const tabs = [
  { id: "import", label: "📥 Import Câu hỏi", component: <ImportQuestions /> },
  { id: "create", label: "🧩 Tạo QuizStorage", component: <CreateQuizStorage /> },
  { id: "assign", label: "📘 Gán Quiz", component: <TutorAssignQuiz /> },
  { id: "manage", label: "🗂️ Quản lý Quiz", component: <TutorQuizManage /> },
];

const TutorQuizManager = () => {
  const [activeTab, setActiveTab] = useState("import");

  return (
    <div className="tutor-quiz-dashboard p-6">
      {/* 🔹 Tab Header */}
      <div className="flex gap-4 border-b mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-blue-500"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 🔹 Tab Content */}
      <div className="tab-content">
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default TutorQuizManager;
