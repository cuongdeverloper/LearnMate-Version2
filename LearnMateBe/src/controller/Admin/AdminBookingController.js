const Booking = require('../../modal/Booking');
const Report = require('../../modal/Report');
const User = require('../../modal/User');
const Tutor = require('../../modal/Tutor');
const Subject = require('../../modal/Subject');
const FinancialHistory = require('../../modal/FinancialHistory');
const mongoose = require('mongoose');

// Get all bookings for admin management
const getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, tutorId, learnerId, startDate, endDate } = req.query;
    
    let filter = {};
    
    // Filter by status
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Filter by tutor
    if (tutorId) {
      filter.tutorId = tutorId;
    }
    
    // Filter by learner
    if (learnerId) {
      filter.learnerId = learnerId;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const bookings = await Booking.find(filter)
      .populate('learnerId', 'username email phoneNumber image')
      .populate({
        path: 'tutorId',
        populate: {
          path: 'user',
          select: 'username email phoneNumber image'
        }
      })
      .populate('subjectId', 'name classLevel')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Booking.countDocuments(filter);
    
    return res.status(200).json({
      success: true,
      data: {
        bookings,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get booking details with reports
const getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Validate bookingId
    if (!bookingId || bookingId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required and must be valid'
      });
    }
    
    // Validate if bookingId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Booking ID format'
      });
    }
    
    const booking = await Booking.findById(bookingId)
      .populate('learnerId', 'username email phoneNumber image balance')
      .populate({
        path: 'tutorId',
        populate: {
          path: 'user',
          select: 'username email phoneNumber image'
        }
      })
      .populate('subjectId', 'name classLevel')
      .populate('scheduleIds');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Get related reports
    const reports = await Report.find({ 
      targetType: 'booking', 
      targetId: bookingId 
    })
      .populate('reporter', 'username email image')
      .populate('reviewedBy', 'username email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        booking,
        reports,
        reportCount: reports.length
      }
    });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, reason } = req.body;
    const adminId = req.user.id;
    
    // Validate bookingId
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format'
      });
    }
    
    if (!['pending', 'approve', 'cancelled', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    const oldStatus = booking.status;
    booking.status = status;
    
    // Handle refund logic if booking is cancelled/rejected
    if ((status === 'cancelled' || status === 'rejected') && booking.deposit > 0) {
      try {
        // Issue refund
        const learner = await User.findById(booking.learnerId);
        if (learner) {
          learner.balance += booking.deposit;
          await learner.save();
          
          // Create financial history record
          try {
            await FinancialHistory.create({
              userId: booking.learnerId,
              amount: booking.deposit,
              type: 'refund',
              description: `Refund for booking ${booking._id} - ${reason || 'Booking cancelled by admin'}`,
              relatedBooking: booking._id
            });
          } catch (historyError) {
            console.error('Error creating financial history:', historyError);
            // Continue execution even if financial history fails
          }
        }
      } catch (refundError) {
        console.error('Error processing refund:', refundError);
        return res.status(500).json({
          success: false,
          message: 'Error processing refund'
        });
      }
    }
    
    await booking.save();
    
    return res.status(200).json({
      success: true,
      message: `Booking status updated from ${oldStatus} to ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message
    });
  }
};

// Get booking statistics
const getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const approvedBookings = await Booking.countDocuments({ status: 'approve' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const rejectedBookings = await Booking.countDocuments({ status: 'rejected' });
    const reportedBookings = await Booking.countDocuments({ reported: true });
    
    return res.status(200).json({
      success: true,
      data: {
        totalBookings,
        pendingBookings,
        approvedBookings,
        cancelledBookings,
        completedBookings,
        rejectedBookings,
        reportedBookings
      }
    });
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllBookings,
  getBookingDetails,
  updateBookingStatus,
  getBookingStats
};