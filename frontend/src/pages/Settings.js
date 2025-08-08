import React, { useState } from 'react';
import { useMutation } from 'react-query';
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  Select,
  InputNumber,
  Divider,
  message,
  Row,
  Col,
  Alert,
  Tabs,
} from 'antd';
import {
  SaveOutlined,
  DatabaseOutlined,
  SettingOutlined,
  BellOutlined,
  SecurityScanOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const StyledCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Settings = () => {
  const [form] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [securityForm] = Form.useForm();

  const updateSettingsMutation = useMutation(
    (settings) => Promise.resolve(settings),
    {
      onSuccess: () => {
        message.success('Settings saved successfully');
      },
      onError: () => {
        message.error('Failed to save settings');
      },
    }
  );

  const handleGeneralSettings = (values) => {
    updateSettingsMutation.mutate({ type: 'general', ...values });
  };

  const handleNotificationSettings = (values) => {
    updateSettingsMutation.mutate({ type: 'notifications', ...values });
  };

  const handleSecuritySettings = (values) => {
    updateSettingsMutation.mutate({ type: 'security', ...values });
  };

  return (
    <div>
      <h1 style={{ marginBottom: '24px', fontSize: '28px', fontWeight: 'bold' }}>
        Settings
      </h1>

      <Tabs defaultActiveKey="general" size="large">
        <TabPane
          tab={
            <span>
              <SettingOutlined />
              General
            </span>
          }
          key="general"
        >
          <StyledCard title="General Settings">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleGeneralSettings}
              initialValues={{
                applicationName: 'Data Pipeline Manager',
                timezone: 'UTC',
                language: 'en',
                theme: 'light',
                autoSave: true,
                maxConcurrentPipelines: 10,
                defaultTimeout: 300,
              }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="applicationName"
                    label="Application Name"
                    rules={[{ required: true, message: 'Please enter application name' }]}
                  >
                    <Input placeholder="Enter application name" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="timezone"
                    label="Timezone"
                    rules={[{ required: true, message: 'Please select timezone' }]}
                  >
                    <Select placeholder="Select timezone">
                      <Option value="UTC">UTC</Option>
                      <Option value="EST">Eastern Time</Option>
                      <Option value="PST">Pacific Time</Option>
                      <Option value="GMT">GMT</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="language"
                    label="Language"
                    rules={[{ required: true, message: 'Please select language' }]}
                  >
                    <Select placeholder="Select language">
                      <Option value="en">English</Option>
                      <Option value="es">Spanish</Option>
                      <Option value="fr">French</Option>
                      <Option value="de">German</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="theme"
                    label="Theme"
                    rules={[{ required: true, message: 'Please select theme' }]}
                  >
                    <Select placeholder="Select theme">
                      <Option value="light">Light</Option>
                      <Option value="dark">Dark</Option>
                      <Option value="auto">Auto</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="maxConcurrentPipelines"
                    label="Max Concurrent Pipelines"
                    rules={[{ required: true, message: 'Please enter max concurrent pipelines' }]}
                  >
                    <InputNumber
                      min={1}
                      max={50}
                      style={{ width: '100%' }}
                      placeholder="Enter max concurrent pipelines"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="defaultTimeout"
                    label="Default Timeout (seconds)"
                    rules={[{ required: true, message: 'Please enter default timeout' }]}
                  >
                    <InputNumber
                      min={60}
                      max={3600}
                      style={{ width: '100%' }}
                      placeholder="Enter default timeout"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="autoSave"
                    label="Auto Save"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" icon={<SaveOutlined />} htmlType="submit">
                  Save General Settings
                </Button>
              </Form.Item>
            </Form>
          </StyledCard>
        </TabPane>

        <TabPane
          tab={
            <span>
              <DatabaseOutlined />
              Database
            </span>
          }
          key="database"
        >
          <StyledCard title="Database Configuration">
            <Alert
              message="Database Settings"
              description="Configure database connections and connection pooling settings."
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />
            <Form layout="vertical">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="dbHost"
                    label="Database Host"
                    rules={[{ required: true, message: 'Please enter database host' }]}
                  >
                    <Input placeholder="localhost" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="dbPort"
                    label="Database Port"
                    rules={[{ required: true, message: 'Please enter database port' }]}
                  >
                    <InputNumber
                      min={1}
                      max={65535}
                      style={{ width: '100%' }}
                      placeholder="5432"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="dbName"
                    label="Database Name"
                    rules={[{ required: true, message: 'Please enter database name' }]}
                  >
                    <Input placeholder="pipeline_db" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="dbUsername"
                    label="Database Username"
                    rules={[{ required: true, message: 'Please enter database username' }]}
                  >
                    <Input placeholder="Enter database username" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="dbPassword"
                    label="Database Password"
                    rules={[{ required: true, message: 'Please enter database password' }]}
                  >
                    <Input.Password placeholder="Enter database password" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="connectionPool"
                    label="Connection Pool Size"
                    rules={[{ required: true, message: 'Please enter connection pool size' }]}
                  >
                    <InputNumber
                      min={1}
                      max={100}
                      style={{ width: '100%' }}
                      placeholder="10"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" icon={<SaveOutlined />}>
                  Save Database Settings
                </Button>
              </Form.Item>
            </Form>
          </StyledCard>
        </TabPane>

        <TabPane
          tab={
            <span>
              <BellOutlined />
              Notifications
            </span>
          }
          key="notifications"
        >
          <StyledCard title="Notification Settings">
            <Form
              form={notificationForm}
              layout="vertical"
              onFinish={handleNotificationSettings}
              initialValues={{
                emailNotifications: true,
                slackNotifications: false,
                pipelineFailures: true,
                qualityCheckAlerts: true,
                systemAlerts: true,
                dailyDigest: false,
              }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="emailNotifications"
                    label="Email Notifications"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="slackNotifications"
                    label="Slack Notifications"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="pipelineFailures"
                    label="Pipeline Failure Alerts"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="qualityCheckAlerts"
                    label="Quality Check Alerts"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="systemAlerts"
                    label="System Health Alerts"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="dailyDigest"
                    label="Daily Digest Report"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="notificationEmail"
                    label="Notification Email"
                    rules={[
                      { required: true, message: 'Please enter notification email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input placeholder="admin@example.com" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="slackWebhook"
                    label="Slack Webhook URL"
                  >
                    <Input placeholder="https://hooks.slack.com/services/..." />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" icon={<SaveOutlined />} htmlType="submit">
                  Save Notification Settings
                </Button>
              </Form.Item>
            </Form>
          </StyledCard>
        </TabPane>

        <TabPane
          tab={
            <span>
              <SecurityScanOutlined />
              Security
            </span>
          }
          key="security"
        >
          <StyledCard title="Security Settings">
            <Form
              form={securityForm}
              layout="vertical"
              onFinish={handleSecuritySettings}
              initialValues={{
                sessionTimeout: 30,
                passwordPolicy: 'strong',
                twoFactorAuth: false,
                auditLogging: true,
                ipWhitelist: '',
              }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="sessionTimeout"
                    label="Session Timeout (minutes)"
                    rules={[{ required: true, message: 'Please enter session timeout' }]}
                  >
                    <InputNumber
                      min={5}
                      max={480}
                      style={{ width: '100%' }}
                      placeholder="30"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="passwordPolicy"
                    label="Password Policy"
                    rules={[{ required: true, message: 'Please select password policy' }]}
                  >
                    <Select placeholder="Select password policy">
                      <Option value="basic">Basic</Option>
                      <Option value="strong">Strong</Option>
                      <Option value="very-strong">Very Strong</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="twoFactorAuth"
                    label="Two-Factor Authentication"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="auditLogging"
                    label="Audit Logging"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item
                    name="ipWhitelist"
                    label="IP Whitelist (comma-separated)"
                  >
                    <TextArea
                      rows={3}
                      placeholder="192.168.1.0/24, 10.0.0.0/8"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" icon={<SaveOutlined />} htmlType="submit">
                  Save Security Settings
                </Button>
              </Form.Item>
            </Form>
          </StyledCard>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Settings; 