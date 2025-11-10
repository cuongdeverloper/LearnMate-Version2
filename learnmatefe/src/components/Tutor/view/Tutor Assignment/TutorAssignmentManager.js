import React, { useState } from "react";
import TutorCreateAssignment from "./TutorCreateAssignment";
import TutorAssignAssignment from "./TutorAssignAssignment";
import TutorManageAssignment from "./TutorManageAssignment";
import "./TutorAssignment.scss";
import TutorViewSubmissions from "./TutorViewSubmissions";

const TutorAssignmentManager = () => {
  const [tab, setTab] = useState("create");

  return (
    <div className="tutor-assignment-container">
      <div className="tab-header">
        <button className={tab === "create" ? "active" : ""} onClick={() => setTab("create")}>📂 Tạo Assignment</button>
        <button className={tab === "assign" ? "active" : ""} onClick={() => setTab("assign")}>🎯 Giao Assignment</button>
        <button className={tab === "manage" ? "active" : ""} onClick={() => setTab("manage")}>📋 Quản lý Assignment</button>
        <button className={tab === "submissions" ? "active" : ""} onClick={() => setTab("submissions")}>📥 Bài nộp</button>
      </div>

      <div className="tab-content">
        {tab === "create" && <TutorCreateAssignment />}
        {tab === "assign" && <TutorAssignAssignment />}
        {tab === "manage" && <TutorManageAssignment />}
        {tab === "submissions" && <TutorViewSubmissions />}
      </div>
    </div>
  );
};

export default TutorAssignmentManager;
