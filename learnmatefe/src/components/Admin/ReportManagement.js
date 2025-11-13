import React, { useState, useEffect, useCallback } from 'react';
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
  Avatar,
  Typography,
  Badge
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  CalendarOutlined,
  FlagOutlined,
  WarningOutlined,
  StopOutlined,
} from '@ant-design/icons';
import AdminService from '../../Service/ApiService/AdminService';
import moment from 'moment';
import './ReportManagement.scss';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const { current, pageSize } = pagination;
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    rejectedReports: 0
  });
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


  const fetchReports = useCallback(async () => {
  setLoading(true);
  try {
    const params = {
      page: current,
      limit: pageSize,
      status: filters.status !== 'all' ? filters.status : undefined,
      targetType: filters.targetType !== 'all' ? filters.targetType : undefined,
      startDate: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
      endDate: filters.dateRange?.[1]?.format('YYYY-MM-DD')
    };

    const response = await AdminService.getReports(params);
    if (response.success) {
      const reportsList = response.data.reports || [];
      setReports(reportsList);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        current: response.data.page,
        pageSize: response.data.limit
      }));
      calculateStatisticsFromReports(reportsList);
    }
  } catch {
    message.error('Không thể tải danh sách báo cáo');
  } finally {
    setLoading(false);
  }
}, [filters, current, pageSize]);

  const calculateStatisticsFromReports = (reportsList) => {
    const stats = {
      total: reportsList.length,
      pending: reportsList.filter(report => report.status === 'pending').length,
      resolved: reportsList.filter(report => report.status === 'resolved' || report.status === 'reviewed').length,
      rejected: reportsList.filter(report => report.status === 'rejected' || report.status === 'dismissed').length
    };

    //console.log('Calculated statistics from reports:', stats);
    setStats({
      totalReports: stats.total,
      pendingReports: stats.pending,
      resolvedReports: stats.resolved,
      rejectedReports: stats.rejected
    });
  };

  const fetchStatistics = async () => {
    try {
      const response = await AdminService.getReportStats();
      //console.log('Report Statistics API Response:', response);

      if (response && response.success && response.data &&
        (response.data.total > 0 || response.data.pending > 0 ||
          response.data.resolved > 0 || response.data.rejected > 0)) {
        //console.log('Using API Statistics (has data):', response.data);
        setStats({
          totalReports: response.data.total || 0,
          pendingReports: response.data.pending || 0,
          resolvedReports: response.data.resolved || 0,
          rejectedReports: response.data.rejected || 0
        });
      } else {
        console.warn('API statistics empty or failed, keeping calculated statistics');
        // Keep the statistics calculated from reports data
      }
    } catch (error) {
      console.error('Error fetching report statistics:', error);
      console.warn('Keeping statistics calculated from reports data');
      // Keep the statistics calculated from reports data
    }
  };

  useEffect(() => {
  fetchReports();
  fetchStatistics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

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
      //console.log('Fetching booking details for ID:', bookingId);
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
    getCheckboxProps: (record) => ({
      disabled: record.status !== 'pending', // Chỉ cho phép chọn report có status 'pending'
    }),
  };

  const columns = [
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
        <Tag className={`status-${status}`}>
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
          {record.status === 'pending' && (
            <Button
              type="default"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openUpdateModal(record)}
            >
              Xử lý
            </Button>
          )}
        </Space>
      )
    }
  ];


  return (
    <div className="report-management">
      {/* Modern Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <Title level={1} className="welcome-title">
              <FlagOutlined />
              Quản lý báo cáo
            </Title>
            <Text className="welcome-subtitle">
              Quản lý và xử lý các báo cáo vi phạm từ người dùng
            </Text>
          </div>
          <div className="header-stats">
            <Badge count={stats.pendingReports} showZero>
              <Avatar size={50} icon={<WarningOutlined />} />
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
                  <FlagOutlined />
                </div>
                <div className="metric-details">
                  <Statistic
                    value={stats.totalReports}
                    valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#1890ff' }}
                  />
                  <Text className="metric-title">Tổng báo cáo</Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="metric-card warning">
              <div className="metric-content">
                <div className="metric-icon warning">
                  <WarningOutlined />
                </div>
                <div className="metric-details">
                  <Statistic
                    value={stats.pendingReports}
                    valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#faad14' }}
                  />
                  <Text className="metric-title">Chờ xử lý</Text>
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
                    value={stats.resolvedReports}
                    valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#52c41a' }}
                  />
                  <Text className="metric-title">Đã xử lý</Text>
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
                    value={stats.rejectedReports}
                    valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#ff4d4f' }}
                  />
                  <Text className="metric-title">Bị từ chối</Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Modern Filters Section */}
      <Card className="filter-card">
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <div className="filter-group">
              <Text strong>Trạng thái:</Text>
              <Select
                className="filter-select"
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
                placeholder="Chọn trạng thái"
              >
                <Option value="all">Tất cả</Option>
                <Option value="pending">Chờ xử lý</Option>
                <Option value="reviewed">Đã xử lý</Option>
                <Option value="dismissed">Đã bỏ qua</Option>
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <div className="filter-group">
              <Text strong>Loại đối tượng:</Text>
              <Select
                className="filter-select"
                value={filters.targetType}
                onChange={(value) => setFilters({ ...filters, targetType: value })}
                placeholder="Chọn loại"
              >
                <Option value="all">Tất cả</Option>
                <Option value="booking">Booking</Option>
                <Option value="tutor">Gia sư</Option>
                <Option value="learner">Học viên</Option>
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <div className="filter-group">
              <Text strong>Khoảng thời gian:</Text>
              <RangePicker
                className="filter-select"
                value={filters.dateRange}
                onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
              />
            </div>
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

      {/* Action Buttons */}
      <div className="action-buttons">
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={fetchReports}
          loading={loading}
        >
          Làm mới dữ liệu
        </Button>
        {selectedReports.length > 0 && (
          <>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => setBulkUpdateModalVisible(true)}
            >
              Xử lý hàng loạt ({selectedReports.length})
            </Button>
            <Button
              onClick={() => setSelectedReports([])}
            >
              Bỏ chọn tất cả
            </Button>
          </>
        )}
      </div>

      {/* Reports Table */}
      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="_id"
          loading={loading}
          rowSelection={rowSelection}
          rowClassName={(record) => record.status !== 'pending' ? 'processed-row' : ''}
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
              <Radio value="reviewed">Đã xử lý</Radio>
              <Radio value="dismissed">Bỏ qua</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="adminNotes"
            label="Ghi chú của admin"
            rules={[{ required: true, message: 'Vui lòng nhập ghi chú' }]}
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
            rules={[{ required: true, message: 'Vui lòng nhập ghi chú' }]}
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
                      //console.log('Booking ID:', bookingId);
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