import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Shield,
  Award,
  ChevronRight,
  TrendingUp,
  ClipboardList,
  FileText,
  CheckCircle2,
  Bell,
  LayoutGrid,
  FolderOpen,
  Inbox,
} from 'lucide-react';
import { Card, Button, Badge, cn } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useNotifications } from '../context/NotificationContext';
import { apiFetch, getErrorMessageFromResponse } from '../lib/api';
import { getUserDisplayName } from '../lib/userDisplayName';

const SUMMARY_DEFAULT = {
  applications: 0,
  documents: 0,
  completedTasks: 0,
  activities: [],
  myOpenServiceRequests: 0,
  staffServiceQueueCount: null,
  applicationQueueCount: null,
};

const METRIC_ACCENTS = {
  primary: { iconWrap: 'bg-accent-primary/10 text-accent-primary' },
  secondary: { iconWrap: 'bg-accent-primary/10 text-accent-primary' },
  tertiary: { iconWrap: 'bg-accent-tertiary/10 text-accent-tertiary' },
  neutral: { iconWrap: 'bg-border-light text-secondary' },
};

const MetricBlock = ({ title, value, hint, icon: Icon, accent }) => {
  const a = METRIC_ACCENTS[accent] || METRIC_ACCENTS.primary;
  return (
    <Card elevated className="flex min-h-[96px] flex-col justify-between !p-4 sm:!p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-secondary">{title}</h3>
        <div className={cn('rounded-xl p-2', a.iconWrap)}>
          <Icon size={17} strokeWidth={2} aria-hidden />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-[1.625rem] font-semibold tracking-tight text-primary">{value}</p>
        {hint ? <p className="mt-1.5 text-xs leading-snug text-tertiary">{hint}</p> : null}
      </div>
    </Card>
  );
};

