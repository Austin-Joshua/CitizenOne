import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Bell,
  Bot,
  LineChart,
  Settings,
  X,
  ChevronRight,
  User,
  LifeBuoy,
  Map,
  BarChart3,
  FolderOpen,
  ClipboardList,
  LayoutGrid,
  Compass,
  Heart,
} from 'lucide-react';
import { cn } from '../ui';
import { AppLogo } from '../brand/AppLogo';
import { useI18n } from '../../context/I18nContext';
import { useAuth } from '../../context/AuthContext';

const SIDEBAR_W = 'w-[65vw] sm:w-[280px] max-w-[280px]';

function pathMatches(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

const NavItem = ({ to, icon: Icon, label, onNavigate, end, matchPrefixes }) => {
  const { pathname } = useLocation();
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) => {
        const prefixOn = matchPrefixes?.some((p) => pathMatches(pathname, p)) ?? false;
        const on = isActive || prefixOn;
        return cn(
          'flex min-h-10 items-center gap-3 rounded-[12px] px-3 py-2 text-[14px] font-medium leading-snug transition-[background-color,color] duration-150',
          on ? 'bg-accent-primary/[0.1] text-accent-primary' : 'text-secondary hover:bg-surface hover:text-primary'
        );
      }}
    >
      <Icon size={18} strokeWidth={2} className="shrink-0 opacity-90" aria-hidden />
      <span className="truncate">{label}</span>
    </NavLink>
  );
};

function NavGroup({ title, children }) {
  return (
    <div className="space-y-1">
      <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-tertiary">{title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SidebarContent({ onMobileClose }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const role = user?.role === 'service_provider' ? 'staff' : user?.role || 'citizen';
  const showAdmin = ['admin', 'staff', 'organization'].includes(role);

  return (
    <>
      <div className="flex items-start justify-end lg:justify-between gap-2 border-b border-border-light px-4 py-4">
        <Link
          to="/app/dashboard"
          onClick={onMobileClose}
          className="hidden lg:flex min-w-0 flex-1 flex-col gap-1 rounded-xl py-0.5 text-left transition-colors hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/35"
          aria-label={t('auth.homeAria')}
        >
          <AppLogo size="md" className="min-w-0 w-full max-w-full" />
        </Link>
        <button
          type="button"
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-secondary transition-colors hover:bg-surface hover:text-primary lg:hidden"
          aria-label={t('nav.closeMenu')}
          onClick={onMobileClose}
        >
          <X size={18} aria-hidden />
        </button>
      </div>

      <nav
        className="flex flex-1 flex-col gap-0 overflow-y-auto overflow-x-hidden scrollbar-none px-3 py-5"
        aria-label={t('nav.mainNavigation')}
      >
        <NavGroup title={t('nav.sectionPrimaryServices')}>
          <NavItem to="/app/dashboard" icon={Home} label={t('nav.dashboard')} onNavigate={onMobileClose} end />
          <NavItem to="/app/women" icon={Heart} label="Women Empowerment" onNavigate={onMobileClose} />
          <NavItem to="/app/student" icon={BookOpen} label="Student Hub" onNavigate={onMobileClose} />
          <NavItem to="/app/farmer" icon={Sprout} label="Farmer Support" onNavigate={onMobileClose} />
          <NavItem
            to="/app/benefits"
            icon={LayoutGrid}
            label={t('nav.schemesOpportunities')}
            onNavigate={onMobileClose}
            matchPrefixes={['/app/benefits', '/app/opportunities']}
          />
          <NavItem
            to="/app/progress"
            icon={ClipboardList}
            label={t('nav.applicationsAndRequests')}
            onNavigate={onMobileClose}
            matchPrefixes={['/app/progress', '/app/services']}
          />
          <NavItem to="/app/alerts" icon={Bell} label={t('nav.notifications')} onNavigate={onMobileClose} />
          <NavItem to="/app/vault" icon={FolderOpen} label={t('nav.documents')} onNavigate={onMobileClose} />
        </NavGroup>

        <div className="my-5 h-px shrink-0 bg-border-light" aria-hidden />

        <NavGroup title={t('nav.sectionAccount')}>
          <NavItem to="/app/profile" icon={User} label={t('nav.profile')} onNavigate={onMobileClose} />
          <NavItem to="/app/settings" icon={Settings} label={t('nav.settings')} onNavigate={onMobileClose} />
          <NavItem to="/app/support" icon={LifeBuoy} label={t('nav.support')} onNavigate={onMobileClose} />
        </NavGroup>

        {showAdmin && (
          <>
            <div className="my-5 h-px shrink-0 bg-border-light" aria-hidden />
            <NavGroup title={t('nav.sectionAdministration')}>
              <NavItem to="/app/admin" icon={BarChart3} label={t('nav.adminHub')} onNavigate={onMobileClose} />
            </NavGroup>
          </>
        )}

        <div className="mt-auto border-t border-border-light pt-4">
          <NavLink
            to="/app/subscription"
            onClick={onMobileClose}
            className="flex items-center justify-between gap-2 rounded-[12px] px-3 py-2.5 text-[13px] font-medium text-secondary transition-colors hover:bg-surface hover:text-primary"
          >
            <span>{t('nav.subscription')}</span>
            <ChevronRight size={16} strokeWidth={2} className="shrink-0 opacity-60" aria-hidden />
          </NavLink>
        </div>
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
      <aside className={cn('app-sidebar-surface hidden h-screen shrink-0 flex-col lg:flex', SIDEBAR_W)}>
        <SidebarContent onMobileClose={closeIfMobile} />
      </aside>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-[#0f172a]/10 dark:bg-[#020617]/20 lg:hidden"
          aria-label={t('nav.closeMenu')}
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'app-sidebar-surface fixed bottom-0 left-0 top-0 z-40 flex flex-col border-r border-border-light shadow-elevated-lg transition-[transform,opacity] duration-200 ease-out lg:hidden',
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
