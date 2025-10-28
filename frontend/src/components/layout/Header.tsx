import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ThemeSwitch from '@/components/ui/ThemeSwitch';
import SponsorDialog from '@/components/ui/SponsorDialog';
import WeChatDialog from '@/components/ui/WeChatDialog';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { t } = useTranslation();
  const [sponsorDialogOpen, setSponsorDialogOpen] = useState(false);
  const [wechatDialogOpen, setWechatDialogOpen] = useState(false);

  const { auth } = useAuth();
  const navigate = useNavigate();

  const handleTitleClick = () => {
    navigate('/dashboard');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
      <div className="flex justify-between items-center px-3 py-3">
        <div className="flex items-center">
          {/* 侧边栏切换按钮 - 仅在认证后显示 */}
          {auth.isAuthenticated && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              aria-label={t('app.toggleSidebar')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* 应用标题 - 点击可导航到仪表盘 */}
          <button 
            onClick={handleTitleClick}
            className="ml-4 text-xl font-bold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            {t('app.title')}
          </button>
        </div>

        {/* Theme Switch and Version */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {import.meta.env.PACKAGE_VERSION === 'dev'
              ? import.meta.env.PACKAGE_VERSION
              : `${import.meta.env.PACKAGE_VERSION}`}
          </span>
          <ThemeSwitch />
          
          {/* 登录按钮 - 仅在未认证时显示 */}
          {!auth.isAuthenticated && (
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {t('auth.login')}
            </button>
          )}
        </div>
      </div>
      <SponsorDialog open={sponsorDialogOpen} onOpenChange={setSponsorDialogOpen} />
      <WeChatDialog open={wechatDialogOpen} onOpenChange={setWechatDialogOpen} />
    </header>
  );
};

export default Header;