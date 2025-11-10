const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema(
  {
    quizAttemptId: { type: mongoose.Schema.Types.ObjectId, ref: "QuizAttempt" },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    selectedAnswer: { type: Number, required: true },
    isCorrect: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Answer", AnswerSchema);
