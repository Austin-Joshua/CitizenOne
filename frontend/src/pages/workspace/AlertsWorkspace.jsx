import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Upload,
  ExternalLink,
  Filter,
  Bell,
  Zap,
  Info,
  ArrowRight,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Card, Button, Badge, cn } from '../../components/ui';

// Mock data for enhanced alerts - in real app, this would come from API
const MOCK_ALERTS = [
  {
    id: '1',
    type: 'action_required',
    priority: 'urgent',
    title: 'Upload Income Certificate',
    description: 'Required for scheme eligibility verification',
    timeAgo: '2 hours ago',
    action: { label: 'Upload Now', type: 'upload', target: '/app/vault' },
    category: 'documents',
    unread: true,
  },
  {
    id: '2',
    type: 'deadline',
    priority: 'warning',
    title: 'Scheme Deadline Approaching',
    description: 'PM Kisan application deadline in 3 days',
    timeAgo: '1 day ago',
    action: { label: 'Apply Now', type: 'navigate', target: '/app/benefits' },
    category: 'schemes',
    unread: true,
  },
  {
    id: '3',
    type: 'update',
    priority: 'info',
    title: 'New Scheme Available',
    description: 'You are now eligible for Ayushman Bharat',
    timeAgo: '3 days ago',
    action: { label: 'View Details', type: 'navigate', target: '/app/benefits' },
    category: 'schemes',
    unread: false,
  },
  {
    id: '4',
    type: 'action_required',
    priority: 'urgent',
    title: 'Complete Profile Verification',
    description: 'Add Aadhaar number to access more schemes',
    timeAgo: '5 hours ago',
    action: { label: 'Update Profile', type: 'navigate', target: '/app/profile' },
    category: 'profile',
    unread: true,
  },
  {
    id: '5',
    type: 'deadline',
    priority: 'warning',
    title: 'Document Expiry Notice',
    description: 'Your caste certificate expires in 30 days',
    timeAgo: '2 days ago',
    action: { label: 'Renew Now', type: 'upload', target: '/app/vault' },
    category: 'documents',
    unread: false,
  },
];

const PRIORITY_CONFIG = {
  urgent: {
    color: 'border-red-500 bg-red-500/5',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    label: 'Urgent',
  },
  warning: {
    color: 'border-amber-500 bg-amber-500/5',
    icon: Clock,
    iconColor: 'text-amber-500',
    label: 'Warning',
  },
  info: {
    color: 'border-blue-500 bg-blue-500/5',
    icon: Info,
    iconColor: 'text-blue-500',
    label: 'Info',
  },
};

const CATEGORY_FILTERS = [
  { key: 'all', label: 'All', icon: Bell },
  { key: 'action_required', label: 'Action Required', icon: Zap },
  { key: 'deadline', label: 'Deadlines', icon: Clock },
  { key: 'update', label: 'Updates', icon: Info },
];

const QUICK_ACTIONS = [
  { label: 'Apply for Scheme', icon: FileText, action: () => window.location.assign('/app/benefits') },
  { label: 'Upload Document', icon: Upload, action: () => window.location.assign('/app/vault') },
  { label: 'Check Eligibility', icon: CheckCircle, action: () => window.location.assign('/app/assistant') },
];

export function AlertsWorkspace({ alertFeed = [] }) {
  const [activeFilter, setActiveFilter] = useState('all');

  // Use mock data if no real alerts, otherwise enhance real alerts
  const alerts = useMemo(() => {
    if (alertFeed.length === 0) return MOCK_ALERTS;

    // Enhance real alerts with mock properties for demo
    return alertFeed.map((alert, index) => ({
      ...alert,
      priority: index % 3 === 0 ? 'urgent' : index % 3 === 1 ? 'warning' : 'info',
      type: index % 3 === 0 ? 'action_required' : index % 3 === 1 ? 'deadline' : 'update',
      description: alert.body,
      timeAgo: alert.at ? new Date(alert.at).toLocaleString() : 'Recently',
      action: {
        label: index % 3 === 0 ? 'Upload Now' : index % 3 === 1 ? 'Apply Now' : 'View Details',
        type: 'navigate',
        target: '/app/benefits',
      },
      category: index % 3 === 0 ? 'documents' : 'schemes',
    }));
  }, [alertFeed]);

  const filteredAlerts = useMemo(() => {
    if (activeFilter === 'all') return alerts;
    return alerts.filter(alert => alert.type === activeFilter);
  }, [alerts, activeFilter]);

  const summary = useMemo(() => {
    const actionRequired = alerts.filter(a => a.type === 'action_required').length;
    const deadlines = alerts.filter(a => a.type === 'deadline').length;
    const updates = alerts.filter(a => a.type === 'update').length;
    return { actionRequired, deadlines, updates };
  }, [alerts]);

  const handleAction = (action) => {
    if (action.type === 'navigate') {
      window.location.assign(action.target);
    } else if (action.type === 'upload') {
      // Handle upload action
      window.location.assign(action.target);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Notifications & Alerts</h1>
        <p className="mt-1 text-secondary">Stay informed and take action on important updates</p>
      </div>

      {/* Summary Section */}
      <Card elevated className="!p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">
                {summary.actionRequired} Action Required
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">
                {summary.deadlines} Deadlines
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">
                {summary.updates} Updates
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-secondary" />
            <span className="text-sm text-secondary">Command Center</span>
          </div>
        </div>
      </Card>

      {/* AI Insights */}
      <Card elevated className="!p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-primary">AI Insights</h3>
            <p className="mt-1 text-sm text-secondary">
              You are eligible for 2 new schemes • You may miss a deadline soon
            </p>
          </div>
          <Button size="sm" variant="primary" onClick={() => window.location.assign('/app/benefits')}>
            View Details
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-1">
        {CATEGORY_FILTERS.map((filter) => {
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

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <Card elevated className="!p-8 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="mt-4 text-lg font-semibold text-primary">You're all caught up!</h3>
            <p className="mt-2 text-secondary">No pending alerts at this time</p>
          </Card>
        ) : (
          <AnimatePresence>
            {filteredAlerts.map((alert) => {
              const config = PRIORITY_CONFIG[alert.priority];
              const Icon = config.icon;
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    'relative overflow-hidden rounded-lg border-l-4 bg-card p-4 shadow-sm transition-all hover:shadow-md',
                    config.color,
                    alert.unread && 'ring-1 ring-accent-primary/20'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={cn('mt-0.5', config.iconColor)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-primary">{alert.title}</h4>
                          {alert.unread && (
                            <div className="h-2 w-2 rounded-full bg-accent-primary" />
                          )}
                        </div>
                        <p className="mt-1 text-sm text-secondary">{alert.description}</p>
                        <p className="mt-2 text-xs text-tertiary">{alert.timeAgo}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleAction(alert.action)}
                      className="shrink-0"
                    >
                      {alert.action.label}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Quick Actions */}
      <Card elevated className="!p-4">
        <h3 className="font-semibold text-primary">Quick Actions</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {QUICK_ACTIONS.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className="flex items-center gap-3 rounded-lg border border-border-light bg-surface p-3 text-left transition-all hover:border-accent-primary/30 hover:bg-accent-primary/5"
              >
                <Icon className="h-5 w-5 text-accent-primary" />
                <span className="text-sm font-medium text-primary">{action.label}</span>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}