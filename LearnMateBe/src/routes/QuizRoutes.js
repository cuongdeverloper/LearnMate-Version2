// routes/quizRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const { checkAccessToken } = require("../middleware/JWTAction");

const {
  getAllQuizzes,
  getQuizById,
  getQuestionsByQuizId,
  updateQuestion,
  deleteQuestion,
  getAllQuizzesByLearnerId,
  createQuizFromStorage,
  importQuestionsToStorage,
  getQuizStorage,
  getQuestionStorage,
  addQuestionsFromStorageToQuiz,
  createQuizStorage,
  deleteQuizStorage,
  updateQuizStorage,

  submitQuiz,
  getQuizResultById,
  getQuizDetailsById,
  updateQuizTime,
  getQuizzesByTutorWithStatus,
} = require("../controller/quiz/quizController");

// =========================
// 📘 QUIZ ROUTES
// =========================
router.get("/", checkAccessToken, getAllQuizzes);
router.get("/getdetailquiz/:id", checkAccessToken, getQuizById);
router.post("/", checkAccessToken, createQuizFromStorage);
router.get("/my-quizzes", checkAccessToken, getQuizStorage);

router.get("/learner/all-quizzes", checkAccessToken, getAllQuizzesByLearnerId);

// =========================
// 📤 IMPORT & QUESTIONS
// =========================
router.post(
  "/import-question-storage",
  checkAccessToken,
  upload.single("file"),
  importQuestionsToStorage
);

router.get("/question/quiz/:quizId", checkAccessToken, getQuestionsByQuizId);
router.get("/my-question-storage", checkAccessToken, getQuestionStorage);
router.put("/question/:questionId", checkAccessToken, updateQuestion);
router.delete("/question/:questionId", checkAccessToken, deleteQuestion);
router.delete(
  "/quizstorage/:quizStorageId",
  checkAccessToken,
  deleteQuizStorage
);
router.post(
  "/add-questions-to-quiz",
  checkAccessToken,
  addQuestionsFromStorageToQuiz
);
router.post("/quiz-storage/create", checkAccessToken, createQuizStorage);
router.put("/quiz-storage/:quizStorageId", checkAccessToken, updateQuizStorage);
router.get(
  "/tutor/quizzes-status",
  checkAccessToken,
  getQuizzesByTutorWithStatus
);
// ---------------------- LEARNER ----------------------
router.post("/:quizId/submit", checkAccessToken, submitQuiz);
router.get("/:quizId/result", checkAccessToken, getQuizResultById);
router.get("/:quizId/details", checkAccessToken, getQuizDetailsById);
router.post("/updateQuizTime", checkAccessToken ,updateQuizTime);
module.exports = router;
