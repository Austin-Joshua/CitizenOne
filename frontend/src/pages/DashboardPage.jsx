import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  Shield,
  Award,
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import { Card, Button, Badge, cn } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';

const METRIC_ACCENTS = {
  primary: {
    orb: 'bg-accent-primary',
    iconWrap: 'bg-accent-primary/10 text-accent-primary',
  },
  secondary: {
    orb: 'bg-accent-secondary',
    iconWrap: 'bg-accent-secondary/10 text-accent-secondary',
  },
  tertiary: {
    orb: 'bg-accent-tertiary',
    iconWrap: 'bg-accent-tertiary/10 text-accent-tertiary',
  },
  amber: {
    orb: 'bg-amber-500',
    iconWrap: 'bg-amber-500/10 text-amber-500',
  },
};

const MetricBlock = ({ title, value, change, icon: Icon, accent }) => {
  const a = METRIC_ACCENTS[accent] || METRIC_ACCENTS.primary;
  return (
    <Card
      elevated
      className="group relative flex min-h-[118px] flex-col justify-between overflow-hidden !p-4 sm:!p-4"
    >
      <div
        className={cn(
          'absolute -bottom-8 -right-8 h-28 w-28 rounded-full blur-2xl opacity-15 transition-opacity group-hover:opacity-25',
          a.orb
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-secondary">{title}</h3>
        <div className={cn('rounded-md p-1.5', a.iconWrap)}>
          <Icon size={16} strokeWidth={2} />
        </div>
      </div>
      <div className="relative mt-2">
        <p className="text-2xl font-semibold tracking-tight text-primary sm:text-[1.65rem]">{value}</p>
        <div className="mt-1 flex items-center gap-2">
          <span
            className={cn(
              'text-[11px] font-semibold',
              Number.parseFloat(String(change)) < 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
            )}
          >
            {Number.parseFloat(String(change)) < 0 ? '' : '+'}
            {change}%
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-tertiary">vs prior</span>
        </div>
      </div>
    </Card>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const firstName = user?.name?.split(/\s+/)[0] || 'Operator';
  const roleLabel = user?.role || 'citizen';
  const isAdmin = roleLabel === 'admin';
  const isOrg = roleLabel === 'organization';
  const [summary, setSummary] = useState({ applications: 0, documents: 0, completedTasks: 0, activities: [] });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiFetch('/api/activity/summary');
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setSummary(data);
      } catch {
        // keep dashboard usable with fallback metrics
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <motion.div variants={item} className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            Welcome back, <span className="text-accent-primary">{firstName}</span>
          </h1>
          <p className="max-w-xl text-sm text-secondary sm:text-[15px]">
            Your command center is up to date with the latest recommendations and activity.
          </p>
        </motion.div>
        <motion.div variants={item} className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" className="shadow-none">
            Diagnostics
          </Button>
          <Button size="sm">Report</Button>
        </motion.div>
      </div>

      <motion.div variants={item} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricBlock title="Applications" value={String(summary.applications)} change="6.1" icon={TrendingUp} accent="primary" />
        <MetricBlock title="Documents" value={String(summary.documents)} change="3.7" icon={Award} accent="secondary" />
        <MetricBlock title="Completed tasks" value={String(summary.completedTasks)} change="4.4" icon={Shield} accent="tertiary" />
        <MetricBlock title="Active anomalies" value="3" change="-2" icon={AlertCircle} accent="amber" />
      </motion.div>

      {(isAdmin || isOrg) && (
        <motion.div variants={item} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card elevated className="!p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Program Management</p>
            <p className="mt-2 text-sm text-secondary">
              Manage schemes, publish updates, and monitor moderation queues with role-based governance controls.
            </p>
          </Card>
          <Card elevated className="!p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">System Health</p>
            <p className="mt-2 text-sm text-secondary">
              API uptime 99.98% · AI inference stable · Notification delivery latency 1.2s.
            </p>
          </Card>
        </motion.div>
      )}

      <motion.div variants={item} className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card elevated className="relative !p-4 sm:!p-5">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-accent-primary/5 blur-3xl" />
            <div className="relative mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary shadow-sm shadow-accent-primary/20">
                <Bot className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-primary sm:text-base">Predictive infrastructure</h2>
                <p className="text-[10px] font-medium uppercase tracking-wider text-secondary">
                  Policy recommendations
                </p>
              </div>
            </div>

            <div className="relative grid grid-cols-1 gap-3 md:grid-cols-2">
              <button
                type="button"
                className="rounded-lg border border-border-light bg-base/40 p-3 text-left transition-colors hover:border-accent-primary/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/30"
              >
                <Badge variant="warning" className="mb-2">
                  Traffic
                </Badge>
                <h3 className="text-[13px] font-semibold text-primary">Sector 7 congestion risk</h3>
                <p className="mt-1 text-xs leading-relaxed text-secondary">
                  North Bridge peak 16:00–19:00 · weather-adjusted model
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                  Reroute <ChevronRight size={12} />
                </span>
              </button>
              <button
                type="button"
                className="rounded-lg border border-border-light bg-base/40 p-3 text-left transition-colors hover:border-accent-tertiary/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-tertiary/30"
              >
                <Badge variant="primary" className="mb-2 bg-accent-tertiary/10 text-accent-tertiary">
                  Grant
                </Badge>
                <h3 className="text-[13px] font-semibold text-primary">Urban renewal allocation</h3>
                <p className="mt-1 text-xs leading-relaxed text-secondary">
                  ~94% fit vs. city metrics · $2.5M ceiling
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-accent-tertiary">
                  Draft <ChevronRight size={12} />
                </span>
              </button>
            </div>

            <div className="relative mt-4 flex items-center justify-between border-t border-border-light pt-3">
              <span className="text-[10px] font-medium uppercase tracking-wider text-tertiary">C-ONE v4.2</span>
              <Button variant="ghost" size="sm" className="h-7 text-[10px]">
                Analytics
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card elevated className="!p-4 sm:!p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
              <Sparkles className="h-4 w-4 text-accent-secondary" strokeWidth={2} />
              Operations
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Portal V2 rollout', progress: 78, color: 'bg-accent-primary' },
                { label: 'Grid maintenance', progress: 42, color: 'bg-amber-500' },
                { label: 'Security audit', progress: 15, color: 'bg-accent-secondary' },
              ].map((op) => (
                <div key={op.label} className="space-y-1.5">
                  <div className="flex items-end justify-between gap-2">
                    <span className="text-xs font-medium text-primary">{op.label}</span>
                    <span className="text-[10px] font-semibold text-secondary">{op.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-border-light">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${op.progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={cn('h-full rounded-full', op.color)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-border-light pt-3">
              {summary.activities?.slice(0, 2).map((a) => (
                <p key={a.id} className="mb-2 text-xs text-secondary">{a.message}</p>
              ))}
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-border-light bg-base/30 px-3 py-2 text-left transition-colors hover:border-accent-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25"
              >
                <span className="flex items-center gap-2 text-xs font-medium text-primary">
                  <Briefcase size={14} className="text-accent-primary" />
                  Vendor reviews
                </span>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-primary/15 text-[10px] font-semibold text-accent-primary">
                  4
                </span>
              </button>
            </div>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
