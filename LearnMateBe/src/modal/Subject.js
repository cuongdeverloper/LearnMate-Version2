// models/Subject.js
const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  classLevel: { type: String, required: true }, // ví dụ: "Grade 10", "IELTS"
});

module.exports = mongoose.model("Subject", SubjectSchema);
