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
  Checkbox,
  Timeline,
  Avatar,
  Typography,
  Alert,
  Tabs
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import AdminService from '../../Service/ApiService/AdminService';
import moment from 'moment';
import './ReportManagement.scss';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ReportManagement = () => {
  const [reports, setReports] = useState([]);
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
    targetType: 'all',
    dateRange: null
  });
  
  // Modal states
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [bulkUpdateModalVisible, setBulkUpdateModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedReports, setSelectedReports] = useState([]);
  const [updateForm] = Form.useForm();
  const [bulkUpdateForm] = Form.useForm();
  
  // Drawer states
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [reportDetails, setReportDetails] = useState(null);
  const [bookingDrawerVisible, setBookingDrawerVisible] = useState(false);
  const [relatedBooking, setRelatedBooking] = useState(null);

  useEffect(() => {
    fetchReports();
    fetchStatistics();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        status: filters.status !== 'all' ? filters.status : undefined,
        targetType: filters.targetType !== 'all' ? filters.targetType : undefined,
        startDate: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: filters.dateRange?.[1]?.format('YYYY-MM-DD')
      };

      const response = await AdminService.getReports(params);
      if (response.success) {
        setReports(response.data.reports);
        setPagination(prev => ({
          ...prev,
          total: response.data.total,
          current: response.data.page,
          pageSize: response.data.limit
        }));
      }
    } catch (error) {
      message.error('Không thể tải danh sách báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await AdminService.getReportStats();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching report statistics:', error);
    }
  };

  const fetchReportDetails = async (reportId) => {
    try {
      const response = await AdminService.getReportDetails(reportId);
      if (response.success) {
        setReportDetails(response.data.report);
        setDetailDrawerVisible(true);
      }
    } catch (error) {
      message.error('Không thể tải chi tiết báo cáo');
    }
  };

  const fetchBookingDetails = async (bookingId) => {
    // Validate bookingId
    if (!bookingId) {
      message.error('ID Booking không hợp lệ');
      console.error('BookingId is undefined or null:', bookingId);
      return;
    }

    try {
      console.log('Fetching booking details for ID:', bookingId);
      const response = await AdminService.getBookingDetails(bookingId);
      if (response.success) {
        setRelatedBooking(response.data.booking);
        setBookingDrawerVisible(true);
        message.success('Tải chi tiết booking thành công');
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      message.error('Không thể tải chi tiết booking: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateStatus = async (values) => {
    try {
      setUpdateModalVisible(false); // Close modal immediately to show loading state
      
      // Show loading message
      const hideLoading = message.loading('Đang cập nhật trạng thái báo cáo...', 0);
      
      const response = await AdminService.updateReportStatus(selectedReport._id, values);
      
      hideLoading(); // Hide loading message
      
      if (response && response.success) {
        message.success('Cập nhật trạng thái báo cáo thành công');
        
        // Update local state immediately for better UX
        setReports(prevReports => 
          prevReports.map(report => 
            report._id === selectedReport._id 
              ? { ...report, status: values.status, adminNotes: values.adminNotes }
              : report
          )
        );
        
        // Refresh data in background
        fetchReports();
        fetchStatistics();
      } else {
        throw new Error(response?.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      
      // Show detailed error message
      const errorMessage = error.response?.data?.message || error.message || 'Không thể cập nhật trạng thái báo cáo';
      message.error(`Lỗi: ${errorMessage}`, 5);
      
      // Reopen modal with original values if error occurs
      updateForm.setFieldsValue({
        status: selectedReport.status,
        adminNotes: selectedReport.adminNotes || ''
      });
      setUpdateModalVisible(true);
    }
  };

  const handleBulkUpdate = async (values) => {
    try {
      setBulkUpdateModalVisible(false);
      
      // Show loading message
      const hideLoading = message.loading(`Đang cập nhật ${selectedReports.length} báo cáo...`, 0);
      
      const response = await AdminService.bulkUpdateReports({
        reportIds: selectedReports,
        ...values
      });
      
      hideLoading(); // Hide loading message
      
      if (response && response.success) {
        message.success(`Cập nhật ${selectedReports.length} báo cáo thành công`);
        setSelectedReports([]);
        
        // Refresh data
        fetchReports();
        fetchStatistics();
      } else {
        throw new Error(response?.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error bulk updating reports:', error);
      
      // Show detailed error message
      const errorMessage = error.response?.data?.message || error.message || 'Không thể cập nhật hàng loạt báo cáo';
      message.error(`Lỗi: ${errorMessage}`, 5);
      
      // Reopen modal if error occurs
      setBulkUpdateModalVisible(true);
    }
  };

  const openUpdateModal = (report) => {
    setSelectedReport(report);
    updateForm.setFieldsValue({
      status: report.status
    });
    setUpdateModalVisible(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      reviewed: 'green',
      dismissed: 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ xử lý',
      reviewed: 'Đã xử lý',
      dismissed: 'Đã bỏ qua'
    };
    return texts[status] || status;
  };

  const getReasonText = (reason) => {
    const reasons = {
      inappropriate_behavior: 'Hành vi không phù hợp',
      poor_teaching: 'Chất lượng dạy kém',
      schedule_issues: 'Vấn đề lịch học',
      payment_issues: 'Vấn đề thanh toán',
      communication_problems: 'Vấn đề giao tiếp',
      other: 'Khác'
    };
    return reasons[reason] || reason;
  };

  const getTargetTypeText = (type) => {
    const types = {
      booking: 'Booking',
      tutor: 'Gia sư',
      learner: 'Học viên'
    };
    return types[type] || type;
  };

  const rowSelection = {
    selectedRowKeys: selectedReports,
    onChange: (selectedRowKeys) => {
      setSelectedReports(selectedRowKeys);
    },
  };

  const columns = [
    {
      title: 'Mã báo cáo',
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
      title: 'Người báo cáo',
      dataIndex: 'reporter',
      key: 'reporter',
      width: 200,
      render: (reporter) => (
        <Space>
          <Avatar 
            src={reporter?.image} 
            icon={<UserOutlined />} 
            size="small"
          />
          <div>
            <div>{reporter?.username}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {reporter?.email}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Loại đối tượng',
      dataIndex: 'targetType',
      key: 'targetType',
      width: 120,
      render: (type) => (
        <Tag color="blue">{getTargetTypeText(type)}</Tag>
      )
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      width: 180,
      render: (reason) => getReasonText(reason)
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
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
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EyeOutlined />}
            onClick={() => fetchReportDetails(record._id)}
          >
            Chi tiết
          </Button>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openUpdateModal(record)}
          >
            Xử lý
          </Button>
        </Space>
      )
    }
  ];

  const statisticsCards = [
    {
      title: 'Tổng số báo cáo',
      value: statistics.totalReports || 0,
      icon: <ExclamationCircleOutlined />,
      color: '#1890ff'
    },
    {
      title: 'Chờ xử lý',
      value: statistics.pendingReports || 0,
      icon: <CalendarOutlined />,
      color: '#faad14'
    },
    {
      title: 'Đã xử lý',
      value: statistics.reviewedReports || 0,
      icon: <CheckCircleOutlined />,
      color: '#52c41a'
    },
    {
      title: 'Đã bỏ qua',
      value: statistics.dismissedReports || 0,
      icon: <CloseCircleOutlined />,
      color: '#ff4d4f'
    }
  ];

  return (
    <div className="report-management-container" style={{ padding: '24px' }}>
      <Title level={2}>Quản lý Báo cáo</Title>
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {statisticsCards.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Reason Statistics */}
      {statistics.reasonStats && statistics.reasonStats.length > 0 && (
        <Card style={{ marginBottom: '16px' }}>
          <Title level={4}>Thống kê theo lý do báo cáo</Title>
          <Row gutter={[16, 8]}>
            {statistics.reasonStats.map((stat, index) => (
              <Col xs={12} sm={8} md={6} key={index}>
                <div style={{ textAlign: 'center', padding: '8px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                    {stat.count}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {getReasonText(stat._id)}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      )}

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
              <Option value="pending">Chờ xử lý</Option>
              <Option value="reviewed">Đã xử lý</Option>
              <Option value="dismissed">Đã bỏ qua</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <label>Loại đối tượng:</label>
            <Select
              style={{ width: '100%', marginTop: '4px' }}
              value={filters.targetType}
              onChange={(value) => setFilters({ ...filters, targetType: value })}
            >
              <Option value="all">Tất cả</Option>
              <Option value="booking">Booking</Option>
              <Option value="tutor">Gia sư</Option>
              <Option value="learner">Học viên</Option>
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
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={fetchReports}
                loading={loading}
              >
                Tìm kiếm
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setFilters({
                    status: 'all',
                    targetType: 'all',
                    dateRange: null
                  });
                  fetchReports();
                }}
              >
                Làm mới
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Bulk Actions */}
      {selectedReports.length > 0 && (
        <Alert
          message={`Đã chọn ${selectedReports.length} báo cáo`}
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
          action={
            <Button
              type="primary"
              size="small"
              onClick={() => setBulkUpdateModalVisible(true)}
            >
              Xử lý hàng loạt
            </Button>
          }
        />
      )}

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="_id"
          loading={loading}
          rowSelection={rowSelection}
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
              `${range[0]}-${range[1]} của ${total} báo cáo`
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Update Status Modal */}
      <Modal
        title="Xử lý báo cáo"
        open={updateModalVisible}
        onCancel={() => setUpdateModalVisible(false)}
        footer={null}
        width={600}
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
              <Radio value="pending">Chờ xử lý</Radio>
              <Radio value="reviewed">Đã xử lý</Radio>
              <Radio value="dismissed">Bỏ qua</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item
            name="action"
            label="Hành động với booking (nếu có)"
          >
            <Radio.Group>
              <Radio value="">Không thay đổi</Radio>
              <Radio value="cancel_booking">Hủy booking</Radio>
              <Radio value="mark_reported">Đánh dấu đã được báo cáo</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item
            name="adminNotes"
            label="Ghi chú của admin"
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập ghi chú về quyết định xử lý..."
            />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<CheckCircleOutlined />}>
                Xử lý
              </Button>
              <Button onClick={() => setUpdateModalVisible(false)} icon={<CloseCircleOutlined />}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Bulk Update Modal */}
      <Modal
        title={`Xử lý hàng loạt ${selectedReports.length} báo cáo`}
        open={bulkUpdateModalVisible}
        onCancel={() => setBulkUpdateModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={bulkUpdateForm}
          layout="vertical"
          onFinish={handleBulkUpdate}
        >
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Radio.Group>
              <Radio value="reviewed">Đã xử lý</Radio>
              <Radio value="dismissed">Bỏ qua</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item
            name="adminNotes"
            label="Ghi chú chung"
          >
            <Input.TextArea
              rows={3}
              placeholder="Nhập ghi chú chung cho tất cả báo cáo..."
            />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<CheckCircleOutlined />}>
                Xử lý hàng loạt
              </Button>
              <Button onClick={() => setBulkUpdateModalVisible(false)} icon={<CloseCircleOutlined />}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Report Detail Drawer */}
      <Drawer
        title="Chi tiết báo cáo"
        placement="right"
        width={700}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {reportDetails && (
          <div>
            <Descriptions title="Thông tin báo cáo" bordered column={1}>
              <Descriptions.Item label="Mã báo cáo">
                <Text code>{reportDetails._id}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="Người báo cáo">
                <Space>
                  <Avatar src={reportDetails.reporter?.image} icon={<UserOutlined />} />
                  <div>
                    <div>{reportDetails.reporter?.username}</div>
                    <Text type="secondary">{reportDetails.reporter?.email}</Text>
                  </div>
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Loại đối tượng">
                <Tag color="blue">{getTargetTypeText(reportDetails.targetType)}</Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Lý do báo cáo">
                {getReasonText(reportDetails.reason)}
              </Descriptions.Item>
              
              <Descriptions.Item label="Mô tả chi tiết">
                {reportDetails.description || 'Không có mô tả'}
              </Descriptions.Item>
              
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(reportDetails.status)}>
                  {getStatusText(reportDetails.status)}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Ngày tạo">
                {moment(reportDetails.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              
              {reportDetails.reviewedAt && (
                <Descriptions.Item label="Ngày xử lý">
                  {moment(reportDetails.reviewedAt).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
              )}
              
              {reportDetails.adminNotes && (
                <Descriptions.Item label="Ghi chú admin">
                  {reportDetails.adminNotes}
                </Descriptions.Item>
              )}
            </Descriptions>

            {reportDetails.targetType === 'booking' && reportDetails.targetId && (
              <>
                <Divider />
                <div style={{ marginBottom: '16px' }}>
                  <Button
                    type="primary"
                    icon={<FileTextOutlined />}
                    onClick={() => {
                      // Handle both cases: targetId as object or as string
                      const bookingId = typeof reportDetails.targetId === 'object' 
                        ? reportDetails.targetId._id 
                        : reportDetails.targetId;
                      console.log('Booking ID:', bookingId);
                      fetchBookingDetails(bookingId);
                    }}
                  >
                    Xem chi tiết Booking liên quan
                  </Button>
                </div>
                
                {typeof reportDetails.targetId === 'object' ? (
                  <Card title="Thông tin Booking được báo cáo" size="small">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Học viên">
                        {reportDetails.targetId.learnerId?.username}
                      </Descriptions.Item>
                      <Descriptions.Item label="Gia sư">
                        {reportDetails.targetId.tutorId?.user?.username}
                      </Descriptions.Item>
                      <Descriptions.Item label="Trạng thái booking">
                        <Tag color={getStatusColor(reportDetails.targetId.status)}>
                          {getStatusText(reportDetails.targetId.status)}
                        </Tag>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                ) : (
                  <Card title="Thông tin Booking được báo cáo" size="small">
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      padding: '20px',
                      background: 'linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%)',
                      borderRadius: '8px',
                      border: '1px dashed #d1d5db'
                    }}>
                      <FileTextOutlined style={{ 
                        fontSize: '32px', 
                        color: '#3b82f6',
                        marginBottom: '12px'
                      }} />
                      <div style={{ 
                        fontSize: '16px', 
                        fontWeight: '600', 
                        color: '#1f2937',
                        marginBottom: '8px'
                      }}>
                        Booking được báo cáo
                      </div>
                      <div style={{ 
                        fontSize: '14px',
                        color: '#6b7280',
                        background: '#fff',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb',
                        fontFamily: 'monospace',
                        marginBottom: '12px'
                      }}>
                        ID: {reportDetails.targetId}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#9ca3af',
                        textAlign: 'center',
                        lineHeight: '1.5'
                      }}>
                        Click nút bên trên để xem thông tin chi tiết booking
                      </div>
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        )}
      </Drawer>

      {/* Booking Detail Drawer */}
      <Drawer
        title="Chi tiết Booking liên quan"
        placement="right"
        width={600}
        open={bookingDrawerVisible}
        onClose={() => setBookingDrawerVisible(false)}
      >
        {relatedBooking && (
          <Descriptions title="Thông tin Booking" bordered column={1}>
            <Descriptions.Item label="Mã Booking">
              <Text code>{relatedBooking._id}</Text>
            </Descriptions.Item>
            
            <Descriptions.Item label="Học viên">
              <Space>
                <Avatar src={relatedBooking.learnerId?.image} icon={<UserOutlined />} />
                <div>
                  <div>{relatedBooking.learnerId?.username}</div>
                  <Text type="secondary">{relatedBooking.learnerId?.email}</Text>
                </div>
              </Space>
            </Descriptions.Item>
            
            <Descriptions.Item label="Gia sư">
              <Space>
                <Avatar src={relatedBooking.tutorId?.user?.image} icon={<UserOutlined />} />
                <div>
                  <div>{relatedBooking.tutorId?.user?.username}</div>
                  <Text type="secondary">{relatedBooking.tutorId?.user?.email}</Text>
                </div>
              </Space>
            </Descriptions.Item>
            
            <Descriptions.Item label="Môn học">
              {relatedBooking.subjectId?.name} - Lớp {relatedBooking.subjectId?.classLevel}
            </Descriptions.Item>
            
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(relatedBooking.status)}>
                {getStatusText(relatedBooking.status)}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="Tổng tiền">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(relatedBooking.amount)}
            </Descriptions.Item>
            
            <Descriptions.Item label="Ngày tạo">
              {moment(relatedBooking.createdAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default ReportManagement;