const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tutor",
    required: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
  },
  sourceQuestionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QuestionStorage",
  },
  topic: { type: String },
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Question", QuestionSchema);
