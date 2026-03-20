import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Map, 
  Bell, 
  Activity, 
  ShieldCheck, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../ui';

const NavItem = ({ to, icon: Icon, label, collapsed }) => (
  <NavLink
    to={to}
    className={({ isActive }) => cn(
      "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative",
      isActive 
        ? "bg-accent-primary/10 text-accent-primary font-bold shadow-sm" 
        : "text-secondary hover:bg-surface hover:text-primary font-medium"
    )}
  >
    {({ isActive }) => (
      <>
        {isActive && (
          <div className="absolute left-0 w-1 h-6 bg-accent-primary rounded-r-md"></div>
        )}
        <Icon size={20} className={cn("shrink-0 transition-transform", isActive ? "scale-110" : "group-hover:scale-110")} />
        {!collapsed && <span className="text-sm tracking-wide whitespace-nowrap">{label}</span>}
      </>
    )}
  </NavLink>
);

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { logout } = useAuth();
  
  return (
    <aside 
      className={cn(
        "glass-panel fixed top-4 bottom-4 left-4 z-40 flex flex-col transition-all duration-300",
        collapsed ? "w-[80px]" : "w-[280px]"
      )}
    >
      {/* Header / Logo */}
      <div className="flex bg-surface/50 items-center justify-between p-6 border-b border-border-light rounded-t-2xl">
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center shrink-0 shadow-md">
              <span className="text-white font-black text-sm">C1</span>
            </div>
            <span className="font-black text-lg tracking-tight text-primary">Citizen One</span>
          </div>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
             <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center shadow-md">
              <span className="text-white font-black text-sm">C1</span>
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-8 w-7 h-7 rounded-full bg-surface border border-border-light flex items-center justify-center text-secondary hover:text-primary shadow-sm hover:scale-105 transition-all z-50"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
        
        <div className="space-y-2">
          {!collapsed && <p className="px-4 text-[10px] font-black uppercase tracking-widest text-tertiary mb-4">Core Services</p>}
          <NavItem to="/app/dashboard" icon={Home} label="Command Center" collapsed={collapsed} />
          <NavItem to="/app/navigator" icon={Map} label="Life Navigator" collapsed={collapsed} />
          <NavItem to="/app/benefits" icon={Zap} label="Benefit Discovery" collapsed={collapsed} />
        </div>

        <div className="space-y-2">
          {!collapsed && <p className="px-4 text-[10px] font-black uppercase tracking-widest text-tertiary mb-4">Intelligence</p>}
          <NavItem to="/app/opportunities" icon={Activity} label="Opportunities" collapsed={collapsed} />
          <NavItem to="/app/vault" icon={ShieldCheck} label="Identity Vault" collapsed={collapsed} />
          <NavItem to="/app/alerts" icon={Bell} label="Smart Alerts" collapsed={collapsed} />
        </div>

        <div className="space-y-2">
          {!collapsed && <p className="px-4 text-[10px] font-black uppercase tracking-widest text-tertiary mb-4">System</p>}
          <NavItem to="/app/settings" icon={Settings} label="Accessibility" collapsed={collapsed} />
          <NavItem to="/app/admin" icon={BarChart3} label="Admin Hub" collapsed={collapsed} />
        </div>

      </div>

      {/* Footer / User */}
      <div className="p-4 border-t border-border-light bg-surface/30 rounded-b-2xl">
        <button 
          onClick={logout}
          className={cn(
            "w-full flex items-center gap-4 px-4 py-3 rounded-xl text-secondary hover:bg-red-500/10 hover:text-red-500 transition-colors group",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut size={20} className="shrink-0 group-hover:scale-110 transition-transform" />
          {!collapsed && <span className="text-sm font-bold tracking-wide">Secure Disconnect</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
