import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Select,
  Tag,
  Modal,
  message,
  Tooltip,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

const { Option } = Select;
const { Search } = Input;

const StyledCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ActionButton = styled(Button)`
  margin-right: 8px;
`;

// Mock data - replace with actual API calls
const mockPipelines = [
  {
    id: '1',
    name: 'Customer Data ETL',
    description: 'ETL pipeline for customer data processing',
    status: 'active',
    lastRun: '2024-01-15 10:30:00',
    nextRun: '2024-01-15 11:30:00',
    successRate: 95,
    avgDuration: '2m 15s',
    schedule: 'hourly',
    owner: 'admin',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Sales Analytics',
    description: 'Analytics pipeline for sales data',
    status: 'paused',
    lastRun: '2024-01-15 09:00:00',
    nextRun: '2024-01-16 09:00:00',
    successRate: 88,
    avgDuration: '5m 30s',
    schedule: 'daily',
    owner: 'analytics-team',
    createdAt: '2024-01-05',
  },
  {
    id: '3',
    name: 'Inventory Sync',
    description: 'Inventory synchronization pipeline',
    status: 'failed',
    lastRun: '2024-01-15 08:00:00',
    nextRun: '2024-01-15 09:00:00',
    successRate: 72,
    avgDuration: '1m 45s',
    schedule: 'hourly',
    owner: 'inventory-team',
    createdAt: '2024-01-10',
  },
  {
    id: '4',
    name: 'User Behavior Tracking',
    description: 'User behavior data collection',
    status: 'active',
    lastRun: '2024-01-15 10:15:00',
    nextRun: '2024-01-15 10:45:00',
    successRate: 98,
    avgDuration: '45s',
    schedule: '30min',
    owner: 'product-team',
    createdAt: '2024-01-12',
  },
];

const PipelineList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scheduleFilter, setScheduleFilter] = useState('all');

  const { data: pipelines, isLoading } = useQuery('pipelines', () => 
    Promise.resolve(mockPipelines)
  );

  const updatePipelineStatusMutation = useMutation(
    ({ id, status }) => Promise.resolve({ id, status }),
    {
      onSuccess: () => {
        message.success('Pipeline status updated');
        queryClient.invalidateQueries('pipelines');
      },
      onError: () => {
        message.error('Failed to update pipeline status');
      },
    }
  );

  const deletePipelineMutation = useMutation(
    (id) => Promise.resolve(id),
    {
      onSuccess: () => {
        message.success('Pipeline deleted');
        queryClient.invalidateQueries('pipelines');
      },
      onError: () => {
        message.error('Failed to delete pipeline');
      },
    }
  );

  const getStatusTag = (status) => {
    const statusConfig = {
      active: { color: 'success', text: 'Active' },
      paused: { color: 'warning', text: 'Paused' },
      failed: { color: 'error', text: 'Failed' },
      draft: { color: 'default', text: 'Draft' },
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getScheduleTag = (schedule) => {
    const scheduleConfig = {
      manual: { color: 'default', text: 'Manual' },
      hourly: { color: 'blue', text: 'Hourly' },
      daily: { color: 'green', text: 'Daily' },
      weekly: { color: 'orange', text: 'Weekly' },
      '30min': { color: 'purple', text: '30 Min' },
    };
    
    const config = scheduleConfig[schedule] || scheduleConfig.manual;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const handleStatusChange = (pipelineId, newStatus) => {
    updatePipelineStatusMutation.mutate({ id: pipelineId, status: newStatus });
  };

  const handleDeletePipeline = (pipelineId) => {
    deletePipelineMutation.mutate(pipelineId);
  };

  const filteredPipelines = pipelines?.filter(pipeline => {
    const matchesSearch = pipeline.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         pipeline.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pipeline.status === statusFilter;
    const matchesSchedule = scheduleFilter === 'all' || pipeline.schedule === scheduleFilter;
    
    return matchesSearch && matchesStatus && matchesSchedule;
  }) || [];

  const columns = [
    {
      title: 'Pipeline Name',
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Paused', value: 'paused' },
        { text: 'Failed', value: 'failed' },
        { text: 'Draft', value: 'draft' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Schedule',
      dataIndex: 'schedule',
      key: 'schedule',
      render: (schedule) => getScheduleTag(schedule),
    },
    {
      title: 'Success Rate',
      dataIndex: 'successRate',
      key: 'successRate',
      render: (rate) => (
        <div>
          <div style={{ fontWeight: 'bold', color: rate >= 90 ? '#52c41a' : rate >= 80 ? '#faad14' : '#ff4d4f' }}>
            {rate}%
          </div>
        </div>
      ),
      sorter: (a, b) => a.successRate - b.successRate,
    },
    {
      title: 'Last Run',
      dataIndex: 'lastRun',
      key: 'lastRun',
      render: (date) => (
        <div>
          <div>{date}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Avg: {date}</div>
        </div>
      ),
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
          <Tooltip title="View Pipeline">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/pipelines/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Edit Pipeline">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/pipelines/${record.id}`)}
            />
          </Tooltip>
          {record.status === 'active' ? (
            <Tooltip title="Pause Pipeline">
              <Button
                type="text"
                icon={<PauseCircleOutlined />}
                onClick={() => handleStatusChange(record.id, 'paused')}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Start Pipeline">
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                onClick={() => handleStatusChange(record.id, 'active')}
              />
            </Tooltip>
          )}
          <Tooltip title="Delete Pipeline">
            <Popconfirm
              title="Are you sure you want to delete this pipeline?"
              onConfirm={() => handleDeletePipeline(record.id)}
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
          Pipelines
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/pipelines/new')}
        >
          Create Pipeline
        </Button>
      </div>

      <StyledCard>
        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Search
            placeholder="Search pipelines..."
            allowClear
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="Filter by status"
            style={{ width: 150 }}
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
          >
            <Option value="all">All Status</Option>
            <Option value="active">Active</Option>
            <Option value="paused">Paused</Option>
            <Option value="failed">Failed</Option>
            <Option value="draft">Draft</Option>
          </Select>
          <Select
            placeholder="Filter by schedule"
            style={{ width: 150 }}
            value={scheduleFilter}
            onChange={setScheduleFilter}
            allowClear
          >
            <Option value="all">All Schedules</Option>
            <Option value="manual">Manual</Option>
            <Option value="hourly">Hourly</Option>
            <Option value="daily">Daily</Option>
            <Option value="weekly">Weekly</Option>
            <Option value="30min">30 Min</Option>
          </Select>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => queryClient.invalidateQueries('pipelines')}
          >
            Refresh
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredPipelines}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} pipelines`,
          }}
        />
      </StyledCard>
    </div>
  );
};

export default PipelineList; 