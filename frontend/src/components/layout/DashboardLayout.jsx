import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { NotificationProvider } from '../../context/NotificationContext';
import { cn } from '../ui';

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

        <div
          className={cn(
            'flex min-h-0 min-w-0 flex-1 flex-col transition-[margin] duration-200 ease-out',
            mobileNavOpen && 'max-lg:ml-[232px]'
          )}
        >
          <TopBar onMobileMenuClick={() => setMobileNavOpen(true)} />

          <main className="min-h-0 flex-1 overflow-y-auto px-0 py-4 sm:px-0 sm:py-5">
            <div className="w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default DashboardLayout;
