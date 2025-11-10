const mongoose = require("mongoose");

const QuizStorageSchema = new mongoose.Schema(
  {
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "Tutor", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    name: { type: String, required: true },
    description: { type: String },
    topic: { type: String },

    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "QuestionStorage" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizStorage", QuizStorageSchema);
