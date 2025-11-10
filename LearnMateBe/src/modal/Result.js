// models/Result.js
const mongoose = require("mongoose");

const ResultSchema = new mongoose.Schema({
  learner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
  score: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Result", ResultSchema);
