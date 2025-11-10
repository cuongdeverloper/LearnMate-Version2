const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema(
  {
    tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "Tutor", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    quizStorageId: { type: mongoose.Schema.Types.ObjectId, ref: "QuizStorage" },
    title: { type: String, required: true },
    description: { type: String },
    topic: { type: String },
    // ⚙️ Tùy chỉnh thời gian
    duration: { type: Number, default: 1800 }, // giây
    openTime: { type: Date, default: Date.now }, // thời gian mở quiz
    closeTime: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
    },

    newestScore: { type: Number, default: 0 },
    attempted: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", QuizSchema);
