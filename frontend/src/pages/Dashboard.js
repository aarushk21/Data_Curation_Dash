import React from 'react';
import { Row, Col, Card, Statistic, Table, Progress, Tag, Button } from 'antd';
import { useQuery } from 'react-query';
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styled from 'styled-components';

const StyledCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transition: box-shadow 0.3s ease;
  }
`;

const MetricCard = styled(Card)`
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .ant-statistic-title {
    color: #666;
    font-size: 14px;
  }
  
  .ant-statistic-content {
    font-size: 24px;
    font-weight: bold;
  }
`;

// Mock data - replace with actual API calls
const mockPipelineMetrics = {
  totalPipelines: 12,
  activePipelines: 8,
  failedPipelines: 2,
  pendingPipelines: 2,
  successRate: 85,
  avgExecutionTime: 45,
};

const mockExecutionData = [
  { time: '00:00', executions: 5, failures: 1 },
  { time: '04:00', executions: 8, failures: 0 },
  { time: '08:00', executions: 12, failures: 2 },
  { time: '12:00', executions: 15, failures: 1 },
  { time: '16:00', executions: 10, failures: 0 },
  { time: '20:00', executions: 6, failures: 1 },
];

const mockPipelineStatus = [
  { name: 'Success', value: 85, color: '#52c41a' },
  { name: 'Failed', value: 10, color: '#ff4d4f' },
  { name: 'Pending', value: 5, color: '#faad14' },
];

const mockRecentPipelines = [
  {
    key: '1',
    name: 'Customer Data ETL',
    status: 'success',
    lastRun: '2024-01-15 10:30',
    duration: '2m 15s',
    records: '125,430',
  },
  {
    key: '2',
    name: 'Sales Analytics',
    status: 'running',
    lastRun: '2024-01-15 10:25',
    duration: '1m 45s',
    records: '89,200',
  },
  {
    key: '3',
    name: 'Inventory Sync',
    status: 'failed',
    lastRun: '2024-01-15 10:20',
    duration: '0m 30s',
    records: '0',
  },
  {
    key: '4',
    name: 'User Behavior',
    status: 'success',
    lastRun: '2024-01-15 10:15',
    duration: '3m 10s',
    records: '256,780',
  },
];

const Dashboard = () => {
  // Mock API calls - replace with actual API endpoints
  const { data: metrics, isLoading: metricsLoading } = useQuery('pipelineMetrics', () => 
    Promise.resolve(mockPipelineMetrics)
  );

  const { data: executionData, isLoading: executionLoading } = useQuery('executionData', () => 
    Promise.resolve(mockExecutionData)
  );

  const { data: recentPipelines, isLoading: pipelinesLoading } = useQuery('recentPipelines', () => 
    Promise.resolve(mockRecentPipelines)
  );

  const getStatusTag = (status) => {
    const statusConfig = {
      success: { color: 'success', icon: <CheckCircleOutlined /> },
      running: { color: 'processing', icon: <PlayCircleOutlined /> },
      failed: { color: 'error', icon: <ExclamationCircleOutlined /> },
      pending: { color: 'warning', icon: <ClockCircleOutlined /> },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Tag color={config.color} icon={config.icon}>
        {status.toUpperCase()}
      </Tag>
    );
  };

  const pipelineColumns = [
    {
      title: 'Pipeline Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Last Run',
      dataIndex: 'lastRun',
      key: 'lastRun',
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Records Processed',
      dataIndex: 'records',
      key: 'records',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Button type="link" size="small">
          View Details
        </Button>
      ),
    },
  ];

  if (metricsLoading || executionLoading || pipelinesLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '24px', fontSize: '28px', fontWeight: 'bold' }}>
        Dashboard
      </h1>

      {/* Metrics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard>
            <Statistic
              title="Total Pipelines"
              value={metrics.totalPipelines}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </MetricCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard>
            <Statistic
              title="Active Pipelines"
              value={metrics.activePipelines}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </MetricCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard>
            <Statistic
              title="Success Rate"
              value={metrics.successRate}
              suffix="%"
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </MetricCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <MetricCard>
            <Statistic
              title="Avg Execution Time"
              value={metrics.avgExecutionTime}
              suffix="min"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </MetricCard>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={16}>
          <StyledCard title="Pipeline Executions (Last 24 Hours)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={executionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="executions"
                  stroke="#1890ff"
                  strokeWidth={2}
                  name="Executions"
                />
                <Line
                  type="monotone"
                  dataKey="failures"
                  stroke="#ff4d4f"
                  strokeWidth={2}
                  name="Failures"
                />
              </LineChart>
            </ResponsiveContainer>
          </StyledCard>
        </Col>
        <Col xs={24} lg={8}>
          <StyledCard title="Pipeline Status Distribution">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockPipelineStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {mockPipelineStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </StyledCard>
        </Col>
      </Row>

      {/* Recent Pipelines */}
      <StyledCard title="Recent Pipeline Executions">
        <Table
          columns={pipelineColumns}
          dataSource={recentPipelines}
          pagination={false}
          size="middle"
        />
      </StyledCard>
    </div>
  );
};

export default Dashboard; 