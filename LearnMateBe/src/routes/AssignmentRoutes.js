const express = require("express");
const router = express.Router();

const { checkAccessToken } = require("../middleware/JWTAction");
const uploadDocs = require("../config/cloudinaryDocxConfig");

const {
  // === Storage ===
  createAssignmentStorage,
  getAssignmentStorage,
  getAssignmentStorageById,
  updateAssignmentStorage,
  deleteAssignmentStorage,

  // === Assigned / Tutor ===
  assignAssignmentFromStorage,
  assignMultipleAssignments,
  assignAssignmentToMultipleBookings,
  viewAssignment,
  viewAssignmentByTutor,
  filterAssignmentsByTutor,
  updateAssignedAssignment,
  deleteAssignedAssignment,
  getAssignmentById,

  // === Learner ===
  getAssignmentsForCourse,
  submitAssignment,
  viewSubmission,
  viewGradeFeedback,
  gradeAssignment,
} = require("../controller/assignment/assignmentController");


// ===================================================================
// 🧱 ASSIGNMENT STORAGE (Tutor tạo bộ bài mẫu)
// ===================================================================

// ➕ Tạo assignment mẫu
router.post(
  "/storage",
  checkAccessToken,
  uploadDocs.single("file"),
  createAssignmentStorage
);

// 📦 Lấy tất cả assignment mẫu
router.get("/storage", checkAccessToken, getAssignmentStorage);

// 🔍 Lấy chi tiết 1 assignment mẫu
router.get("/storage/:id", checkAccessToken, getAssignmentStorageById);

// ✏️ Cập nhật assignment mẫu
router.put(
  "/storage/:id",
  checkAccessToken,
  uploadDocs.single("file"),
  updateAssignmentStorage
);

// ❌ Xóa assignment mẫu (nếu chưa được giao)
router.delete("/storage/:id", checkAccessToken, deleteAssignmentStorage);


// ===================================================================
// 🧩 ASSIGNED ASSIGNMENT (Tutor giao – quản lý – chấm bài)
// ===================================================================

// 📨 Giao 1 assignment từ storage
router.post("/assign", checkAccessToken, assignAssignmentFromStorage);

// 📨 Giao nhiều assignment (multi learners)
router.post("/assign-multiple", checkAccessToken, assignMultipleAssignments);

// 📨 Giao assignment cho nhiều booking (multi booking)
router.post("/assign-multiple-bookings", checkAccessToken, assignAssignmentToMultipleBookings);

// 📋 Xem tất cả assignment (admin hoặc tutor)
router.get("/", checkAccessToken, viewAssignment);

// 👨‍🏫 Tutor xem assignment của chính mình
router.get("/my-assignment", checkAccessToken, viewAssignmentByTutor);

// 🔍 Lọc assignment theo học viên / môn / trạng thái
router.get("/filter", checkAccessToken, filterAssignmentsByTutor);

// ✏️ Cập nhật assignment đã giao (deadline, trạng thái, note...)
router.put("/:id", checkAccessToken, updateAssignedAssignment);

// ❌ Xóa assignment đã giao (nếu học viên chưa nộp)
router.delete("/:id", checkAccessToken, deleteAssignedAssignment);


// ===================================================================
// 🎓 LEARNER (học viên làm bài – xem điểm)
// ===================================================================

// 🧭 Lấy assignment theo khóa học
router.get("/course/:courseId", checkAccessToken, getAssignmentsForCourse);

// 📤 Học viên nộp bài
router.post(
  "/submit",
  checkAccessToken,
  uploadDocs.single("file"),
  submitAssignment
);

// 👀 Tutor xem danh sách bài nộp
router.get("/submissions", checkAccessToken, viewSubmission);

// 🧾 Tutor chấm điểm bài nộp
router.post("/grade", checkAccessToken, gradeAssignment);

// 💬 Học viên xem feedback
router.get("/:id/feedbacks", checkAccessToken, viewGradeFeedback);

// 🔎 Lấy chi tiết 1 assignment (cho cả tutor & learner)
router.get("/:id", checkAccessToken, getAssignmentById);

module.exports = router;
