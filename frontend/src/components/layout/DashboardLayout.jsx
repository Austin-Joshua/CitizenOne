import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { cn } from '../ui';

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-base flex overflow-hidden font-sans">
      
      {/* Persistent Left Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      
      {/* Main Content Area */}
      <div 
        className={cn(
          "flex-1 flex flex-col h-screen transition-all duration-300 relative",
          collapsed ? "ml-[96px]" : "ml-[296px]" // 16px (left-4) + Sidebar Width
        )}
      >
        <TopBar />
        
        {/* Scrollable Dashboard Router Outlet */}
        <main className="flex-1 overflow-y-auto pb-12 px-12 scrollbar-hide">
          <Outlet />
        </main>
      </div>
      
    </div>
  );
};

export default DashboardLayout;
