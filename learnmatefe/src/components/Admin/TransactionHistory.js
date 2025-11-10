import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Row,
  Col,
  Button,
  Tag,
  Space,
  Input,
  Select,
  DatePicker,
  Typography,
  Avatar,
  Tooltip,
  Badge
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  HistoryOutlined,
  UserOutlined,
  DownloadOutlined,
  FilterOutlined
} from '@ant-design/icons';
import AdminService from '../../Service/ApiService/AdminService';
import './TransactionHistory.scss';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    type: 'all',
    userId: '',
    dateRange: null
  });

  useEffect(() => {
    fetchTransactions();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        type: filters.type !== 'all' ? filters.type : undefined,
        userId: filters.userId || undefined,
        startDate: filters.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: filters.dateRange?.[1]?.format('YYYY-MM-DD')
      };

      const response = await AdminService.getTransactionHistory(params);
      if (response && response.success) {
        setTransactions(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.pagination.totalItems
        }));
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const getTypeColor = (type) => {
    const colors = {
      topup: 'green',
      withdraw: 'red', 
      earning: 'blue',
      spend: 'orange',
      refund: 'purple'
    };
    return colors[type] || 'default';
  };

  const getTypeText = (type) => {
    const texts = {
      topup: 'Nạp tiền',
      withdraw: 'Rút tiền',
      earning: 'Thu nhập',
      spend: 'Chi tiêu',
      refund: 'Hoàn tiền'
    };
    return texts[type] || type;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'topup': return '⬆️';
      case 'withdraw': return '⬇️';
      case 'earning': return '💰';
      case 'spend': return '💳';
      case 'refund': return '🔄';
      default: return '💵';
    }
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
      title: 'Loại giao dịch',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type) => (
        <Tag color={getTypeColor(type)}>
          {getTypeIcon(type)} {getTypeText(type)}
        </Tag>
      )
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (amount, record) => (
        <Text 
          strong 
          style={{ 
            color: record.balanceChange > 0 ? '#52c41a' : '#f5222d'
          }}
        >
          {record.balanceChange > 0 ? '+' : ''}{formatCurrency(amount)}
        </Text>
      )
    },
    {
      title: 'Thay đổi số dư',
      dataIndex: 'balanceChange',
      key: 'balanceChange',
      width: 150,
      render: (balanceChange) => (
        <Text 
          strong 
          style={{ 
            color: balanceChange > 0 ? '#52c41a' : '#f5222d'
          }}
        >
          {balanceChange > 0 ? '+' : ''}{formatCurrency(balanceChange)}
        </Text>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const statusConfig = {
          success: { color: 'green', text: 'Thành công' },
          pending: { color: 'orange', text: 'Chờ xử lý' },
          failed: { color: 'red', text: 'Thất bại' }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (description) => (
        <Tooltip title={description}>
          <Text>{description}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Ngày giao dịch',
      dataIndex: 'date',
      key: 'date',
      width: 180,
      render: (date) => (
        <div>
          <div>{new Date(date).toLocaleDateString('vi-VN')}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {new Date(date).toLocaleTimeString('vi-VN')}
          </Text>
        </div>
      )
    }
  ];

  return (
    <div className="transaction-history">
      <div className="page-header">
        <Title level={2}>
          <HistoryOutlined /> Lịch sử Giao dịch
        </Title>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={5}>
            <Input
              placeholder="ID người dùng..."
              prefix={<SearchOutlined />}
              value={filters.userId}
              onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="Loại giao dịch"
              value={filters.type}
              onChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            >
              <Option value="all">Tất cả loại</Option>
              <Option value="topup">Nạp tiền</Option>
              <Option value="withdraw">Rút tiền</Option>
              <Option value="earning">Thu nhập</Option>
              <Option value="spend">Chi tiêu</Option>
              <Option value="refund">Hoàn tiền</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['Từ ngày', 'Đến ngày']}
              value={filters.dateRange}
              onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
            />
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setFilters({
                    type: 'all',
                    userId: '',
                    dateRange: null
                  });
                  fetchTransactions();
                }}
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() => {
                  // TODO: Implement export functionality
                  console.log('Export transactions');
                }}
              >
                Xuất Excel
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <div className="summary-card">
              <div className="summary-icon topup">⬆️</div>
              <div className="summary-content">
                <div className="summary-title">Nạp tiền</div>
                <div className="summary-value">
                  {transactions.filter(t => t.type === 'topup').length} giao dịch
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <div className="summary-card">
              <div className="summary-icon withdraw">⬇️</div>
              <div className="summary-content">
                <div className="summary-title">Rút tiền</div>
                <div className="summary-value">
                  {transactions.filter(t => t.type === 'withdraw').length} giao dịch
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <div className="summary-card">
              <div className="summary-icon earning">💰</div>
              <div className="summary-content">
                <div className="summary-title">Thu nhập</div>
                <div className="summary-value">
                  {transactions.filter(t => t.type === 'earning').length} giao dịch
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <div className="summary-card">
              <div className="summary-icon spend">💳</div>
              <div className="summary-content">
                <div className="summary-title">Chi tiêu</div>
                <div className="summary-value">
                  {transactions.filter(t => t.type === 'spend').length} giao dịch
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} giao dịch`
          }}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
        />
      </Card>
    </div>
  );
};

export default TransactionHistory;