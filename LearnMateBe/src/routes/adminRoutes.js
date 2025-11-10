const express = require('express');
const { checkAccessToken } = require('../middleware/JWTAction');
const { checkAdminRole } = require('../middleware/adminMiddleware');
const { 
    getAllUsers, 
    blockUser, 
    unblockUser, 
    deleteUser,
    getUserByUserId,
    getAllTutorApplications,
    approveTutorApplication,
    rejectTutorApplication
} = require('../controller/User/UserController');

const {
    getAllReviews,
    toggleHideReview,
    deleteReview,
    markReview,
    getReviewStats
} = require('../controller/Admin/AdminReviewController');

const {
    getAllBookings,
    getBookingDetails,
    updateBookingStatus,
    getBookingStats
} = require('../controller/Admin/AdminBookingController');

const {
    getAllReports,
    getReportDetails,
    updateReportStatus,
    getReportStats,
    bulkUpdateReports
} = require('../controller/Admin/AdminReportController');

const {
    getAllWithdrawals,
    getWithdrawalDetails,
    updateWithdrawalStatus,
    getTransactionHistory,
    getFinancialAnalytics,
    getWithdrawalStats
} = require('../controller/Admin/AdminFinancialController');

const RouterAdmin = express.Router();

// Middleware: Kiểm tra access token và quyền admin
RouterAdmin.use(checkAccessToken);
RouterAdmin.use(checkAdminRole);

// User management routes
// User management routes
RouterAdmin.get('/users', getAllUsers);
RouterAdmin.get('/users/:userId', getUserByUserId);
RouterAdmin.patch('/users/:userId/block', blockUser);
RouterAdmin.patch('/users/:userId/unblock', unblockUser);
RouterAdmin.delete('/users/:userId', deleteUser);

// Tutor management routes
RouterAdmin.get('/tutor-applications', getAllTutorApplications);
RouterAdmin.patch('/tutor-applications/:applicationId/approve', approveTutorApplication);
RouterAdmin.patch('/tutor-applications/:applicationId/reject', rejectTutorApplication);

// Review management routes
RouterAdmin.get('/reviews', getAllReviews);
RouterAdmin.get('/reviews/stats', getReviewStats);
RouterAdmin.patch('/reviews/:reviewId/toggle-hide', toggleHideReview);
RouterAdmin.delete('/reviews/:reviewId', deleteReview);
RouterAdmin.patch('/reviews/:reviewId/mark', markReview);

// Booking management routes
RouterAdmin.get('/bookings', getAllBookings);
RouterAdmin.get('/bookings/stats', getBookingStats);
RouterAdmin.get('/bookings/:bookingId', getBookingDetails);
RouterAdmin.patch('/bookings/:bookingId/status', updateBookingStatus);

// Report management routes
RouterAdmin.get('/reports', getAllReports);
RouterAdmin.get('/reports/stats', getReportStats);
RouterAdmin.get('/reports/:reportId', getReportDetails);
RouterAdmin.patch('/reports/:reportId/status', updateReportStatus);
RouterAdmin.patch('/reports/bulk-update', bulkUpdateReports);

// Financial management routes
RouterAdmin.get('/withdrawals', getAllWithdrawals);
RouterAdmin.get('/withdrawals/stats', getWithdrawalStats);
RouterAdmin.get('/withdrawals/:withdrawalId', getWithdrawalDetails);
RouterAdmin.patch('/withdrawals/:withdrawalId/status', updateWithdrawalStatus);
RouterAdmin.get('/transactions', getTransactionHistory);
RouterAdmin.get('/analytics', getFinancialAnalytics);

module.exports = RouterAdmin;