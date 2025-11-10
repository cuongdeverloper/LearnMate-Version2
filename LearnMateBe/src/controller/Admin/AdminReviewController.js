const Review = require('../../modal/Review');
const User = require('../../modal/User');
const Notification = require('../../modal/Notification');

// Get all reviews for admin management
const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    let filter = {};
    
    // Filter by status
    if (status === 'hidden') {
      filter.isHidden = true;
      filter.isDeleted = false; // Chỉ hiển thị những review bị ẩn nhưng chưa bị xóa
    } else if (status === 'deleted') {
      filter.isDeleted = true;
    } else if (status === 'spam') {
      filter.isSpam = true;
    } else if (status === 'offensive') {
      filter.isOffensive = true;
    } else if (status === 'active') {
      filter.isHidden = false;
      filter.isDeleted = false;
    }
    // Nếu không có status filter, hiển thị tất cả (bao gồm cả deleted, hidden, spam, offensive)
    
    // Search filter
    if (search && search.trim()) {
      filter.$or = [
        { comment: { $regex: search, $options: 'i' } },
        { 'user.username': { $regex: search, $options: 'i' } },
        { 'tutor.user.username': { $regex: search, $options: 'i' } }
      ];
    }
    
    const reviews = await Review.find(filter)
      .populate('user', '-password') // Lấy toàn bộ thông tin user trừ password
      .populate('tutor', 'user')
      .populate({
        path: 'tutor',
        populate: {
          path: 'user',
          select: 'username email'
        }
      })
      .populate('course', 'startDate endDate')
      .populate('deletedBy', 'username')
      .populate('adminRepliedBy', 'username')
      .populate('markedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(filter);

    return res.status(200).json({
      errorCode: 0,
      message: 'Get all reviews successfully',
      data: {
        reviews,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });
  } catch (error) {
    console.error('Error getting reviews:', error);
    return res.status(500).json({
      errorCode: 1,
      message: 'Internal server error'
    });
  }
};

// Hide/Show review
const toggleHideReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const adminId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        errorCode: 1,
        message: 'Review not found'
      });
    }

    if (review.isDeleted) {
      return res.status(400).json({
        errorCode: 2,
        message: 'Cannot hide/show deleted review'
      });
    }

    review.isHidden = !review.isHidden;
    await review.save();

    return res.status(200).json({
      errorCode: 0,
      message: review.isHidden ? 'Review hidden successfully' : 'Review shown successfully'
    });
  } catch (error) {
    console.error('Error toggling review visibility:', error);
    return res.status(500).json({
      errorCode: 3,
      message: 'Internal server error'
    });
  }
};

// Delete review with reason
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { deleteReason } = req.body;
    const adminId = req.user.id;

    if (!deleteReason || deleteReason.trim().length === 0) {
      return res.status(400).json({
        errorCode: 1,
        message: 'Delete reason is required'
      });
    }

    const review = await Review.findById(reviewId).populate('user', 'email username');
    if (!review) {
      return res.status(404).json({
        errorCode: 2,
        message: 'Review not found'
      });
    }

    if (review.isDeleted) {
      return res.status(400).json({
        errorCode: 3,
        message: 'Review already deleted'
      });
    }

    review.isDeleted = true;
    review.deleteReason = deleteReason;
    review.deletedAt = new Date();
    review.deletedBy = adminId;
    await review.save();

    // Tạo thông báo cho user về việc xóa review
    try {
      const notification = new Notification({
        recipient: review.user._id,
        type: 'review_deleted',
        title: 'Đánh giá của bạn đã bị xóa',
        message: `Đánh giá của bạn đã bị xóa bởi quản trị viên. Lý do: ${deleteReason}`,
        data: {
          reviewId: review._id,
          deleteReason: deleteReason,
          deletedAt: new Date()
        }
      });
      await notification.save();
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Continue execution even if notification fails
    }

    return res.status(200).json({
      errorCode: 0,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({
      errorCode: 4,
      message: 'Internal server error'
    });
  }
};

// Mark review as spam/offensive
const markReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { markType } = req.body; // Change from 'type' to 'markType'
    const adminId = req.user.id;

    if (!['spam', 'offensive'].includes(markType)) {
      return res.status(400).json({
        errorCode: 1,
        message: 'Invalid mark type. Must be "spam" or "offensive"'
      });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        errorCode: 2,
        message: 'Review not found'
      });
    }

    if (markType === 'spam') {
      review.isSpam = !review.isSpam;
    } else if (markType === 'offensive') {
      review.isOffensive = !review.isOffensive;
    }

    // Tự động ẩn đánh giá khi đánh dấu spam hoặc vi phạm
    if ((markType === 'spam' && review.isSpam) || (markType === 'offensive' && review.isOffensive)) {
      review.isHidden = true;
    }

    review.markedBy = adminId;
    review.markedAt = new Date();
    await review.save();

    return res.status(200).json({
      errorCode: 0,
      message: `Review ${markType} status updated successfully${
        ((markType === 'spam' && review.isSpam) || (markType === 'offensive' && review.isOffensive)) 
          ? ' and hidden' 
          : ''
      }`
    });
  } catch (error) {
    console.error('Error marking review:', error);
    return res.status(500).json({
      errorCode: 3,
      message: 'Internal server error'
    });
  }
};

// Get review stats for dashboard
const getReviewStats = async (req, res) => {
  try {
    // Tính toán thống kê đơn giản và chính xác
    const totalReviews = await Review.countDocuments();
    
    // Đã xóa
    const deletedReviews = await Review.countDocuments({ isDeleted: true });
    
    // Đã ẩn (không bao gồm đã xóa)
    const hiddenReviews = await Review.countDocuments({ 
      isDeleted: { $ne: true }, 
      isHidden: true 
    });
    
    // Đang hiển thị = Tổng - Đã xóa - Đã ẩn
    const activeReviews = totalReviews - deletedReviews - hiddenReviews;
    
    // Spam
    const spamReviews = await Review.countDocuments({ isSpam: true });
    
    // Vi phạm
    const offensiveReviews = await Review.countDocuments({ isOffensive: true });

    return res.status(200).json({
      errorCode: 0,
      message: 'Get review stats successfully',
      data: {
        totalReviews,
        activeReviews,
        hiddenReviews,
        deletedReviews,
        spamReviews,
        offensiveReviews
      }
    });
  } catch (error) {
    console.error('Error getting review stats:', error);
    return res.status(500).json({
      errorCode: 1,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllReviews,
  toggleHideReview,
  deleteReview,
  markReview,
  getReviewStats
};