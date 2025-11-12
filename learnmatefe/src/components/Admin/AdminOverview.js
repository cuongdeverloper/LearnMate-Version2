import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Card, 
    Row, 
    Col, 
    Statistic, 
    Progress,
    Tag,
    Avatar,
    List,
    Empty,
    Badge,
    Tooltip,
    Space,
    Typography,
    message
} from 'antd';
import { 
    UserOutlined,
    TeamOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    RiseOutlined,
    BookOutlined,
    DollarOutlined,
    TrophyOutlined,
    CalendarOutlined,
    StarOutlined,
    EyeOutlined,
    ArrowUpOutlined,
} from '@ant-design/icons';
import { 
    PieChart, 
    Pie, 
    Cell, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartsTooltip, 
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import AdminService from '../../Service/ApiService/AdminService';
import moment from 'moment';
import './AdminOverview.scss';

const { Title, Text } = Typography;

const AdminOverview = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [systemStats, setSystemStats] = useState({
        users: {
            total: 0,
            students: 0,
            tutors: 0,
            admins: 0,
            active: 0,
            blocked: 0
        },
        tutorApplications: {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0
        },
        recentUsers: [],
        recentApplications: []
    });

    
    // Sample data for demonstration - in real app, fetch from API
    const growthData = [
        { month: 'T1', users: 120, tutors: 15, bookings: 85 },
        { month: 'T2', users: 180, tutors: 22, bookings: 142 },
        { month: 'T3', users: 240, tutors: 28, bookings: 198 },
        { month: 'T4', users: 320, tutors: 35, bookings: 265 },
        { month: 'T5', users: 400, tutors: 42, bookings: 330 },
        { month: 'T6', users: 480, tutors: 48, bookings: 385 }
    ];

    const platformStats = [
        { name: 'Desktop', value: 65, color: '#1890ff' },
        { name: 'Mobile', value: 30, color: '#52c41a' },
        { name: 'Tablet', value: 5, color: '#faad14' }
    ];

    const subjectStats = [
        { subject: 'Toán', bookings: 45, revenue: 12000000 },
        { subject: 'Tiếng Anh', bookings: 38, revenue: 9500000 },
        { subject: 'Vật Lý', bookings: 25, revenue: 6800000 },
        { subject: 'Hóa Học', bookings: 22, revenue: 5900000 },
        { subject: 'Sinh Học', bookings: 18, revenue: 4500000 }
    ];

    useEffect(() => {
        fetchSystemData();
    }, []);

    const fetchSystemData = async () => {
        setLoading(true);
        try {
            // Fetch users data
            const usersResponse = await AdminService.getAllUsers();
            // Handle both array and { data: [...] } formats
            const users = Array.isArray(usersResponse) ? usersResponse : (usersResponse?.data || []);

            // Fetch tutor applications data
            const applicationsResponse = await AdminService.getAllTutorApplications();
            //console.log('AdminOverview - Applications response:', applicationsResponse);
            // Handle both array and { data: [...] } formats
            const applications = Array.isArray(applicationsResponse) ? applicationsResponse : (applicationsResponse?.data || []);

            // Calculate statistics
            const userStats = {
                total: users.length,
                students: users.filter(u => u.role === 'student').length,
                tutors: users.filter(u => u.role === 'tutor').length,
                admins: users.filter(u => u.role === 'admin').length,
                active: users.filter(u => !u.isBlocked).length,
                blocked: users.filter(u => u.isBlocked).length
            };

            const applicationStats = {
                total: applications.length,
                pending: applications.filter(a => a.status === 'pending').length,
                approved: applications.filter(a => a.status === 'approved').length,
                rejected: applications.filter(a => a.status === 'rejected').length
            };

            // Get recent data
            const recentUsers = users
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);

            const recentApplications = applications
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);

            setSystemStats({
                users: userStats,
                tutorApplications: applicationStats,
                recentUsers,
                recentApplications
            });

        } catch (error) {
            console.error('Error fetching system data:', error);
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'orange';
            case 'approve': return 'green';
            case 'rejected': return 'red';
            default: return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Chờ duyệt';
            case 'approve': return 'Đã duyệt';
            case 'rejected': return 'Đã từ chối';
            default: return status;
        }
    };

    // Navigation handlers for Quick Actions
    const handleNavigateToUsers = () => {
        message.info('Đang chuyển đến trang Quản lý Người dùng...');
        setTimeout(() => {
            navigate('/admin/user-management');
        }, 800);
    };

    const handleNavigateToTutorApplications = () => {
        message.info('Đang chuyển đến trang Duyệt Đơn Gia sư...');
        setTimeout(() => {
            navigate('/admin/tutor-management');
        }, 800);
    };

    const handleNavigateToFinancialReports = () => {
        message.info('Đang chuyển đến trang Báo cáo Tài chính...');
        setTimeout(() => {
            navigate('/admin/transaction-history');
        }, 800);
    };

    // Navigation handlers for other sections
    const handleNavigateToAllUsers = () => {
        message.info('Đang chuyển đến trang Quản lý tất cả Người dùng...');
        setTimeout(() => {
            navigate('/admin/users');
        }, 800);
    };

    const handleNavigateToAllApplications = () => {
        message.info('Đang chuyển đến trang Quản lý tất cả Đơn đăng ký...');
        setTimeout(() => {
            navigate('/admin/tutor-applications');
        }, 800);
    };

    return (
        <div className="admin-overview">
            {/* Modern Header with Welcome Message */}
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="welcome-section">
                        <Title level={2} className="welcome-title">
                            <TrophyOutlined /> Chào mừng đến với Dashboard
                        </Title>
                        <Text className="welcome-subtitle">
                            Tổng quan và thống kê toàn diện về hệ thống LearnMate
                        </Text>
                    </div>
                    <div className="header-stats">
                        <Badge count={systemStats.tutorApplications.pending} showZero>
                            <Avatar size="large" icon={<ClockCircleOutlined />} />
                        </Badge>
                        <Text className="current-date">
                            <CalendarOutlined /> {moment().format('dddd, DD/MM/YYYY')}
                        </Text>
                    </div>
                </div>
            </div>

            {/* Enhanced Key Metrics */}
            <div className="metrics-section">
                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12} md={6}>
                        <Card 
                            className="metric-card primary" 
                            onClick={handleNavigateToUsers}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="metric-content">
                                <div className="metric-icon primary">
                                    <TeamOutlined />
                                </div>
                                <div className="metric-details">
                                    <Statistic
                                        value={systemStats.users.total}
                                        valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 'bold' }}
                                    />
                                    <Text className="metric-label">Tổng Người Dùng</Text>
                                    <div className="metric-trend">
                                        <ArrowUpOutlined className="trend-icon up" />
                                        <Text className="trend-text">+12% so với tháng trước</Text>
                                    </div>
                                </div>
                            </div>
                            <Progress 
                                percent={100} 
                                strokeColor="#1890ff" 
                                showInfo={false} 
                                size="small"
                                className="metric-progress"
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <Card 
                            className="metric-card success"
                            onClick={handleNavigateToUsers}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="metric-content">
                                <div className="metric-icon success">
                                    <UserOutlined />
                                </div>
                                <div className="metric-details">
                                    <Statistic
                                        value={systemStats.users.students}
                                        valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 'bold' }}
                                    />
                                    <Text className="metric-label">Học Viên</Text>
                                    <div className="metric-trend">
                                        <ArrowUpOutlined className="trend-icon up" />
                                        <Text className="trend-text">+8% so với tháng trước</Text>
                                    </div>
                                </div>
                            </div>
                            <Progress 
                                percent={systemStats.users.total ? 
                                    (systemStats.users.students / systemStats.users.total * 100) : 0
                                } 
                                strokeColor="#52c41a" 
                                showInfo={false} 
                                size="small"
                                className="metric-progress"
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <Card 
                            className="metric-card warning"
                            onClick={handleNavigateToTutorApplications}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="metric-content">
                                <div className="metric-icon warning">
                                    <BookOutlined />
                                </div>
                                <div className="metric-details">
                                    <Statistic
                                        value={systemStats.users.tutors}
                                        valueStyle={{ color: '#722ed1', fontSize: '28px', fontWeight: 'bold' }}
                                    />
                                    <Text className="metric-label">Gia Sư</Text>
                                    <div className="metric-trend">
                                        <ArrowUpOutlined className="trend-icon up" />
                                        <Text className="trend-text">+15% so với tháng trước</Text>
                                    </div>
                                </div>
                            </div>
                            <Progress 
                                percent={systemStats.users.total ? 
                                    (systemStats.users.tutors / systemStats.users.total * 100) : 0
                                } 
                                strokeColor="#722ed1" 
                                showInfo={false} 
                                size="small"
                                className="metric-progress"
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <Card 
                            className="metric-card danger"
                            style={{ cursor: 'default' }}
                        >
                            <div className="metric-content">
                                <div className="metric-icon danger">
                                    <StarOutlined />
                                </div>
                                <div className="metric-details">
                                    <Statistic
                                        value={350}
                                        valueStyle={{ color: '#faad14', fontSize: '28px', fontWeight: 'bold' }}
                                    />
                                    <Text className="metric-label">Lớp Học Hoạt Động</Text>
                                    <div className="metric-trend">
                                        <ArrowUpOutlined className="trend-icon up" />
                                        <Text className="trend-text">+5% so với tháng trước</Text>
                                    </div>
                                </div>
                            </div>
                            <Progress 
                                percent={75} 
                                strokeColor="#faad14" 
                                showInfo={false} 
                                size="small"
                                className="metric-progress"
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Charts Section */}
            <Row gutter={[24, 24]} className="charts-section">
                {/* Growth Chart */}
                <Col xs={24} lg={16}>
                    <Card 
                        title={
                            <Space>
                                <RiseOutlined style={{ color: '#1890ff' }} />
                                <span>Biểu Đồ Tăng Trưởng Theo Tháng</span>
                            </Space>
                        }
                        className="chart-card"
                        extra={
                            <Tooltip title="Dữ liệu 6 tháng gần nhất">
                                <EyeOutlined />
                            </Tooltip>
                        }
                    >
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={growthData}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#1890ff" stopOpacity={0.1}/>
                                    </linearGradient>
                                    <linearGradient id="colorTutors" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#52c41a" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <RechartsTooltip />
                                <Area type="monotone" dataKey="users" stroke="#1890ff" fillOpacity={1} fill="url(#colorUsers)" name="Người dùng" />
                                <Area type="monotone" dataKey="tutors" stroke="#52c41a" fillOpacity={1} fill="url(#colorTutors)" name="Gia sư" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* Platform Usage Pie Chart */}
                <Col xs={24} lg={8}>
                    <Card 
                        title={
                            <Space>
                                <DollarOutlined style={{ color: '#52c41a' }} />
                                <span>Thống Kê Thiết Bị Truy Cập</span>
                            </Space>
                        }
                        className="chart-card"
                    >
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={platformStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {platformStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    formatter={(value) => [`${value}%`, 'Tỷ lệ']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="platform-legend">
                            {platformStats.map((item, index) => (
                                <div key={index} className="legend-item">
                                    <span 
                                        className="legend-color" 
                                        style={{ backgroundColor: item.color }}
                                    ></span>
                                    <Text>{item.name}: {item.value}%</Text>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Subject Statistics Bar Chart */}
            <Row gutter={[24, 24]} className="subject-stats-section">
                <Col span={24}>
                    <Card 
                        title={
                            <Space>
                                <BookOutlined style={{ color: '#722ed1' }} />
                                <span>Thống Kê Môn Học Phổ Biến</span>
                            </Space>
                        }
                        className="chart-card"
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={subjectStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="subject" />
                                <YAxis yAxisId="left" orientation="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <RechartsTooltip 
                                    formatter={(value, name) => [
                                        name === 'bookings' ? `${value} lớp` : `${value.toLocaleString()} VNĐ`,
                                        name === 'bookings' ? 'Số lớp' : 'Doanh thu'
                                    ]}
                                />
                                <Bar yAxisId="left" dataKey="bookings" fill="#1890ff" name="bookings" />
                                <Bar yAxisId="right" dataKey="revenue" fill="#52c41a" name="revenue" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Application Status Overview */}
            <div className="application-section">
                <Title level={3} className="section-title">
                    <FileTextOutlined /> Tình Trạng Đơn Đăng Ký Gia Sư
                </Title>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="status-card pending">
                            <div className="status-content">
                                <ClockCircleOutlined className="status-icon" />
                                <div className="status-info">
                                    <Text className="status-value">{systemStats.tutorApplications.pending}</Text>
                                    <Text className="status-label">Chờ Duyệt</Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="status-card approved">
                            <div className="status-content">
                                <CheckCircleOutlined className="status-icon" />
                                <div className="status-info">
                                    <Text className="status-value">{systemStats.tutorApplications.approved}</Text>
                                    <Text className="status-label">Đã Duyệt</Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="status-card rejected">
                            <div className="status-content">
                                <CloseCircleOutlined className="status-icon" />
                                <div className="status-info">
                                    <Text className="status-value">{systemStats.tutorApplications.rejected}</Text>
                                    <Text className="status-label">Đã Từ Chối</Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="status-card total">
                            <div className="status-content">
                                <FileTextOutlined className="status-icon" />
                                <div className="status-info">
                                    <Text className="status-value">{systemStats.tutorApplications.total}</Text>
                                    <Text className="status-label">Tổng Đơn</Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Enhanced Recent Activities */}
            <Row gutter={[24, 24]} className="activity-section">
                <Col xs={24} lg={12}>
                    <Card 
                        title={
                            <Space>
                                <UserOutlined style={{ color: '#1890ff' }} />
                                <span>Người Dùng Mới Nhất</span>
                                <Badge count={systemStats.recentUsers.length} style={{ backgroundColor: '#52c41a' }} />
                            </Space>
                        }
                        className="activity-card"
                        loading={loading}
                        extra={
                            <Tooltip title="Xem tất cả">
                                <EyeOutlined 
                                    onClick={handleNavigateToAllUsers}
                                    style={{ cursor: 'pointer' }}
                                />
                            </Tooltip>
                        }
                    >
                        {systemStats.recentUsers.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={systemStats.recentUsers}
                                renderItem={user => (
                                    <List.Item className="activity-item">
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar 
                                                    src={user.image} 
                                                    icon={<UserOutlined />}
                                                    size="large"
                                                    className="activity-avatar"
                                                />
                                            }
                                            title={
                                                <Space wrap>
                                                    <Text strong className="activity-name">
                                                        {user.username}
                                                    </Text>
                                                    <Tag color={getRoleColor(user.role)} className="role-tag">
                                                        {user.role.toUpperCase()}
                                                    </Tag>
                                                    {user.isBlocked && (
                                                        <Tag color="red" className="status-tag">
                                                            BLOCKED
                                                        </Tag>
                                                    )}
                                                </Space>
                                            }
                                            description={
                                                <div className="activity-description">
                                                    <Text className="activity-email">{user.email}</Text>
                                                    <Text className="activity-time">
                                                        <CalendarOutlined /> {moment(user.createdAt).fromNow()}
                                                    </Text>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty 
                                description="Không có người dùng mới" 
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card 
                        title={
                            <Space>
                                <FileTextOutlined style={{ color: '#722ed1' }} />
                                <span>Đơn Đăng Ký Mới Nhất</span>
                                <Badge count={systemStats.recentApplications.length} style={{ backgroundColor: '#faad14' }} />
                            </Space>
                        }
                        className="activity-card"
                        loading={loading}
                        extra={
                            <Tooltip title="Xem tất cả">
                                <EyeOutlined 
                                    onClick={handleNavigateToAllApplications}
                                    style={{ cursor: 'pointer' }}
                                />
                            </Tooltip>
                        }
                    >
                        {systemStats.recentApplications.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={systemStats.recentApplications}
                                renderItem={application => (
                                    <List.Item className="activity-item">
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar 
                                                    src={application.tutorId?.image} 
                                                    icon={<BookOutlined />}
                                                    size="large"
                                                    className="activity-avatar"
                                                />
                                            }
                                            title={
                                                <Space wrap>
                                                    <Text strong className="activity-name">
                                                        {application.tutorId?.username}
                                                    </Text>
                                                    <Tag 
                                                        color={getStatusColor(application.status)} 
                                                        className="status-tag"
                                                    >
                                                        {getStatusText(application.status)}
                                                    </Tag>
                                                </Space>
                                            }
                                            description={
                                                <div className="activity-description">
                                                    <Text className="activity-email">
                                                        {application.tutorId?.email}
                                                    </Text>
                                                    <Text className="activity-time">
                                                        <CalendarOutlined /> {moment(application.createdAt).fromNow()}
                                                    </Text>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty 
                                description="Không có đơn đăng ký mới" 
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Quick Actions */}
            <div className="quick-actions-section">
                <Title level={3} className="section-title">
                    <RiseOutlined /> Thao Tác Nhanh
                </Title>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                        <Card 
                            className="action-card" 
                            hoverable
                            onClick={handleNavigateToUsers}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="action-content">
                                <UserOutlined className="action-icon" />
                                <Text className="action-title">Quản Lý Người Dùng</Text>
                                <Text className="action-desc">Xem và quản lý tất cả người dùng</Text>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card 
                            className="action-card" 
                            hoverable
                            onClick={handleNavigateToTutorApplications}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="action-content">
                                <FileTextOutlined className="action-icon" />
                                <Text className="action-title">Duyệt Đơn Gia Sư</Text>
                                <Text className="action-desc">Xử lý đơn đăng ký gia sư</Text>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card 
                            className="action-card" 
                            hoverable
                            onClick={handleNavigateToFinancialReports}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="action-content">
                                <DollarOutlined className="action-icon" />
                                <Text className="action-title">Báo Cáo Tài Chính</Text>
                                <Text className="action-desc">Xem báo cáo doanh thu</Text>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default AdminOverview;