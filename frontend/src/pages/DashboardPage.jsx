import React, { useState } from 'react';
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
  Sparkles,
  Upload,
  Search,
  User,
  Zap,
  Target,
  IndianRupee,
  Clock,
  ArrowRight,
  Star,
  BrainCircuit,
  X,
  AlertTriangle,
  FileWarning,
  Compass,
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
  // insight breakdowns
  pendingApplications: 0,
  approvedApplications: 0,
  rejectedApplications: 0,
  verifiedDocuments: 0,
  pendingDocuments: 0,
};

const METRIC_ACCENTS = {
  primary: { iconWrap: 'bg-blue-500/15 text-blue-400' },
  secondary: { iconWrap: 'bg-violet-500/15 text-violet-400' },
  tertiary: { iconWrap: 'bg-emerald-500/15 text-emerald-400' },
  neutral: { iconWrap: 'bg-amber-500/15 text-amber-400' },
};

// variant → color styles for insight pills
const INSIGHT_VARIANTS = {
  green:  'bg-emerald-500/12 text-emerald-500 ring-1 ring-emerald-500/20',
  yellow: 'bg-amber-400/12 text-amber-500 ring-1 ring-amber-400/20',
  red:    'bg-red-500/12 text-red-500 ring-1 ring-red-500/20',
  blue:   'bg-blue-500/12 text-blue-400 ring-1 ring-blue-500/20',
};
const INSIGHT_DOTS = {
  green:  'bg-emerald-500',
  yellow: 'bg-amber-400',
  red:    'bg-red-500',
  blue:   'bg-blue-400',
};

/**
 * insights: Array<{ label: string, variant: 'green'|'yellow'|'red'|'blue' }>
 */
