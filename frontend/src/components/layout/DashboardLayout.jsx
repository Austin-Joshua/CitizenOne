import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { NotificationProvider } from '../../context/NotificationContext';

const DashboardLayout = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const id = requestAnimationFrame(() => setMobileNavOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <NotificationProvider>
      <div className="flex min-h-screen bg-base font-sans text-[15px] leading-relaxed antialiased">
        <Sidebar mobileOpen={mobileNavOpen} onMobileClose={() => setMobileNavOpen(false)} />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:pl-[262px]">
          <TopBar onMobileMenuClick={() => setMobileNavOpen(true)} />

          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
            <div className="mx-auto max-w-[1400px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default DashboardLayout;
