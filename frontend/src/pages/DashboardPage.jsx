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
} from 'lucide-react';
import { Card, Button, Badge, cn } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
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
  primary: {
    orb: 'bg-accent-primary',
    iconWrap: 'bg-accent-primary/10 text-accent-primary',
  },
  secondary: {
    orb: 'bg-emerald-500',
    iconWrap: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  tertiary: {
    orb: 'bg-accent-tertiary',
    iconWrap: 'bg-accent-tertiary/10 text-accent-tertiary',
  },
  neutral: {
    orb: 'bg-slate-400',
    iconWrap: 'bg-border-light text-secondary',
  },
};

const MetricBlock = ({ title, value, hint, icon: Icon, accent }) => {
  const a = METRIC_ACCENTS[accent] || METRIC_ACCENTS.primary;
  return (
    <Card elevated className="flex min-h-[112px] flex-col justify-between !p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-secondary">{title}</h3>
        <div className={cn('rounded-lg p-2', a.iconWrap)}>
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
    show: { opacity: 1, transition: { staggerChildren: 0.04 } },
  };
  const item = {
    hidden: { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  const queueHint = isStaff
    ? summary.staffServiceQueueCount != null
      ? t('dashboardPage.queueHintStaff', { count: summary.staffServiceQueueCount })
      : t('dashboardPage.queueHintStaffShort')
    : summary.myOpenServiceRequests
      ? t('dashboardPage.queueHintUser', { count: summary.myOpenServiceRequests })
      : t('dashboardPage.queueHintNone');

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <motion.div variants={item} className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            {t('dashboardPage.welcomePrefix')}{' '}
            <span className="text-accent-primary">{displayName}</span>
          </h1>
          <p className="max-w-xl text-sm text-secondary sm:text-[15px]">{t('dashboardPage.intro')}</p>
        </motion.div>
        <motion.div variants={item} className="flex flex-wrap gap-2">
          <Link to="/app/benefits">
            <Button size="sm">{t('nav.benefitDiscovery')}</Button>
          </Link>
          <Link to="/app/services">
            <Button variant="secondary" size="sm">
              {t('nav.serviceDesk')}
            </Button>
          </Link>
        </motion.div>
      </div>

      <motion.div variants={item} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card elevated className="!p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary/90 text-white">
                <FileText className="h-5 w-5" strokeWidth={2} aria-hidden />
              </div>
              <div>
                <h2 className="text-base font-semibold text-primary">{t('dashboardPage.recommendedTitle')}</h2>
                <p className="text-[11px] font-medium uppercase tracking-wide text-secondary">{t('dashboardPage.recommendedSubtitle')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {schemes.length === 0 ? (
                <p className="text-sm text-secondary md:col-span-2">
                  {t('dashboardPage.recommendedEmpty')}{' '}
                  <Link className="font-medium text-accent-primary hover:underline" to="/app/benefits">
                    {t('nav.benefitDiscovery')}
                  </Link>
                  .
                </p>
              ) : (
                schemes.map((s) => (
                  <Link
                    key={s.id}
                    to="/app/benefits"
                    className="rounded-lg border border-border-light bg-base/40 p-3 text-left transition-all hover:border-accent-primary/35 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/30"
                  >
                    <Badge variant="primary" className="mb-2">
                      {s.governmentLevel === 'state' ? t('dashboardPage.levelState') : t('dashboardPage.levelNational')}
                    </Badge>
                    <h3 className="text-[13px] font-semibold text-primary">{s.schemeName}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-secondary">{s.description}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-accent-primary">
                      {t('dashboardPage.view')} <ChevronRight size={12} aria-hidden />
                    </span>
                  </Link>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card elevated className="!p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary">
              <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} aria-hidden />
              {t('dashboardPage.activityTitle')}
            </h3>
            <div className="space-y-3">
              {summary.activities?.length ? (
                summary.activities.map((a) => (
                  <p key={a.id} className="text-xs leading-relaxed text-secondary">
                    {a.message}
                  </p>
                ))
              ) : (
                <p className="text-xs text-secondary">{t('dashboardPage.activityEmpty')}</p>
              )}
            </div>
            <div className="mt-4 border-t border-border-light pt-3">
              <Link
                to="/app/profile"
                className="flex w-full items-center justify-between rounded-lg border border-border-light bg-base/30 px-3 py-2 text-left text-xs font-medium text-primary transition-colors hover:border-accent-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25"
              >
                <span>{t('dashboardPage.eligibilityProfile')}</span>
                <ChevronRight className="h-4 w-4 text-tertiary" aria-hidden />
              </Link>
            </div>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
