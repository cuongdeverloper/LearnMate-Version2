import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Tag,
  Space,
  Input,
  Select,
  DatePicker,
  Modal,
  Form,
  message,
  Avatar,
  Descriptions,
  Typography,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  CheckOutlined,
  ReloadOutlined,
  DollarOutlined,
  BankOutlined,
  UserOutlined,
  WalletOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import AdminService from '../../Service/ApiService/AdminService';
import './WithdrawalManagement.scss';
import { useCallback } from 'react';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Title, Text } = Typography;

const WithdrawalManagement = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [stats, setStats] = useState({
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    approvedWithdrawals: 0,
    rejectedWithdrawals: 0,
    totalAmount: 0,
    pendingAmount: 0
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
    search: '',
    dateRange: null
  });

  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  // Form
  const [updateForm] = Form.useForm();
  const calculateStatisticsFromWithdrawals = useCallback((withdrawalsList) => {
  const pendingWithdrawals = withdrawalsList.filter(w => w.status === 'pending');
  const pendingAmount = pendingWithdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);

  const stats = {
    totalWithdrawals: withdrawalsList.length,
    pendingWithdrawals: pendingWithdrawals.length,
    approvedWithdrawals: withdrawalsList.filter(w => w.status === 'approved').length,
    rejectedWithdrawals: withdrawalsList.filter(w => w.status === 'rejected').length,
    totalAmount: withdrawalsList.reduce((sum, w) => sum + (w.amount || 0), 0),
    pendingAmount
  };

  setStats(stats);
}, []);

