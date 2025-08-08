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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import MonacoEditor from '@monaco-editor/react';
import styled from 'styled-components';

const { Option } = Select;
const { TextArea } = Input;

const StyledCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

// Mock data - replace with actual API calls
const mockSchemas = [
  {
    id: '1',
    name: 'Customer Schema',
    version: '1.0.0',
    description: 'Schema for customer data validation',
    status: 'active',
    fields: 15,
    lastUpdated: '2024-01-15 10:30:00',
    owner: 'admin',
  },
  {
    id: '2',
    name: 'Product Schema',
    version: '2.1.0',
    description: 'Schema for product catalog data',
    status: 'active',
    fields: 12,
    lastUpdated: '2024-01-14 15:20:00',
    owner: 'product-team',
  },
  {
    id: '3',
    name: 'Order Schema',
    version: '1.5.0',
    description: 'Schema for order processing data',
    status: 'draft',
    fields: 20,
    lastUpdated: '2024-01-13 09:15:00',
    owner: 'order-team',
  },
];

const defaultSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {},
  required: [],
  additionalProperties: false
};

const SchemaManager = () => {
  const queryClient = useQueryClient();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [form] = Form.useForm();

  const { data: schemas, isLoading } = useQuery('schemas', () => 
    Promise.resolve(mockSchemas)
  );

  const createSchemaMutation = useMutation(
    (schemaData) => Promise.resolve(schemaData),
    {
      onSuccess: () => {
        message.success('Schema created successfully');
        setIsModalVisible(false);
        form.resetFields();
        queryClient.invalidateQueries('schemas');
      },
      onError: () => {
        message.error('Failed to create schema');
      },
    }
  );

  const updateSchemaMutation = useMutation(
    (schemaData) => Promise.resolve(schemaData),
    {
      onSuccess: () => {
        message.success('Schema updated successfully');
        setIsModalVisible(false);
        setSelectedSchema(null);
        form.resetFields();
        queryClient.invalidateQueries('schemas');
      },
      onError: () => {
        message.error('Failed to update schema');
      },
    }
  );

  const deleteSchemaMutation = useMutation(
    (id) => Promise.resolve(id),
    {
      onSuccess: () => {
        message.success('Schema deleted successfully');
        queryClient.invalidateQueries('schemas');
      },
      onError: () => {
        message.error('Failed to delete schema');
      },
    }
  );

  const handleCreateSchema = () => {
    setSelectedSchema(null);
    form.resetFields();
    form.setFieldsValue({
      schema: JSON.stringify(defaultSchema, null, 2)
    });
    setIsModalVisible(true);
  };

  const handleEditSchema = (schema) => {
    setSelectedSchema(schema);
    form.setFieldsValue({
      name: schema.name,
      version: schema.version,
      description: schema.description,
      schema: JSON.stringify(defaultSchema, null, 2) // Mock schema data
    });
    setIsModalVisible(true);
  };

  const handleViewSchema = (schema) => {
    setSelectedSchema(schema);
    setIsViewModalVisible(true);
  };

  const handleDeleteSchema = (id) => {
    deleteSchemaMutation.mutate(id);
  };

  const handleSubmit = (values) => {
    try {
      const schemaJson = JSON.parse(values.schema);
      const schemaData = {
        ...values,
        schema: schemaJson,
        id: selectedSchema?.id,
      };

      if (selectedSchema) {
        updateSchemaMutation.mutate(schemaData);
      } else {
        createSchemaMutation.mutate(schemaData);
      }
    } catch (error) {
      message.error('Invalid JSON schema format');
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      active: { color: 'success', icon: <CheckCircleOutlined /> },
      draft: { color: 'warning', icon: <ExclamationCircleOutlined /> },
      deprecated: { color: 'error', icon: <ExclamationCircleOutlined /> },
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <Tag color={config.color} icon={config.icon}>
        {status.toUpperCase()}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Schema Name',
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
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      render: (version) => <Tag color="blue">{version}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Fields',
      dataIndex: 'fields',
      key: 'fields',
      render: (fields) => <span>{fields} fields</span>,
    },
    {
      title: 'Last Updated',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
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
          <Tooltip title="View Schema">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewSchema(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Schema">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditSchema(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Schema">
            <Popconfirm
              title="Are you sure you want to delete this schema?"
              onConfirm={() => handleDeleteSchema(record.id)}
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
          Schema Manager
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateSchema}
        >
          Create Schema
        </Button>
      </div>

      <StyledCard>
        <Table
          columns={columns}
          dataSource={schemas}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} schemas`,
          }}
        />
      </StyledCard>

      {/* Create/Edit Schema Modal */}
      <Modal
        title={selectedSchema ? 'Edit Schema' : 'Create Schema'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedSchema(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={800}
        okText={selectedSchema ? 'Update' : 'Create'}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Schema Name"
            rules={[{ required: true, message: 'Please enter schema name' }]}
          >
            <Input placeholder="Enter schema name" />
          </Form.Item>
          
          <Form.Item
            name="version"
            label="Version"
            rules={[{ required: true, message: 'Please enter version' }]}
          >
            <Input placeholder="e.g., 1.0.0" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={3} placeholder="Enter schema description" />
          </Form.Item>
          
          <Form.Item
            name="schema"
            label="JSON Schema"
            rules={[
              { required: true, message: 'Please enter JSON schema' },
              {
                validator: (_, value) => {
                  try {
                    JSON.parse(value);
                    return Promise.resolve();
                  } catch (error) {
                    return Promise.reject(new Error('Invalid JSON format'));
                  }
                },
              },
            ]}
          >
            <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px' }}>
              <MonacoEditor
                height="400px"
                language="json"
                theme="vs-light"
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                }}
              />
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Schema Modal */}
      <Modal
        title={`Schema: ${selectedSchema?.name}`}
        open={isViewModalVisible}
        onCancel={() => {
          setIsViewModalVisible(false);
          setSelectedSchema(null);
        }}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedSchema && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <p><strong>Description:</strong> {selectedSchema.description}</p>
              <p><strong>Version:</strong> {selectedSchema.version}</p>
              <p><strong>Status:</strong> {getStatusTag(selectedSchema.status)}</p>
            </div>
            <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px' }}>
              <MonacoEditor
                height="400px"
                language="json"
                theme="vs-light"
                value={JSON.stringify(defaultSchema, null, 2)}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SchemaManager; 