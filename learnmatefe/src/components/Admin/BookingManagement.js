import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Input,
  Button,
  Select,
  DatePicker,
  Tag,
  Space,
  Modal,
  Form,
  Radio,
  message,
  Drawer,
  Descriptions,
  Divider,
  Row,
  Col,
  Statistic,
  Badge,
  Tooltip,
  Avatar,
  Typography
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import AdminService from '../../Service/ApiService/AdminService';
import moment from 'moment';
import './BookingManagement.scss';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    tutorId: '',
    learnerId: '',
    dateRange: null
  });
  
  // Modal states
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updateForm] = Form.useForm();
  
  // Drawer states
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [relatedReports, setRelatedReports] = useState([]);

  useEffect(() => {
    fetchBookings();
    fetchStatistics();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        status: filters.status !== 'all' ? filters.status : undefined,
        tutorId: filters.tutorId || undefined,
        learnerId: filters.learnerId || undefined,
        startDate: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: filters.dateRange?.[1]?.format('YYYY-MM-DD')
      };

      const response = await AdminService.getBookings(params);
      if (response.success) {
        setBookings(response.data.bookings);
        setPagination(prev => ({
          ...prev,
          total: response.data.total,
          current: response.data.page,
          pageSize: response.data.limit
        }));
      }
    } catch (error) {
      message.error('Không thể tải danh sách booking');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await AdminService.getBookingStats();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching booking statistics:', error);
    }
  };

  const fetchBookingDetails = async (bookingId) => {
    try {
      const response = await AdminService.getBookingDetails(bookingId);
      if (response.success) {
        setBookingDetails(response.data.booking);
        setRelatedReports(response.data.reports || []);
        
        // Show info message if no reports found
        if (!response.data.reports || response.data.reports.length === 0) {
          message.info('Booking này chưa có báo cáo nào');
        } else {
          message.success(`Tìm thấy ${response.data.reports.length} báo cáo liên quan`);
        }
        
        setDetailDrawerVisible(true);
      }
    } catch (error) {
      message.error('Không thể tải chi tiết booking');
    }
  };

  const handleUpdateStatus = async (values) => {
    try {
      console.log('🔄 Updating booking status:', values);
      const response = await AdminService.updateBookingStatus(selectedBooking._id, values);
      if (response.success) {
        message.success('Cập nhật trạng thái booking thành công');
        setUpdateModalVisible(false);
        fetchBookings();
        fetchStatistics();
      }
    } catch (error) {
      console.error('❌ Error updating booking status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể cập nhật trạng thái booking';
      message.error(`Lỗi cập nhật: ${errorMessage}`);
    }
  };

  const openUpdateModal = (booking) => {
    setSelectedBooking(booking);
    updateForm.setFieldsValue({
      status: booking.status
    });
    setUpdateModalVisible(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      approve: 'green',
      cancelled: 'red',
      rejected: 'volcano',
      completed: 'blue'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ duyệt',
      approve: 'Đã duyệt',
      cancelled: 'Đã hủy',
      rejected: 'Đã từ chối',
      completed: 'Hoàn thành'
    };
    return texts[status] || status;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const renderReportBadge = (reported) => {
    if (reported) {
      return (
        <Tooltip title="Booking này có báo cáo">
          <Badge color="red" text="Có báo cáo" />
        </Tooltip>
      );
    }
    return null;
  };

  const columns = [
    {
      title: 'Mã Booking',
      dataIndex: '_id',
      key: '_id',
      width: 120,
      render: (id) => (
        <Text code style={{ fontSize: '12px' }}>
          {id.slice(-8)}
        </Text>
      )
    },
    {
      title: 'Học viên',
      dataIndex: 'learnerId',
      key: 'learner',
      width: 200,
      render: (learner) => (
        <Space>
          <Avatar 
            src={learner?.image} 
            icon={<UserOutlined />} 
            size="small"
          />
          <div>
            <div>{learner?.username}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {learner?.email}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Gia sư',
      dataIndex: 'tutorId',
      key: 'tutor',
      width: 200,
      render: (tutor) => (
        <Space>
          <Avatar 
            src={tutor?.user?.image} 
            icon={<UserOutlined />} 
            size="small"
          />
          <div>
            <div>{tutor?.user?.username}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {tutor?.user?.email}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Môn học',
      dataIndex: 'subjectId',
      key: 'subject',
      width: 150,
      render: (subject) => (
        <div>
          <div>{subject?.name}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Lớp {subject?.classLevel}
          </Text>
        </div>
      )
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {formatCurrency(amount)}
          </div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Cọc: {formatCurrency(record.deposit)}
          </Text>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status, record) => (
        <Space direction="vertical" size="small">
          <Tag color={getStatusColor(status)}>
            {getStatusText(status)}
          </Tag>
          {renderReportBadge(record.reported)}
        </Space>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              ghost
              size="small"
              icon={<EyeOutlined />}
              onClick={() => fetchBookingDetails(record._id)}
            />
          </Tooltip>
          <Tooltip title="Cập nhật trạng thái">
            <Button
              type="default"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openUpdateModal(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="booking-management-container" style={{ padding: '24px' }}>
      <Title level={2}>Quản lý Booking</Title>
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số Booking"
              value={statistics.totalBookings || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Chờ duyệt"
              value={statistics.pendingBookings || 0}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã duyệt"
              value={statistics.approvedBookings || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Có báo cáo"
              value={statistics.reportedBookings || 0}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} sm={8} md={6}>
            <label>Trạng thái:</label>
            <Select
              style={{ width: '100%', marginTop: '4px' }}
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="all">Tất cả</Option>
              <Option value="pending">Chờ duyệt</Option>
              <Option value="approve">Đã duyệt</Option>
              <Option value="cancelled">Đã hủy</Option>
              <Option value="rejected">Đã từ chối</Option>
              <Option value="completed">Hoàn thành</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <label>Khoảng thời gian:</label>
            <RangePicker
              style={{ width: '100%', marginTop: '4px' }}
              value={filters.dateRange}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={fetchBookings}
              loading={loading}
            >
              Tìm kiếm
            </Button>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setFilters({
                  status: 'all',
                  tutorId: '',
                  learnerId: '',
                  dateRange: null
                });
                fetchBookings();
              }}
            >
              Làm mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={bookings}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => {
              setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize
              }));
            },
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} booking`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Update Status Modal */}
      <Modal
        title="Cập nhật trạng thái Booking"
        open={updateModalVisible}
        onCancel={() => setUpdateModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={updateForm}
          layout="vertical"
          onFinish={handleUpdateStatus}
        >
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Radio.Group>
              <Radio value="pending">Chờ duyệt</Radio>
              <Radio value="approve">Duyệt</Radio>
              <Radio value="cancelled">Hủy</Radio>
              <Radio value="rejected">Từ chối</Radio>
              <Radio value="completed">Hoàn thành</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item
            name="reason"
            label="Lý do (tùy chọn)"
          >
            <Input.TextArea
              rows={3}
              placeholder="Nhập lý do cập nhật trạng thái..."
            />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<CheckCircleOutlined />}>
                Cập nhật
              </Button>
              <Button onClick={() => setUpdateModalVisible(false)} icon={<CloseCircleOutlined />}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Booking Detail Drawer */}
      <Drawer
        title="Chi tiết Booking"
        placement="right"
        width={800}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {bookingDetails && (
          <div>
            <Descriptions title="Thông tin Booking" bordered column={2}>
              <Descriptions.Item label="Mã Booking" span={2}>
                <Text code>{bookingDetails._id}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="Học viên">
                <Space>
                  <Avatar src={bookingDetails.learnerId?.image} icon={<UserOutlined />} />
                  <div>
                    <div>{bookingDetails.learnerId?.username}</div>
                    <Text type="secondary">{bookingDetails.learnerId?.email}</Text>
                  </div>
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Gia sư">
                <Space>
                  <Avatar src={bookingDetails.tutorId?.user?.image} icon={<UserOutlined />} />
                  <div>
                    <div>{bookingDetails.tutorId?.user?.username}</div>
                    <Text type="secondary">{bookingDetails.tutorId?.user?.email}</Text>
                  </div>
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Môn học">
                {bookingDetails.subjectId?.name} - Lớp {bookingDetails.subjectId?.classLevel}
              </Descriptions.Item>
              
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(bookingDetails.status)}>
                  {getStatusText(bookingDetails.status)}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Tổng tiền">
                {formatCurrency(bookingDetails.amount)}
              </Descriptions.Item>
              
              <Descriptions.Item label="Tiền cọc">
                {formatCurrency(bookingDetails.deposit)}
              </Descriptions.Item>
              
              <Descriptions.Item label="Số tháng học">
                {bookingDetails.numberOfMonths} tháng
              </Descriptions.Item>
              
              <Descriptions.Item label="Số buổi học">
                {bookingDetails.numberOfSession} buổi
              </Descriptions.Item>
              
              <Descriptions.Item label="Địa chỉ học" span={2}>
                {bookingDetails.address || 'Chưa có thông tin'}
              </Descriptions.Item>
              
              <Descriptions.Item label="Ghi chú" span={2}>
                {bookingDetails.note || 'Không có ghi chú'}
              </Descriptions.Item>
              
              <Descriptions.Item label="Ngày tạo">
                {moment(bookingDetails.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              
              <Descriptions.Item label="Cập nhật cuối">
                {moment(bookingDetails.updatedAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>

            <Divider />
            <Title level={4}>
              Báo cáo liên quan 
              {relatedReports && relatedReports.length > 0 ? (
                <span> ({relatedReports.length})</span>
              ) : (
                <span style={{ color: '#8c8c8c', fontSize: '14px', fontWeight: 'normal' }}>
                  {' '}(0 báo cáo)
                </span>
              )}
            </Title>
            
            {relatedReports && relatedReports.length > 0 ? (
              relatedReports.map(report => (
                <Card key={report._id} size="small" style={{ marginBottom: '8px' }}>
                  <Row>
                    <Col span={18}>
                      <Space direction="vertical" size="small">
                        <Text strong>Người báo cáo: {report.reporter?.username}</Text>
                        <Text>Lý do: {report.reason}</Text>
                        <Text type="secondary">
                          {moment(report.createdAt).format('DD/MM/YYYY HH:mm')}
                        </Text>
                      </Space>
                    </Col>
                    <Col span={6} style={{ textAlign: 'right' }}>
                      <Tag color={report.status === 'pending' ? 'orange' : 
                                 report.status === 'reviewed' ? 'green' : 'red'}>
                        {report.status === 'pending' ? 'Chờ xử lý' :
                         report.status === 'reviewed' ? 'Đã xử lý' : 'Đã bỏ qua'}
                      </Tag>
                    </Col>
                  </Row>
                </Card>
              ))
            ) : (
              <Card size="small" style={{ 
                background: '#f9f9f9', 
                border: '1px dashed #d9d9d9',
                textAlign: 'center',
                color: '#8c8c8c'
              }}>
                <Space direction="vertical" size="small">
                  <ExclamationCircleOutlined style={{ fontSize: '24px', color: '#d9d9d9' }} />
                  <Text type="secondary">Booking này chưa có báo cáo nào</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Học viên hoặc gia sư chưa gửi báo cáo về booking này
                  </Text>
                </Space>
              </Card>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default BookingManagement;