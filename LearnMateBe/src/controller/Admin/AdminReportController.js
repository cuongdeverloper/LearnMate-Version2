const mongoose = require('mongoose');
const Report = require('../../modal/Report');
const Booking = require('../../modal/Booking');
const User = require('../../modal/User');
const Notification = require('../../modal/Notification');

// Get all reports for admin management
const getAllReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, targetType, startDate, endDate } = req.query;
    
    let filter = {};
    
    // Filter by status
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Filter by target type
    if (targetType && targetType !== 'all') {
      filter.targetType = targetType;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    const reports = await Report.find(filter)
      .populate('reporter', 'username email image')
      .populate({
        path: 'targetId',
        populate: [
          {
            path: 'learnerId',
            select: 'username email image'
          },
          {
            path: 'tutorId',
            populate: {
              path: 'user',
              select: 'username email image'
            }
          }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Report.countDocuments(filter);
    
    return res.status(200).json({
      success: true,
      data: {
        reports,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get report details
const getReportDetails = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await Report.findById(reportId)
      .populate('reporter', 'username email phoneNumber image balance')
      .populate({
        path: 'targetId',
        populate: [
          {
            path: 'learnerId',
            select: 'username email phoneNumber image balance'
          },
          {
            path: 'tutorId',
            populate: {
              path: 'user',
              select: 'username email phoneNumber image'
            }
          },
          {
            path: 'subjectId',
            select: 'name classLevel'
          }
        ]
      });
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        report
      }
    });
  } catch (error) {
    console.error('Error fetching report details:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update report status
const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, action, adminNotes } = req.body;
    const adminId = req.user.id;
    
    
    // Validate reportId
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID format'
      });
    }
    
    if (!['pending', 'reviewed', 'dismissed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    const oldStatus = report.status;
    report.status = status;
    report.adminNotes = adminNotes;
    report.reviewedBy = adminId;
    report.reviewedAt = new Date();
    
    // Handle booking-related actions
    if (report.targetType === 'booking' && action) {
      
      try {
        const booking = await Booking.findById(report.targetId);
        if (booking) {
          
          if (action === 'cancel_booking') {
            booking.status = 'cancelled';
            booking.reported = true;
            await booking.save();
          } else if (action === 'mark_reported') {
            booking.reported = true;
            await booking.save();
          }
        } else {
          console.log('Booking not found for targetId:', report.targetId);
        }
      } catch (bookingError) {
        console.error('Error processing booking action:', bookingError);
        // Continue execution even if booking action fails
      }
    }
    
    await report.save();
    
    // Send notification to reporter
    try {
      await Notification.create({
        recipient: report.reporter,
        message: `Your report has been ${status}. ${adminNotes ? 'Admin notes: ' + adminNotes : ''}`,
        type: 'admin_action',
        relatedModel: 'Report',
        relatedId: report._id
      });
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Continue execution even if notification fails
    }
    
    return res.status(200).json({
      success: true,
      message: `Report status updated from ${oldStatus} to ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating report status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error: ' + error.message
    });
  }
};

// Get report statistics
const getReportStats = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const reviewedReports = await Report.countDocuments({ status: 'reviewed' });
    const dismissedReports = await Report.countDocuments({ status: 'dismissed' });
    const bookingReports = await Report.countDocuments({ targetType: 'booking' });
    
    // Get reports by reason
    const reasonStats = await Report.aggregate([
      {
        $group: {
          _id: '$reason',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    return res.status(200).json({
      success: true,
      data: {
        totalReports,
        pendingReports,
        reviewedReports,
        dismissedReports,
        bookingReports,
        reasonStats
      }
    });
  } catch (error) {
    console.error('Error fetching report stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Bulk update reports
const bulkUpdateReports = async (req, res) => {
  try {
    const { reportIds, status, adminNotes } = req.body;
    const adminId = req.user.id;
    
    if (!Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Report IDs array is required'
      });
    }
    
    if (!['pending', 'reviewed', 'dismissed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const updateData = {
      status,
      reviewedBy: adminId,
      reviewedAt: new Date()
    };
    
    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }
    
    const result = await Report.updateMany(
      { _id: { $in: reportIds } },
      updateData
    );
    
    // Send notifications to reporters
    const reports = await Report.find({ _id: { $in: reportIds } }).select('reporter');
    for (const report of reports) {
      await Notification.create({
        recipient: report.reporter,
        message: `Your report has been ${status}. ${adminNotes ? 'Admin notes: ' + adminNotes : ''}`,
        type: 'admin_action',
        relatedModel: 'Report',
        relatedId: report._id
      });
    }
    
    return res.status(200).json({
      success: true,
      message: `${result.modifiedCount} reports updated successfully`
    });
  } catch (error) {
    console.error('Error bulk updating reports:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllReports,
  getReportDetails,
  updateReportStatus,
  getReportStats,
  bulkUpdateReports
};