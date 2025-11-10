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
    Image,
    Descriptions,
    List
} from 'antd';
import { 
    UserOutlined, 
    CheckOutlined, 
    CloseOutlined,
    EyeOutlined,
    FileTextOutlined,
    BookOutlined,
    DollarOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AdminService from '../../Service/ApiService/AdminService';
import moment from 'moment';
import './TutorManagement.scss';

const { TextArea } = Input;

const TutorManagement = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [actionModalVisible, setActionModalVisible] = useState(false);
    const [actionType, setActionType] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await AdminService.getAllTutorApplications();
            console.log('Tutor applications API response:', response);
            
            // Backend trả về format: { errorCode: 0, message: '...', data: [...] }
            let applicationList = [];
            if (!response) {
                applicationList = [];
            } else if (response.errorCode === 0 && response.data && Array.isArray(response.data)) {
                applicationList = response.data;
            } else if (Array.isArray(response)) {
                // Fallback nếu response là array trực tiếp
                applicationList = response;
            } else {
                applicationList = [];
            }
            
            if (applicationList.length > 0) {
                setApplications(applicationList);
                calculateStats(applicationList);
            } else {
                console.log('No applications found or empty response');
                setApplications([]);
                // Không hiển thị error message nếu không có dữ liệu (có thể là trường hợp bình thường)
            }
        } catch (error) {
            message.error('Không thể tải danh sách đơn đăng ký');
            console.error('Fetch applications error:', error);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (applicationList = []) => {
        if (!Array.isArray(applicationList)) {
            applicationList = [];
        }
        
        const stats = {
            total: applicationList.length,
            pending: applicationList.filter(app => app.status === 'pending').length,
            approved: applicationList.filter(app => app.status === 'approved').length,
            rejected: applicationList.filter(app => app.status === 'rejected').length
        };
        setStats(stats);
    };

    const handleApprove = async () => {
        if (!selectedApplication) return;

        try {
            setLoading(true);
            const response = await AdminService.approveTutorApplication(selectedApplication._id);
            
            // Backend trả về format: { errorCode: 0, message: '...' }
            if (response && response.errorCode === 0) {
                message.success('Đã duyệt đơn đăng ký thành công');
                fetchApplications(); // Refresh the list
                setActionModalVisible(false);
            } else {
                const errorMessage = response?.message || 'Có lỗi xảy ra khi duyệt đơn';
                message.error(errorMessage);
            }
        } catch (error) {
            // Show specific error message from backend
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi duyệt đơn';
            message.error(errorMessage);
            console.error('Approve error:', error);
            
            // Refresh data even on error (in case backend updated but returned error)
            fetchApplications();
        } finally {
            setLoading(false);
            setActionModalVisible(false);
        }
    };

    const handleReject = async () => {
        if (!selectedApplication || !rejectionReason.trim()) {
            message.error('Vui lòng nhập lý do từ chối');
            return;
        }

        try {
            setLoading(true);
            const response = await AdminService.rejectTutorApplication(
                selectedApplication._id, 
                rejectionReason
            );
            
            // Backend trả về format: { errorCode: 0, message: '...' }
            if (response && response.errorCode === 0) {
                message.success('Đã từ chối đơn đăng ký');
                fetchApplications(); // Refresh the list
                setActionModalVisible(false);
                setRejectionReason('');
            } else {
                const errorMessage = response?.message || 'Có lỗi xảy ra khi từ chối đơn';
                message.error(errorMessage);
            }
        } catch (error) {
            // Show specific error message from backend
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi từ chối đơn';
            message.error(errorMessage);
            console.error('Reject error:', error);
            
            // Refresh data even on error (in case backend updated but returned error)
            fetchApplications();
        } finally {
            setLoading(false);
            setActionModalVisible(false);
            setRejectionReason('');
        }
    };

    const openActionModal = (application, type) => {
        setSelectedApplication(application);
        setActionType(type);
        setRejectionReason('');
        setActionModalVisible(true);
    };

    const openDetailModal = (application) => {
        setSelectedApplication(application);
        setDetailModalVisible(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'orange';
            case 'approved': return 'green';
            case 'rejected': return 'red';
            default: return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Chờ duyệt';
            case 'approved': return 'Đã duyệt';
            case 'rejected': return 'Đã từ chối';
            default: return status;
        }
    };

    const columns = [
        {
            title: 'Ảnh đại diện',
            dataIndex: ['tutorId', 'image'],
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
            title: 'Họ tên',
            dataIndex: ['tutorId', 'username'],
            key: 'username',
            sorter: (a, b) => a.tutorId.username.localeCompare(b.tutorId.username),
        },
        {
            title: 'Email',
            dataIndex: ['tutorId', 'email'],
            key: 'email',
        },
        {
            title: 'Môn học',
            dataIndex: 'subjects',
            key: 'subjects',
            render: (subjects) => (
                <div>
                    {subjects?.slice(0, 2).map((subject, index) => (
                        <Tag key={index} color="blue">{subject}</Tag>
                    ))}
                    {subjects?.length > 2 && <Tag>+{subjects.length - 2}</Tag>}
                </div>
            ),
        },
        {
            title: 'Giá/giờ',
            dataIndex: 'pricePerHour',
            key: 'pricePerHour',
            render: (price) => `${price?.toLocaleString()} VNĐ`,
            sorter: (a, b) => a.pricePerHour - b.pricePerHour,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            ),
            filters: [
                { text: 'Chờ duyệt', value: 'pending' },
                { text: 'Đã duyệt', value: 'approved' },
                { text: 'Đã từ chối', value: 'rejected' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Ngày nộp',
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
                            onClick={() => openDetailModal(record)}
                        />
                    </Tooltip>
                    
                    {record.status === 'pending' && (
                        <>
                            <Tooltip title="Duyệt đơn">
                                <Button 
                                    type="primary" 
                                    size="small"
                                    icon={<CheckOutlined />}
                                    onClick={() => openActionModal(record, 'approve')}
                                />
                            </Tooltip>
                            
                            <Tooltip title="Từ chối">
                                <Button 
                                    type="default" 
                                    danger
                                    size="small"
                                    icon={<CloseOutlined />}
                                    onClick={() => openActionModal(record, 'reject')}
                                />
                            </Tooltip>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="tutor-management">
            <div className="dashboard-header">
                <Button 
                    type="link" 
                    icon={<ArrowLeftOutlined />} 
                    onClick={() => navigate('/admin/dashboard')}
                    style={{ marginBottom: 16 }}
                >
                    Quay lại Dashboard
                </Button>
                <h1>Quản lý đơn đăng ký gia sư</h1>
                <p>Duyệt và quản lý các đơn đăng ký trở thành gia sư</p>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} className="stats-row">
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng đơn"
                            value={stats.total}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Chờ duyệt"
                            value={stats.pending}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đã duyệt"
                            value={stats.approved}
                            prefix={<CheckOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Đã từ chối"
                            value={stats.rejected}
                            prefix={<CloseOutlined />}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Applications Table */}
            <Card className="applications-table-card">
                <div className="table-header">
                    <h2>Danh sách đơn đăng ký</h2>
                    <Button type="primary" onClick={fetchApplications} loading={loading}>
                        Làm mới
                    </Button>
                </div>
                
                <Table 
                    columns={columns}
                    dataSource={applications || []}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        total: (applications || []).length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                            `${range[0]}-${range[1]} của ${total} đơn đăng ký`,
                    }}
                    scroll={{ x: 1200 }}
                />
            </Card>

            {/* Detail Modal */}
            <Modal
                title="Chi tiết đơn đăng ký gia sư"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={800}
            >
                {selectedApplication && (
                    <div className="application-detail">
                        <div className="applicant-info">
                            <Avatar 
                                src={selectedApplication.tutorId?.image} 
                                icon={<UserOutlined />} 
                                size={80}
                            />
                            <div className="basic-info">
                                <h3>{selectedApplication.tutorId?.username}</h3>
                                <p>{selectedApplication.tutorId?.email}</p>
                                <Tag color={getStatusColor(selectedApplication.status)}>
                                    {getStatusText(selectedApplication.status)}
                                </Tag>
                            </div>
                        </div>

                        <Descriptions title="Thông tin đơn đăng ký" bordered column={2}>
                            <Descriptions.Item label="Học vấn">
                                {selectedApplication.education}
                            </Descriptions.Item>
                            <Descriptions.Item label="Kinh nghiệm">
                                {selectedApplication.experience}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giá/giờ">
                                {selectedApplication.pricePerHour?.toLocaleString()} VNĐ
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa điểm">
                                {selectedApplication.location}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngôn ngữ" span={2}>
                                {selectedApplication.languages?.join(', ')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Mô tả" span={2}>
                                {selectedApplication.bio}
                            </Descriptions.Item>
                        </Descriptions>

                        <div className="subjects-section">
                            <h4>Môn học giảng dạy:</h4>
                            <div>
                                {selectedApplication.subjects?.map((subject, index) => (
                                    <Tag key={index} color="blue">{subject}</Tag>
                                ))}
                            </div>
                        </div>

                        {selectedApplication.certificates?.length > 0 && (
                            <div className="certificates-section">
                                <h4>Chứng chỉ:</h4>
                                <List
                                    itemLayout="horizontal"
                                    dataSource={selectedApplication.certificates}
                                    renderItem={(cert, index) => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={<BookOutlined />}
                                                title={<a href={cert} target="_blank" rel="noopener noreferrer">Chứng chỉ {index + 1}</a>}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </div>
                        )}

                        {selectedApplication.cvFile && (
                            <div className="cv-section">
                                <h4>CV:</h4>
                                <Button 
                                    type="link" 
                                    icon={<FileTextOutlined />}
                                    href={selectedApplication.cvFile}
                                    target="_blank"
                                >
                                    Xem CV
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Action Modal */}
            <Modal
                title={actionType === 'approve' ? 'Duyệt đơn đăng ký' : 'Từ chối đơn đăng ký'}
                open={actionModalVisible}
                onOk={actionType === 'approve' ? handleApprove : handleReject}
                onCancel={() => setActionModalVisible(false)}
                confirmLoading={loading}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <p>
                    Bạn có chắc muốn {actionType === 'approve' ? 'duyệt' : 'từ chối'} đơn đăng ký của{' '}
                    <strong>{selectedApplication?.tutorId?.username}</strong>?
                </p>
                
                {actionType === 'reject' && (
                    <div style={{ marginTop: 16 }}>
                        <label>Lý do từ chối:</label>
                        <TextArea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Nhập lý do từ chối đơn đăng ký..."
                            rows={4}
                            style={{ marginTop: 8 }}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TutorManagement;