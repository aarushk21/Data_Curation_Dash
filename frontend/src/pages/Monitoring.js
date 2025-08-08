import React from 'react';
import { useQuery } from 'react-query';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Progress,
  Alert,
} from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import styled from 'styled-components';

const StyledCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

// Mock Prometheus metrics data
const mockSystemMetrics = {
  cpuUsage: 45.2,
  memoryUsage: 67.8,
  diskUsage: 23.4,
  networkThroughput: 125.6,
  activeConnections: 234,
  errorRate: 0.5,
  responseTime: 245,
  throughput: 1250,
};

const mockPerformanceData = [
  { time: '00:00', cpu: 42, memory: 65, disk: 22, network: 120 },
  { time: '04:00', cpu: 38, memory: 62, disk: 23, network: 110 },
  { time: '08:00', cpu: 55, memory: 70, disk: 24, network: 140 },
  { time: '12:00', cpu: 68, memory: 75, disk: 25, network: 160 },
  { time: '16:00', cpu: 72, memory: 78, disk: 26, network: 180 },
  { time: '20:00', cpu: 58, memory: 72, disk: 25, network: 150 },
];

const mockPipelineMetrics = [
  { pipeline: 'Customer ETL', success: 95, duration: 135, records: 125430 },
  { pipeline: 'Sales Analytics', success: 88, duration: 330, records: 89200 },
  { pipeline: 'Inventory Sync', success: 72, duration: 105, records: 45600 },
  { pipeline: 'User Behavior', success: 98, duration: 45, records: 256780 },
];

const mockAlerts = [
  {
    id: '1',
    severity: 'critical',
    message: 'High CPU usage detected on server-01',
    timestamp: '2024-01-15 10:30:00',
    status: 'active',
  },
  {
    id: '2',
    severity: 'warning',
    message: 'Memory usage approaching threshold',
    timestamp: '2024-01-15 10:25:00',
    status: 'active',
  },
  {
    id: '3',
    severity: 'info',
    message: 'Pipeline "Inventory Sync" completed with warnings',
    timestamp: '2024-01-15 10:20:00',
    status: 'resolved',
  },
];

