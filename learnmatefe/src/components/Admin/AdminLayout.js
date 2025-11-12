import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Badge, Tooltip } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    UserOutlined,
    FileTextOutlined,
    LogoutOutlined,
    SettingOutlined,
    CommentOutlined,
    ExclamationCircleOutlined,
    DollarOutlined,
    HistoryOutlined,
    BellOutlined,
    SearchOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { doLogout } from '../../redux/action/userAction';
import './AdminLayout.scss';

const { Header, Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const user = useSelector(state => state.user.account);

    // Update current time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    const handleLogout = async () => {
        await dispatch(doLogout());
        navigate('/signin');
    };

    const menuItems = [
        {
            key: '/admin/dashboard',
            icon: <DashboardOutlined />,
            label: 'Tổng quan',
        },
        {
            key: '/admin/user-management',
            icon: <UserOutlined />,
            label: 'Quản lý người dùng',
        },
        {
            key: '/admin/tutor-management',
            icon: <FileTextOutlined />,
            label: 'Quản lý đơn gia sư',
        },
        {
            key: '/admin/review-management',
            icon: <CommentOutlined />,
            label: 'Quản lý đánh giá',
        },
        {
            key: '/admin/report-management',
            icon: <ExclamationCircleOutlined />,
            label: 'Quản lý Báo cáo',
        },
        {
            key: '/admin/withdrawal-management',
            icon: <DollarOutlined />,
            label: 'Quản lý Rút tiền',
        },
        {
            key: '/admin/transaction-history',
            icon: <HistoryOutlined />,
            label: 'Lịch sử Giao dịch',
        },
    ];

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Thông tin cá nhân',
            onClick: () => navigate('/profile')
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Cài đặt',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: handleLogout
        },
    ];

    const handleMenuClick = ({ key }) => {
        navigate(key);
    };

    return (
        <Layout className="modern-admin-layout">
            <Sider 
                trigger={null} 
                collapsible 
                collapsed={collapsed}
                className="modern-admin-sider"
                width={280}
            >
                <div className="admin-logo">
                    <div className="logo-content">
                        <div className="logo-icon">
                            <DashboardOutlined />
                        </div>
                        {!collapsed && (
                            <div className="logo-text">
                                <h2>LearnMate</h2>
                                <span>Admin Panel</span>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="admin-info">
                    {!collapsed && (
                        <>
                            <div className="admin-welcome">
                                <Avatar 
                                    src={user?.image} 
                                    icon={<UserOutlined />}
                                    size={48}
                                    className="admin-avatar"
                                />
                                <div className="admin-details">
                                    <div className="admin-name">{user?.username}</div>
                                    <div className="admin-role">Administrator</div>
                                </div>
                            </div>
                            <div className="current-time">
                                {currentTime.toLocaleString('vi-VN', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </>
                    )}
                </div>
                
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    className="modern-admin-menu"
                />
            </Sider>
            
            <Layout className="modern-site-layout">
                <Header className="modern-admin-header">
                    <div className="header-left">
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            className="modern-trigger-button"
                        />
                        <div className="header-breadcrumb">
                            <span className="current-page">
                                {menuItems.find(item => item.key === location.pathname)?.label || 'Dashboard'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="header-right">
                        <div className="header-actions">
                            <Tooltip title="Thông báo">
                                <Badge count={5} size="small">
                                    <Button 
                                        type="text" 
                                        icon={<BellOutlined />}
                                        className="action-button"
                                    />
                                </Badge>
                            </Tooltip>
                            
                            <div className="user-section">
                                <span className="welcome-text">Xin chào, {user?.username}</span>
                                <Dropdown
                                    menu={{ items: userMenuItems }}
                                    placement="bottomRight"
                                    arrow
                                    trigger={['click']}
                                >
                                    <Avatar 
                                        src={user?.image} 
                                        icon={<UserOutlined />}
                                        className="modern-user-avatar"
                                        style={{ cursor: 'pointer' }}
                                    />
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </Header>
                
                <Content className="modern-admin-content">
                    <div className="content-wrapper">
                        {children}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;