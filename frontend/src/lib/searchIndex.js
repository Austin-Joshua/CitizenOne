export const globalSearchItems = [
  { id: 'dashboard', title: 'Command Center', subtitle: 'Main dashboard and activity overview', path: '/app/dashboard', category: 'Core' },
  { id: 'assistant', title: 'AI Assistant', subtitle: 'Natural language guidance and action plans', path: '/app/assistant', category: 'AI' },
  { id: 'navigator', title: 'Life Navigator', subtitle: 'Education, jobs, health, family, retirement pathways', path: '/app/navigator', category: 'Guidance' },
  { id: 'benefits', title: 'Benefit Discovery', subtitle: 'Scheme eligibility, status tracking, and deadlines', path: '/app/benefits', category: 'Benefits' },
  { id: 'vault', title: 'Identity Vault', subtitle: 'Documents, access logs, and secure records', path: '/app/vault', category: 'Identity' },
  { id: 'opportunities', title: 'Opportunity Engine', subtitle: 'Jobs, grants, scholarships, and market links', path: '/app/opportunities', category: 'Growth' },
  { id: 'alerts', title: 'Predictive Alerts', subtitle: 'Proactive reminders and deadline notifications', path: '/app/alerts', category: 'Alerts' },
  { id: 'recommendations', title: 'Recommendations', subtitle: 'Personalized AI recommendations', path: '/app/recommendations', category: 'AI' },
  { id: 'inclusion', title: 'Inclusion Tools', subtitle: 'Women, students, rural, and accessibility modules', path: '/app/inclusion', category: 'Inclusion' },
  { id: 'career', title: 'Career & Learning', subtitle: 'Skill gap analysis and learning pathways', path: '/app/career', category: 'Career' },
  { id: 'support', title: 'Community Support', subtitle: 'Mentors, help center, FAQs, and feedback', path: '/app/support', category: 'Support' },
  { id: 'emergency', title: 'Emergency Support', subtitle: 'Critical services and crisis resources', path: '/app/emergency', category: 'Safety' },
  { id: 'offline', title: 'Offline Access', subtitle: 'Save for later, low-connectivity support', path: '/app/offline', category: 'Offline' },
  { id: 'integrations', title: 'Integrations', subtitle: 'API-ready interfaces and data exchange', path: '/app/integrations', category: 'Platform' },
  { id: 'progress', title: 'Progress Tracker', subtitle: 'Applications, tasks, milestones, and outcomes', path: '/app/progress', category: 'Insights' },
  { id: 'analytics', title: 'Personal Analytics', subtitle: 'Engagement and conversion metrics', path: '/app/analytics', category: 'Insights' },
  { id: 'settings', title: 'Settings', subtitle: 'Privacy, notifications, and accessibility preferences', path: '/app/settings', category: 'Account' },
  { id: 'subscription', title: 'Subscription', subtitle: 'Free/Premium plan and billing history', path: '/app/subscription', category: 'Billing' },
  { id: 'admin', title: 'Admin Hub', subtitle: 'Program governance, moderation, and analytics', path: '/app/admin', category: 'Admin' },
  { id: 'profile', title: 'Profile', subtitle: 'Account details, activity history, privacy controls', path: '/app/profile', category: 'Account' },
];

export function querySearchItems(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return globalSearchItems
    .filter((item) =>
      `${item.title} ${item.subtitle} ${item.category}`.toLowerCase().includes(q)
    )
    .slice(0, 8);
}
