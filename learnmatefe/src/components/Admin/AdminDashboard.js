import React, { useState, useEffect, useCallback } from 'react';
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
    Typography,
    Badge
} from 'antd';
import {
    UserOutlined,
    LockOutlined,
    UnlockOutlined,
    DeleteOutlined,
    EyeOutlined,
    TeamOutlined,
    ExclamationCircleOutlined,
    FileTextOutlined,
    DashboardOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    StopOutlined
} from '@ant-design/icons';
import AdminService from '../../Service/ApiService/AdminService';
import moment from 'moment';
import './AdminDashboard.scss';

const { TextArea } = Input;
const { Title, Text } = Typography;
const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [actionType, setActionType] = useState('');
    const [reason, setReason] = useState('');
    const [userDetailModalVisible, setUserDetailModalVisible] = useState(false);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        blockedUsers: 0,
        admins: 0,
        tutors: 0,
        students: 0
    });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await AdminService.getAllUsers();

            if (response && Array.isArray(response)) {
                const userList = response;
                setUsers(userList);
                calculateStats(userList);
            } else {
                console.error('No data in response');
                setUsers([]);
                message.error('Không có dữ liệu người dùng');
            }
        } catch (error) {
            message.error('Không thể tải danh sách người dùng');
            console.error('Fetch error:', error);
            setUsers([]); // Set empty array nếu có lỗi
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const calculateStats = (userList = []) => { // Default parameter
        if (!Array.isArray(userList)) {
            userList = []; // Fallback nếu không phải array
        }

        const stats = {
            totalUsers: userList.length,
            activeUsers: userList.filter(user => !user.isBlocked).length,
            blockedUsers: userList.filter(user => user.isBlocked).length,
            admins: userList.filter(user => user.role === 'admin').length,
            tutors: userList.filter(user => user.role === 'tutor').length,
            students: userList.filter(user => user.role === 'student').length
        };
        setStats(stats);
    };

    const handleAction = (user, type) => {
        setSelectedUser(user);
        setActionType(type);
        setReason('');
        setModalVisible(true);
    };

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setUserDetailModalVisible(true);
    };

    const executeAction = async () => {
        if (!selectedUser) return;

        try {
            setLoading(true);
            switch (actionType) {
                case 'block':
                    if (!reason.trim()) {
                        message.error('Vui lòng nhập lý do khóa tài khoản');
                        return;
                    }
                    await AdminService.blockUser(selectedUser._id, reason);
                    message.success('Đã khóa tài khoản thành công');
                    break;

                case 'unblock':
                    await AdminService.unblockUser(selectedUser._id);
                    message.success('Đã mở khóa tài khoản thành công');
                    break;

                case 'delete':
                    if (!reason.trim()) {
                        message.error('Vui lòng nhập lý do xóa tài khoản');
                        return;
                    }
                    await AdminService.deleteUser(selectedUser._id, reason);
                    message.success('Đã xóa tài khoản thành công');
                    break;

                default:
                    break;
            }


            fetchUsers(); // Refresh the list
            setModalVisible(false);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra';
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'red';
            case 'tutor': return 'blue';
            case 'student': return 'green';
            default: return 'default';
        }
    };

    const getStatusColor = (isBlocked) => {
        return isBlocked ? 'red' : 'green';
    };

    const getStatusText = (isBlocked) => {
        return isBlocked ? 'Đã khóa' : 'Hoạt động';
    };

    const columns = [
        {
            title: 'Avatar',
            dataIndex: 'image',
            key: 'avatar',
            width: 80,
            render: (image, record) => (
                <Avatar
                    src={image}
                    icon={<UserOutlined />}
                    size={40}
                />
            ),
        },
        {
            title: 'Tên người dùng',
            dataIndex: 'username',
            key: 'username',
            sorter: (a, b) => a.username.localeCompare(b.username),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => (
                <Tag color={getRoleColor(role)}>
                    {role.toUpperCase()}
                </Tag>
            ),
            filters: [
                { text: 'Admin', value: 'admin' },
                { text: 'Tutor', value: 'tutor' },
                { text: 'Student', value: 'student' },
            ],
            onFilter: (value, record) => record.role === value,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isBlocked',
            key: 'status',
            render: (isBlocked) => (
                <Tag color={getStatusColor(isBlocked)}>
                    {getStatusText(isBlocked)}
                </Tag>
            ),
            filters: [
                { text: 'Hoạt động', value: false },
                { text: 'Đã khóa', value: true },
            ],
            onFilter: (value, record) => record.isBlocked === value,
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="default"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetails(record)}
                        />
                    </Tooltip>

                    {record.role !== 'admin' && (
                        <>
                            {record.isBlocked ? (
                                <Tooltip title="Mở khóa">
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<UnlockOutlined />}
                                        onClick={() => handleAction(record, 'unblock')}
                                    />
                                </Tooltip>
                            ) : (
                                <Tooltip title="Khóa tài khoản">
                                    <Button
                                        type="default"
                                        danger
                                        size="small"
                                        icon={<LockOutlined />}
                                        onClick={() => handleAction(record, 'block')}
                                    />
                                </Tooltip>
                            )}

                            <Popconfirm
                                title="Bạn có chắc muốn xóa tài khoản này?"
                                description="Hành động này không thể hoàn tác!"
                                onConfirm={() => handleAction(record, 'delete')}
                                okText="Có"
                                cancelText="Không"
                                icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                            >
                                <Tooltip title="Xóa tài khoản">
                                    <Button
                                        type="primary"
                                        danger
                                        size="small"
                                        icon={<DeleteOutlined />}
                                    />
                                </Tooltip>
                            </Popconfirm>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    const getModalTitle = () => {
        switch (actionType) {
            case 'block': return 'Khóa tài khoản';
            case 'unblock': return 'Mở khóa tài khoản';
            case 'delete': return 'Xóa tài khoản';
            default: return '';
        }
    };

    return (
        <div className="admin-dashboard">
            {/* Modern Dashboard Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="welcome-section">
                        <Title level={1} className="welcome-title">
                            <DashboardOutlined />
                            Quản lý người dùng
                        </Title>
                        <Text className="welcome-subtitle">
                            Quản lý thông tin và trạng thái của tất cả người dùng trong hệ thống
                        </Text>
                    </div>
                    <div className="header-stats">
                        <Badge count={stats.totalUsers} showZero>
                            <Avatar size={50} icon={<TeamOutlined />} />
                        </Badge>
                        <div className="current-date">
                            <CalendarOutlined />
                            {moment().format('DD/MM/YYYY')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Metrics Section */}
            <div className="metrics-section">
                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="metric-card primary">
                            <div className="metric-content">
                                <div className="metric-icon primary">
                                    <TeamOutlined />
                                </div>
                                <div className="metric-details">
                                    <Statistic
                                        value={stats.totalUsers}
                                        valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#1890ff' }}
                                    />
                                    <Text className="metric-title">Tổng người dùng</Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="metric-card success">
                            <div className="metric-content">
                                <div className="metric-icon success">
                                    <CheckCircleOutlined />
                                </div>
                                <div className="metric-details">
                                    <Statistic
                                        value={stats.activeUsers}
                                        valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#52c41a' }}
                                    />
                                    <Text className="metric-title">Đang hoạt động</Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="metric-card danger">
                            <div className="metric-content">
                                <div className="metric-icon danger">
                                    <StopOutlined />
                                </div>
                                <div className="metric-details">
                                    <Statistic
                                        value={stats.blockedUsers}
                                        valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#faad14' }}
                                    />
                                    <Text className="metric-title">Đã bị khóa</Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="metric-card warning">
                            <div className="metric-content">
                                <div className="metric-icon warning">
                                    <UserOutlined />
                                </div>
                                <div className="metric-details">
                                    <Statistic
                                        value={stats.students + stats.tutors}
                                        valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#722ed1' }}
                                    />
                                    <Text className="metric-title">Học viên & Gia sư</Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Users Table */}
            <div className="main-content">
                <Card className="content-card">
                    <div className="table-header">
                        <Title level={3} style={{ margin: 0, color: '#262626' }}>
                            <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                            Danh sách người dùng
                        </Title>
                        <Button 
                            type="primary" 
                            onClick={fetchUsers} 
                            loading={loading}
                            style={{ borderRadius: '8px' }}
                        >
                            Làm mới
                        </Button>
                    </div>
                
                <Table 
                    columns={columns}
                    dataSource={users || []} // Đảm bảo dataSource không undefined
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        total: (users || []).length, // Safe access
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                            `${range[0]}-${range[1]} của ${total} người dùng`,
                    }}
                    scroll={{ x: 1200 }}
                />
                </Card>
            </div>

            {/* Action Modal */}
            <Modal
                title={getModalTitle()}
                open={modalVisible}
                onOk={executeAction}
                onCancel={() => setModalVisible(false)}
                confirmLoading={loading}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <p>
                    Bạn có chắc muốn {actionType === 'block' ? 'khóa' : actionType === 'unblock' ? 'mở khóa' : 'xóa'} tài khoản của <strong>{selectedUser?.username}</strong>?
                </p>
                
                {(actionType === 'block' || actionType === 'delete') && (
                    <div style={{ marginTop: 16 }}>
                        <label>Lý do {actionType === 'block' ? 'khóa' : 'xóa'} tài khoản:</label>
                        <TextArea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={`Nhập lý do ${actionType === 'block' ? 'khóa' : 'xóa'} tài khoản...`}
                            rows={4}
                            style={{ marginTop: 8 }}
                        />
                    </div>
                )}
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
                                <h3>{selectedUser.username}</h3>
                                <Tag color={getRoleColor(selectedUser.role)}>
                                    {selectedUser.role.toUpperCase()}
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
                                <strong>Ngày tạo:</strong> {moment(selectedUser.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                            </div>
                            <div className="detail-item">
                                <strong>Cập nhật cuối:</strong> {moment(selectedUser.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminDashboard;