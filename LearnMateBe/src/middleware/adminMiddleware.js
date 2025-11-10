const checkAdminRole = (req, res, next) => {
    try {
        // Kiểm tra user có tồn tại không (đã được verify bởi checkAccessToken)
        if (!req.user) {
            return res.status(401).json({
                errorCode: 1,
                message: 'Unauthorized: No user information found'
            });
        }

        // Kiểm tra role có phải admin không
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                errorCode: 2,
                message: 'Forbidden: Admin access required'
            });
        }

        // Nếu là admin, cho phép tiếp tục
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(500).json({
            errorCode: 3,
            message: 'Internal server error in admin middleware'
        });
    }
};

module.exports = {
    checkAdminRole
};