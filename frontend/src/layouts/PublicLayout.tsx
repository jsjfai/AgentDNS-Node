import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Content from '@/components/layout/Content';

const PublicLayout: React.FC = () => {
  // 控制侧边栏展开/折叠状态
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const { auth } = useAuth();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* 顶部导航 */}
      <Header onToggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* 侧边导航 - 仅在认证后显示 */}
        {auth.isAuthenticated && (
          <Sidebar collapsed={sidebarCollapsed} />
        )}
        
        {/* 主内容区域 */}
        <Content>
          <Outlet />
        </Content>
      </div>
    </div>
  );
};

export default PublicLayout;