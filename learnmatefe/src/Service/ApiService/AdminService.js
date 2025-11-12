import axios from '../AxiosCustomize';
import Cookies from 'js-cookie';

class AdminService {
    // Get all users
    static async getAllUsers() {
        try {
            const token = Cookies.get("accessToken");

            if (!token) {
                console.error('No access token found');
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.get('/api/admin/users', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            // Axios interceptor đã extract response.data, nên response đã là data trực tiếp
            return response;
        } catch (error) {
            console.error('Error fetching users:', error.response?.data?.message || error.message);
            return null;
        }
    }

    // Get user by ID
    static async getUserById(userId) {
        try {
            const token = Cookies.get("accessToken");

            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.get(`/api/admin/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    }

    // Block user
    static async blockUser(userId, reason) {
        try {
            const token = Cookies.get("accessToken");

            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.patch(
                `/api/admin/users/${userId}/block`,
                { reason },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error blocking user:', error);
            return null;
        }
    }

    // Unblock user
    static async unblockUser(userId) {
        try {
            const token = Cookies.get("accessToken");

            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.patch(
                `/api/admin/users/${userId}/unblock`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error unblocking user:', error);
            return null;
        }
    }

    // Delete user
    static async deleteUser(userId, reason) {
        try {
            const token = Cookies.get("accessToken");

            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.delete(
                `/api/admin/users/${userId}`,
                { 
                    data: { reason },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error deleting user:', error);
            return null;
        }
    }

    // ========== TUTOR MANAGEMENT FUNCTIONS ==========
    
    // Get all tutor applications
    static async getAllTutorApplications() {
        try {
            const token = Cookies.get("accessToken");

            if (!token) {
                console.error('No access token found');
                window.open("/signin", "_blank");
                return null;
            }


            const response = await axios.get('/api/admin/tutor-applications', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Axios interceptor đã extract response.data, nên response đã là data trực tiếp
            return response;
        } catch (error) {
            console.error('Error fetching tutor applications - Full error:', error);
            console.error('Error response:', error.response);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);
            return null;
        }
    }

    // Approve tutor application
    static async approveTutorApplication(applicationId) {
        try {
            const token = Cookies.get("accessToken");

            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.patch(
                `/api/admin/tutor-applications/${applicationId}/approve`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            // Return response data để component có thể kiểm tra success
            return response;
        } catch (error) {
            console.error('Error approving tutor application:', error);
            throw error; // Let component handle the error
        }
    }

    // Reject tutor application
    static async rejectTutorApplication(applicationId, reason) {
        try {
            const token = Cookies.get("accessToken");

            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }
            
            const response = await axios.patch(
                `/api/admin/tutor-applications/${applicationId}/reject`,
                { reason },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            // Return response data để component có thể kiểm tra success
            return response;
        } catch (error) {
            throw error;
        }
    }

    // ========== REVIEW MANAGEMENT FUNCTIONS ==========
    


    // Get all reviews
    static async getAllReviews(page = 1, pageSize = 10, status = '', search = '') {
        try {
            const token = Cookies.get("accessToken");
            
            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString(),
            });

            if (status) params.append('status', status);
            if (search) params.append('search', search);

            const response = await axios.get(`/api/admin/reviews?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response;
        } catch (error) {
            console.error('Error fetching reviews:', error);
            throw error;
        }
    }

    static async getReviewStats() {
        try {
            const token = Cookies.get("accessToken");
            
            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.get('/api/admin/reviews/stats', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response;
        } catch (error) {
            console.error('Error fetching review stats:', error);
            throw error;
        }
    }

    static async toggleHideReview(reviewId) {
        try {
            const token = Cookies.get("accessToken");
            
            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.patch(`/api/admin/reviews/${reviewId}/toggle-hide`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response;
        } catch (error) {
            console.error('Error toggling review visibility:', error);
            throw error;
        }
    }

    static async deleteReview(reviewId, reason) {
        try {
            const token = Cookies.get("accessToken");
            
            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.delete(`/api/admin/reviews/${reviewId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                data: {
                    reason: reason
                }
            });

            return response;
        } catch (error) {
            console.error('Error deleting review:', error);
            throw error;
        }
    }

    static async markReview(reviewId, type) {
        try {
            const token = Cookies.get("accessToken");
            
            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.patch(`/api/admin/reviews/${reviewId}/mark`, {
                type: type
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response;
        } catch (error) {
            console.error('Error marking review:', error);
            throw error;
        }
    }

    // ============ REPORT MANAGEMENT ============
    
    // Get all reports
    static async getReports(params = {}) {
        try {
            const token = Cookies.get("accessToken");
            
            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.get('/api/admin/reports', {
                params,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response;
        } catch (error) {
            console.error('Error fetching reports:', error);
            throw error;
        }
    }

    // Get report statistics
    static async getReportStats() {
        try {
            const token = Cookies.get("accessToken");
            
            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.get('/api/admin/reports/stats', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response;
        } catch (error) {
            console.error('Error fetching report stats:', error);
            throw error;
        }
    }

    // Get report details
    static async getReportDetails(reportId) {
        try {
            const token = Cookies.get("accessToken");
            
            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.get(`/api/admin/reports/${reportId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response;
        } catch (error) {
            console.error('Error fetching report details:', error);
            throw error;
        }
    }

    // Update report status
    static async updateReportStatus(reportId, data) {
        try {
            const token = Cookies.get("accessToken");
            
            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.patch(`/api/admin/reports/${reportId}/status`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response;
        } catch (error) {
            console.error('Error updating report status:', error);
            throw error;
        }
    }

    // Bulk update reports
    static async bulkUpdateReports(data) {
        try {
            const token = Cookies.get("accessToken");
            
            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.patch('/api/admin/reports/bulk-update', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response;
        } catch (error) {
            console.error('Error bulk updating reports:', error);
            throw error;
        }
    }
    
       // ================= BOOKING MANAGEMENT =================
    
    // Get all bookings
    static async getBookings(params = {}) {
        try {
            const token = Cookies.get("accessToken");

            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.get('/api/admin/bookings', {
                params,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response;
        } catch (error) {
            console.error('Error fetching bookings:', error);
            throw error;
        }
    }


    // Get booking details
    static async getBookingDetails(bookingId) {
        try {
            const token = Cookies.get("accessToken");

            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.get(`/api/admin/bookings/${bookingId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response;
        } catch (error) {
            console.error('Error fetching booking details:', error);
            throw error;
        }
    }
    

    // ========== FINANCIAL MANAGEMENT ==========
    
    // Get all withdrawal requests
    static async getAllWithdrawals(params = {}) {
        try {
            const token = Cookies.get("accessToken");
            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.get('/api/admin/withdrawals', {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            return response;
        } catch (error) {
            console.error('Error fetching withdrawals:', error);
            throw error;
        }
    }

    // Get withdrawal statistics
    static async getWithdrawalStats() {
        try {
            const token = Cookies.get("accessToken");
            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.get('/api/admin/withdrawals/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });

            return response;
        } catch (error) {
            console.error('Error fetching withdrawal stats:', error);
            throw error;
        }
    }

    // Get withdrawal details
    static async getWithdrawalDetails(withdrawalId) {
        try {
            const token = Cookies.get("accessToken");
            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.get(`/api/admin/withdrawals/${withdrawalId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            return response;
        } catch (error) {
            console.error('Error fetching withdrawal details:', error);
            throw error;
        }
    }

    // Update withdrawal status
    static async updateWithdrawalStatus(withdrawalId, statusData) {
        try {
            const token = Cookies.get("accessToken");
            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.patch(`/api/admin/withdrawals/${withdrawalId}/status`, statusData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            return response;
        } catch (error) {
            console.error('Error updating withdrawal status:', error);
            throw error;
        }
    }

    // Get transaction history
    static async getTransactionHistory(params = {}) {
        try {
            const token = Cookies.get("accessToken");
            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.get('/api/admin/transactions', {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            return response;
        } catch (error) {
            console.error('Error fetching transaction history:', error);
            throw error;
        }
    }

    // Get financial analytics
    static async getFinancialAnalytics(params = {}) {
        try {
            const token = Cookies.get("accessToken");
            if (!token) {
                window.open("/signin", "_blank");
                return null;
            }

            const response = await axios.get('/api/admin/analytics', {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            return response;
        } catch (error) {
            console.error('Error fetching financial analytics:', error);
            throw error;
        }
    }
}

export default AdminService;