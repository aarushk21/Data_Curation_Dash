import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import PipelineList from './pages/PipelineList';
import PipelineEditor from './pages/PipelineEditor';
import SchemaManager from './pages/SchemaManager';
import QualityChecks from './pages/QualityChecks';
import Monitoring from './pages/Monitoring';
import Settings from './pages/Settings';

const { Content } = Layout;

function App() {
  return (
    <MainLayout>
      <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pipelines" element={<PipelineList />} />
          <Route path="/pipelines/:id" element={<PipelineEditor />} />
          <Route path="/pipelines/new" element={<PipelineEditor />} />
          <Route path="/schemas" element={<SchemaManager />} />
          <Route path="/quality" element={<QualityChecks />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Content>
    </MainLayout>
  );
}

export default App; 