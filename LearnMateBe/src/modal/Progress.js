const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  content: { type: String, required: true }, 
  week: { type: Number, required: true }, 
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);