const Monitoring = () => {
  const { data: systemMetrics } = useQuery('systemMetrics', () => 
    Promise.resolve(mockSystemMetrics)
  );

  const { data: performanceData } = useQuery('performanceData', () => 
    Promise.resolve(mockPerformanceData)
  );

  const { data: pipelineMetrics } = useQuery('pipelineMetrics', () => 
    Promise.resolve(mockPipelineMetrics)
  );

  const { data: alerts } = useQuery('alerts', () => 
    Promise.resolve(mockAlerts)
  );

  const getSeverityColor = (severity) => {
    const colors = {
      critical: '#ff4d4f',
      warning: '#faad14',
      info: '#1890ff',
    };
    return colors[severity] || colors.info;
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      critical: <ExclamationCircleOutlined />,
      warning: <WarningOutlined />,
      info: <CheckCircleOutlined />,
    };
    return icons[severity] || icons.info;
  };

  const alertColumns = [
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity) => (
        <Tag color={getSeverityColor(severity)} icon={getSeverityIcon(severity)}>
          {severity.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'red' : 'green'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  const pipelineColumns = [
    {
      title: 'Pipeline',
      dataIndex: 'pipeline',
      key: 'pipeline',
    },
    {
      title: 'Success Rate',
      dataIndex: 'success',
      key: 'success',
      render: (success) => (
        <div>
          <div style={{ fontWeight: 'bold', color: success >= 90 ? '#52c41a' : success >= 80 ? '#faad14' : '#ff4d4f' }}>
            {success}%
          </div>
          <Progress percent={success} size="small" showInfo={false} />
        </div>
      ),
    },
    {
      title: 'Duration (s)',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => <span>{duration}s</span>,
    },
    {
      title: 'Records Processed',
      dataIndex: 'records',
      key: 'records',
      render: (records) => <span>{records.toLocaleString()}</span>,
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '24px', fontSize: '28px', fontWeight: 'bold' }}>
        System Monitoring
      </h1>

      {/* System Health Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <StyledCard>
            <Statistic
              title="CPU Usage"
              value={systemMetrics?.cpuUsage}
              suffix="%"
              valueStyle={{ color: systemMetrics?.cpuUsage > 80 ? '#ff4d4f' : systemMetrics?.cpuUsage > 60 ? '#faad14' : '#52c41a' }}
            />
            <Progress percent={systemMetrics?.cpuUsage} showInfo={false} />
          </StyledCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StyledCard>
            <Statistic
              title="Memory Usage"
              value={systemMetrics?.memoryUsage}
              suffix="%"
              valueStyle={{ color: systemMetrics?.memoryUsage > 80 ? '#ff4d4f' : systemMetrics?.memoryUsage > 60 ? '#faad14' : '#52c41a' }}
            />
            <Progress percent={systemMetrics?.memoryUsage} showInfo={false} />
          </StyledCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StyledCard>
            <Statistic
              title="Disk Usage"
              value={systemMetrics?.diskUsage}
              suffix="%"
              valueStyle={{ color: systemMetrics?.diskUsage > 80 ? '#ff4d4f' : systemMetrics?.diskUsage > 60 ? '#faad14' : '#52c41a' }}
            />
            <Progress percent={systemMetrics?.diskUsage} showInfo={false} />
          </StyledCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StyledCard>
            <Statistic
              title="Error Rate"
              value={systemMetrics?.errorRate}
              suffix="%"
              valueStyle={{ color: systemMetrics?.errorRate > 5 ? '#ff4d4f' : systemMetrics?.errorRate > 1 ? '#faad14' : '#52c41a' }}
            />
          </StyledCard>
        </Col>
      </Row>

      {/* Performance Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <StyledCard title="System Performance (Last 24 Hours)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="cpu"
                  stroke="#ff4d4f"
                  strokeWidth={2}
                  name="CPU (%)"
                />
                <Line
                  type="monotone"
                  dataKey="memory"
                  stroke="#1890ff"
                  strokeWidth={2}
                  name="Memory (%)"
                />
                <Line
                  type="monotone"
                  dataKey="disk"
                  stroke="#52c41a"
                  strokeWidth={2}
                  name="Disk (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </StyledCard>
        </Col>
        <Col xs={24} lg={12}>
          <StyledCard title="Network Throughput (Last 24 Hours)">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="network"
                  stroke="#722ed1"
                  fill="#722ed1"
                  fillOpacity={0.3}
                  name="Network (MB/s)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </StyledCard>
        </Col>
      </Row>

      {/* Pipeline Performance */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <StyledCard title="Pipeline Success Rates">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pipelineMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="pipeline" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="success" fill="#52c41a" name="Success Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </StyledCard>
        </Col>
        <Col xs={24} lg={12}>
          <StyledCard title="Pipeline Performance Details">
            <Table
              columns={pipelineColumns}
              dataSource={pipelineMetrics}
              rowKey="pipeline"
              pagination={false}
              size="small"
            />
          </StyledCard>
        </Col>
      </Row>

      {/* Alerts */}
      <StyledCard title="System Alerts">
        <Table
          columns={alertColumns}
          dataSource={alerts}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </StyledCard>

      {/* Prometheus Integration Info */}
      <StyledCard title="Prometheus Integration">
        <Alert
          message="Prometheus Metrics"
          description="System metrics are collected via Prometheus and displayed in real-time. Metrics include CPU, memory, disk usage, network throughput, and application-specific metrics."
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Tag color="blue">Prometheus Endpoint: /metrics</Tag>
          <Tag color="green">Scrape Interval: 15s</Tag>
          <Tag color="orange">Retention: 15 days</Tag>
          <Tag color="purple">Grafana Dashboard: Available</Tag>
        </div>
      </StyledCard>
    </div>
  );
};

export default Monitoring; 