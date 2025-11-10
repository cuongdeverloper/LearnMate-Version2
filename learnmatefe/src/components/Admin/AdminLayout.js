import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    UserOutlined,
    FileTextOutlined,
    LogoutOutlined,
    SettingOutlined,
    CommentOutlined,
    BookOutlined,
    ExclamationCircleOutlined,
    DollarOutlined,
    HistoryOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { doLogout } from '../../redux/action/userAction';
import './AdminLayout.scss';

const { Header, Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const user = useSelector(state => state.user.account);

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
            key: '/admin/booking-management',
            icon: <BookOutlined />,
            label: 'Quản lý Booking',
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
        <Layout className="admin-layout">
            <Sider 
                trigger={null} 
                collapsible 
                collapsed={collapsed}
                className="admin-sider"
                width={250}
            >
                <div className="admin-logo">
                    <h2>{collapsed ? 'LM' : 'LearnMate Admin'}</h2>
                </div>
                
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    className="admin-menu"
                />
            </Sider>
            
            <Layout className="site-layout">
                <Header className="admin-header">
                    <div className="header-left">
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            className="trigger-button"
                        />
                    </div>
                    
                    <div className="header-right">
                        <span className="welcome-text">Xin chào, {user?.username}</span>
                        <Dropdown
                            menu={{ items: userMenuItems }}
                            placement="bottomRight"
                            arrow
                        >
                            <Avatar 
                                src={user?.image} 
                                icon={<UserOutlined />}
                                className="user-avatar"
                                style={{ cursor: 'pointer' }}
                            />
                        </Dropdown>
                    </div>
                </Header>
                
                <Content className="admin-content">
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;