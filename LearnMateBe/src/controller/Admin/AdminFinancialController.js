const mongoose = require('mongoose');
const Withdrawal = require('../../modal/Withdrawal');
const FinancialHistory = require('../../modal/FinancialHistory');
const User = require('../../modal/User');
const Booking = require('../../modal/Booking');
const Payment = require('../../modal/Payment');

// Get all withdrawal requests
const getAllWithdrawals = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;
    
    let filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const skip = (page - 1) * limit;
    const total = await Withdrawal.countDocuments(filter);
    
    const withdrawals = await Withdrawal.find(filter)
      .populate('userId', 'username email phoneNumber image balance')
      .populate('processedBy', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    return res.status(200).json({
      success: true,
      data: withdrawals,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get withdrawal details
const getWithdrawalDetails = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(withdrawalId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid withdrawal ID format'
      });
    }
    
    const withdrawal = await Withdrawal.findById(withdrawalId)
      .populate('userId', 'username email phoneNumber image balance')
      .populate('processedBy', 'username email');
    
    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: withdrawal
    });
  } catch (error) {
    console.error('Error fetching withdrawal details:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update withdrawal status
const updateWithdrawalStatus = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { status, adminNotes } = req.body;
    const adminId = req.user.id;
    
    if (!mongoose.Types.ObjectId.isValid(withdrawalId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid withdrawal ID format'
      });
    }
    
    if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found'
      });
    }
    
    const oldStatus = withdrawal.status;
    
    // If rejecting withdrawal, refund the amount
    if (status === 'rejected' && oldStatus === 'pending') {
      try {
        const user = await User.findById(withdrawal.userId);
        if (user) {
          user.balance += withdrawal.amount;
          await user.save();
          
          // Create financial history record
          await FinancialHistory.create({
            userId: withdrawal.userId,
            amount: withdrawal.amount,
            balanceChange: withdrawal.amount,
            type: 'topup',
            description: `Refund for rejected withdrawal request - ${adminNotes || 'Withdrawal rejected by admin'}`,
            status: 'success'
          });
        }
      } catch (refundError) {
        console.error('Error processing refund:', refundError);
        return res.status(500).json({
          success: false,
          message: 'Error processing refund'
        });
      }
    }
    
    withdrawal.status = status;
    withdrawal.adminNotes = adminNotes;
    withdrawal.processedBy = adminId;
    withdrawal.processedAt = new Date();
    
    await withdrawal.save();
    
    return res.status(200).json({
      success: true,
      message: `Withdrawal status updated from ${oldStatus} to ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating withdrawal status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message
    });
  }
};

// Get transaction history
const getTransactionHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, userId, startDate, endDate } = req.query;
    
    let filter = {};
    
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    if (userId) {
      filter.userId = userId;
    }
    
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const skip = (page - 1) * limit;
    const total = await FinancialHistory.countDocuments(filter);
    
    const transactions = await FinancialHistory.find(filter)
      .populate('userId', 'username email phoneNumber image')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    return res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get financial analytics
const getFinancialAnalytics = async (req, res) => {
  try {
    const { period = 'month', year = new Date().getFullYear() } = req.query;
    
    // Get withdrawal statistics
    const withdrawalStats = await Withdrawal.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    // Get revenue analytics based on period
    let dateGrouping, dateRange;
    const currentYear = parseInt(year);
    
    if (period === 'week') {
      // Last 12 weeks
      dateGrouping = {
        week: { $week: '$date' },
        year: { $year: '$date' }
      };
      dateRange = {
        $gte: new Date(currentYear, 0, 1),
        $lte: new Date(currentYear, 11, 31)
      };
    } else if (period === 'month') {
      // 12 months of the year
      dateGrouping = {
        month: { $month: '$date' },
        year: { $year: '$date' }
      };
      dateRange = {
        $gte: new Date(currentYear, 0, 1),
        $lte: new Date(currentYear, 11, 31)
      };
    } else if (period === 'year') {
      // Last 5 years
      dateGrouping = {
        year: { $year: '$date' }
      };
      dateRange = {
        $gte: new Date(currentYear - 4, 0, 1),
        $lte: new Date(currentYear, 11, 31)
      };
    }
    
    // Revenue from bookings (earnings)
    const revenueData = await FinancialHistory.aggregate([
      {
        $match: {
          type: 'spend', // When users spend money on bookings
          date: dateRange
        }
      },
      {
        $group: {
          _id: dateGrouping,
          revenue: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1 } }
    ]);
    
    // Withdrawal analytics
    const withdrawalData = await FinancialHistory.aggregate([
      {
        $match: {
          type: 'withdraw',
          date: dateRange
        }
      },
      {
        $group: {
          _id: dateGrouping,
          withdrawals: { $sum: '$amount' },
          withdrawalCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1 } }
    ]);
    
    // Top users by spending
    const topSpenders = await FinancialHistory.aggregate([
      {
        $match: {
          type: 'spend',
          date: dateRange
        }
      },
      {
        $group: {
          _id: '$userId',
          totalSpent: { $sum: '$amount' },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          username: '$user.username',
          email: '$user.email',
          totalSpent: 1,
          transactionCount: 1
        }
      }
    ]);
    
    // Monthly totals for current year
    const monthlyTotals = await FinancialHistory.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(currentYear, 0, 1),
            $lte: new Date(currentYear, 11, 31)
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    return res.status(200).json({
      success: true,
      data: {
        withdrawalStats,
        revenueData,
        withdrawalData,
        topSpenders,
        monthlyTotals,
        period,
        year: currentYear
      }
    });
  } catch (error) {
    console.error('Error fetching financial analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get withdrawal statistics
const getWithdrawalStats = async (req, res) => {
  try {
    const totalWithdrawals = await Withdrawal.countDocuments();
    const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'pending' });
    const approvedWithdrawals = await Withdrawal.countDocuments({ status: 'approved' });
    const rejectedWithdrawals = await Withdrawal.countDocuments({ status: 'rejected' });
    const completedWithdrawals = await Withdrawal.countDocuments({ status: 'completed' });
    
    // Total withdrawal amounts
    const totalWithdrawalAmount = await Withdrawal.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const pendingWithdrawalAmount = await Withdrawal.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    return res.status(200).json({
      success: true,
      data: {
        totalWithdrawals,
        pendingWithdrawals,
        approvedWithdrawals,
        rejectedWithdrawals,
        completedWithdrawals,
        totalWithdrawalAmount: totalWithdrawalAmount[0]?.total || 0,
        pendingWithdrawalAmount: pendingWithdrawalAmount[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Error fetching withdrawal stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllWithdrawals,
  getWithdrawalDetails,
  updateWithdrawalStatus,
  getTransactionHistory,
  getFinancialAnalytics,
  getWithdrawalStats
};