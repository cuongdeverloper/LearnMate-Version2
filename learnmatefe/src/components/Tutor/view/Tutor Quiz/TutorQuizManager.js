import React, { useState } from "react";
import TutorCreateQuiz from "./TutorCreateQuiz";
import TutorAssignQuiz from "./TutorAssignQuiz";
import TutorQuizManage from "./TutorQuizManage";

const tabs = [
  { id: "create", label: "Tạo Quiz", component: <TutorCreateQuiz /> },
  { id: "assign", label: "Gán Quiz", component: <TutorAssignQuiz /> },
  { id: "manage", label: "Quản lý Quiz", component: <TutorQuizManage /> },
];

const TutorQuizManager = () => {
  const [activeTab, setActiveTab] = useState("create");

  return (
    <div className="p-6">
      {/* 🔹 Tab header */}
      <div className="flex gap-4 border-b mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 font-medium ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-600 hover:text-blue-500"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 🔹 Tab content */}
      <div>
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default TutorQuizManager;
