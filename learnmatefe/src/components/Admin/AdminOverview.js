import React, { useState, useEffect } from 'react';
import { 
    Card, 
    Row, 
    Col, 
    Statistic, 
    Progress,
    Table,
    Tag,
    Avatar,
    List,
    Timeline,
    Empty
} from 'antd';
import { 
    UserOutlined,
    TeamOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    RiseOutlined,
    FallOutlined,
    BookOutlined,
    DollarOutlined
} from '@ant-design/icons';
import AdminService from '../../Service/ApiService/AdminService';
import moment from 'moment';
import './AdminOverview.scss';

const AdminOverview = () => {
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
            console.log('AdminOverview - Applications response:', applicationsResponse);
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

    return (
        <div className="admin-overview">
            <div className="page-header">
                <h1>Tổng quan hệ thống</h1>
                <p>Thống kê và giám sát tổng quan về hệ thống LearnMate</p>
            </div>

            {/* User Statistics */}
            <div className="stats-section">
                <h2>Thống kê người dùng</h2>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="stat-card">
                            <Statistic
                                title="Tổng người dùng"
                                value={systemStats.users.total}
                                prefix={<TeamOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                                suffix={
                                    <div className="progress-wrapper">
                                        <Progress 
                                            percent={100} 
                                            size="small" 
                                            showInfo={false} 
                                            strokeColor="#1890ff"
                                        />
                                    </div>
                                }
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="stat-card">
                            <Statistic
                                title="Học viên"
                                value={systemStats.users.students}
                                prefix={<UserOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                                suffix={
                                    <div className="progress-wrapper">
                                        <Progress 
                                            percent={systemStats.users.total ? 
                                                (systemStats.users.students / systemStats.users.total * 100) : 0
                                            } 
                                            size="small" 
                                            showInfo={false}
                                            strokeColor="#52c41a"
                                        />
                                    </div>
                                }
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="stat-card">
                            <Statistic
                                title="Gia sư"
                                value={systemStats.users.tutors}
                                prefix={<BookOutlined />}
                                valueStyle={{ color: '#722ed1' }}
                                suffix={
                                    <div className="progress-wrapper">
                                        <Progress 
                                            percent={systemStats.users.total ? 
                                                (systemStats.users.tutors / systemStats.users.total * 100) : 0
                                            } 
                                            size="small" 
                                            showInfo={false}
                                            strokeColor="#722ed1"
                                        />
                                    </div>
                                }
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="stat-card">
                            <Statistic
                                title="Tài khoản bị khóa"
                                value={systemStats.users.blocked}
                                prefix={<CloseCircleOutlined />}
                                valueStyle={{ color: '#ff4d4f' }}
                                suffix={
                                    <div className="progress-wrapper">
                                        <Progress 
                                            percent={systemStats.users.total ? 
                                                (systemStats.users.blocked / systemStats.users.total * 100) : 0
                                            } 
                                            size="small" 
                                            showInfo={false}
                                            strokeColor="#ff4d4f"
                                        />
                                    </div>
                                }
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Tutor Applications Statistics */}
            <div className="stats-section">
                <h2>Thống kê đơn đăng ký gia sư</h2>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="stat-card">
                            <Statistic
                                title="Tổng đơn đăng ký"
                                value={systemStats.tutorApplications.total}
                                prefix={<FileTextOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="stat-card">
                            <Statistic
                                title="Chờ duyệt"
                                value={systemStats.tutorApplications.pending}
                                prefix={<ClockCircleOutlined />}
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="stat-card">
                            <Statistic
                                title="Đã duyệt"
                                value={systemStats.tutorApplications.approved}
                                prefix={<CheckCircleOutlined />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="stat-card">
                            <Statistic
                                title="Đã từ chối"
                                value={systemStats.tutorApplications.rejected}
                                prefix={<CloseCircleOutlined />}
                                valueStyle={{ color: '#ff4d4f' }}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Recent Activities */}
            <Row gutter={[16, 16]} className="recent-section">
                <Col xs={24} lg={12}>
                    <Card 
                        title="Người dùng mới nhất" 
                        className="recent-card"
                        loading={loading}
                    >
                        {systemStats.recentUsers.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={systemStats.recentUsers}
                                renderItem={user => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar 
                                                    src={user.image} 
                                                    icon={<UserOutlined />}
                                                />
                                            }
                                            title={
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span>{user.username}</span>
                                                    <Tag color={getRoleColor(user.role)}>
                                                        {user.role.toUpperCase()}
                                                    </Tag>
                                                    {user.isBlocked && (
                                                        <Tag color="red">BLOCKED</Tag>
                                                    )}
                                                </div>
                                            }
                                            description={
                                                <div>
                                                    <div>{user.email}</div>
                                                    <div style={{ color: '#999', fontSize: '12px' }}>
                                                        {moment(user.createdAt).fromNow()}
                                                    </div>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="Không có dữ liệu" />
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card 
                        title="Đơn đăng ký gia sư mới nhất" 
                        className="recent-card"
                        loading={loading}
                    >
                        {systemStats.recentApplications.length > 0 ? (
                            <List
                                itemLayout="horizontal"
                                dataSource={systemStats.recentApplications}
                                renderItem={application => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar 
                                                    src={application.tutorId?.image} 
                                                    icon={<UserOutlined />}
                                                />
                                            }
                                            title={
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span>{application.tutorId?.username}</span>
                                                    <Tag color={getStatusColor(application.status)}>
                                                        {getStatusText(application.status)}
                                                    </Tag>
                                                </div>
                                            }
                                            description={
                                                <div>
                                                    <div>{application.tutorId?.email}</div>
                                                    <div style={{ color: '#999', fontSize: '12px' }}>
                                                        {moment(application.createdAt).fromNow()}
                                                    </div>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="Không có dữ liệu" />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminOverview;