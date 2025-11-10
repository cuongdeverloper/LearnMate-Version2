const mongoose = require("mongoose");

const AssignmentStorageSchema = new mongoose.Schema({
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
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String }, 
  topic: { type: String, default: "Chưa phân loại" },
}, { timestamps: true });

module.exports = mongoose.model("AssignmentStorage", AssignmentStorageSchema);
