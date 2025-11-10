const mongoose = require("mongoose");

const QuizTemplateSchema = new mongoose.Schema({
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
  storageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QuizStorage",
  },

  title: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, default: 1800 }, // giây

  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  topic: String,
}, { timestamps: true });

module.exports = mongoose.model("QuizTemplate", QuizTemplateSchema);
