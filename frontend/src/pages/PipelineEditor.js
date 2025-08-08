import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Space, Modal, Form, Input, Select, Tabs, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'react-flow-renderer';
import {
  PlusOutlined,
  SaveOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  DatabaseOutlined,
  ApiOutlined,
  FilterOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

const { Option } = Select;
const { TabPane } = Tabs;

const EditorContainer = styled.div`
  display: flex;
  height: calc(100vh - 200px);
  gap: 16px;
`;

const Sidebar = styled.div`
  width: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  overflow-y: auto;
`;

const FlowContainer = styled.div`
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const NodePalette = styled.div`
  margin-bottom: 24px;
`;

const NodeType = styled.div`
  padding: 12px;
  margin: 8px 0;
  border: 2px solid #d9d9d9;
  border-radius: 6px;
  cursor: grab;
  background: white;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #1890ff;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
  }
  
  &:active {
    cursor: grabbing;
  }
`;

const nodeTypes = [
  {
    type: 'dataSource',
    label: 'Data Source',
    icon: <DatabaseOutlined />,
    color: '#1890ff',
  },
  {
    type: 'transformation',
    label: 'Transformation',
    icon: <FilterOutlined />,
    color: '#52c41a',
  },
  {
    type: 'validation',
    label: 'Schema Validation',
    icon: <CheckCircleOutlined />,
    color: '#faad14',
  },
  {
    type: 'qualityCheck',
    label: 'Quality Check',
    icon: <ApiOutlined />,
    color: '#722ed1',
  },
  {
    type: 'dataSink',
    label: 'Data Sink',
    icon: <DatabaseOutlined />,
    color: '#eb2f96',
  },
];

const PipelineEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isConfigModalVisible, setIsConfigModalVisible] = useState(false);
  const [configForm] = Form.useForm();

  // Mock data - replace with actual API calls
  const { data: pipeline, isLoading } = useQuery(
    ['pipeline', id],
    () => Promise.resolve({
      id: id || 'new',
      name: id ? 'Customer Data ETL' : 'New Pipeline',
      description: 'ETL pipeline for customer data processing',
      status: 'draft',
      nodes: [],
      edges: [],
    }),
    { enabled: !!id }
  );

  const savePipelineMutation = useMutation(
    (pipelineData) => Promise.resolve(pipelineData),
    {
      onSuccess: () => {
        message.success('Pipeline saved successfully');
        queryClient.invalidateQueries(['pipelines']);
      },
      onError: () => {
        message.error('Failed to save pipeline');
      },
    }
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const nodeType = nodeTypes.find(nt => nt.type === type);
      
      if (!nodeType) return;

      const position = {
        x: event.clientX - event.target.getBoundingClientRect().left,
        y: event.clientY - event.target.getBoundingClientRect().top,
      };

      const newNode = {
        id: `${type}-${Date.now()}`,
        type: 'default',
        position,
        data: {
          label: nodeType.label,
          type: nodeType.type,
          icon: nodeType.icon,
          color: nodeType.color,
          config: {},
        },
        style: {
          border: `2px solid ${nodeType.color}`,
          borderRadius: '8px',
          padding: '12px',
          background: 'white',
          minWidth: '120px',
          textAlign: 'center',
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setIsConfigModalVisible(true);
    configForm.setFieldsValue(node.data.config);
  }, [configForm]);

  const handleSavePipeline = () => {
    const pipelineData = {
      ...pipeline,
      nodes,
      edges,
    };
    savePipelineMutation.mutate(pipelineData);
  };

  const handleDeployPipeline = () => {
    Modal.confirm({
      title: 'Deploy Pipeline',
      content: 'Are you sure you want to deploy this pipeline?',
      onOk: () => {
        message.success('Pipeline deployed successfully');
        navigate('/pipelines');
      },
    });
  };

  const handleNodeConfigSave = (values) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, config: values } }
          : node
      )
    );
    setIsConfigModalVisible(false);
    message.success('Node configuration saved');
  };

  const getNodeConfigForm = () => {
    if (!selectedNode) return null;

    const { type } = selectedNode.data;

    switch (type) {
      case 'dataSource':
        return (
          <>
            <Form.Item name="sourceType" label="Source Type" rules={[{ required: true }]}>
              <Select>
                <Option value="database">Database</Option>
                <Option value="file">File</Option>
                <Option value="api">API</Option>
                <Option value="stream">Stream</Option>
              </Select>
            </Form.Item>
            <Form.Item name="connectionString" label="Connection String">
              <Input.Password />
            </Form.Item>
            <Form.Item name="query" label="Query">
              <Input.TextArea rows={4} />
            </Form.Item>
          </>
        );

      case 'transformation':
        return (
          <>
            <Form.Item name="transformationType" label="Transformation Type" rules={[{ required: true }]}>
              <Select>
                <Option value="filter">Filter</Option>
                <Option value="map">Map</Option>
                <Option value="aggregate">Aggregate</Option>
                <Option value="join">Join</Option>
              </Select>
            </Form.Item>
            <Form.Item name="transformationLogic" label="Transformation Logic">
              <Input.TextArea rows={6} placeholder="Enter transformation logic..." />
            </Form.Item>
          </>
        );

      case 'validation':
        return (
          <>
            <Form.Item name="schemaFile" label="Schema File">
              <Input />
            </Form.Item>
            <Form.Item name="validationRules" label="Validation Rules">
              <Input.TextArea rows={4} placeholder="Enter validation rules..." />
            </Form.Item>
          </>
        );

      case 'qualityCheck':
        return (
          <>
            <Form.Item name="qualityMetrics" label="Quality Metrics" rules={[{ required: true }]}>
              <Select mode="multiple">
                <Option value="completeness">Completeness</Option>
                <Option value="accuracy">Accuracy</Option>
                <Option value="consistency">Consistency</Option>
                <Option value="timeliness">Timeliness</Option>
              </Select>
            </Form.Item>
            <Form.Item name="threshold" label="Quality Threshold">
              <Input type="number" min={0} max={100} />
            </Form.Item>
          </>
        );

      case 'dataSink':
        return (
          <>
            <Form.Item name="sinkType" label="Sink Type" rules={[{ required: true }]}>
              <Select>
                <Option value="database">Database</Option>
                <Option value="file">File</Option>
                <Option value="dataWarehouse">Data Warehouse</Option>
                <Option value="dataLake">Data Lake</Option>
              </Select>
            </Form.Item>
            <Form.Item name="tableName" label="Table Name">
              <Input />
            </Form.Item>
            <Form.Item name="writeMode" label="Write Mode">
              <Select>
                <Option value="append">Append</Option>
                <Option value="overwrite">Overwrite</Option>
                <Option value="merge">Merge</Option>
              </Select>
            </Form.Item>
          </>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          {pipeline.name}
        </h1>
        <Space>
          <Button icon={<SaveOutlined />} onClick={handleSavePipeline}>
            Save
          </Button>
          <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleDeployPipeline}>
            Deploy
          </Button>
        </Space>
      </div>

      <EditorContainer>
        <Sidebar>
          <NodePalette>
            <h3>Pipeline Components</h3>
            {nodeTypes.map((nodeType) => (
              <NodeType
                key={nodeType.type}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData('application/reactflow', nodeType.type);
                  event.dataTransfer.effectAllowed = 'move';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: nodeType.color }}>{nodeType.icon}</span>
                  <span>{nodeType.label}</span>
                </div>
              </NodeType>
            ))}
          </NodePalette>

          <Tabs defaultActiveKey="properties">
            <TabPane tab="Properties" key="properties">
              <Form layout="vertical">
                <Form.Item label="Pipeline Name">
                  <Input defaultValue={pipeline.name} />
                </Form.Item>
                <Form.Item label="Description">
                  <Input.TextArea defaultValue={pipeline.description} rows={3} />
                </Form.Item>
                <Form.Item label="Schedule">
                  <Select defaultValue="manual">
                    <Option value="manual">Manual</Option>
                    <Option value="hourly">Hourly</Option>
                    <Option value="daily">Daily</Option>
                    <Option value="weekly">Weekly</Option>
                  </Select>
                </Form.Item>
              </Form>
            </TabPane>
            <TabPane tab="Validation" key="validation">
              <p>Schema validation rules and quality checks will appear here.</p>
            </TabPane>
          </Tabs>
        </Sidebar>

        <FlowContainer>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </FlowContainer>
      </EditorContainer>

      <Modal
        title={`Configure ${selectedNode?.data?.label}`}
        open={isConfigModalVisible}
        onCancel={() => setIsConfigModalVisible(false)}
        onOk={() => configForm.submit()}
        width={600}
      >
        <Form
          form={configForm}
          layout="vertical"
          onFinish={handleNodeConfigSave}
        >
          {getNodeConfigForm()}
        </Form>
      </Modal>
    </div>
  );
};

export default PipelineEditor; 