import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ApiOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  MonitorOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

const { Header, Sider, Content } = Layout;

const StyledHeader = styled(Header)`
  background: #001529;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
`;

const StyledSider = styled(Sider)`
  position: fixed;
  height: 100vh;
  left: 0;
  top: 64px;
  z-index: 999;
  background: #fff;
  box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
`;

const Logo = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #001529;
  color: white;
  font-size: 18px;
  font-weight: bold;
`;

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/pipelines',
    icon: <ApiOutlined />,
    label: 'Pipelines',
  },
  {
    key: '/schemas',
    icon: <DatabaseOutlined />,
    label: 'Schema Manager',
  },
  {
    key: '/quality',
    icon: <CheckCircleOutlined />,
    label: 'Quality Checks',
  },
  {
    key: '/monitoring',
    icon: <MonitorOutlined />,
    label: 'Monitoring',
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: 'Settings',
  },
];

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
    },
  ];

  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      // Handle logout
      console.log('Logout clicked');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <StyledHeader>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
              color: 'white',
            }}
          />
          <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', marginLeft: '16px' }}>
            Data Pipeline Manager
          </div>
        </div>
        <Space>
          <Button
            type="text"
            icon={<BellOutlined />}
            style={{ color: 'white' }}
          />
          <Dropdown
            menu={{
              items: userMenuItems,
              onClick: handleUserMenuClick,
            }}
            placement="bottomRight"
          >
            <Space style={{ color: 'white', cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>Admin User</span>
            </Space>
          </Dropdown>
        </Space>
      </StyledHeader>
      
      <StyledSider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ height: '100%', borderRight: 0 }}
        />
      </StyledSider>
      
      <Layout style={{ marginLeft: collapsed ? 80 : 250, marginTop: 64 }}>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#f5f5f5' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 