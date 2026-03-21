import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import VoiceAssistantPanel from '../inclusive/VoiceAssistantPanel';
import { NotificationProvider } from '../../context/NotificationContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useI18n } from '../../context/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { getUserDisplayName } from '../../lib/userDisplayName';

const PATH_TITLE_KEY = {
  '/app/dashboard': 'documentTitle.dashboard',
  '/app/profile': 'documentTitle.profile',
  '/app/services': 'documentTitle.services',
  '/app/navigator': 'documentTitle.navigator',
  '/app/benefits': 'documentTitle.benefits',
  '/app/opportunities': 'documentTitle.opportunities',
  '/app/vault': 'documentTitle.vault',
  '/app/alerts': 'documentTitle.alerts',
  '/app/assistant': 'documentTitle.assistant',
  '/app/inclusion': 'documentTitle.inclusion',
  '/app/recommendations': 'documentTitle.recommendations',
  '/app/career': 'documentTitle.career',
  '/app/support': 'documentTitle.support',
  '/app/emergency': 'documentTitle.emergency',
  '/app/offline': 'documentTitle.offline',
  '/app/sms': 'documentTitle.sms',
  '/app/integrations': 'documentTitle.integrations',
  '/app/progress': 'documentTitle.progress',
  '/app/analytics': 'documentTitle.analytics',
  '/app/settings': 'documentTitle.settings',
  '/app/subscription': 'documentTitle.subscription',
  '/app/admin': 'documentTitle.admin',
};

const DashboardLayout = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { pathname } = useLocation();
  const titleKey = PATH_TITLE_KEY[pathname] || 'documentTitle.workspace';
  const titleSegment = useMemo(() => {
    if (pathname === '/app/dashboard' && user) {
      const name = getUserDisplayName(user, t('dashboardPage.userFallback'));
      return `${t('dashboardPage.welcomePrefix')} ${name}`.replace(/\s+/g, ' ').trim();
    }
    return t(titleKey);
  }, [pathname, user, t, titleKey]);
  useDocumentTitle(titleSegment);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMobileNavOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <NotificationProvider>
      <a
        href="#main-content"
        className="fixed left-3 top-3 z-[100] -translate-y-16 rounded-xl bg-accent-primary px-3 py-2 text-xs font-semibold text-white shadow-elevated-sm opacity-0 transition-[transform,opacity] duration-200 focus:translate-y-0 focus:opacity-100 focus:outline-none"
      >
        {t('common.skipToContent')}
      </a>
      <div className="flex min-h-screen bg-canvas font-sans text-[15px] leading-relaxed antialiased">
        <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <TopBar onMobileMenuClick={() => setMobileNavOpen(true)} />

          <main
            id="main-content"
            tabIndex={-1}
            className="app-main-canvas min-h-0 flex-1 overflow-y-auto outline-none"
          >
            <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-20 lg:py-10">
              <div className="mx-auto w-full max-w-[1280px]">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
      <VoiceAssistantPanel />
    </NotificationProvider>
  );
};

export default DashboardLayout;
