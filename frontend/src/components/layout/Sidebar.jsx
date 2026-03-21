import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Bell,
  Bot,
  ShieldCheck,
  LineChart,
  ClipboardList,
  Settings,
  X,
  ChevronDown,
  Zap,
  ListTodo,
  User,
  LifeBuoy,
  Map,
  Activity,
  HandHelping,
  GraduationCap,
  Siren,
  WifiOff,
  PlugZap,
  Lightbulb,
  CreditCard,
  BarChart3,
  MessageSquare,
} from 'lucide-react';
import { cn } from '../ui';
import { useI18n } from '../../context/I18nContext';
import { useAuth } from '../../context/AuthContext';

const SIDEBAR_W = 'w-[264px]';

const NavItem = ({ to, icon: Icon, label, onNavigate, end }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onNavigate}
    className={({ isActive }) =>
      cn(
        'flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium leading-snug transition-colors',
        isActive
          ? 'bg-accent-primary/[0.11] text-accent-primary'
          : 'text-secondary hover:bg-base hover:text-primary'
      )
    }
  >
    <Icon size={18} strokeWidth={2} className="shrink-0 opacity-90" aria-hidden />
    <span className="truncate">{label}</span>
  </NavLink>
);

function NavGroup({ title, children }) {
  return (
    <div className="space-y-0.5">
      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-tertiary">{title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SidebarContent({ onMobileClose }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(() =>
    ['/app/navigator', '/app/opportunities', '/app/inclusion', '/app/career', '/app/emergency', '/app/offline', '/app/sms', '/app/integrations', '/app/recommendations', '/app/subscription'].some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    )
  );

  const role = user?.role === 'service_provider' ? 'staff' : user?.role || 'citizen';
  const showAdmin = ['admin', 'staff', 'organization'].includes(role);

  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-border-light px-4 py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-primary text-xs font-bold text-white">
            C1
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-primary">{t('brand.short')}</p>
            <p className="truncate text-[11px] text-tertiary">{t('brand.subtitle')}</p>
          </div>
        </div>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-base hover:text-primary lg:hidden"
          aria-label={t('nav.closeMenu')}
          onClick={onMobileClose}
        >
          <X size={18} aria-hidden />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-0 overflow-y-auto overflow-x-hidden px-3 py-5" aria-label={t('nav.mainNavigation')}>
        <NavGroup title={t('nav.sectionPrimaryServices')}>
          <NavItem to="/app/dashboard" icon={Home} label={t('nav.dashboard')} onNavigate={onMobileClose} end />
          <NavItem to="/app/benefits" icon={Zap} label={t('nav.schemes')} onNavigate={onMobileClose} />
          <NavItem to="/app/progress" icon={ListTodo} label={t('nav.applications')} onNavigate={onMobileClose} />
          <NavItem to="/app/alerts" icon={Bell} label={t('nav.notifications')} onNavigate={onMobileClose} />
        </NavGroup>

        <div className="my-5 h-px bg-border-light" aria-hidden />

        <NavGroup title={t('nav.sectionTools')}>
          <NavItem to="/app/assistant" icon={Bot} label={t('nav.guidedAssistance')} onNavigate={onMobileClose} />
          <NavItem to="/app/vault" icon={ShieldCheck} label={t('nav.documents')} onNavigate={onMobileClose} />
          <NavItem to="/app/analytics" icon={LineChart} label={t('nav.insights')} onNavigate={onMobileClose} />
          <NavItem to="/app/services" icon={ClipboardList} label={t('nav.serviceDesk')} onNavigate={onMobileClose} />
        </NavGroup>

        <div className="my-5 h-px bg-border-light" aria-hidden />

        <NavGroup title={t('nav.sectionAccount')}>
          <NavItem to="/app/profile" icon={User} label={t('nav.profile')} onNavigate={onMobileClose} />
          <NavItem to="/app/settings" icon={Settings} label={t('nav.settings')} onNavigate={onMobileClose} />
          <NavItem to="/app/support" icon={LifeBuoy} label={t('nav.support')} onNavigate={onMobileClose} />
        </NavGroup>

        <div className="my-5 h-px bg-border-light" aria-hidden />

        <div>
          <button
            type="button"
            className="mb-2 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-tertiary transition-colors hover:bg-base hover:text-secondary"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((o) => !o)}
          >
            {t('nav.sectionAdditional')}
            <ChevronDown
              size={16}
              strokeWidth={2}
              className={cn('shrink-0 opacity-70 transition-transform duration-200', moreOpen && 'rotate-180')}
              aria-hidden
            />
          </button>
          {moreOpen && (
            <div className="space-y-0.5 pb-1">
              <NavItem to="/app/navigator" icon={Map} label={t('nav.lifeNavigator')} onNavigate={onMobileClose} />
              <NavItem to="/app/opportunities" icon={Activity} label={t('nav.opportunities')} onNavigate={onMobileClose} />
              <NavItem to="/app/inclusion" icon={HandHelping} label={t('nav.inclusionTools')} onNavigate={onMobileClose} />
              <NavItem to="/app/career" icon={GraduationCap} label={t('nav.careerLearning')} onNavigate={onMobileClose} />
              <NavItem to="/app/emergency" icon={Siren} label={t('nav.emergencySupport')} onNavigate={onMobileClose} />
              <NavItem to="/app/offline" icon={WifiOff} label={t('nav.offlineAccess')} onNavigate={onMobileClose} />
              <NavItem to="/app/sms" icon={MessageSquare} label={t('nav.smsChannel')} onNavigate={onMobileClose} />
              <NavItem to="/app/integrations" icon={PlugZap} label={t('nav.integrations')} onNavigate={onMobileClose} />
              <NavItem to="/app/recommendations" icon={Lightbulb} label={t('nav.recommendations')} onNavigate={onMobileClose} />
              <NavItem to="/app/subscription" icon={CreditCard} label={t('nav.subscription')} onNavigate={onMobileClose} />
            </div>
          )}
        </div>

        {showAdmin && (
          <>
            <div className="my-5 h-px bg-border-light" aria-hidden />
            <NavGroup title={t('nav.sectionAdministration')}>
              <NavItem to="/app/admin" icon={BarChart3} label={t('nav.adminHub')} onNavigate={onMobileClose} />
            </NavGroup>
          </>
        )}
      </nav>
    </>
  );
}

const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const { t } = useI18n();
  const closeIfMobile = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
      onMobileClose?.();
    }
  };

  return (
    <>
      <aside
        className={cn(
          'app-sidebar-surface hidden h-screen shrink-0 flex-col lg:flex',
          SIDEBAR_W
        )}
      >
        <SidebarContent onMobileClose={closeIfMobile} />
      </aside>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[2px] lg:hidden"
          aria-label={t('nav.closeMenu')}
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'app-sidebar-surface fixed bottom-0 left-0 top-0 z-40 flex flex-col shadow-xl transition-[transform,opacity] duration-200 ease-out lg:hidden',
          SIDEBAR_W,
          mobileOpen ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-full opacity-0'
        )}
        aria-hidden={!mobileOpen}
      >
        <SidebarContent onMobileClose={closeIfMobile} />
      </aside>
    </>
  );
};

export default Sidebar;
