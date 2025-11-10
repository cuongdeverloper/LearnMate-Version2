const mongoose = require("mongoose");

const QuestionStorageSchema = new mongoose.Schema(
  {
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "Tutor", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    topic: { type: String, required: true }, 
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuestionStorage", QuestionStorageSchema);
