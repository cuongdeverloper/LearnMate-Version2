const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor' }, // Có thể null nếu review cho course
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }, // Có thể null nếu review cho tutor
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  
  // Admin management fields
  isHidden: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  deleteReason: { type: String },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Admin reply
  adminReply: { type: String },
  adminRepliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminRepliedAt: { type: Date },
  
  // Moderation flags
  isSpam: { type: Boolean, default: false },
  isOffensive: { type: Boolean, default: false },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  markedAt: { type: Date },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', ReviewSchema);
