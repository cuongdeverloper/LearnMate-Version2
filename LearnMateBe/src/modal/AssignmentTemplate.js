const mongoose = require("mongoose");

const AssignmentTemplateSchema = new mongoose.Schema({
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
    ref: "AssignmentStorage",
  },
  title: { type: String, required: true },
  description: String,
  fileUrl: String, // file bài tập mẫu
  deadlineDays: { type: Number, default: 7 }, // hạn nộp mặc định
}, { timestamps: true });

module.exports = mongoose.model("AssignmentTemplate", AssignmentTemplateSchema);
