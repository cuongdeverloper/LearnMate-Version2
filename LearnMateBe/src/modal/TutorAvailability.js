const mongoose = require("mongoose");

const tutorAvailabilitySchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "Tutor", required: true },
  dayOfWeek: { type: Number, required: true }, // 0 = Sunday, 1 = Monday ... 6 = Saturday
  startTime: { type: String, required: true }, // "10:00"
  endTime: { type: String, required: true },   // "11:00"
  isBooked: { type: Boolean, default: false } // Có ai book chưa
}, { timestamps: true });

module.exports = mongoose.model("TutorAvailability", tutorAvailabilitySchema);
