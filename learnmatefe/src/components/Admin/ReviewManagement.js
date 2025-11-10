import React, { useState, useEffect } from 'react';
import { 
    Table, 
    Button, 
    Modal, 
    Input, 
    Tag, 
    Space, 
    message, 
    Card,
    Avatar,
    Popconfirm,
    Tooltip,
    Row,
    Col,
    Statistic,
    Select,
    Rate,
    Descriptions,
    Typography,
    Badge,
    Divider
} from 'antd';
import { 
    UserOutlined, 
    EyeOutlined,
    EyeInvisibleOutlined,
    DeleteOutlined,
    MessageOutlined,
    WarningOutlined,
    FlagOutlined,
    LinkOutlined,
    ReloadOutlined,
    CommentOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AdminService from '../../Service/ApiService/AdminService';
import { format } from 'date-fns';
import moment from 'moment';
import './ReviewManagement.scss';

const { TextArea } = Input;
const { Option } = Select;
const { Text, Paragraph } = Typography;

const ReviewManagement = () => {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [actionModalVisible, setActionModalVisible] = useState(false);
    const [actionType, setActionType] = useState('');
    const [actionReason, setActionReason] = useState('');
    
    // User detail modal
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetailModalVisible, setUserDetailModalVisible] = useState(false);
    
    // Pagination & filtering
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchFilter, setSearchFilter] = useState('');
    
    // Stats
    const [stats, setStats] = useState({
        totalReviews: 0,
        activeReviews: 0,
        hiddenReviews: 0,
        deletedReviews: 0,
        spamReviews: 0,
        offensiveReviews: 0
    });

    useEffect(() => {
        fetchReviews();
        fetchStats();
    }, [currentPage, pageSize, statusFilter, searchFilter]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await AdminService.getAllReviews(
                currentPage, 
                pageSize, 
                statusFilter, 
                searchFilter
            );
            
            if (response && response.data) {
                setReviews(response.data.reviews);
                setTotal(response.data.total);
            } else {
                console.error('No data in response');
                setReviews([]);
                message.error('Không có dữ liệu đánh giá');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Không thể tải danh sách đánh giá';
            message.error(errorMessage);
            console.error('Fetch reviews error:', error);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await AdminService.getReviewStats();
            if (response && response.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleToggleHide = async (review) => {
        try {
            await AdminService.toggleHideReview(review._id);
            message.success(review.isHidden ? 'Đã hiển thị đánh giá' : 'Đã ẩn đánh giá');
            fetchReviews();
            fetchStats();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra';
            message.error(errorMessage);
        }
    };

    const handleDeleteReview = async () => {
        if (!selectedReview || !actionReason.trim()) {
            message.error('Vui lòng nhập lý do xóa đánh giá');
            return;
        }

        try {
            await AdminService.deleteReview(selectedReview._id, actionReason);
            message.success('Đã xóa đánh giá thành công');
            setActionModalVisible(false);
            setActionReason('');
            fetchReviews();
            fetchStats();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa đánh giá';
            message.error(errorMessage);
        }
    };

    const handleMarkReview = async (review, type) => {
        try {
            // Đánh dấu spam/vi phạm (backend sẽ tự động ẩn nếu cần)
            const response = await AdminService.markReview(review._id, type);
            
            const isMarking = (type === 'spam' && !review.isSpam) || (type === 'offensive' && !review.isOffensive);
            const actionText = type === 'spam' ? 'spam' : 'vi phạm';
            
            if (isMarking) {
                message.success(`Đã đánh dấu ${actionText} và ẩn đánh giá`);
            } else {
                message.success(`Đã bỏ đánh dấu ${actionText}`);
            }
            
            fetchReviews();
            fetchStats();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra';
            message.error(errorMessage);
        }
    };

    const openActionModal = (review, type) => {
        setSelectedReview(review);
        setActionType(type);
        setActionReason('');
        setActionModalVisible(true);
    };

    const handleViewUserProfile = (user) => {
        if (!user) {
            message.error('Không thể lấy thông tin người dùng');
            return;
        }
        setSelectedUser(user);
        setUserDetailModalVisible(true);
    };

    // Helper functions for user status (copied from AdminDashboard)
    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'red';
            case 'tutor': return 'blue';
            case 'learner': return 'green';
            default: return 'default';
        }
    };

    const getStatusColor = (isBlocked) => {
        return isBlocked ? 'red' : 'green';
    };

    const getStatusText = (isBlocked) => {
        return isBlocked ? 'Bị khóa' : 'Hoạt động';
    };

    const getStatusTag = (review) => {
        const tags = [];
        
        if (review.isDeleted) {
            tags.push(<Tag color="red" key="deleted">Đã xóa</Tag>);
        } else if (review.isHidden) {
            tags.push(<Tag color="orange" key="hidden">Đã ẩn</Tag>);
        } else {
            tags.push(<Tag color="green" key="active">Hiển thị</Tag>);
        }
        
        if (review.isSpam) {
            tags.push(<Tag color="red" key="spam">Spam</Tag>);
        }
        
        if (review.isOffensive) {
            tags.push(<Tag color="purple" key="offensive">Vi phạm</Tag>);
        }
        
        return tags;
    };

    const columns = [
        {
            title: 'Người đánh giá',
            dataIndex: 'user',
            key: 'user',
            width: 200,
            render: (user) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar 
                        src={user?.image} 
                        icon={<UserOutlined />} 
                        size={32}
                    />
                    <div>
                        <div style={{ fontWeight: 500 }}>{user?.username || 'Không rõ'}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>{user?.email}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Gia sư',
            dataIndex: 'tutor',
            key: 'tutor',
            width: 150,
            render: (tutor) => (
                <div>
                    {tutor?.user?.username || 'Không rõ'}
                </div>
            ),
        },
        {
            title: 'Đánh giá',
            key: 'rating',
            width: 120,
            render: (_, record) => (
                <div>
                    <Rate disabled value={record.rating} style={{ fontSize: 14 }} />
                    <div style={{ fontSize: 12, color: '#666' }}>
                        {record.rating}/5 sao
                    </div>
                </div>
            ),
        },
        {
            title: 'Nội dung',
            dataIndex: 'comment',
            key: 'comment',
            width: 300,
            render: (comment) => (
                <Paragraph 
                    ellipsis={{ rows: 2, expandable: true, symbol: 'xem thêm' }}
                    style={{ margin: 0 }}
                >
                    {comment}
                </Paragraph>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 150,
            render: (_, record) => getStatusTag(record),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => format(new Date(date), 'dd/MM/yyyy'),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 200,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small" wrap>
                    {!record.isDeleted && (
                        <Tooltip title={record.isHidden ? "Hiển thị" : "Ẩn"}>
                            <Button 
                                type="default" 
                                size="small"
                                icon={record.isHidden ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                onClick={() => handleToggleHide(record)}
                            />
                        </Tooltip>
                    )}
                    
                    {!record.isDeleted && (
                        <>
                            <Tooltip title={record.isSpam ? "Bỏ đánh dấu Spam" : "Đánh dấu Spam và ẩn"}>
                                <Button 
                                    type={record.isSpam ? "primary" : "default"}
                                    size="small"
                                    icon={<WarningOutlined />}
                                    onClick={() => handleMarkReview(record, 'spam')}
                                    danger={record.isSpam}
                                />
                            </Tooltip>
                            
                            <Tooltip title={record.isOffensive ? "Bỏ đánh dấu Vi phạm" : "Đánh dấu Vi phạm và ẩn"}>
                                <Button 
                                    type={record.isOffensive ? "primary" : "default"}
                                    size="small"
                                    icon={<FlagOutlined />}
                                    onClick={() => handleMarkReview(record, 'offensive')}
                                    danger={record.isOffensive}
                                />
                            </Tooltip>
                        </>
                    )}
                    
                    <Tooltip title="Xem chi tiết người dùng">
                        <Button 
                            type="default" 
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => record.user && handleViewUserProfile(record.user)}
                            disabled={!record.user}
                        />
                    </Tooltip>
                    
                    {!record.isDeleted && (
                        <Popconfirm
                            title="Bạn có chắc muốn xóa đánh giá này?"
                            description="Hành động này không thể hoàn tác!"
                            onConfirm={() => openActionModal(record, 'delete')}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Tooltip title="Xóa đánh giá">
                                <Button 
                                    type="primary" 
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                />
                            </Tooltip>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="review-management">
            <div className="dashboard-header">
                <Button 
                    type="link" 
                    icon={<ArrowLeftOutlined />} 
                    onClick={() => navigate('/admin/dashboard')}
                    style={{ marginBottom: 16 }}
                >
                    Quay lại Dashboard
                </Button>
                <h1>Quản lý đánh giá</h1>
                <p>Quản lý và kiểm duyệt các đánh giá của người dùng</p>
            </div>

            {/* Statistics */}
            <Row gutter={[16, 16]} className="stats-row">
                <Col xs={24} sm={12} lg={4}>
                    <Card>
                        <Statistic
                            title="Tổng đánh giá"
                            value={stats.totalReviews}
                            prefix={<CommentOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={4}>
                    <Card>
                        <Statistic
                            title="Đang hiển thị"
                            value={stats.activeReviews}
                            prefix={<EyeOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={4}>
                    <Card>
                        <Statistic
                            title="Đã ẩn"
                            value={stats.hiddenReviews}
                            prefix={<EyeInvisibleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={4}>
                    <Card>
                        <Statistic
                            title="Đã xóa"
                            value={stats.deletedReviews}
                            prefix={<DeleteOutlined />}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={4}>
                    <Card>
                        <Statistic
                            title="Spam"
                            value={stats.spamReviews}
                            prefix={<WarningOutlined />}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={4}>
                    <Card>
                        <Statistic
                            title="Vi phạm"
                            value={stats.offensiveReviews}
                            prefix={<FlagOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card className="filter-card">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={8} md={6}>
                        <Select
                            placeholder="Lọc theo trạng thái"
                            style={{ width: '100%' }}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            allowClear
                        >
                            <Option value="">Tất cả</Option>
                            <Option value="active">Đang hiển thị</Option>
                            <Option value="hidden">Đã ẩn</Option>
                            <Option value="deleted">Đã xóa</Option>
                            <Option value="spam">Spam</Option>
                            <Option value="offensive">Vi phạm</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={8} md={6}>
                        <Input.Search
                            placeholder="Tìm kiếm đánh giá..."
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                            onSearch={fetchReviews}
                            allowClear
                        />
                    </Col>
                </Row>
            </Card>

            {/* Reviews Table */}
            <Card className="table-card">
                <div className="table-header">
                    <h2>Danh sách đánh giá</h2>
                    <Button 
                        type="primary" 
                        icon={<ReloadOutlined />}
                        onClick={() => {
                            setStatusFilter('');
                            setSearchFilter('');
                            setCurrentPage(1);
                            fetchReviews();
                            fetchStats();
                        }}
                        loading={loading}
                    >
                        Làm mới
                    </Button>
                </div>
                
                <Table 
                    columns={columns}
                    dataSource={reviews}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                            `${range[0]}-${range[1]} của ${total} đánh giá`,
                        onChange: (page, size) => {
                            setCurrentPage(page);
                            setPageSize(size);
                        },
                    }}
                    scroll={{ x: 1400 }}
                />
            </Card>

            {/* Delete Modal */}
            <Modal
                title="Xóa đánh giá"
                open={actionModalVisible}
                onOk={handleDeleteReview}
                onCancel={() => setActionModalVisible(false)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
            >
                <p>
                    Bạn có chắc muốn xóa đánh giá của <strong>{selectedReview?.user?.username}</strong>?
                </p>
                
                {selectedReview && (
                    <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                        <Rate disabled value={selectedReview.rating} style={{ fontSize: 14 }} />
                        <p style={{ margin: '8px 0 0', fontSize: 14 }}>
                            "{selectedReview.comment}"
                        </p>
                    </div>
                )}
                
                <div>
                    <label style={{ fontWeight: 500 }}>Lý do xóa đánh giá:</label>
                    <TextArea
                        value={actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        placeholder="Nhập lý do xóa đánh giá..."
                        rows={3}
                        style={{ marginTop: 8 }}
                    />
                </div>
            </Modal>

            {/* User Detail Modal */}
            <Modal
                title="Chi tiết người dùng"
                open={userDetailModalVisible}
                onCancel={() => setUserDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setUserDetailModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={600}
            >
                {selectedUser && (
                    <div className="user-detail">
                        <div className="user-avatar-section">
                            <Avatar 
                                src={selectedUser.image} 
                                icon={<UserOutlined />} 
                                size={80}
                            />
                            <div className="user-basic-info">
                                <h3>{selectedUser.username || 'Không rõ tên'}</h3>
                                <Tag color={getRoleColor(selectedUser.role)}>
                                    {selectedUser.role ? selectedUser.role.toUpperCase() : 'N/A'}
                                </Tag>
                                <Tag color={getStatusColor(selectedUser.isBlocked)}>
                                    {getStatusText(selectedUser.isBlocked)}
                                </Tag>
                            </div>
                        </div>
                        
                        <div className="user-details-grid">
                            <div className="detail-item">
                                <strong>Email:</strong> {selectedUser.email}
                            </div>
                            <div className="detail-item">
                                <strong>Số điện thoại:</strong> {selectedUser.phoneNumber || 'Không có'}
                            </div>
                            <div className="detail-item">
                                <strong>Giới tính:</strong> {selectedUser.gender || 'Không có'}
                            </div>
                            <div className="detail-item">
                                <strong>Loại tài khoản:</strong> {selectedUser.type || 'Local'}
                            </div>
                            <div className="detail-item">
                                <strong>Xác thực:</strong> {selectedUser.verified ? 'Đã xác thực' : 'Chưa xác thực'}
                            </div>
                            <div className="detail-item">
                                <strong>Số dư:</strong> {selectedUser.balance?.toLocaleString() || 0} VNĐ
                            </div>
                            <div className="detail-item">
                                <strong>Ngày tạo:</strong> {selectedUser.createdAt ? moment(selectedUser.createdAt).format('DD/MM/YYYY HH:mm:ss') : 'Không có'}
                            </div>
                            <div className="detail-item">
                                <strong>Cập nhật cuối:</strong> {selectedUser.updatedAt ? moment(selectedUser.updatedAt).format('DD/MM/YYYY HH:mm:ss') : 'Không có'}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ReviewManagement;