// models/Withdrawal.js
const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: { // Số tiền user yêu cầu rút
        type: Number,
        required: true,
        min: 100000
    },
    actualWithdrawal: { // Số tiền thực nhận sau khi trừ phí
        type: Number,
        required: true
    },
    bankAccount: {
        bankName: { type: String, required: true },
        accountNumber: { type: String, required: true },
        accountHolderName: { type: String, required: true },
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending'
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    processedAt: { type: Date },
    note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);