const DashboardPage = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const { items: notifItems } = useNotifications();
  const displayName = getUserDisplayName(user, t('dashboardPage.userFallback'));
  const role = user?.role === 'service_provider' ? 'staff' : user?.role || 'citizen';
  const isStaff = role === 'staff' || role === 'admin';

  const { data: summary = SUMMARY_DEFAULT } = useQuery({
    queryKey: ['dashboard', 'activity-summary', user?.id],
    queryFn: async () => {
      const res = await apiFetch('/api/activity/summary');
      if (!res.ok) throw new Error(await getErrorMessageFromResponse(res));
      const data = await res.json();
      return { ...SUMMARY_DEFAULT, ...data };
    },
    enabled: Boolean(user),
    placeholderData: SUMMARY_DEFAULT,
  });

  const { data: schemes = [] } = useQuery({
    queryKey: ['dashboard', 'schemes-intelligence', user?.id],
    queryFn: async () => {
      const res = await apiFetch('/api/schemes/intelligence');
      if (!res.ok) throw new Error(await getErrorMessageFromResponse(res));
      const data = await res.json();
      const rec = Array.isArray(data.recommended) ? data.recommended : [];
      return rec.slice(0, 4);
    },
    enabled: Boolean(user),
  });

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.02 } },
  };
  const item = {
    hidden: { opacity: 0, y: 2 },
    show: { opacity: 1, y: 0, transition: { duration: 0.14, ease: [0.16, 1, 0.3, 1] } },
  };

  const queueHint = isStaff
    ? summary.staffServiceQueueCount != null
      ? t('dashboardPage.queueHintStaff', { count: summary.staffServiceQueueCount })
      : t('dashboardPage.queueHintStaffShort')
    : summary.myOpenServiceRequests
      ? t('dashboardPage.queueHintUser', { count: summary.myOpenServiceRequests })
      : t('dashboardPage.queueHintNone');

  const previewNotifs = notifItems.slice(0, 4);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 lg:space-y-10">
      <motion.section variants={item} className="flex flex-col gap-6 border-b border-border-light pb-8 lg:flex-row lg:items-end lg:justify-between lg:pb-10">
        <div className="max-w-2xl space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-tertiary">
            {t('dashboardPage.summaryEyebrow')}
          </p>
          <h1 className="ds-page-title">
            {t('dashboardPage.welcomePrefix')}{' '}
            <span className="text-accent-primary">{displayName}</span>
          </h1>
          <p className="ds-body">{t('dashboardPage.intro')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/app/benefits">
            <Button size="sm">{t('nav.schemesOpportunities')}</Button>
          </Link>
          <Link to="/app/services">
            <Button variant="secondary" size="sm">
              {t('nav.serviceDesk')}
            </Button>
          </Link>
        </div>
      </motion.section>

      <motion.section variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <MetricBlock
          title={t('dashboardPage.metricApplications')}
          value={String(summary.applications)}
          hint={t('dashboardPage.metricApplicationsHint')}
          icon={TrendingUp}
          accent="primary"
        />
        <MetricBlock
          title={t('dashboardPage.metricDocuments')}
          value={String(summary.documents)}
          hint={t('dashboardPage.metricDocumentsHint')}
          icon={Award}
          accent="secondary"
        />
        <MetricBlock
          title={t('dashboardPage.metricCompleted')}
          value={String(summary.completedTasks)}
          hint={t('dashboardPage.metricCompletedHint')}
          icon={CheckCircle2}
          accent="tertiary"
        />
        <MetricBlock
          title={isStaff ? t('dashboardPage.metricQueueStaff') : t('dashboardPage.metricQueueUser')}
          value={String(
            isStaff ? (summary.staffServiceQueueCount ?? 0) : (summary.myOpenServiceRequests ?? 0)
          )}
          hint={queueHint}
          icon={ClipboardList}
          accent="neutral"
        />
      </motion.section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
        <motion.div variants={item} className="lg:col-span-8">
          <Card elevated className="!p-5 sm:!p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-primary text-white">
                <FileText className="h-5 w-5" strokeWidth={2} aria-hidden />
              </div>
              <div>
                <h2 className="ds-card-title">{t('dashboardPage.recommendedTitle')}</h2>
                <p className="ds-caption mt-0.5 uppercase tracking-wide">{t('dashboardPage.recommendedSubtitle')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {schemes.length === 0 ? (
                <p className="text-sm text-secondary md:col-span-2">
                  {t('dashboardPage.recommendedEmpty')}{' '}
                  <Link className="font-medium text-accent-primary hover:underline" to="/app/benefits">
                    {t('nav.schemesOpportunities')}
                  </Link>
                  .
                </p>
              ) : (
                schemes.map((s) => (
                  <Link
                    key={s.id}
                    to="/app/benefits"
                    className="rounded-2xl border border-border-light bg-surface p-4 text-left transition-colors hover:border-accent-primary/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25"
                  >
                    <Badge variant="primary" className="mb-2">
                      {s.governmentLevel === 'state' ? t('dashboardPage.levelState') : t('dashboardPage.levelNational')}
                    </Badge>
                    <h3 className="text-[15px] font-semibold text-primary">{s.schemeName}</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-secondary">{s.description}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-accent-primary">
                      {t('dashboardPage.view')} <ChevronRight size={12} aria-hidden />
                    </span>
                  </Link>
                ))
              )}
            </div>

            <div className="mt-8 border-t border-border-light pt-6">
              <h3 className="ds-card-title mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-accent-primary" strokeWidth={2} aria-hidden />
                {t('dashboardPage.activityTitle')}
              </h3>
              <div className="space-y-3">
                {summary.activities?.length ? (
                  summary.activities.map((a) => (
                    <p key={a.id} className="text-sm leading-relaxed text-secondary">
                      {a.message}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-secondary">{t('dashboardPage.activityEmpty')}</p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.aside variants={item} className="flex flex-col gap-6 lg:col-span-4">
          <Card elevated className="!p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="ds-card-title flex items-center gap-2">
                <Bell className="h-4 w-4 text-accent-primary" strokeWidth={2} aria-hidden />
                {t('dashboardPage.recentNotificationsTitle')}
              </h3>
              <Link
                to="/app/alerts"
                className="text-xs font-medium text-accent-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/30"
              >
                {t('dashboardPage.viewAllAlerts')}
              </Link>
            </div>
            {previewNotifs.length === 0 ? (
              <p className="text-sm text-secondary">{t('dashboardPage.recentNotificationsEmpty')}</p>
            ) : (
              <ul className="space-y-3">
                {previewNotifs.map((n) => (
                  <li key={n.id} className="text-sm">
                    <p className="font-medium text-primary">{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-secondary">{n.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card elevated className="!p-5">
            <h3 className="ds-card-title mb-4">{t('dashboardPage.quickActionsTitle')}</h3>
            <div className="grid grid-cols-1 gap-2">
              <Link
                to="/app/benefits"
                className="flex items-center gap-3 rounded-xl border border-border-light px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface"
              >
                <LayoutGrid className="h-4 w-4 text-accent-primary" aria-hidden />
                {t('dashboardPage.quickActionSchemes')}
              </Link>
              <Link
                to="/app/vault"
                className="flex items-center gap-3 rounded-xl border border-border-light px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface"
              >
                <FolderOpen className="h-4 w-4 text-accent-primary" aria-hidden />
                {t('dashboardPage.quickActionDocuments')}
              </Link>
              <Link
                to="/app/services"
                className="flex items-center gap-3 rounded-xl border border-border-light px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface"
              >
                <Inbox className="h-4 w-4 text-accent-primary" aria-hidden />
                {t('dashboardPage.quickActionServices')}
              </Link>
              <Link
                to="/app/alerts"
                className="flex items-center gap-3 rounded-xl border border-border-light px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface"
              >
                <Bell className="h-4 w-4 text-accent-primary" aria-hidden />
                {t('dashboardPage.quickActionAlerts')}
              </Link>
            </div>
          </Card>

          <Card elevated className="!p-5">
            <h3 className="ds-card-title mb-2">{t('dashboardPage.tipsTitle')}</h3>
            <p className="text-sm leading-relaxed text-secondary">{t('dashboardPage.tipsBody')}</p>
            <Link
              to="/app/profile"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-primary hover:underline"
            >
              {t('dashboardPage.eligibilityProfile')}
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </Card>
        </motion.aside>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
