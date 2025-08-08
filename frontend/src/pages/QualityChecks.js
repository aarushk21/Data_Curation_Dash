import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tag,
  Tooltip,
  Popconfirm,
  Progress,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import styled from 'styled-components';

const { Option } = Select;
const { TextArea } = Input;

const StyledCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

// Mock data - replace with actual API calls
const mockQualityChecks = [
  {
    id: '1',
    name: 'Customer Email Validation',
    description: 'Validates customer email format and uniqueness',
    type: 'completeness',
    status: 'active',
    threshold: 95,
    currentScore: 98,
    lastRun: '2024-01-15 10:30:00',
    owner: 'admin',
  },
  {
    id: '2',
    name: 'Product Price Range Check',
    description: 'Ensures product prices are within valid range',
    type: 'accuracy',
    status: 'active',
    threshold: 90,
    currentScore: 87,
    lastRun: '2024-01-15 10:25:00',
    owner: 'product-team',
  },
  {
    id: '3',
    name: 'Order Date Consistency',
    description: 'Validates order dates are not in the future',
    type: 'consistency',
    status: 'warning',
    threshold: 100,
    currentScore: 99,
    lastRun: '2024-01-15 10:20:00',
    owner: 'order-team',
  },
];

const mockQualityTrends = [
  { date: '2024-01-10', completeness: 95, accuracy: 88, consistency: 92 },
  { date: '2024-01-11', completeness: 96, accuracy: 89, consistency: 93 },
  { date: '2024-01-12', completeness: 94, accuracy: 87, consistency: 91 },
  { date: '2024-01-13', completeness: 97, accuracy: 90, consistency: 94 },
  { date: '2024-01-14', completeness: 98, accuracy: 87, consistency: 99 },
  { date: '2024-01-15', completeness: 98, accuracy: 87, consistency: 99 },
];

