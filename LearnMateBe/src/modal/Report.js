const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Người báo cáo
  targetType: { type: String, enum: ['booking'], required: true }, // Loại đối tượng bị báo cáo
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID đối tượng bị báo cáo (ví dụ: bookingId)
  reason: { type: String, required: true }, // Nội dung báo cáo
  description: { type: String }, // Mô tả chi tiết (tùy chọn)
  status: { type: String, enum: ['pending', 'reviewed', 'dismissed'], default: 'pending' }, // Trạng thái xử lý
  adminNotes: { type: String }, // Ghi chú của admin
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin xử lý
  reviewedAt: { type: Date }, // Thời gian xử lý
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
