import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  FileText,
  Upload,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Filter,
  TrendingUp,
  Target,
  Zap,
  Eye,
  ChevronRight,
  Circle,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Activity,
  Plus,
  Search,
} from 'lucide-react';
import { Card, Button, Badge, cn } from '../../components/ui';

// Simple Bar Chart Component
function BarChart({ data, maxValue }) {
  return (
    <div className="flex items-end gap-2 h-20">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center gap-1">
          <div
            className="w-8 bg-accent-primary rounded-t"
            style={{ height: `${(item.value / maxValue) * 60}px` }}
          ></div>
          <span className="text-xs text-secondary">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// Simple Line Chart Component
function LineChart({ data }) {
  const maxValue = Math.max(...data.map(d => d.value));
  const points = data.map((d, i) => `${i * 50 + 20},${80 - (d.value / maxValue) * 60}`).join(' ');
  return (
    <svg className="w-full h-20" viewBox="0 0 200 80">
      <polyline
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        points={points}
      />
      {data.map((d, i) => (
        <circle key={i} cx={i * 50 + 20} cy={80 - (d.value / maxValue) * 60} r="3" fill="#3b82f6" />
      ))}
    </svg>
  );
}

// Mock data for enhanced progress tracking
const MOCK_APPLICATIONS = [
  {
    id: '1',
    title: 'PM Kisan Scheme Application',
    type: 'scheme',
    status: 'in_review',
    steps: [
      { name: 'Application Submitted', completed: true, date: '2024-03-15' },
      { name: 'Document Verification', completed: true, date: '2024-03-16' },
      { name: 'Eligibility Check', completed: false, current: true },
      { name: 'Approval', completed: false },
    ],
    deadline: '2024-04-15',
    lastUpdated: '2 days ago',
    priority: 'normal',
    missingDocs: [],
  },
  {
    id: '2',
    title: 'Ayushman Bharat Health Card',
    type: 'scheme',
    status: 'action_required',
    steps: [
      { name: 'Application Submitted', completed: true, date: '2024-03-10' },
      { name: 'Document Verification', completed: false, current: true },
      { name: 'Card Generation', completed: false },
      { name: 'Distribution', completed: false },
    ],
    deadline: '2024-03-25',
    lastUpdated: '1 hour ago',
    priority: 'urgent',
    missingDocs: ['Income Certificate', 'Address Proof'],
  },
  {
    id: '3',
    title: 'MGNREGA Job Card Renewal',
    type: 'scheme',
    status: 'approved',
    steps: [
      { name: 'Application Submitted', completed: true, date: '2024-03-01' },
      { name: 'Verification', completed: true, date: '2024-03-05' },
      { name: 'Approval', completed: true, date: '2024-03-08' },
      { name: 'Card Issued', completed: true, date: '2024-03-10' },
    ],
    deadline: null,
    lastUpdated: '5 days ago',
    priority: 'normal',
    missingDocs: [],
  },
  {
    id: '4',
    title: 'Pradhan Mantri Awas Yojana',
    type: 'scheme',
    status: 'submitted',
    steps: [
      { name: 'Application Submitted', completed: true, date: '2024-03-20' },
      { name: 'Initial Review', completed: false, current: true },
      { name: 'Site Inspection', completed: false },
      { name: 'Approval', completed: false },
    ],
    deadline: '2024-05-01',
    lastUpdated: '3 hours ago',
    priority: 'normal',
    missingDocs: [],
  },
];

const STATUS_CONFIG = {
  submitted: {
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    icon: Clock,
    label: 'Submitted',
  },
  in_review: {
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    icon: Clock,
    label: 'In Review',
  },
  approved: {
    color: 'bg-green-500/10 text-green-600 border-green-500/20',
    icon: CheckCircle,
    label: 'Approved',
  },
  rejected: {
    color: 'bg-red-500/10 text-red-600 border-red-500/20',
    icon: AlertCircle,
    label: 'Rejected',
  },
  action_required: {
    color: 'bg-red-500/10 text-red-600 border-red-500/20',
    icon: AlertTriangle,
    label: 'Action Required',
  },
};

const FILTER_OPTIONS = [
  { key: 'all', label: 'All', icon: FileText },
  { key: 'in_progress', label: 'In Progress', icon: Clock },
  { key: 'completed', label: 'Completed', icon: CheckCircle },
  { key: 'action_required', label: 'Action Required', icon: AlertTriangle },
];

const SORT_OPTIONS = [
  { key: 'updated', label: 'Last Updated' },
  { key: 'deadline', label: 'Deadline' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
];

function ProgressStep({ step, isLast }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full border-2',
            step.completed
              ? 'border-green-500 bg-green-500 text-white'
              : step.current
              ? 'border-blue-500 bg-blue-500 text-white'
              : 'border-gray-300 bg-gray-100 text-gray-400'
          )}
        >
          {step.completed ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : step.current ? (
            <Circle className="h-4 w-4 fill-current" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
        </div>
        {!isLast && (
          <div
            className={cn(
              'mt-1 h-6 w-0.5',
              step.completed ? 'bg-green-500' : 'bg-gray-300'
            )}
          />
        )}
      </div>
      <div className="flex-1">
        <p
          className={cn(
            'text-sm font-medium',
            step.completed
              ? 'text-green-700'
              : step.current
              ? 'text-blue-700'
              : 'text-gray-500'
          )}
        >
          {step.name}
        </p>
        {step.date && (
          <p className="text-xs text-gray-500">{step.date}</p>
        )}
      </div>
    </div>
  );
}

function ApplicationCard({ application }) {
  const [expanded, setExpanded] = useState(false);
  const config = STATUS_CONFIG[application.status];
  const StatusIcon = config.icon;

  const daysUntilDeadline = application.deadline
    ? Math.ceil((new Date(application.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md',
        config.color,
        isUrgent && 'ring-1 ring-red-500/20'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-primary">{application.title}</h3>
            {isUrgent && <AlertTriangle className="h-4 w-4 text-red-500" />}
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Badge className={config.color}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {config.label}
            </Badge>
            <span className="text-xs text-secondary">{application.lastUpdated}</span>
          </div>

          {application.deadline && (
            <div className="flex items-center gap-1 mb-3">
              <Calendar className="h-4 w-4 text-secondary" />
              <span className={cn(
                'text-sm',
                isUrgent ? 'text-red-600 font-medium' : 'text-secondary'
              )}>
                Deadline: {application.deadline}
                {daysUntilDeadline !== null && (
                  <span className="ml-1">
                    ({daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : 'Overdue'})
                  </span>
                )}
              </span>
            </div>
          )}

          {application.missingDocs.length > 0 && (
            <div className="mb-3 rounded-md bg-red-50 p-2">
              <p className="text-sm font-medium text-red-800">Missing Documents:</p>
              <ul className="mt-1 text-sm text-red-700">
                {application.missingDocs.map((doc, index) => (
                  <li key={index}>• {doc}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="shrink-0"
        >
          <ChevronRight className={cn(
            'h-4 w-4 transition-transform',
            expanded && 'rotate-90'
          )} />
        </Button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 space-y-3"
          >
            <div>
              <h4 className="text-sm font-medium text-primary mb-3">Progress Tracker</h4>
              <div className="space-y-2">
                {application.steps.map((step, index) => (
                  <ProgressStep
                    key={index}
                    step={step}
                    isLast={index === application.steps.length - 1}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-border-light">
              <Button size="sm" variant="outline">
                <Eye className="mr-1 h-3 w-3" />
                View Details
              </Button>
              {application.missingDocs.length > 0 && (
                <Button size="sm" variant="primary">
                  <Upload className="mr-1 h-3 w-3" />
                  Upload Documents
                </Button>
              )}
              <Button size="sm" variant="outline">
                <Target className="mr-1 h-3 w-3" />
                Track
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ProgressWorkspace({ applications = [] }) {

  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated');

  // Defensive mapping: ensure all required fields exist
  const apps = useMemo(() => {
    if (applications.length === 0) return MOCK_APPLICATIONS;
    return applications.map((app, idx) => {
      // Defensive: fallback values for missing fields
      return {
        ...app,
        steps: app.steps || [
          { name: 'Application Submitted', completed: true, date: app.updatedAt ? new Date(app.updatedAt).toLocaleDateString() : undefined },
          { name: 'Under Review', completed: app.status === 'in_review' || app.status === 'approved', current: app.status === 'in_review' },
          { name: 'Approved', completed: app.status === 'approved' }
        ],
        status: app.status || 'submitted',
        priority: app.priority || (app.deadline ? 'urgent' : 'normal'),
        missingDocs: app.missingDocs || [],
        lastUpdated: app.updatedAt ? new Date(app.updatedAt).toLocaleDateString() : 'Recently',
        deadline: app.deadline || null,
        title: app.title || `Application #${idx + 1}`,
        type: app.type || 'scheme',
      };
    });
  }, [applications]);

  const filteredAndSortedApps = useMemo(() => {
    let filtered = apps;

    if (activeFilter === 'in_progress') {
      filtered = apps.filter(app => ['submitted', 'in_review'].includes(app.status));
    } else if (activeFilter === 'completed') {
      filtered = apps.filter(app => app.status === 'approved');
    } else if (activeFilter === 'action_required') {
      filtered = apps.filter(app => app.status === 'action_required');
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'updated') {
        return new Date(b.updatedAt || b.lastUpdated) - new Date(a.updatedAt || a.lastUpdated);
      }
      if (sortBy === 'deadline') {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      }
      if (sortBy === 'priority') {
        const priorityOrder = { urgent: 0, normal: 1 };
        return priorityOrder[a.priority || 'normal'] - priorityOrder[b.priority || 'normal'];
      }
      return 0;
    });

    return filtered;
  }, [apps, activeFilter, sortBy]);

  const summary = useMemo(() => {
    const total = apps.length;
    const completed = apps.filter(app => app.status === 'approved').length;
    const inProgress = apps.filter(app => ['submitted', 'in_review'].includes(app.status)).length;
    const actionRequired = apps.filter(app => app.status === 'action_required').length;
    const submitted = apps.filter(app => app.status === 'submitted').length;
    const inReview = apps.filter(app => app.status === 'in_review').length;

    return { total, completed, inProgress, actionRequired, submitted, inReview };
  }, [apps]);

  const progressPercentage = summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0;

  // Mock chart data
  const statusChartData = [
    { label: 'Approved', value: summary.completed },
    { label: 'In Review', value: summary.inReview },
    { label: 'Submitted', value: summary.submitted },
    { label: 'Action Req', value: summary.actionRequired },
  ];
  const timeChartData = [
    { label: 'Week 1', value: 1 },
    { label: 'Week 2', value: 2 },
    { label: 'Week 3', value: 3 },
    { label: 'Week 4', value: 4 },
  ];

  // Recent activities
  const recentActivities = useMemo(() => {
    return apps.slice(0, 5).map(app => ({
      id: app.id,
      type: 'Application',
      description: `${app.title} - ${STATUS_CONFIG[app.status].label}`,
      time: app.lastUpdated,
      icon: STATUS_CONFIG[app.status].icon,
    }));
  }, [apps]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Activity & Analytics</h1>
          <p className="mt-1 text-secondary">Track your progress, insights, and recent activities</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Plus className="mr-1 h-4 w-4" />
            Apply for Scheme
          </Button>
          <Button size="sm" variant="outline">
            <Upload className="mr-1 h-4 w-4" />
            Upload Document
          </Button>
          <Button size="sm" variant="outline">
            <Search className="mr-1 h-4 w-4" />
            Check Status
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card elevated className="!p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary">Applications</p>
              <p className="text-2xl font-bold text-primary">{summary.total}</p>
              <p className="text-xs text-secondary">({summary.inReview} in review, {summary.submitted} submitted)</p>
            </div>
          </div>
        </Card>

        <Card elevated className="!p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary">Completed</p>
              <p className="text-2xl font-bold text-primary">{summary.completed}</p>
              <p className="text-xs text-secondary">Approved applications</p>
            </div>
          </div>
        </Card>

        <Card elevated className="!p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary">In Progress</p>
              <p className="text-2xl font-bold text-primary">{summary.inProgress}</p>
              <p className="text-xs text-secondary">Active applications</p>
            </div>
          </div>
        </Card>

        <Card elevated className="!p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary">Action Required</p>
              <p className="text-2xl font-bold text-primary">{summary.actionRequired}</p>
              <p className="text-xs text-secondary">Needs attention</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Visual Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card elevated className="!p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-accent-primary" />
            <h3 className="font-semibold text-primary">Status Breakdown</h3>
          </div>
          <BarChart data={statusChartData} maxValue={Math.max(...statusChartData.map(d => d.value))} />
        </Card>

        <Card elevated className="!p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-accent-primary" />
            <h3 className="font-semibold text-primary">Applications Over Time</h3>
          </div>
          <LineChart data={timeChartData} />
        </Card>
      </div>

      {/* Performance Summary */}
      <Card elevated className="!p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-accent-primary" />
          <h3 className="font-semibold text-primary">Performance Summary</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm text-secondary">Completion Rate</p>
            <p className="text-2xl font-bold text-primary">{progressPercentage}%</p>
          </div>
          <div>
            <p className="text-sm text-secondary">Average Processing Time</p>
            <p className="text-2xl font-bold text-primary">12 days</p>
          </div>
          <div>
            <p className="text-sm text-secondary">Success Rate</p>
            <p className="text-2xl font-bold text-primary">75%</p>
          </div>
        </div>
      </Card>

      {/* Progress Overview */}
      <Card elevated className="!p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-primary">Overall Progress</h3>
          <span className="text-sm text-secondary">{summary.completed}/{summary.total} applications completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-xs text-secondary mt-2">{progressPercentage}% complete</p>
      </Card>

      {/* AI Insights */}
      <Card elevated className="!p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-accent-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-primary">AI Insights</h3>
              <p className="mt-1 text-sm text-secondary">
                You submitted 2 applications this week. Complete 1 more step to finish your PM Kisan application.
              </p>
            </div>
          </div>
          <Button size="sm" variant="primary">
            Take Action
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card elevated className="!p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-primary flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </h3>
          <Button size="sm" variant="ghost">View All</Button>
        </div>
        <div className="space-y-3">
          {recentActivities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-primary/10">
                  <Icon className="h-4 w-4 text-accent-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary">{activity.description}</p>
                  <p className="text-xs text-secondary">{activity.time}</p>
                </div>
                <Button size="sm" variant="ghost">
                  <Eye className="h-4 w-4" />
                  View Details
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-1">
          {FILTER_OPTIONS.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.key;
            return (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent-primary text-white'
                    : 'text-secondary hover:bg-surface hover:text-primary'
                )}
              >
                <Icon className="h-4 w-4" />
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-secondary">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-border-light bg-surface px-3 py-2 text-sm"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredAndSortedApps.length === 0 ? (
          <Card elevated className="!p-8 text-center">
            <Activity className="mx-auto h-12 w-12 text-secondary" />
            <h3 className="mt-4 text-lg font-semibold text-primary">No activity yet</h3>
            <p className="mt-2 text-secondary">Start by applying for a scheme or uploading documents to see your progress and insights.</p>
            <div className="mt-4 flex gap-2 justify-center">
              <Button onClick={() => window.location.assign('/app/benefits')}>
                Apply for Scheme
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => window.location.assign('/app/vault')}>
                Upload Document
              </Button>
            </div>
          </Card>
        ) : (
          filteredAndSortedApps.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))
        )}
      </div>
    </div>
  );
}