const QualityChecks = () => {
  const queryClient = useQueryClient();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState(null);
  const [form] = Form.useForm();

  const { data: qualityChecks, isLoading } = useQuery('qualityChecks', () => 
    Promise.resolve(mockQualityChecks)
  );

  const { data: qualityTrends } = useQuery('qualityTrends', () => 
    Promise.resolve(mockQualityTrends)
  );

  const createQualityCheckMutation = useMutation(
    (checkData) => Promise.resolve(checkData),
    {
      onSuccess: () => {
        message.success('Quality check created successfully');
        setIsModalVisible(false);
        form.resetFields();
        queryClient.invalidateQueries('qualityChecks');
      },
      onError: () => {
        message.error('Failed to create quality check');
      },
    }
  );

  const updateQualityCheckMutation = useMutation(
    (checkData) => Promise.resolve(checkData),
    {
      onSuccess: () => {
        message.success('Quality check updated successfully');
        setIsModalVisible(false);
        setSelectedCheck(null);
        form.resetFields();
        queryClient.invalidateQueries('qualityChecks');
      },
      onError: () => {
        message.error('Failed to update quality check');
      },
    }
  );

  const deleteQualityCheckMutation = useMutation(
    (id) => Promise.resolve(id),
    {
      onSuccess: () => {
        message.success('Quality check deleted successfully');
        queryClient.invalidateQueries('qualityChecks');
      },
      onError: () => {
        message.error('Failed to delete quality check');
      },
    }
  );

  const handleCreateCheck = () => {
    setSelectedCheck(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditCheck = (check) => {
    setSelectedCheck(check);
    form.setFieldsValue({
      name: check.name,
      description: check.description,
      type: check.type,
      threshold: check.threshold,
      rule: 'SELECT * FROM data WHERE condition', // Mock rule
    });
    setIsModalVisible(true);
  };

  const handleDeleteCheck = (id) => {
    deleteQualityCheckMutation.mutate(id);
  };

  const handleSubmit = (values) => {
    const checkData = {
      ...values,
      id: selectedCheck?.id,
    };

    if (selectedCheck) {
      updateQualityCheckMutation.mutate(checkData);
    } else {
      createQualityCheckMutation.mutate(checkData);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      active: { color: 'success', icon: <CheckCircleOutlined /> },
      warning: { color: 'warning', icon: <WarningOutlined /> },
      failed: { color: 'error', icon: <ExclamationCircleOutlined /> },
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return (
      <Tag color={config.color} icon={config.icon}>
        {status.toUpperCase()}
      </Tag>
    );
  };

  const getTypeTag = (type) => {
    const typeConfig = {
      completeness: { color: 'blue', text: 'Completeness' },
      accuracy: { color: 'green', text: 'Accuracy' },
      consistency: { color: 'orange', text: 'Consistency' },
      timeliness: { color: 'purple', text: 'Timeliness' },
    };
    
    const config = typeConfig[type] || typeConfig.completeness;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getScoreColor = (score, threshold) => {
    if (score >= threshold) return '#52c41a';
    if (score >= threshold * 0.9) return '#faad14';
    return '#ff4d4f';
  };

  const columns = [
    {
      title: 'Quality Check Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.description}</div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => getTypeTag(type),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Quality Score',
      key: 'score',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', color: getScoreColor(record.currentScore, record.threshold) }}>
            {record.currentScore}%
          </div>
          <Progress
            percent={record.currentScore}
            size="small"
            strokeColor={getScoreColor(record.currentScore, record.threshold)}
            showInfo={false}
          />
          <div style={{ fontSize: '12px', color: '#666' }}>
            Threshold: {record.threshold}%
          </div>
        </div>
      ),
    },
    {
      title: 'Last Run',
      dataIndex: 'lastRun',
      key: 'lastRun',
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      key: 'owner',
      render: (owner) => <Tag>{owner}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
            />
          </Tooltip>
          <Tooltip title="Edit Quality Check">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditCheck(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Quality Check">
            <Popconfirm
              title="Are you sure you want to delete this quality check?"
              onConfirm={() => handleDeleteCheck(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
          Quality Checks
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateCheck}
        >
          Create Quality Check
        </Button>
      </div>

      {/* Quality Metrics Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <StyledCard>
            <Statistic
              title="Overall Quality Score"
              value={94.5}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </StyledCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StyledCard>
            <Statistic
              title="Active Checks"
              value={qualityChecks?.length || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </StyledCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StyledCard>
            <Statistic
              title="Failed Checks"
              value={1}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </StyledCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StyledCard>
            <Statistic
              title="Warning Checks"
              value={1}
              valueStyle={{ color: '#faad14' }}
            />
          </StyledCard>
        </Col>
      </Row>

      {/* Quality Trends Chart */}
      <StyledCard title="Quality Trends (Last 7 Days)">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={qualityTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Line
              type="monotone"
              dataKey="completeness"
              stroke="#1890ff"
              strokeWidth={2}
              name="Completeness"
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              stroke="#52c41a"
              strokeWidth={2}
              name="Accuracy"
            />
            <Line
              type="monotone"
              dataKey="consistency"
              stroke="#faad14"
              strokeWidth={2}
              name="Consistency"
            />
          </LineChart>
        </ResponsiveContainer>
      </StyledCard>

      {/* Quality Checks Table */}
      <StyledCard title="Quality Checks">
        <Table
          columns={columns}
          dataSource={qualityChecks}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} quality checks`,
          }}
        />
      </StyledCard>

      {/* Create/Edit Quality Check Modal */}
      <Modal
        title={selectedCheck ? 'Edit Quality Check' : 'Create Quality Check'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedCheck(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
        okText={selectedCheck ? 'Update' : 'Create'}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Quality Check Name"
            rules={[{ required: true, message: 'Please enter quality check name' }]}
          >
            <Input placeholder="Enter quality check name" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={3} placeholder="Enter quality check description" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="Quality Type"
            rules={[{ required: true, message: 'Please select quality type' }]}
          >
            <Select placeholder="Select quality type">
              <Option value="completeness">Completeness</Option>
              <Option value="accuracy">Accuracy</Option>
              <Option value="consistency">Consistency</Option>
              <Option value="timeliness">Timeliness</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="threshold"
            label="Quality Threshold (%)"
            rules={[{ required: true, message: 'Please enter threshold' }]}
          >
            <Input type="number" min={0} max={100} placeholder="e.g., 95" />
          </Form.Item>
          
          <Form.Item
            name="rule"
            label="Quality Rule (SQL)"
            rules={[{ required: true, message: 'Please enter quality rule' }]}
          >
            <TextArea rows={6} placeholder="Enter SQL query for quality check..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QualityChecks; 