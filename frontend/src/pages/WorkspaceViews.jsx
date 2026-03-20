import React from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import { Card, Button, Badge, cn } from '../components/ui';

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

const MODULES = {
  navigator: {
    title: 'Life Navigator',
    description: 'Guided pathways for services, milestones, and next-best actions across programs.',
    body: (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card elevated className="!p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Active path</p>
            <p className="mt-1.5 text-base font-medium text-primary">Housing stability → Benefits review</p>
            <p className="mt-2 text-sm text-secondary">3 steps remaining · Est. 12 min</p>
            <Button size="sm" className="mt-4">
              Continue
            </Button>
          </Card>
          <Card elevated className="!p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Suggested</p>
            <ul className="mt-2 space-y-2 text-sm text-secondary">
              <li>• Register for transit subsidy pre-check</li>
              <li>• Update household composition (due in 8 days)</li>
            </ul>
          </Card>
        </div>
        <Card className="!mt-4 !p-0 overflow-hidden">
          <div className="border-b border-border-light bg-surface/40 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-tertiary">
            Upcoming milestones
          </div>
          <div className="px-4 py-1">
            <Row>
              <span className="text-primary">Document verification</span>
              <Badge variant="warning">Due Fri</Badge>
            </Row>
            <Row>
              <span className="text-primary">Benefit renewal window</span>
              <Badge variant="primary">Open</Badge>
            </Row>
            <Row>
              <span className="text-primary">Community workshop</span>
              <span className="text-tertiary">Optional</span>
            </Row>
          </div>
        </Card>
      </>
    ),
  },
  benefits: {
    title: 'Benefit Discovery',
    description: 'Eligibility signals, enrolled programs, and recommended applications in one view.',
    body: (
      <div className="grid gap-4 lg:grid-cols-3">
        <Card elevated className="!p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-base font-medium text-primary">Matches this week</span>
            <Badge variant="primary">Live</Badge>
          </div>
          <div className="space-y-0 divide-y divide-border-light">
            <Row>
              <span className="text-primary">Energy relief credit</span>
              <span className="font-medium text-accent-primary">94% fit</span>
            </Row>
            <Row>
              <span className="text-primary">Childcare subsidy (tier B)</span>
              <span className="font-medium text-secondary">Review</span>
            </Row>
            <Row>
              <span className="text-primary">Small business micro-grant</span>
              <span className="font-medium text-secondary">Draft saved</span>
            </Row>
          </div>
          <Button size="sm" variant="secondary" className="mt-5">
            Export summary
          </Button>
        </Card>
        <Card elevated className="!p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Enrolled</p>
          <p className="mt-2 text-3xl font-semibold text-primary">6</p>
          <p className="mt-1 text-sm text-secondary">Programs with active disbursement</p>
          <Button size="sm" className="mt-5 w-full" variant="ghost">
            View ledger
          </Button>
        </Card>
      </div>
    ),
  },
  opportunities: {
    title: 'Opportunity Engine',
    description: 'Grants, contracts, and workforce openings ranked for your organization.',
    body: (
      <Card elevated className="!p-0 overflow-hidden">
        <table className="w-full text-left text-sm sm:text-[15px]">
          <thead>
            <tr className="border-b border-border-light bg-surface/50 text-[11px] font-semibold uppercase tracking-wider text-tertiary">
              <th className="px-4 py-3 font-medium">Opportunity</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Closes</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="text-primary">
            {[
              ['Urban renewal grant', 'Apr 12', '0.94', 'Draft'],
              ['Municipal EV fleet RFP', 'Mar 28', '0.81', 'Track'],
              ['Regional data fellowship', 'Rolling', '0.76', 'Apply'],
            ].map(([name, close, score, act]) => (
              <tr key={name} className="border-b border-border-light/80 last:border-0">
                <td className="px-4 py-3 font-medium">{name}</td>
                <td className="hidden px-4 py-3 text-secondary sm:table-cell">{close}</td>
                <td className="px-4 py-3 text-accent-primary">{score}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="rounded text-sm font-medium text-accent-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/40"
                  >
                    {act}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    ),
  },
  vault: {
    title: 'Identity Vault',
    description: 'Controlled document storage, verification status, and access audit trail.',
    body: (
      <div className="grid gap-4 md:grid-cols-2">
        <Card elevated className="!p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Verification</p>
          <p className="mt-2 text-base font-medium text-primary">Identity tier: Strong</p>
          <p className="mt-1 text-sm text-secondary">Last verified 6 days ago · Doc expiry in 142 days</p>
        </Card>
        <Card elevated className="!p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Documents</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between text-primary">
              <span>Proof of residence</span>
              <Badge variant="primary">OK</Badge>
            </li>
            <li className="flex justify-between text-primary">
              <span>Income attestation</span>
              <Badge variant="warning">Renew</Badge>
            </li>
          </ul>
        </Card>
        <Card className="!p-0 overflow-hidden md:col-span-2">
          <div className="border-b border-border-light px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-tertiary">
            Recent access
          </div>
          <div className="px-4 py-1">
            <Row>
              <span className="text-secondary">Benefits API · read metadata</span>
              <span className="text-tertiary text-sm">2h ago</span>
            </Row>
            <Row>
              <span className="text-secondary">You · uploaded PDF</span>
              <span className="text-tertiary text-sm">Yesterday</span>
            </Row>
          </div>
        </Card>
      </div>
    ),
  },
  alerts: {
    title: 'Smart Alerts',
    description: 'Policy changes, deadlines, and risk signals configured for your jurisdiction.',
    body: (
      <Card elevated className="!p-5">
        <div className="space-y-3">
          {[
            { t: 'Policy', m: 'Federal reporting schema v3 effective next quarter.', s: 'info' },
            { t: 'Deadline', m: 'Quarterly transparency filing in 9 business days.', s: 'warning' },
            { t: 'Insight', m: 'Anomaly volume down 18% vs. prior week.', s: 'primary' },
          ].map((a) => (
            <div
              key={a.m}
              className="flex gap-3 rounded-lg border border-border-light bg-base/40 px-4 py-3"
            >
              <Badge variant={a.s === 'warning' ? 'warning' : a.s === 'primary' ? 'primary' : 'default'}>
                {a.t}
              </Badge>
              <p className="text-sm leading-relaxed text-primary sm:text-[15px]">{a.m}</p>
            </div>
          ))}
        </div>
        <Button size="sm" variant="secondary" className="mt-5">
          Manage rules
        </Button>
      </Card>
    ),
  },
  settings: {
    title: 'Settings & accessibility',
    description: 'Notifications, motion, focus, and session preferences for your workspace.',
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
              ['SSO / OIDC', 'Operational'],
              ['Benefits bridge API', 'Operational'],
              ['Document OCR', 'Degraded'],
            ].map(([n, st]) => (
              <Row key={n}>
                <span className="text-primary">{n}</span>
                <span
                  className={cn(
                    'text-sm font-medium',
                    st === 'Operational' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  )}
                >
                  {st}
                </span>
              </Row>
            ))}
          </div>
        </Card>
        <Card elevated className="!p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Roles</p>
          <p className="mt-2 text-sm text-secondary sm:text-[15px]">
            12 admins · 48 operators · 4 auditors.{' '}
            <Link to="/app/settings" className="font-medium text-accent-primary hover:underline">
              Invite users
            </Link>
          </p>
        </Card>
      </div>
    ),
  },
};

function OnlineBanner() {
  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.12] px-4 py-3 text-sm text-emerald-900 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-100"
      role="status"
    >
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-40" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </span>
      <div>
        <p className="font-semibold">Module online</p>
        <p className="text-xs opacity-90 sm:text-sm">Full workspace features are available in this build.</p>
      </div>
    </div>
  );
}

const WorkspaceViews = ({ moduleKey }) => {
  const m = MODULES[moduleKey];
  if (!m) {
    return (
      <PageShell
        title="Page unavailable"
        description="This section could not be loaded. Use the sidebar to open a valid workspace."
      >
        <p className="text-sm text-secondary">
          Unknown module: <code className="rounded bg-base px-1.5 py-0.5 text-primary">{moduleKey}</code>
        </p>
      </PageShell>
    );
  }
  return (
    <div className="space-y-5">
      <OnlineBanner />
      <PageShell title={m.title} description={m.description}>
        {m.body}
      </PageShell>
    </div>
  );
};

export default WorkspaceViews;
