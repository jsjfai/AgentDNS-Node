import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import MainLayout from './layouts/MainLayout';
import PublicLayout from './layouts/PublicLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import MyAgentsPage from './pages/MyAgentsPage';
import GroupsPage from './pages/GroupsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import AgentsPage from './pages/AgentsPage';
import LogsPage from './pages/LogsPage';
import { getBasePath } from './utils/runtime';

function App() {
  const basename = getBasePath();
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router basename={basename}>
            <Routes>
              {/* 公共路由 */}
              <Route path="/login" element={<LoginPage />} />

              {/* 受保护的路由，使用 MainLayout 作为布局容器 */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/myagents" element={<MyAgentsPage />} />
                  <Route path="/groups" element={<GroupsPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/logs" element={<LogsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Route>
              
              {/* 智能体广场路由 - 添加环境变量判断 */}
              {import.meta.env.VITE_SHOW_MARKET === 'true' ? (
                <Route element={<PublicLayout />}>
                  <Route path="/agents" element={<AgentsPage />} />
                  <Route path="/agents/:serverName" element={<AgentsPage />} />
                </Route>
              ) : (
                // 当环境变量不满足条件时，重定向到首页或其他页面
                <Route path="/agents" element={<Navigate to="/myagents" replace />} />
              )}
              
              {/* 未匹配的路由重定向到首页 */}
              <Route path="/" element={<Navigate to="/agents" replace />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;