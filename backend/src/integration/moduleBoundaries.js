/**
 * Logical modules for service decomposition (monolith today; extract to services later).
 * Each entry documents ownership and stable HTTP surface — see docs/MODULES_AND_SCALING.md.
 */

const MODULE_BOUNDARIES = [
  {
    id: 'authentication-identity',
    paths: ['/auth'],
    description: 'Sign-in, refresh, logout, email verification, password reset, JWT issuance',
    ownerLayer: 'routes/auth.js + lib/passwords + refreshTokenStore',
  },
  {
    id: 'user-profile',
    paths: ['/users'],
    description: 'Directory (admin), profile projection',
    ownerLayer: 'routes/users.js + lib/userStore',
  },
  {
    id: 'scheme-intelligence',
    paths: ['/schemes'],
    description: 'Government scheme catalogue, eligibility intelligence, imports',
    ownerLayer: 'routes/schemes.js + domain/scheme',
  },
  {
    id: 'application-workflow',
    paths: ['/applications', '/service-requests'],
    description: 'Programme applications and citizen service desk (domain workflows + application services)',
    ownerLayer: 'application/* + domain/workflow',
  },
  {
    id: 'notifications',
    paths: ['/notifications'],
    description: 'In-app notification feed',
    ownerLayer: 'routes/notifications.js + lib/notify',
  },
  {
    id: 'subscription-billing',
    paths: ['/plans', '/billing'],
    description: 'Plan catalogue; Stripe checkout session + webhook updates `users.plan` when configured',
    ownerLayer: 'routes/plans.js, routes/billing.js, routes/stripeWebhook.js',
  },
  {
    id: 'institutional-onboarding',
    paths: ['/institutions'],
    description: 'Organisation onboarding applications and admin review (PostgreSQL)',
    ownerLayer: 'routes/institutions.js',
  },
  {
    id: 'administration',
    paths: ['/audit', '/activity', '/events'],
    description: 'Audit trail, activity summaries, SSE fan-out',
    ownerLayer: 'routes/audit.js, activity.js, events.js',
  },
  {
    id: 'documents-opportunities',
    paths: ['/documents', '/opportunities'],
    description: 'Vault records and labour-style opportunities',
    ownerLayer: 'routes/documents.js, opportunities.js',
  },
];

module.exports = { MODULE_BOUNDARIES };
