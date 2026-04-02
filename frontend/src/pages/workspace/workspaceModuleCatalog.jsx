/* eslint-disable react-refresh/only-export-components -- static route catalog (data + JSX) */
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, cn } from '../../components/ui';
import { InclusionWorkspaceBody, OfflineWorkspaceBody, SmsWorkspaceBody } from './InclusiveHubBodies';

const Row = ({ children, className }) => (
  <div
    className={cn(
      'flex items-center justify-between gap-3 border-b border-border-light py-2.5 text-sm last:border-0 sm:text-[15px]',
      className
    )}
  >
    {children}
  </div>
);

/** Static shell content per workspace route; live data is composed in `WorkspaceViews`. */
export const WORKSPACE_MODULES = {
  navigator: {
    title: 'Service pathways',
    description: 'Typical steps for using this workspace. Follow the links to complete each part of your case.',
    body: (
      <>
        <Card elevated className="!p-5">
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-secondary">
            <li>Complete your eligibility profile (household, location, occupation).</li>
            <li>Review recommended programmes and read official guidance before you apply.</li>
            <li>Upload supporting documents to your vault when you are ready.</li>
            <li>Use the service desk if you need a staff member to review a request.</li>
          </ol>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/app/profile">
              <Button size="sm">Eligibility profile</Button>
            </Link>
            <Link to="/app/benefits">
              <Button size="sm" variant="secondary">
                Benefit discovery
              </Button>
            </Link>
            <Link to="/app/vault">
              <Button size="sm" variant="secondary">
                Document vault
              </Button>
            </Link>
            <Link to="/app/services">
              <Button size="sm" variant="secondary">
                Service desk
              </Button>
            </Link>
          </div>
        </Card>
        <Card elevated className="!mt-6 !p-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-tertiary">Extended services</p>
          <p className="mb-4 text-sm text-secondary">
            Access inclusion tools, connectivity guidance, integrations, and other modules from the links below.
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              { to: '/app/inclusion', label: 'Inclusion & accessibility' },
              { to: '/app/offline', label: 'Connectivity & lite mode' },
              { to: '/app/sms', label: 'SMS channel (concept)' },
              { to: '/app/integrations', label: 'Integrations' },
              { to: '/app/recommendations', label: 'Recommendations' },
              { to: '/app/career', label: 'Career & learning' },
              { to: '/app/emergency', label: 'Emergency information' },
              { to: '/app/opportunities', label: 'Opportunities' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="rounded-[12px] border border-border-light px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface"
              >
                {label}
              </Link>
            ))}
          </div>
        </Card>
      </>
    ),
  },
  benefits: {
    title: 'Benefit Discovery',
    description: 'Live scheme intelligence loads when you open this module.',
    body: (
      <Card elevated className="!p-5">
        <p className="text-sm text-secondary">If this message appears, refresh the page or sign in again.</p>
      </Card>
    ),
  },
  opportunities: {
    title: 'Opportunities',
    description: 'Listings from the opportunities dataset. Pursuing an item records an application on your account.',
    body: (
      <Card elevated className="!p-5">
        <p className="text-sm text-secondary">Loading opportunities…</p>
      </Card>
    ),
  },
  vault: {
    title: 'Document vault',
    description: 'Your uploaded references for scheme matching. Production deployments attach verified identity tiers here.',
    body: (
      <Card elevated className="!p-5">
        <p className="text-sm text-secondary">Loading documents…</p>
      </Card>
    ),
  },
  alerts: {
    title: 'Alerts',
    description: 'System and workflow notifications for your account.',
    body: (
      <Card elevated className="!p-5">
        <p className="text-sm text-secondary">Loading notifications…</p>
      </Card>
    ),
  },
  assistant: {
    titleKey: 'modules.assistant.title',
    descriptionKey: 'modules.assistant.description',
    body: null,
  },
  urbanRuralBridge: {
    title: 'Urban–Rural Opportunity Bridge',
    description: 'Support for rural citizens to discover jobs, training, migration, and housing in cities.',
    body: null,
  },
  recommendations: {
    title: 'Recommendations',
    description: 'Premium adds extended analytics modules; core programme matching stays on the free plan.',
    body: (
      <Card elevated className="!p-5">
        <p className="text-sm leading-relaxed text-secondary">
          Recommended programmes appear in Benefit Discovery. Upgrade only if you need additional reporting views—welfare discovery is not paywalled.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/app/benefits">
            <Button size="sm">Benefit discovery</Button>
          </Link>
          <Link to="/app/subscription">
            <Button size="sm" variant="secondary">
              View plans
            </Button>
          </Link>
        </div>
      </Card>
    ),
  },
  inclusion: {
    titleKey: 'modules.inclusion.title',
    descriptionKey: 'modules.inclusion.description',
    Body: InclusionWorkspaceBody,
  },
  career: {
    title: 'Learning & employment',
    description: 'Education and work-related programmes are listed with other schemes.',
    body: (
      <Card elevated className="!p-5">
        <p className="text-sm leading-relaxed text-secondary">
          Filter Benefit Discovery by life events such as education or job loss, or search by department. Opportunities from the labour dataset are
          listed separately.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/app/benefits">
            <Button size="sm">Browse schemes</Button>
          </Link>
          <Link to="/app/opportunities">
            <Button size="sm" variant="secondary">
              Opportunities
            </Button>
          </Link>
        </div>
      </Card>
    ),
  },
  support: {
    title: 'Help & contact',
    description: 'Official rules and contacts are attached to each programme record.',
    body: (
      <div className="grid gap-4 md:grid-cols-2">
        <Card elevated className="!p-5">
          <p className="text-sm text-secondary">
            For account or process questions, submit a request on the service desk. Staff and administrators see it in their queue.
          </p>
          <Link to="/app/services" className="mt-4 inline-block">
            <Button size="sm">Service desk</Button>
          </Link>
        </Card>
        <Card elevated className="!p-5">
          <p className="text-sm text-secondary">
            Programme-specific helplines and portals appear in Benefit Discovery after you select a scheme. Always confirm requirements on the issuing
            authority’s website.
          </p>
          <Link to="/app/benefits" className="mt-4 inline-block">
            <Button size="sm" variant="secondary">
              Benefit discovery
            </Button>
          </Link>
        </Card>
      </div>
    ),
  },
  emergency: {
    title: 'Emergency information',
    description: 'Public helplines (India examples). Confirm numbers for your state or country.',
    body: (
      <Card elevated className="!p-5">
        <p className="mb-4 text-sm text-secondary">
          For immediate danger to life, use the voice emergency service for your location. Numbers below are widely published references—verify with
          local authorities.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border-light bg-base/40 p-4">
            <p className="text-sm font-semibold text-primary">Integrated emergency (India)</p>
            <p className="mt-1 text-sm text-secondary">112 — police / fire / medical (verify locally)</p>
          </div>
          <div className="rounded-lg border border-border-light bg-base/40 p-4">
            <p className="text-sm font-semibold text-primary">Ambulance (India)</p>
            <p className="mt-1 text-sm text-secondary">108 — verify with your state</p>
          </div>
          <div className="rounded-lg border border-border-light bg-base/40 p-4">
            <p className="text-sm font-semibold text-primary">Childline (India)</p>
            <p className="mt-1 text-sm text-secondary">1098 — national child helpline</p>
          </div>
          <div className="rounded-lg border border-border-light bg-base/40 p-4">
            <p className="text-sm font-semibold text-primary">Women’s helpline (India)</p>
            <p className="mt-1 text-sm text-secondary">181 — verify with state commission</p>
          </div>
        </div>
      </Card>
    ),
  },
  offline: {
    titleKey: 'modules.offline.title',
    descriptionKey: 'modules.offline.description',
    Body: OfflineWorkspaceBody,
  },
  sms: {
    titleKey: 'modules.sms.title',
    descriptionKey: 'modules.sms.description',
    Body: SmsWorkspaceBody,
  },
  integrations: {
    title: 'Integration readiness',
    description: 'Operational expectations when connecting this application to surrounding systems.',
    body: (
      <Card elevated className="!p-5">
        <ul className="space-y-3 text-sm leading-relaxed text-secondary">
          <li>• Authenticated JSON APIs with rate limiting and role checks.</li>
          <li>• Audit logging for security-sensitive actions (administrators can review recent events in Admin Hub).</li>
          <li>• TLS termination, secrets, and identity federation are configured in the hosting environment.</li>
          <li>• Document and identity verification connectors are added per jurisdiction during deployment.</li>
        </ul>
        <p className="mt-4 text-xs text-tertiary">Interface specifications and runbooks are maintained outside this UI.</p>
      </Card>
    ),
  },
  progress: {
    title: 'Progress',
    description: 'Summary metrics load when you open this module.',
    body: (
      <Card elevated className="!p-5">
        <p className="text-sm text-secondary">Loading progress…</p>
      </Card>
    ),
  },
  analytics: {
    title: 'Activity',
    description: 'Account-level counts from this deployment.',
    body: (
      <Card elevated className="!p-5">
        <p className="text-sm text-secondary">Loading activity…</p>
      </Card>
    ),
  },
  settings: {
    titleKey: 'modules.settings.title',
    descriptionKey: 'modules.settings.description',
    body: (
      <Card elevated className="!space-y-4 !p-5">
        {[
          ['Reduce motion', 'Minimize non-essential animation'],
          ['High-contrast focus', 'Stronger focus rings across forms'],
          ['Email digests', 'Daily summary of alerts and deadlines'],
        ].map(([label, hint]) => (
          <label
            key={label}
            className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-border-light bg-base/30 px-4 py-3 transition-colors hover:bg-base/50"
          >
            <span>
              <span className="block text-[15px] font-medium text-primary">{label}</span>
              <span className="mt-1 block text-sm text-secondary">{hint}</span>
            </span>
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-border-light text-accent-primary focus:ring-accent-primary/30"
              defaultChecked={label === 'Email digests'}
            />
          </label>
        ))}
        <div className="flex justify-end pt-2">
          <Button size="sm">Save changes</Button>
        </div>
      </Card>
    ),
  },
  admin: {
    title: 'Admin Hub',
    description: 'Tenant configuration, roles, and integration health for operators.',
    body: (
      <div className="grid gap-4 lg:grid-cols-2">
        <Card elevated className="!p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Integrations</p>
          <div className="mt-3 space-y-1">
            {[
              ['SSO / OIDC', 'Configure at deployment'],
              ['Benefits bridge API', 'Configure at deployment'],
              ['Document services', 'Configure at deployment'],
            ].map(([n, st]) => (
              <Row key={n}>
                <span className="text-primary">{n}</span>
                <span
                  className={cn(
                    'text-sm font-medium',
                    st === 'Connected' ? 'text-semantic-success' : 'text-semantic-warning'
                  )}
                >
                  {st}
                </span>
              </Row>
            ))}
          </div>
        </Card>
        <Card elevated className="!p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Access model</p>
          <p className="mt-2 text-sm text-secondary sm:text-[15px]">
            Citizens and students submit requests; staff and administrators review. Organizations have programme visibility.{' '}
            <Link to="/app/settings" className="font-medium text-accent-primary hover:underline">
              Workspace settings
            </Link>
          </p>
        </Card>
      </div>
    ),
  },
};
