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
  Tooltip,
  Avatar,
  Descriptions,
  Typography,
  Badge,
  Divider
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  DollarOutlined,
  BankOutlined,
  UserOutlined
} from '@ant-design/icons';
import AdminService from '../../Service/ApiService/AdminService';
import './WithdrawalManagement.scss';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Title, Text } = Typography;

const WithdrawalManagement = () => {
  const [withdrawals, setWithdrawals] = useState([]);
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
    search: '',
    dateRange: null
  });

  // Modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  // Form
  const [updateForm] = Form.useForm();

  useEffect(() => {
    fetchWithdrawals();
    fetchStatistics();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        status: filters.status !== 'all' ? filters.status : undefined,
        startDate: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: filters.dateRange?.[1]?.format('YYYY-MM-DD')
      };

      const response = await AdminService.getAllWithdrawals(params);
      if (response && response.success) {
        setWithdrawals(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.pagination.totalItems
        }));
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      message.error('Không thể tải danh sách rút tiền');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await AdminService.getWithdrawalStats();
      if (response && response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

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
      rejected: 'red',
      completed: 'green'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ xử lý',
      approved: 'Đã duyệt',
      rejected: 'Từ chối',
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

  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
      width: 100,
      render: (text) => (
        <Text code copyable={{ text }}>
          {text.slice(-8)}
        </Text>
      )
    },
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
        <Tag color={getStatusColor(status)}>
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
      <div className="page-header">
        <Title level={2}>
          <DollarOutlined /> Quản lý Rút tiền
        </Title>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng yêu cầu"
              value={statistics.totalWithdrawals || 0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Chờ xử lý"
              value={statistics.pendingWithdrawals || 0}
              prefix={<Badge status="processing" />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã hoàn thành"
              value={statistics.completedWithdrawals || 0}
              prefix={<Badge status="success" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số tiền chờ"
              value={statistics.pendingWithdrawalAmount || 0}
              formatter={(value) => formatCurrency(value)}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Input
              placeholder="Tìm kiếm..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Trạng thái"
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="pending">Chờ xử lý</Option>
              <Option value="approved">Đã duyệt</Option>
              <Option value="rejected">Từ chối</Option>
              <Option value="completed">Hoàn thành</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['Từ ngày', 'Đến ngày']}
              value={filters.dateRange}
              onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
            />
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

      {/* Table */}
      <Card>
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
                <div><strong>Tên ngân hàng:</strong> {selectedWithdrawal.bankName}</div>
                <div><strong>Số tài khoản:</strong> {selectedWithdrawal.accountNumber}</div>
                <div><strong>Tên tài khoản:</strong> {selectedWithdrawal.accountName}</div>
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
              <Option value="completed">Hoàn thành</Option>
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