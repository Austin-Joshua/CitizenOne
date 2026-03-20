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
  Bot,
  Lightbulb,
  HandHelping,
  CreditCard,
  GraduationCap,
  Users,
  Siren,
  WifiOff,
  PlugZap,
  Gauge,
  LineChart,
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

const SidebarContent = ({ onMobileClose }) => (
  <>
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
        <NavItem to="/app/dashboard" icon={Home} label="Command Center" onNavigate={onMobileClose} />
        <NavItem to="/app/navigator" icon={Map} label="Life Navigator" onNavigate={onMobileClose} />
        <NavItem to="/app/benefits" icon={Zap} label="Benefit Discovery" onNavigate={onMobileClose} />
      </div>

      <div className="mt-4 space-y-1">
        <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-tertiary">
          Intelligence
        </p>
        <NavItem to="/app/opportunities" icon={Activity} label="Opportunities" onNavigate={onMobileClose} />
        <NavItem to="/app/vault" icon={ShieldCheck} label="Identity Vault" onNavigate={onMobileClose} />
        <NavItem to="/app/alerts" icon={Bell} label="Smart Alerts" onNavigate={onMobileClose} />
        <NavItem to="/app/assistant" icon={Bot} label="AI Assistant" onNavigate={onMobileClose} />
        <NavItem to="/app/recommendations" icon={Lightbulb} label="Recommendations" onNavigate={onMobileClose} />
        <NavItem to="/app/inclusion" icon={HandHelping} label="Inclusion Tools" onNavigate={onMobileClose} />
        <NavItem to="/app/career" icon={GraduationCap} label="Career & Learning" onNavigate={onMobileClose} />
        <NavItem to="/app/support" icon={Users} label="Community Support" onNavigate={onMobileClose} />
        <NavItem to="/app/emergency" icon={Siren} label="Emergency Support" onNavigate={onMobileClose} />
        <NavItem to="/app/offline" icon={WifiOff} label="Offline Access" onNavigate={onMobileClose} />
        <NavItem to="/app/integrations" icon={PlugZap} label="Integrations" onNavigate={onMobileClose} />
        <NavItem to="/app/progress" icon={Gauge} label="Progress Tracker" onNavigate={onMobileClose} />
        <NavItem to="/app/analytics" icon={LineChart} label="Personal Analytics" onNavigate={onMobileClose} />
      </div>

      <div className="mt-4 space-y-1">
        <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-tertiary">
          System
        </p>
        <NavItem to="/app/settings" icon={Settings} label="Settings" onNavigate={onMobileClose} />
        <NavItem to="/app/subscription" icon={CreditCard} label="Subscription" onNavigate={onMobileClose} />
        <NavItem to="/app/admin" icon={BarChart3} label="Admin Hub" onNavigate={onMobileClose} />
      </div>
    </nav>

    <div className="border-t border-border-light px-3 py-1.5" />
  </>
);

const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const closeIfMobile = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
      onMobileClose?.();
    }
  };

  return (
    <>
      <aside className="glass-panel hidden h-screen w-[232px] shrink-0 rounded-none border-l-0 border-t-0 border-b-0 lg:flex lg:flex-col">
        <SidebarContent onMobileClose={closeIfMobile} />
      </aside>

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
          'glass-panel fixed left-0 top-0 bottom-0 z-40 flex w-[232px] flex-col rounded-none border-l-0 transition-[transform,opacity] duration-200 ease-out lg:hidden',
          mobileOpen
            ? 'max-lg:pointer-events-auto max-lg:translate-x-0 max-lg:opacity-100'
            : 'max-lg:pointer-events-none max-lg:-translate-x-[calc(100%+20px)] max-lg:opacity-0',
          'pointer-events-auto'
        )}
      >
        <SidebarContent onMobileClose={closeIfMobile} />
      </aside>
    </>
  );
};

export default Sidebar;