const MetricBlock = ({ title, value, icon: Icon, accent, insights = [], to }) => {
  const a = METRIC_ACCENTS[accent] || METRIC_ACCENTS.primary;
  const content = (
    <Card elevated className={cn("flex flex-col gap-3 !p-4 sm:!p-4 h-full", to && "hover:bg-surface/60 transition-colors")}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-secondary">{title}</h3>
        <div className={cn('rounded-xl p-2 shrink-0', a.iconWrap)}>
          <Icon size={17} strokeWidth={2} aria-hidden />
        </div>
      </div>
      <p className="text-[1.75rem] font-bold tracking-tight text-primary leading-none">{value}</p>
      {insights.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {insights.map((ins, i) => (
            <span
              key={i}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none w-fit',
                INSIGHT_VARIANTS[ins.variant] || INSIGHT_VARIANTS.blue
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', INSIGHT_DOTS[ins.variant] || INSIGHT_DOTS.blue)} />
              {ins.label}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
  
  if (to) {
    return <Link to={to} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 rounded-2xl">{content}</Link>;
  }
  return content;
};

// ─── Helper: format a benefit estimate into a short ₹ string ───────────────
function formatBenefit(scheme) {
  const e = scheme.benefitEstimate;
  if (e) {
    const currency = e.currency === 'INR' ? '₹' : (e.currency || '₹');
    if (e.amountMax) {
      return `${currency}${Number(e.amountMax).toLocaleString('en-IN')} ${e.unit || 'benefit'}`.trim();
    }
    if (e.amountMin) {
      return `${currency}${Number(e.amountMin).toLocaleString('en-IN')} ${e.unit || 'benefit'}`.trim();
    }
    if (e.narrative) return e.narrative;
  }
  if (Array.isArray(scheme.benefitsOffered) && scheme.benefitsOffered.length) {
    const first = scheme.benefitsOffered[0];
    // strip long sentences — show max 60 chars
    return first.length > 60 ? first.slice(0, 58) + '…' : first;
  }
  return null;
}

// ─── Helper: days until deadline ────────────────────────────────────────────
function daysUntilDeadline(deadline) {
  if (!deadline) return null;
  const diff = Math.ceil((new Date(deadline) - Date.now()) / 86400000);
  return diff;
}

// ─── SchemeCard ─────────────────────────────────────────────────────────────
const SchemeCard = ({ scheme, t }) => {
  const matchPct = Math.round((scheme.matchScore || 0) * 100);
  const priorityPct = Math.round((scheme.prioritizedScore || 0) * 100);
  const displayPct = matchPct > 0 ? matchPct : priorityPct;

  const benefit = formatBenefit(scheme);
  const daysLeft = daysUntilDeadline(scheme.deadline);
  const isClosingSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 30;
  const isHighPriority = scheme.isEligible || scheme.prioritizedScore >= 0.75;
  const isApplied = scheme.applicationStatus && scheme.applicationStatus !== 'not_started';

  // Match % ring color
  const matchColor =
    displayPct >= 75 ? 'text-emerald-500' :
    displayPct >= 50 ? 'text-amber-500' :
    'text-blue-400';
  const matchRingColor =
    displayPct >= 75 ? 'stroke-emerald-500' :
    displayPct >= 50 ? 'stroke-amber-400' :
    'stroke-blue-400';

  // SVG ring params
  const r = 16;
  const circ = 2 * Math.PI * r;
  const dash = displayPct > 0 ? (displayPct / 100) * circ : 0;

  return (
    <div className="group relative flex flex-col rounded-2xl border border-border-light bg-surface transition-all duration-200 hover:border-accent-primary/30 hover:shadow-md hover:shadow-accent-primary/5 overflow-hidden">
      {/* top accent bar — color by priority */}
      <div
        className={cn(
          'h-0.5 w-full',
          isHighPriority ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-accent-primary/50 to-violet-400/50'
        )}
      />

      <div className="flex flex-col gap-3 p-4">
        {/* Header row: gov level badge + tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center rounded-full bg-accent-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-primary">
            {scheme.governmentLevel === 'state' ? t('dashboardPage.levelState') : t('dashboardPage.levelNational')}
          </span>
          {isHighPriority && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 ring-1 ring-emerald-500/20">
              <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
              High Priority
            </span>
          )}
          {isClosingSoon && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-500 ring-1 ring-red-400/20">
              <Clock size={9} aria-hidden />
              Closing in {daysLeft}d
            </span>
          )}
          {isApplied && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-500 ring-1 ring-blue-400/20">
              Applied
            </span>
          )}
        </div>

        {/* Title + match ring row */}
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-[14px] font-semibold leading-snug text-primary line-clamp-2">{scheme.schemeName}</h3>
          </div>
          {/* Match % SVG ring */}
          {displayPct > 0 && (
            <div className="relative shrink-0 flex items-center justify-center" style={{ width: 44, height: 44 }}>
              <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
                <circle cx="22" cy="22" r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-border-light" />
                <circle
                  cx="22"
                  cy="22"
                  r={r}
                  fill="none"
                  strokeWidth="3"
                  strokeDasharray={`${dash} ${circ}`}
                  strokeLinecap="round"
                  className={matchRingColor}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Target size={9} className={cn('mb-0.5', matchColor)} aria-hidden />
                <span className={cn('text-[10px] font-bold leading-none', matchColor)}>{displayPct}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Benefit highlight */}
        {benefit && (
          <div className="flex items-center gap-1.5 rounded-xl bg-amber-400/10 px-3 py-1.5 ring-1 ring-amber-400/15">
            <IndianRupee size={12} className="shrink-0 text-amber-500" aria-hidden />
            <span className="text-[12px] font-semibold text-amber-600 leading-snug line-clamp-1">{benefit}</span>
          </div>
        )}

        {/* Description */}
        <p className="line-clamp-2 text-[12px] leading-relaxed text-secondary">{scheme.description}</p>

        {/* CTA */}
        <Link
          to="/app/benefits"
          className={cn(
            'mt-auto inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-[12px] font-semibold transition-all',
            isApplied
              ? 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/15'
              : 'bg-accent-primary text-white hover:bg-accent-primary/90 shadow-sm shadow-accent-primary/25'
          )}
        >
          {isApplied ? (
            <>Track Application <ArrowRight size={12} /></>
          ) : (
            <><Zap size={12} /> Apply Now</>
          )}
        </Link>
      </div>
    </div>
  );
};

// ─── AiInsightBar ────────────────────────────────────────────────────────────
// Derives smart suggestions from real intelligence data — no LLM required.
const AiInsightBar = ({ unapplied, deadlines, missingDocs }) => {
  const [dismissed, setDismissed] = useState(false);

  // Build the highest-priority message
  const insights = [
    unapplied > 0 && {
      icon: Sparkles,
      iconClass: 'text-violet-400',
      message: unapplied === 1
        ? "You are eligible for 1 scheme you haven't applied to yet."
        : `You are eligible for ${unapplied} schemes you haven't applied to yet.`,
      cta: 'View Now',
      ctaTo: '/app/benefits',
      variant: 'purple',
    },
    deadlines > 0 && {
      icon: AlertTriangle,
      iconClass: 'text-amber-400',
      message: deadlines === 1
        ? '1 matched scheme has a deadline closing within 30 days.'
        : `${deadlines} matched schemes have deadlines closing within 30 days.`,
      cta: 'Check Deadlines',
      ctaTo: '/app/benefits',
      variant: 'amber',
    },
    missingDocs > 0 && {
      icon: FileWarning,
      iconClass: 'text-rose-400',
      message: missingDocs === 1
        ? "1 eligible scheme needs documents you haven't uploaded yet."
        : `${missingDocs} eligible schemes need documents you haven't uploaded yet.`,
      cta: 'Upload Docs',
      ctaTo: '/app/vault',
      variant: 'rose',
    },
  ].filter(Boolean);

  const active = insights[0]; // show highest priority

  if (dismissed || !active) return null;

  const gradientMap = {
    purple: 'from-violet-500/10 via-indigo-500/5 to-transparent border-violet-500/20',
    amber:  'from-amber-500/10 via-yellow-500/5 to-transparent border-amber-400/20',
    rose:   'from-rose-500/10 via-red-500/5 to-transparent border-rose-400/20',
  };
  const ctaMap = {
    purple: 'bg-violet-600 hover:bg-violet-500 text-white',
    amber:  'bg-amber-500 hover:bg-amber-400 text-white',
    rose:   'bg-rose-600 hover:bg-rose-500 text-white',
  };
  const IconComponent = active.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'relative flex items-center gap-4 rounded-2xl border bg-gradient-to-r px-4 py-3.5 sm:px-5',
        gradientMap[active.variant]
      )}
    >
      {/* Pulsing AI icon */}
      <div className="relative shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
          <BrainCircuit size={18} className="text-accent-primary" aria-hidden />
        </div>
        {/* outer pulse ring */}
        <span className="absolute inset-0 rounded-xl ring-2 ring-accent-primary/30 animate-ping" aria-hidden />
      </div>

      {/* Text content */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent-primary/70">AI Suggestion</span>
          <span className="h-1 w-1 rounded-full bg-accent-primary/40" />
          <IconComponent size={11} className={active.iconClass} aria-hidden />
        </div>
        <p className="text-[13px] font-medium leading-snug text-primary">
          {active.message}
          {insights.length > 1 && (
            <span className="ml-1.5 text-[11px] font-normal text-secondary">
              +{insights.length - 1} more insight{insights.length - 1 > 1 ? 's' : ''}
            </span>
          )}
        </p>
      </div>

      {/* CTA */}
      <Link
        to={active.ctaTo}
        className={cn(
          'shrink-0 rounded-xl px-3.5 py-1.5 text-[12px] font-semibold shadow-sm transition-all',
          ctaMap[active.variant]
        )}
      >
        {active.cta}
      </Link>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss AI suggestion"
        className="shrink-0 rounded-lg p-1 text-secondary transition-colors hover:bg-white/10 hover:text-primary"
      >
        <X size={14} aria-hidden />
      </button>
    </motion.div>
  );
};

// ─── Notification timeline helpers ──────────────────────────────────────────
const NOTIF_TYPE_META = {
  application: {
    icon: CheckCircle2,
    bgClass: 'bg-emerald-500/15',
    iconClass: 'text-emerald-500',
    actionClass: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20',
  },
  document: {
    icon: FileText,
    bgClass: 'bg-blue-500/15',
    iconClass: 'text-blue-400',
    actionClass: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  },
  benefit: {
    icon: Sparkles,
    bgClass: 'bg-violet-500/15',
    iconClass: 'text-violet-400',
    actionClass: 'bg-violet-500/10 text-violet-500 hover:bg-violet-500/20',
  },
  action_required: {
    icon: AlertTriangle,
    bgClass: 'bg-amber-500/15',
    iconClass: 'text-amber-500',
    actionClass: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20',
  },
  service: {
    icon: ClipboardList,
    bgClass: 'bg-teal-500/15',
    iconClass: 'text-teal-500',
    actionClass: 'bg-teal-500/10 text-teal-600 hover:bg-teal-500/20',
  },
  system: {
    icon: Shield,
    bgClass: 'bg-slate-500/15',
    iconClass: 'text-slate-400',
    actionClass: 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20',
  },
};
const NOTIF_DEFAULT_META = {
  icon: Bell,
  bgClass: 'bg-accent-primary/15',
  iconClass: 'text-accent-primary',
  actionClass: 'bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20',
};

function getNotifMeta(type) {
  return NOTIF_TYPE_META[type] || NOTIF_DEFAULT_META;
}

function formatRelativeTime(isoString) {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return new Date(isoString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getNotifActionLink(notif) {
  // Map refType OR type to meaningful actions
  if (notif.refType === 'application' || notif.type === 'application') {
    return { to: '/app/services', label: 'View Application' };
  }
  if (notif.refType === 'document' || notif.type === 'document') {
    return { to: '/app/vault', label: 'View Document' };
  }
  if (notif.type === 'benefit') {
    return { to: '/app/benefits', label: 'Explore Schemes' };
  }
  if (notif.type === 'action_required') {
    return { to: '/app/vault', label: 'Take Action' };
  }
  if (notif.type === 'service') {
    return { to: '/app/services', label: 'View Request' };
  }
  // system notifications — no specific action
  return null;
}

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

  const { data: intelligence = { schemes: [], unapplied: 0, deadlines: 0, missingDocs: 0 } } = useQuery({
    queryKey: ['dashboard', 'schemes-intelligence', user?.id],
    queryFn: async () => {
      const res = await apiFetch('/api/schemes/intelligence');
      if (!res.ok) throw new Error(await getErrorMessageFromResponse(res));
      const data = await res.json();
      const rec = Array.isArray(data.recommended) ? data.recommended : [];
      const eligible = Array.isArray(data.eligible) ? data.eligible : [];
      // Count eligible schemes that haven't been applied to yet
      const unapplied = eligible.filter((s) => s.applicationStatus === 'not_started').length;
      // Count schemes with deadlines in the next 30 days
      const deadlines = rec.filter((s) => {
        if (!s.deadline) return false;
        const days = Math.ceil((new Date(s.deadline) - Date.now()) / 86400000);
        return days >= 0 && days <= 30;
      }).length;
      // Count schemes with missing required documents
      const missingDocs = eligible.filter((s) =>
        Array.isArray(s.missingRequirements) && s.missingRequirements.length > 0
      ).length;
      return { schemes: rec.slice(0, 4), unapplied, deadlines, missingDocs };
    },
    enabled: Boolean(user),
  });
  const schemes = intelligence.schemes;

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

  // Derive first name for a warmer greeting
  const firstName = displayName.split(' ')[0];
  // Role label badge
  const roleLabel = isStaff
    ? role === 'admin' ? 'Administrator' : 'Staff'
    : user?.role === 'student' ? 'Student'
    : user?.role === 'organization' ? 'Organisation'
    : 'Citizen';

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 lg:space-y-10">

      {/* ── HERO BANNER ─────────────────────────────────────────────── */}
      <motion.section
        variants={item}
        className="relative overflow-hidden rounded-2xl lg:rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, var(--color-accent-primary) 0%, #6d52f5 50%, #8b42d8 100%)',
        }}
      >
        {/* subtle dot grid overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* decorative blur orb */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full"
          style={{ background: 'rgba(255,255,255,0.07)', filter: 'blur(40px)' }}
        />

        <div className="relative z-10 px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          {/* top row: role badge + notifications cue */}
          <div className="mb-5 flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/80 backdrop-blur-sm">
              <User size={11} aria-hidden />
              {roleLabel}
            </span>
            {!isStaff && schemes.length > 0 && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-[11px] font-semibold text-amber-200 ring-1 ring-amber-300/30"
              >
                <Sparkles size={11} aria-hidden />
                {schemes.length} new scheme{schemes.length !== 1 ? 's' : ''} eligible
              </motion.span>
            )}
          </div>

          {/* greeting + subline */}
          <div className="mb-7 max-w-2xl">
            <h1 className="text-3xl font-bold leading-snug tracking-tight text-white sm:text-4xl lg:text-[2.6rem]">
              Welcome back,{' '}
              <span className="text-white/90">{firstName}</span>
              {' '}👋
            </h1>
            {!isStaff && schemes.length > 0 ? (
              <p className="mt-2 text-base font-medium text-white/70">
                You're eligible for{' '}
                <span className="font-semibold text-white">{schemes.length} scheme{schemes.length !== 1 ? 's' : ''}</span>
                {' '}— take action today.
              </p>
            ) : (
              <p className="mt-2 text-base text-white/70">
                {t('dashboardPage.intro')}
              </p>
            )}
          </div>

          {/* PRIMARY ACTION BUTTONS */}
          <div className="flex flex-wrap gap-3">
            <Link to="/app/benefits">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-lg shadow-black/10 transition-all hover:bg-white/95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <Zap size={15} aria-hidden />
                Apply Now
              </motion.button>
            </Link>
            <Link to="/app/services">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <Search size={15} aria-hidden />
                Check Status
              </motion.button>
            </Link>
            <Link to="/app/vault">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <Upload size={15} aria-hidden />
                Upload Documents
              </motion.button>
            </Link>
          </div>

          {/* QUICK STATS STRIP */}
          <div className="mt-8 flex flex-wrap gap-5 border-t border-white/15 pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-white/60" aria-hidden />
              <span className="text-sm font-semibold text-white">{summary.applications}</span>
              <span className="text-sm text-white/55">Applications</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-white/60" aria-hidden />
              <span className="text-sm font-semibold text-white">{summary.completedTasks}</span>
              <span className="text-sm text-white/55">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <FolderOpen size={15} className="text-white/60" aria-hidden />
              <span className="text-sm font-semibold text-white">{summary.documents}</span>
              <span className="text-sm text-white/55">Documents</span>
            </div>
            {!isStaff && (
              <div className="flex items-center gap-2">
                <ClipboardList size={15} className="text-white/60" aria-hidden />
                <span className="text-sm font-semibold text-white">{summary.myOpenServiceRequests ?? 0}</span>
                <span className="text-sm text-white/55">Open requests</span>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* ── AI INSIGHT BAR ────────────────────────────────────────────── */}
      {!isStaff && (
        <AiInsightBar
          unapplied={intelligence.unapplied}
          deadlines={intelligence.deadlines}
          missingDocs={intelligence.missingDocs}
        />
      )}

      <motion.section variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {/* Applications card */}
        <MetricBlock
          title={t('dashboardPage.metricApplications')}
          value={String(summary.applications)}
          icon={TrendingUp}
          accent="primary"
          to="/app/progress"
          insights={[
            ...(summary.pendingApplications > 0
              ? [{ label: `${summary.pendingApplications} pending approval`, variant: 'yellow' }]
              : []),
            ...(summary.approvedApplications > 0
              ? [{ label: `${summary.approvedApplications} approved`, variant: 'green' }]
              : []),
            ...(summary.rejectedApplications > 0
              ? [{ label: `${summary.rejectedApplications} rejected`, variant: 'red' }]
              : []),
            ...(summary.applications === 0
              ? [{ label: 'No applications yet', variant: 'blue' }]
              : []),
          ]}
        />
        {/* Documents card */}
        <MetricBlock
          title={t('dashboardPage.metricDocuments')}
          value={String(summary.documents)}
          icon={Award}
          accent="secondary"
          to="/app/vault"
          insights={[
            ...(summary.verifiedDocuments > 0
              ? [{ label: `${summary.verifiedDocuments} verified`, variant: 'green' }]
              : []),
            ...(summary.pendingDocuments > 0
              ? [{ label: `${summary.pendingDocuments} under review`, variant: 'yellow' }]
              : []),
            ...(summary.documents === 0
              ? [{ label: 'Upload your first doc', variant: 'blue' }]
              : []),
          ]}
        />
        {/* Completed tasks card */}
        <MetricBlock
          title={t('dashboardPage.metricCompleted')}
          value={String(summary.completedTasks)}
          icon={CheckCircle2}
          accent="tertiary"
          to="/app/progress"
          insights={[
            ...(summary.completedTasks > 0
              ? [{ label: `${summary.completedTasks} tasks done`, variant: 'green' }]
              : [{ label: 'Nothing completed yet', variant: 'blue' }]),
            ...(summary.pendingApplications > 0
              ? [{ label: `${summary.pendingApplications} still in progress`, variant: 'yellow' }]
              : []),
          ]}
        />
        {/* Queue / service requests card */}
        <MetricBlock
          title={isStaff ? t('dashboardPage.metricQueueStaff') : t('dashboardPage.metricQueueUser')}
          value={String(
            isStaff ? (summary.staffServiceQueueCount ?? 0) : (summary.myOpenServiceRequests ?? 0)
          )}
          icon={ClipboardList}
          accent="neutral"
          to="/app/services"
          insights={isStaff
            ? [
                summary.staffServiceQueueCount > 0
                  ? { label: `${summary.staffServiceQueueCount} need review`, variant: 'red' }
                  : { label: 'Queue is clear', variant: 'green' },
              ]
            : [
                ...(summary.myOpenServiceRequests > 0
                  ? [{ label: `${summary.myOpenServiceRequests} open requests`, variant: 'yellow' }]
                  : [{ label: 'No pending requests', variant: 'green' }]),
              ]
          }
        />
      </motion.section>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
        <motion.div variants={item} className="lg:col-span-8">
          <Card elevated className="!p-5 sm:!p-6">
            {/* Section header */}
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-primary text-white">
                  <Star className="h-5 w-5" strokeWidth={2} aria-hidden />
                </div>
                <div>
                  <h2 className="ds-card-title">{t('dashboardPage.recommendedTitle')}</h2>
                  <p className="ds-caption mt-0.5 uppercase tracking-wide">{t('dashboardPage.recommendedSubtitle')}</p>
                </div>
              </div>
              {schemes.length > 0 && (
                <Link
                  to="/app/benefits"
                  className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-accent-primary hover:underline sm:inline-flex"
                >
                  View all <ArrowRight size={12} aria-hidden />
                </Link>
              )}
            </div>

            {/* Scheme cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {schemes.length === 0 ? (
                <div className="md:col-span-2 rounded-2xl border border-dashed border-border-light bg-surface/50 p-8 text-center">
                  <Sparkles className="mx-auto mb-3 h-8 w-8 text-accent-primary/40" />
                  <p className="text-sm font-medium text-primary mb-1">No personalised matches yet</p>
                  <p className="text-xs text-secondary mb-4">{t('dashboardPage.recommendedEmpty')}</p>
                  <Link
                    to="/app/benefits"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-accent-primary px-4 py-2 text-xs font-semibold text-white hover:bg-accent-primary/90"
                  >
                    {t('nav.schemesOpportunities')} <ArrowRight size={12} />
                  </Link>
                </div>
              ) : (
                schemes.map((s) => <SchemeCard key={s.id} scheme={s} t={t} />)
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
            <div className="mb-5 flex items-center justify-between gap-2">
              <h3 className="ds-card-title flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-primary/15">
                  <Bell className="h-3.5 w-3.5 text-accent-primary" strokeWidth={2.5} aria-hidden />
                </div>
                {t('dashboardPage.recentNotificationsTitle')}
              </h3>
              <Link
                to="/app/alerts"
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-accent-primary transition-colors hover:bg-accent-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/30"
              >
                View all <ChevronRight size={11} aria-hidden />
              </Link>
            </div>
            {previewNotifs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border-light bg-surface/50 p-6 text-center">
                <Bell className="mx-auto mb-2 h-6 w-6 text-secondary/40" aria-hidden />
                <p className="text-sm font-medium text-secondary">{t('dashboardPage.recentNotificationsEmpty')}</p>
              </div>
            ) : (
              <div className="relative">
                {/* timeline connector line */}
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-accent-primary/20 via-border-light to-transparent" aria-hidden />
                <ul className="space-y-1">
                  {previewNotifs.map((n, idx) => {
                    const notifMeta = getNotifMeta(n.type);
                    const NotifIcon = notifMeta.icon;
                    const relTime = formatRelativeTime(n.at);
                    const actionLink = getNotifActionLink(n);

                    return (
                      <li key={n.id}>
                        <div
                          className={cn(
                            'group relative flex gap-3 rounded-xl px-2 py-2.5 transition-all duration-200',
                            n.clientUnread
                              ? 'bg-accent-primary/[0.04] hover:bg-accent-primary/[0.08]'
                              : 'hover:bg-surface'
                          )}
                        >
                          {/* icon node on timeline */}
                          <div className={cn(
                            'relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-xl ring-2 ring-bg-primary transition-shadow',
                            notifMeta.bgClass,
                            n.clientUnread && 'shadow-sm'
                          )}>
                            <NotifIcon size={13} strokeWidth={2.5} className={notifMeta.iconClass} aria-hidden />
                            {/* unread pulse dot */}
                            {n.clientUnread && (
                              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-primary opacity-40" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent-primary ring-2 ring-bg-primary" />
                              </span>
                            )}
                          </div>

                          {/* content */}
                          <div className="min-w-0 flex-1 pt-0.5">
                            <div className="flex items-start justify-between gap-2">
                              <p className={cn(
                                'text-[13px] leading-snug line-clamp-1',
                                n.clientUnread ? 'font-semibold text-primary' : 'font-medium text-primary/85'
                              )}>
                                {n.title}
                              </p>
                              <span className="shrink-0 text-[10px] font-medium text-secondary/70 tabular-nums whitespace-nowrap pt-0.5">
                                {relTime}
                              </span>
                            </div>
                            <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-secondary">
                              {n.body}
                            </p>
                            {/* clickable action */}
                            {actionLink && (
                              <Link
                                to={actionLink.to}
                                className={cn(
                                  'mt-1.5 inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-semibold transition-all',
                                  notifMeta.actionClass
                                )}
                              >
                                {actionLink.label} <ArrowRight size={9} aria-hidden />
                              </Link>
                            )}
                          </div>
                        </div>
                        {/* separator except after last */}
                        {idx < previewNotifs.length - 1 && (
                          <div className="ml-[15px] h-px bg-transparent" aria-hidden />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
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
              <Link
                to="/app/life-events"
                className="flex items-center gap-3 rounded-xl border border-border-light px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface"
              >
                <Compass className="h-4 w-4 text-accent-primary" aria-hidden />
                Life Event Navigator
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
