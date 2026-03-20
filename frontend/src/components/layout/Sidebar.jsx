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
  X,
  Zap,
} from 'lucide-react';
import { cn } from '../ui';

const NavItem = ({ to, icon: Icon, label, onNavigate }) => (
  <NavLink
    to={to}
    end={to === '/app/dashboard'}
    onClick={onNavigate}
    className={({ isActive }) =>
      cn(
        'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-accent-primary/12 text-accent-primary'
          : 'text-secondary hover:bg-surface hover:text-primary'
      )
    }
  >
    {({ isActive }) => (
      <>
        {isActive && (
          <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-accent-primary" />
        )}
        <Icon size={19} strokeWidth={2} className="shrink-0 opacity-90" aria-hidden />
        <span className="truncate tracking-tight">{label}</span>
      </>
    )}
  </NavLink>
);

const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const closeIfMobile = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
      onMobileClose?.();
    }
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/45 backdrop-blur-[1px] lg:hidden"
          aria-label="Close menu"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'glass-panel fixed z-40 flex flex-col transition-[transform,opacity] duration-200 ease-out',
          'left-3 top-3 bottom-3 w-[238px] rounded-xl',
          mobileOpen
            ? 'max-lg:pointer-events-auto max-lg:translate-x-0 max-lg:opacity-100'
            : 'max-lg:pointer-events-none max-lg:-translate-x-[calc(100%+20px)] max-lg:opacity-0',
          'lg:pointer-events-auto lg:translate-x-0 lg:opacity-100'
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border-light px-3 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-primary text-xs font-bold text-white shadow-sm">
              C1
            </div>
            <span className="truncate text-base font-semibold tracking-tight text-primary">Citizen One</span>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md text-secondary transition-colors hover:bg-base hover:text-primary lg:hidden"
            aria-label="Close menu"
            onClick={onMobileClose}
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
          <div className="space-y-1">
            <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-tertiary">
              Core
            </p>
            <NavItem to="/app/dashboard" icon={Home} label="Command Center" onNavigate={closeIfMobile} />
            <NavItem to="/app/navigator" icon={Map} label="Life Navigator" onNavigate={closeIfMobile} />
            <NavItem to="/app/benefits" icon={Zap} label="Benefit Discovery" onNavigate={closeIfMobile} />
          </div>

          <div className="mt-4 space-y-1">
            <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-tertiary">
              Intelligence
            </p>
            <NavItem to="/app/opportunities" icon={Activity} label="Opportunities" onNavigate={closeIfMobile} />
            <NavItem to="/app/vault" icon={ShieldCheck} label="Identity Vault" onNavigate={closeIfMobile} />
            <NavItem to="/app/alerts" icon={Bell} label="Smart Alerts" onNavigate={closeIfMobile} />
          </div>

          <div className="mt-4 space-y-1">
            <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-tertiary">
              System
            </p>
            <NavItem to="/app/settings" icon={Settings} label="Settings" onNavigate={closeIfMobile} />
            <NavItem to="/app/admin" icon={BarChart3} label="Admin Hub" onNavigate={closeIfMobile} />
          </div>
        </nav>

        <div className="border-t border-border-light px-3 py-2.5 text-xs text-tertiary">v2 · Enterprise</div>
      </aside>
    </>
  );
};

export default Sidebar;
