const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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

    scheduleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Schedule" }],

    status: {
      type: String,
      enum: ["pending", "approve", "cancelled", "rejected", "completed"],
      default: "pending",
    },

    address: { type: String, default: "" },

    // 💰 Thông tin thanh toán
    amount: { type: Number, required: true }, // Tổng tiền toàn khóa
    monthlyPayment: { type: Number, default: 0 }, // Số tiền mỗi tháng
    deposit: { type: Number, default: 0 }, // Tiền cọc (1 tháng cuối)
    depositStatus: {
      type: String,
      enum: ["none", "held", "used", "refunded", "forfeit"],
      default: "none",
    },
    initialPayment: { type: Number, default: 0 }, // Đã thanh toán lúc đầu (tháng đầu + cọc)
    paidMonths: { type: Number, default: 0 }, // Số tháng đã thanh toán
    numberOfMonths: { type: Number, default: 1 }, // Tổng số tháng học

    lastPaymentAt: { type: Date }, // Ngày thanh toán gần nhất

    note: { type: String, default: "" },
    completed: { type: Boolean, default: false },

    reported: { type: Boolean, default: false },
    reportedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