// 🟩 2. Then define fetchWithdrawals using it safely
const fetchWithdrawals = useCallback(async () => {
  try {
    setLoading(true);
    const params = {
      page: pagination.current,
      limit: pagination.pageSize,
      status: filters.status !== 'all' ? filters.status : undefined,
      startDate: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
      endDate: filters.dateRange?.[1]?.format('YYYY-MM-DD'),
    };

    const response = await AdminService.getAllWithdrawals(params);
    if (response && response.success) {
      const withdrawalsList = response.data || [];
      setWithdrawals(withdrawalsList);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.totalItems || withdrawalsList.length,
      }));
      calculateStatisticsFromWithdrawals(withdrawalsList);
    }
  } catch (error) {
    message.error('Không thể tải danh sách rút tiền');
  } finally {
    setLoading(false);
  }
}, [pagination, filters, calculateStatisticsFromWithdrawals]);


  const fetchStatistics = useCallback(async () => {
    try {
      const response = await AdminService.getWithdrawalStats();
      if (response && response.success && response.data) {
        const data = response.data;
        setStats(prev => ({
          ...prev,
          totalWithdrawals: data.totalWithdrawals || prev.totalWithdrawals,
          pendingWithdrawals: data.pendingWithdrawals || prev.pendingWithdrawals,
          approvedWithdrawals: data.approvedWithdrawals || prev.approvedWithdrawals,
          rejectedWithdrawals: data.rejectedWithdrawals || prev.rejectedWithdrawals,
          totalAmount: data.totalAmount || prev.totalAmount,
          pendingAmount: data.pendingAmount || data.pendingWithdrawalAmount || prev.pendingAmount
        }));
      }
    } catch (error) {
      console.error(error);
    }
  }, []);


  useEffect(() => {
  const loadData = async () => {
    await fetchWithdrawals();
    fetchStatistics();
  };
  loadData();
}, [fetchWithdrawals, fetchStatistics, pagination.current, pagination.pageSize, filters]);


  // Debug useEffect to track stats changes
  useEffect(() => {
    //console.log('Stats updated:', stats);
    //console.log('Pending Amount specifically:', stats.pendingAmount);

    // If pending amount is still 0 but we have withdrawals, something might be wrong
    if (stats.pendingAmount === 0 && withdrawals.length > 0) {
      console.warn('Pending amount is 0 but we have withdrawals. Let me check withdrawals data:');
      //console.log('Current withdrawals:', withdrawals);

      // Manual calculation as fallback
      const manualPendingAmount = withdrawals
        .filter(w => w.status === 'pending')
        .reduce((sum, w) => sum + (Number(w.amount) || 0), 0);

      //console.log('Manual calculation of pending amount:', manualPendingAmount);

      if (manualPendingAmount > 0 && stats.pendingAmount === 0) {
        //console.log('Manual calculation found pending amount, updating stats...');
        setStats(prev => ({
          ...prev,
          pendingAmount: manualPendingAmount
        }));
      }
    }
  }, [stats, withdrawals]);


  

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleViewDetails = async (withdrawal) => {
    try {
      const response = await AdminService.getWithdrawalDetails(withdrawal._id);
      if (response && response.success) {
        setSelectedWithdrawal(response.data);
        setDetailModalVisible(true);
      }
    } catch (error) {
      console.error('Error fetching withdrawal details:', error);
      message.error('Không thể tải chi tiết yêu cầu rút tiền');
    }
  };

  const handleUpdateStatus = async (values) => {
    try {
      setUpdateModalVisible(false);

      const hideLoading = message.loading('Đang cập nhật trạng thái...', 0);

      const response = await AdminService.updateWithdrawalStatus(selectedWithdrawal._id, values);

      hideLoading();

      if (response && response.success) {
        message.success('Cập nhật trạng thái thành công');

        // Update local state
        setWithdrawals(prevWithdrawals =>
          prevWithdrawals.map(withdrawal =>
            withdrawal._id === selectedWithdrawal._id
              ? { ...withdrawal, status: values.status, adminNotes: values.adminNotes }
              : withdrawal
          )
        );

        fetchStatistics();
      } else {
        throw new Error(response?.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error updating withdrawal status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể cập nhật trạng thái';
      message.error(`Lỗi: ${errorMessage}`, 5);

      // Reopen modal with original values
      updateForm.setFieldsValue({
        status: selectedWithdrawal.status,
        adminNotes: selectedWithdrawal.adminNotes || ''
      });
      setUpdateModalVisible(true);
    }
  };

  const openUpdateModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    updateForm.setFieldsValue({
      status: withdrawal.status,
      adminNotes: withdrawal.adminNotes || ''
    });
    setUpdateModalVisible(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      approved: 'blue',
      rejected: 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ xử lý',
      approved: 'Đã duyệt',
      rejected: 'Từ chối'
    };
    return texts[status] || status;
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '0 ₫';
    }
    try {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error, 'Amount:', amount);
      return `${amount} ₫`;
    }
  };

  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.userId?.image}
            icon={<UserOutlined />}
            size="small"
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.userId?.username}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.userId?.email}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (amount) => (
        <Text strong style={{ color: '#1890ff' }}>
          {formatCurrency(amount)}
        </Text>
      )
    },
    {
      title: 'Phương thức',
      dataIndex: 'method',
      key: 'method',
      width: 120,
      render: (method) => (
        <Tag icon={<BankOutlined />} color="blue">
          {method === 'bank' ? 'Ngân hàng' : method}
        </Tag>
      )
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
      width: 150,
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Xem
          </Button>
          {record.status === 'pending' && (
            <Button
              type="default"
              size="small"
              icon={<CheckOutlined />}
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
    <div className="withdrawal-management">
      {/* Modern Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <Title level={1} className="welcome-title">
              <WalletOutlined />
              Quản lý rút tiền
            </Title>
            <Text className="welcome-subtitle">
              Quản lý và xử lý các yêu cầu rút tiền từ người dùng
            </Text>
          </div>
          <div className="header-stats">
            <Badge count={stats.pendingWithdrawals} showZero>
              <Avatar size={50} icon={<ClockCircleOutlined />} />
            </Badge>
            <div className="current-date">
              <CalendarOutlined />
              {new Date().toLocaleDateString('vi-VN')}
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
                  <WalletOutlined />
                </div>
                <div className="metric-details">
                  <Statistic
                    value={stats.totalWithdrawals}
                    valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#1890ff' }}
                  />
                  <Text className="metric-title">Tổng yêu cầu</Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="metric-card warning">
              <div className="metric-content">
                <div className="metric-icon warning">
                  <ClockCircleOutlined />
                </div>
                <div className="metric-details">
                  <Statistic
                    value={stats.pendingWithdrawals}
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
                    value={stats.approvedWithdrawals}
                    valueStyle={{ fontSize: '28px', fontWeight: 'bold', color: '#52c41a' }}
                  />
                  <Text className="metric-title">Đã duyệt</Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="metric-card danger">
              <div className="metric-content">
                <div className="metric-icon danger">
                  <DollarOutlined />
                </div>
                <div className="metric-details">
                  <Statistic
                    value={stats.pendingAmount || 0}
                    formatter={(value) => {
                      //console.log('Pending Amount - Raw value:', value, 'Type:', typeof value);
                      return formatCurrency(Number(value) || 0);
                    }}
                    valueStyle={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}
                  />
                  <Text className="metric-title">Tiền chờ duyệt</Text>
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
              <Text strong>Tìm kiếm:</Text>
              <Input
                className="filter-select"
                placeholder="Tìm theo tên, email..."
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                allowClear
              />
            </div>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <div className="filter-group">
              <Text strong>Trạng thái:</Text>
              <Select
                className="filter-select"
                placeholder="Chọn trạng thái"
                value={filters.status}
                onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="pending">Chờ xử lý</Option>
                <Option value="approved">Đã duyệt</Option>
                <Option value="rejected">Từ chối</Option>
              </Select>
            </div>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <div className="filter-group">
              <Text strong>Khoảng thời gian:</Text>
              <RangePicker
                className="filter-select"
                placeholder={['Từ ngày', 'Đến ngày']}
                value={filters.dateRange}
                onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
              />
            </div>
          </Col>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setFilters({
                  status: 'all',
                  search: '',
                  dateRange: null
                });
                fetchWithdrawals();
              }}
            >
              Làm mới
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Action Buttons */}
      <div className="action-buttons">
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={fetchWithdrawals}
          loading={loading}
        >
          Làm mới dữ liệu
        </Button>
      </div>

      {/* Withdrawals Table */}
      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={withdrawals}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} yêu cầu rút tiền`
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết yêu cầu rút tiền"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
          selectedWithdrawal?.status === 'pending' && (
            <Button
              key="update"
              type="primary"
              onClick={() => {
                setDetailModalVisible(false);
                openUpdateModal(selectedWithdrawal);
              }}
            >
              Xử lý yêu cầu
            </Button>
          )
        ]}
        width={800}
      >
        {selectedWithdrawal && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="ID" span={2}>
              <Text code copyable={{ text: selectedWithdrawal._id }}>
                {selectedWithdrawal._id}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Người dùng">
              <Space>
                <Avatar
                  src={selectedWithdrawal.userId?.image}
                  icon={<UserOutlined />}
                />
                {selectedWithdrawal.userId?.username}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedWithdrawal.userId?.email}
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền">
              <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                {formatCurrency(selectedWithdrawal.amount)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(selectedWithdrawal.status)}>
                {getStatusText(selectedWithdrawal.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức" span={2}>
              <Tag icon={<BankOutlined />} color="blue">
                {selectedWithdrawal.method === 'bank' ? 'Ngân hàng' : selectedWithdrawal.method}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thông tin ngân hàng" span={2}>
              <div>
                <div><strong>Tên ngân hàng:</strong> {selectedWithdrawal.bankAccount?.bankName || 'Không có thông tin'}</div>
                <div><strong>Số tài khoản:</strong> {selectedWithdrawal.bankAccount?.accountNumber || 'Không có thông tin'}</div>
                <div><strong>Tên tài khoản:</strong> {selectedWithdrawal.bankAccount?.accountHolderName || 'Không có thông tin'}</div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(selectedWithdrawal.createdAt).toLocaleString('vi-VN')}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày xử lý">
              {selectedWithdrawal.processedAt
                ? new Date(selectedWithdrawal.processedAt).toLocaleString('vi-VN')
                : 'Chưa xử lý'
              }
            </Descriptions.Item>
            {selectedWithdrawal.processedBy && (
              <Descriptions.Item label="Người xử lý" span={2}>
                {selectedWithdrawal.processedBy.username} ({selectedWithdrawal.processedBy.email})
              </Descriptions.Item>
            )}
            {selectedWithdrawal.adminNotes && (
              <Descriptions.Item label="Ghi chú admin" span={2}>
                <Text>{selectedWithdrawal.adminNotes}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        title="Cập nhật trạng thái yêu cầu rút tiền"
        open={updateModalVisible}
        onCancel={() => setUpdateModalVisible(false)}
        onOk={() => updateForm.submit()}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form
          form={updateForm}
          layout="vertical"
          onFinish={handleUpdateStatus}
        >
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="approved">Duyệt</Option>
              <Option value="rejected">Từ chối</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="adminNotes"
            label="Ghi chú"
          >
            <TextArea
              rows={4}
              placeholder="Nhập ghi chú về quyết định này..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WithdrawalManagement;