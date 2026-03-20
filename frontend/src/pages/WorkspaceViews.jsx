import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import { Card, Button, Badge, cn } from '../components/ui';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

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
  assistant: {
    title: 'AI Assistant',
    description: 'Conversational copilot for policy guidance, case triage, and citizen support tasks.',
    body: (
      <div className="grid gap-4 lg:grid-cols-3">
        <Card elevated className="!p-5 lg:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Assistant Console</p>
          <div className="mt-3 rounded-lg border border-border-light bg-base/40 p-4">
            <p className="text-sm text-secondary">Suggested prompt</p>
            <p className="mt-1 text-sm font-medium text-primary">"Find all housing benefits for a single parent in district 14."</p>
          </div>
          <div className="mt-4 space-y-2">
            <Button size="sm">Open Chat Assistant</Button>
            <p className="text-sm text-secondary">Natural-language queries with auditable recommendation trails.</p>
          </div>
        </Card>
        <Card elevated className="!p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Model status</p>
          <p className="mt-2 text-base font-medium text-primary">C-ONE Assistant v4.2</p>
          <p className="mt-1 text-sm text-secondary">Latency: 210ms · Safety filters active</p>
        </Card>
      </div>
    ),
  },
  recommendations: {
    title: 'Personalized Recommendations',
    description: 'AI-ranked actions tailored by profile, plan, and region-level policy signals.',
    body: (
      <Card elevated className="!p-5">
        <div className="space-y-3">
          {[
            'Complete identity refresh to unlock fast-track approvals.',
            'Apply to youth employment credit before March 31.',
            'Enable rural transport alerting for higher response coverage.',
          ].map((rec) => (
            <div key={rec} className="rounded-lg border border-border-light bg-base/35 px-4 py-3 text-sm text-primary">
              {rec}
            </div>
          ))}
        </div>
      </Card>
    ),
  },
  inclusion: {
    title: 'Inclusion Tools',
    description: 'Specialized workflows for women, students, rural communities, and accessibility-first services.',
    body: (
      <div className="grid gap-4 md:grid-cols-2">
        <Card elevated className="!p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Priority Cohorts</p>
          <ul className="mt-3 space-y-2 text-sm text-secondary">
            <li>• Women entrepreneurship pathways</li>
            <li>• Student scholarship navigator</li>
            <li>• Rural offline-first support packs</li>
          </ul>
        </Card>
        <Card elevated className="!p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Accessibility</p>
          <ul className="mt-3 space-y-2 text-sm text-secondary">
            <li>• Screen-reader optimized form flows</li>
            <li>• Simplified language mode</li>
            <li>• Multi-lingual translation aids</li>
          </ul>
        </Card>
      </div>
    ),
  },
  career: {
    title: 'AI Career & Learning Guidance',
    description: 'Skill gap analysis, learning pathways, interview prep, and roadmap guidance.',
    body: (
      <div className="grid gap-4 lg:grid-cols-3">
        <Card elevated className="!p-5 lg:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Skill Gap Analysis</p>
          <div className="mt-3 space-y-2">
            <div className="rounded-lg border border-border-light bg-base/30 px-4 py-3 text-sm text-primary">Data literacy — 62%</div>
            <div className="rounded-lg border border-border-light bg-base/30 px-4 py-3 text-sm text-primary">Digital forms workflow — 84%</div>
            <div className="rounded-lg border border-border-light bg-base/30 px-4 py-3 text-sm text-primary">Interview confidence — 48%</div>
          </div>
        </Card>
        <Card elevated className="!p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Recommended Path</p>
          <p className="mt-2 text-sm text-secondary">4-week civic-tech employability sprint with mock interviews and mentorship.</p>
          <Button size="sm" className="mt-4">Start pathway</Button>
        </Card>
      </div>
    ),
  },
  support: {
    title: 'Community & Support',
    description: 'Mentor network, help center, FAQs, contact support, and structured feedback.',
    body: (
      <div className="grid gap-4 md:grid-cols-2">
        <Card elevated className="!p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Help Center</p>
          <ul className="mt-3 space-y-2 text-sm text-secondary">
            <li>• How to apply for high-priority schemes</li>
            <li>• Document upload troubleshooting</li>
            <li>• Profile verification and role upgrade guide</li>
          </ul>
          <Button size="sm" className="mt-4">Open help docs</Button>
        </Card>
        <Card elevated className="!p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Mentor & Support Desk</p>
          <p className="mt-2 text-sm text-secondary">Connect with vetted mentors, local NGOs, or request assisted onboarding.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Button size="sm" variant="secondary">Find mentor</Button>
            <Button size="sm">Contact support</Button>
          </div>
        </Card>
      </div>
    ),
  },
  emergency: {
    title: 'Emergency & Critical Support',
    description: 'Immediate access to safety services, crisis support, and local emergency resources.',
    body: (
      <Card elevated className="!p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['Emergency Contact', 'Dial national emergency helpline and nearest local responders.'],
            ['Safety Resources', 'Domestic safety, legal aid, and secure shelter guidance.'],
            ['Health Crisis Support', 'Urgent care routing and tele-support channels.'],
            ['Local NGOs', 'Trusted regional support organizations and hotlines.'],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-lg border border-border-light bg-base/40 p-4">
              <p className="text-sm font-semibold text-primary">{title}</p>
              <p className="mt-1 text-sm text-secondary">{desc}</p>
            </div>
          ))}
        </div>
      </Card>
    ),
  },
  offline: {
    title: 'Offline & Low-Connectivity',
    description: 'Save-for-later flows, lightweight mode, and SMS-assistance concepts for low bandwidth.',
    body: (
      <div className="grid gap-4 md:grid-cols-2">
        <Card elevated className="!p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Save for Later</p>
          <p className="mt-2 text-sm text-secondary">Queue forms and guidance steps locally and sync automatically once online.</p>
          <Button size="sm" className="mt-4">Enable offline queue</Button>
        </Card>
        <Card elevated className="!p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">SMS Guidance Concept</p>
          <p className="mt-2 text-sm text-secondary">Fallback channel for critical reminders and application updates via SMS.</p>
          <Button size="sm" variant="secondary" className="mt-4">Configure SMS alerts</Button>
        </Card>
      </div>
    ),
  },
  integrations: {
    title: 'Open Integration Capability',
    description: 'API-ready architecture for government systems, partners, and third-party data exchange.',
    body: (
      <div className="grid auto-rows-fr gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Card elevated className="!p-4">
          <p className="text-sm font-semibold text-primary">Government API Bridge</p>
          <p className="mt-1 text-sm text-secondary">Secure connector architecture for central/state/public service systems.</p>
        </Card>
        <Card elevated className="!p-4">
          <p className="text-sm font-semibold text-primary">Third-Party Participation</p>
          <p className="mt-1 text-sm text-secondary">NGO/service-provider onboarding with scoped permissions and audit logs.</p>
        </Card>
        <Card elevated className="!p-4">
          <p className="text-sm font-semibold text-primary">Data Exchange Contracts</p>
          <p className="mt-1 text-sm text-secondary">Schema-driven payloads, rate-limits, and consent-first data boundaries.</p>
        </Card>
        <Card elevated className="!p-4">
          <p className="text-sm font-semibold text-primary">Integration Health</p>
          <p className="mt-1 text-sm text-secondary">Real-time connector uptime and error monitoring in admin console.</p>
        </Card>
        <Card elevated className="!p-4">
          <p className="text-sm font-semibold text-primary">Security & Consent Layer</p>
          <p className="mt-1 text-sm text-secondary">Token scopes, consent receipts, and policy-based access controls for every exchange.</p>
        </Card>
        <Card elevated className="!p-4">
          <p className="text-sm font-semibold text-primary">Fallback & Offline Sync</p>
          <p className="mt-1 text-sm text-secondary">Queue requests in low connectivity zones and reconcile with conflict-safe sync when online.</p>
        </Card>
      </div>
    ),
  },
  progress: {
    title: 'Action Tracking & Progress',
    description: 'Track submitted applications, task completion, milestones, and real-world impact indicators.',
    body: (
      <div className="grid gap-4 md:grid-cols-2">
        <Card elevated className="!p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Milestones</p>
          <div className="mt-3 space-y-2">
            <div className="rounded-lg border border-border-light bg-base/35 px-4 py-3 text-sm text-primary">Applications submitted: 7</div>
            <div className="rounded-lg border border-border-light bg-base/35 px-4 py-3 text-sm text-primary">Tasks completed: 24</div>
            <div className="rounded-lg border border-border-light bg-base/35 px-4 py-3 text-sm text-primary">Opportunities pursued: 5</div>
          </div>
        </Card>
        <Card elevated className="!p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Impact Indicators</p>
          <ul className="mt-3 space-y-2 text-sm text-secondary">
            <li>• Approval cycle reduced by 18%</li>
            <li>• Document completeness increased to 96%</li>
            <li>• Alert response time improved to same-day</li>
          </ul>
        </Card>
      </div>
    ),
  },
  analytics: {
    title: 'Personal Analytics',
    description: 'Application trends, opportunity conversion, and engagement summaries.',
    body: (
      <Card elevated className="!p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border-light bg-base/35 p-4">
            <p className="text-[11px] uppercase tracking-wide text-tertiary">Conversion</p>
            <p className="mt-1 text-2xl font-semibold text-primary">64%</p>
          </div>
          <div className="rounded-lg border border-border-light bg-base/35 p-4">
            <p className="text-[11px] uppercase tracking-wide text-tertiary">Avg. completion</p>
            <p className="mt-1 text-2xl font-semibold text-primary">2.8 days</p>
          </div>
          <div className="rounded-lg border border-border-light bg-base/35 p-4">
            <p className="text-[11px] uppercase tracking-wide text-tertiary">Engagement</p>
            <p className="mt-1 text-2xl font-semibold text-primary">91%</p>
          </div>
        </div>
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
              ['SSO / OIDC', 'Connected'],
              ['Benefits bridge API', 'Connected'],
              ['Document OCR', 'Limited'],
            ].map(([n, st]) => (
              <Row key={n}>
                <span className="text-primary">{n}</span>
                <span
                  className={cn(
                    'text-sm font-medium',
                    st === 'Connected' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
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

const WorkspaceViews = ({ moduleKey }) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [activitySummary, setActivitySummary] = useState(null);
  const [adminMetrics, setAdminMetrics] = useState(null);
  const [schemeIntel, setSchemeIntel] = useState({
    totals: { all: 0, eligible: 0, recommended: 0, saved: 0, applied: 0, highImpact: 0 },
    recommended: [],
    eligible: [],
    saved: [],
    applied: [],
    highImpact: [],
    alerts: [],
  });
  const [schemeTab, setSchemeTab] = useState('recommended');
  const [schemeFilters, setSchemeFilters] = useState({
    search: '',
    category: '',
    beneficiary: '',
    location: '',
    governmentLevel: '',
    sdg: '',
    department: '',
    lifeEvent: '',
  });
  const [selectedScheme, setSelectedScheme] = useState(null);

  useEffect(() => {
    const needsDocs = moduleKey === 'vault';
    const needsApps = moduleKey === 'benefits' || moduleKey === 'opportunities' || moduleKey === 'progress';
    const needsOpps = moduleKey === 'opportunities';
    const needsSummary = moduleKey === 'progress' || moduleKey === 'analytics';
    const needsAdmin = moduleKey === 'admin';
    let active = true;

    (async () => {
      try {
        const requests = [];
        if (needsDocs) requests.push(apiFetch('/api/documents').then((r) => r.ok ? r.json() : []));
        if (needsApps) requests.push(apiFetch('/api/applications').then((r) => r.ok ? r.json() : []));
        if (needsOpps) requests.push(apiFetch('/api/opportunities').then((r) => r.ok ? r.json() : []));
        if (needsSummary) requests.push(apiFetch('/api/activity/summary').then((r) => r.ok ? r.json() : null));
        if (needsAdmin) requests.push(apiFetch('/api/users/admin/metrics').then((r) => r.ok ? r.json() : null));

        const result = await Promise.all(requests);
        let i = 0;
        if (needsDocs && active) setDocuments(result[i++]);
        if (needsApps && active) setApplications(result[i++]);
        if (needsOpps && active) setOpportunities(result[i++]);
        if (needsSummary && active) setActivitySummary(result[i++]);
        if (needsAdmin && active) setAdminMetrics(result[i++]);
      } catch {
        // fallback to static UI blocks
      }
    })();

    return () => {
      active = false;
    };
  }, [moduleKey, user?.id]);

  useEffect(() => {
    if (moduleKey !== 'benefits') return;
    let active = true;
    const params = new URLSearchParams(
      Object.entries(schemeFilters).filter(([, v]) => String(v || '').trim() !== '')
    );
    (async () => {
      try {
        const res = await apiFetch(`/api/schemes/intelligence?${params.toString()}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setSchemeIntel(data);
        const first = data[schemeTab]?.[0] || data.recommended?.[0] || null;
        setSelectedScheme(first);
      } catch {
        // leave static fallback
      }
    })();
    return () => {
      active = false;
    };
  }, [moduleKey, user?.id, schemeFilters, schemeTab]);

  const dynamicBody = (() => {
    if (moduleKey === 'vault') {
      return (
        <Card elevated className="!p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Stored Documents</p>
            <Button
              size="sm"
              onClick={async () => {
                const name = `Citizen File ${documents.length + 1}`;
                const res = await apiFetch('/api/documents', {
                  method: 'POST',
                  body: JSON.stringify({ name, category: 'General', type: 'PDF', size: '220KB' }),
                });
                if (res.ok) {
                  const created = await res.json();
                  setDocuments((prev) => [created, ...prev]);
                }
              }}
            >
              Upload
            </Button>
          </div>
          <div className="space-y-2">
            {documents.map((d) => (
              <div key={d.id} className="rounded-lg border border-border-light bg-base/35 px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-primary">{d.name}</span>
                  <span className="text-xs text-secondary">{d.type}</span>
                </div>
                <p className="text-xs text-secondary">Expires: {d.expiresAt || 'N/A'}</p>
              </div>
            ))}
            {documents.length === 0 && <p className="text-sm text-secondary">No documents uploaded yet.</p>}
          </div>
        </Card>
      );
    }

    if (moduleKey === 'benefits') {
      const tabRows = schemeIntel[schemeTab] || [];
      return (
        <div className="grid gap-3 lg:grid-cols-[2.2fr_1fr]">
          <Card elevated className="!p-4 lg:col-span-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Government Scheme Intelligence</p>
            <div className="mt-2 grid gap-1.5 sm:grid-cols-3">
              <input
                className="rounded-lg border border-border-light bg-surface px-2.5 py-1.5 text-sm"
                placeholder="Search schemes"
                value={schemeFilters.search}
                onChange={(e) => setSchemeFilters((p) => ({ ...p, search: e.target.value }))}
              />
              <input
                className="rounded-lg border border-border-light bg-surface px-2.5 py-1.5 text-sm"
                placeholder="Category"
                value={schemeFilters.category}
                onChange={(e) => setSchemeFilters((p) => ({ ...p, category: e.target.value }))}
              />
              <select
                className="rounded-lg border border-border-light bg-surface px-2.5 py-1.5 text-sm"
                value={schemeFilters.governmentLevel}
                onChange={(e) => setSchemeFilters((p) => ({ ...p, governmentLevel: e.target.value }))}
              >
                <option value="">All levels</option>
                <option value="central">Central</option>
                <option value="state">State</option>
              </select>
            </div>
            <div className="mt-1.5 grid gap-1.5 sm:grid-cols-4">
              <input
                className="rounded-lg border border-border-light bg-surface px-2.5 py-1.5 text-sm"
                placeholder="Beneficiary (e.g. women)"
                value={schemeFilters.beneficiary}
                onChange={(e) => setSchemeFilters((p) => ({ ...p, beneficiary: e.target.value }))}
              />
              <input
                className="rounded-lg border border-border-light bg-surface px-2.5 py-1.5 text-sm"
                placeholder="Location (e.g. rural)"
                value={schemeFilters.location}
                onChange={(e) => setSchemeFilters((p) => ({ ...p, location: e.target.value }))}
              />
              <input
                className="rounded-lg border border-border-light bg-surface px-2.5 py-1.5 text-sm"
                placeholder="SDG (e.g. SDG5)"
                value={schemeFilters.sdg}
                onChange={(e) => setSchemeFilters((p) => ({ ...p, sdg: e.target.value.toUpperCase() }))}
              />
              <input
                className="rounded-lg border border-border-light bg-surface px-2.5 py-1.5 text-sm"
                placeholder="Department"
                value={schemeFilters.department}
                onChange={(e) => setSchemeFilters((p) => ({ ...p, department: e.target.value }))}
              />
            </div>
            <div className="mt-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Life-event discovery</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {[
                  ['education', 'Student support'],
                  ['job_loss', 'Job loss'],
                  ['starting_business', 'Start business'],
                  ['pregnancy_childcare', 'Pregnancy & childcare'],
                  ['farming_challenges', 'Farming challenges'],
                  ['retirement', 'Retirement'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={cn(
                      'rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
                      schemeFilters.lifeEvent === value
                        ? 'border-accent-primary text-accent-primary bg-accent-primary/10'
                        : 'border-border-light text-secondary'
                    )}
                    onClick={() => setSchemeFilters((p) => ({ ...p, lifeEvent: p.lifeEvent === value ? '' : value }))}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                ['recommended', `Recommended (${schemeIntel.totals?.recommended || 0})`],
                ['eligible', `Eligible (${schemeIntel.totals?.eligible || 0})`],
                ['highImpact', `High Impact (${schemeIntel.totals?.highImpact || 0})`],
                ['saved', `Saved (${schemeIntel.totals?.saved || 0})`],
                ['applied', `Applied (${schemeIntel.totals?.applied || 0})`],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
                    schemeTab === key ? 'border-accent-primary text-accent-primary bg-accent-primary/10' : 'border-border-light text-secondary'
                  )}
                  onClick={() => setSchemeTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-2 space-y-1.5">
              {tabRows.map((scheme) => (
                <div key={scheme.id} className="rounded-lg border border-border-light bg-base/35 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <button type="button" className="text-left" onClick={() => setSelectedScheme(scheme)}>
                      <p className="text-sm font-medium text-primary">{scheme.schemeName}</p>
                      <p className="text-xs text-secondary mt-0.5">{scheme.ministryOrDepartment || 'Ministry TBD'}</p>
                    </button>
                    <Badge variant={scheme.applicationStatus === 'not_started' ? 'warning' : 'primary'}>
                      {scheme.applicationStatus}
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {(scheme.tnwiseAlignedSdgs || []).map((sdg) => (
                      <Badge key={`${scheme.id}-${sdg}`} variant="secondary">{sdg}</Badge>
                    ))}
                    {scheme.prioritizedScore > 0.8 && <Badge variant="primary">High Impact</Badge>}
                  </div>
                  <div className="mt-1.5 flex gap-1.5">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        await apiFetch(`/api/schemes/save/${scheme.id}`, { method: 'POST' });
                        setSchemeFilters((p) => ({ ...p }));
                      }}
                    >
                      Save
                    </Button>
                    {scheme.applicationStatus === 'not_started' && (
                      <Button
                        size="sm"
                        onClick={async () => {
                          await apiFetch('/api/applications', {
                            method: 'POST',
                            body: JSON.stringify({
                              type: 'scheme',
                              targetId: scheme.id,
                              title: scheme.schemeName,
                              deadline: scheme.deadline || null,
                            }),
                          });
                          setSchemeFilters((p) => ({ ...p }));
                        }}
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {tabRows.length === 0 && (
                <div className="rounded-lg border border-dashed border-border-light bg-base/25 px-3 py-4 text-sm text-secondary">
                  No schemes loaded yet. Module is integration-ready for future government data ingestion.
                </div>
              )}
            </div>
          </Card>
          <Card elevated className="!p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Application Guidance Panel</p>
            {selectedScheme ? (
              <div className="mt-1.5 space-y-1.5 text-sm">
                <p className="font-medium text-primary">{selectedScheme.schemeName}</p>
                <p className="text-secondary">{selectedScheme.description || 'Description will appear once scheme data is connected.'}</p>
                <div className="rounded-lg border border-border-light bg-base/35 p-3">
                  <p className="text-xs uppercase tracking-wide text-tertiary">Step-by-step</p>
                  <ol className="mt-1 list-decimal pl-5 text-secondary">
                    {(selectedScheme.guidanceSteps?.length ? selectedScheme.guidanceSteps : ['Create profile', 'Prepare documents', 'Submit application']).map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
                <div className="rounded-lg border border-border-light bg-base/35 p-3">
                  <p className="text-xs uppercase tracking-wide text-tertiary">Required documents</p>
                  <p className="mt-1 text-secondary">{(selectedScheme.requiredDocuments || []).join(', ') || 'Checklist will populate when data is provided.'}</p>
                </div>
                <div className="rounded-lg border border-border-light bg-base/35 p-3">
                  <p className="text-xs uppercase tracking-wide text-tertiary">Official source attribution</p>
                  <p className="mt-1 text-secondary">
                    Source type: <span className="text-primary">{selectedScheme.sourceAttribution?.sourceType || 'policy_brief'}</span>
                  </p>
                  <p className="text-secondary">
                    Last verified: <span className="text-primary">{selectedScheme.sourceAttribution?.lastVerifiedDate || 'Unknown'}</span>
                  </p>
                  <p className="text-secondary">
                    Policy notes: {selectedScheme.sourceAttribution?.policyNotes || 'No policy notes available.'}
                  </p>
                </div>
                <p className="text-secondary">Processing time: {selectedScheme.estimatedProcessingTimeDays || 'TBD'} days</p>
                <p className="text-secondary">Application mode: {selectedScheme.applicationMode || 'TBD'} (online/offline supported)</p>
                <p className="text-secondary">
                  Official source:{' '}
                  {selectedScheme.officialLink ? (
                    <a className="text-accent-primary hover:underline" href={selectedScheme.officialLink} target="_blank" rel="noreferrer">
                      Open portal
                    </a>
                  ) : (
                    'TBD'
                  )}
                </p>
                <p className="text-secondary">Language: Multilingual guidance (concept) | Voice assist (concept) | Printable checklist (concept)</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-secondary">Select a scheme to view guidance.</p>
            )}
            <div className="mt-3 space-y-1">
              {schemeIntel.alerts?.slice(0, 4).map((a, idx) => (
                <p key={`${a.type}-${idx}`} className="text-xs text-secondary">• {a.message}</p>
              ))}
            </div>
          </Card>
        </div>
      );
    }

    if (moduleKey === 'opportunities') {
      return (
        <Card elevated className="!p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Opportunity Matching</p>
          <div className="mt-3 space-y-2">
            {opportunities.map((opp) => (
              <div key={opp.id} className="rounded-lg border border-border-light bg-base/35 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-primary">{opp.title}</p>
                  <Badge variant={opp.pursued ? 'primary' : 'warning'}>{opp.pursued ? opp.applicationStatus : 'new'}</Badge>
                </div>
                <p className="text-xs text-secondary">{opp.company} · {opp.location}</p>
                {!opp.pursued && (
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={async () => {
                      const res = await apiFetch('/api/applications', {
                        method: 'POST',
                        body: JSON.stringify({ type: 'opportunity', targetId: opp.id, title: opp.title }),
                      });
                      if (res.ok) {
                        setOpportunities((prev) =>
                          prev.map((o) => (o.id === opp.id ? { ...o, pursued: true, applicationStatus: 'submitted' } : o))
                        );
                      }
                    }}
                  >
                    Pursue
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      );
    }

    if (moduleKey === 'progress') {
      return (
        <Card elevated className="!p-5">
          <p className="text-sm font-semibold text-primary">Live Progress Summary</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border-light bg-base/35 p-4">
              <p className="text-xs text-tertiary">Applications</p>
              <p className="text-2xl font-semibold text-primary">{activitySummary?.applications ?? applications.length}</p>
            </div>
            <div className="rounded-lg border border-border-light bg-base/35 p-4">
              <p className="text-xs text-tertiary">Documents</p>
              <p className="text-2xl font-semibold text-primary">{activitySummary?.documents ?? documents.length}</p>
            </div>
            <div className="rounded-lg border border-border-light bg-base/35 p-4">
              <p className="text-xs text-tertiary">Completed tasks</p>
              <p className="text-2xl font-semibold text-primary">{activitySummary?.completedTasks ?? 0}</p>
            </div>
          </div>
        </Card>
      );
    }

    if (moduleKey === 'admin') {
      if (!adminMetrics) return null;
      return (
        <Card elevated className="!p-5">
          <p className="text-sm font-semibold text-primary">Live Admin Metrics</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border-light bg-base/35 p-4">
              <p className="text-xs text-tertiary">Users</p>
              <p className="text-2xl font-semibold text-primary">{adminMetrics.totalUsers}</p>
            </div>
            <div className="rounded-lg border border-border-light bg-base/35 p-4">
              <p className="text-xs text-tertiary">Applications</p>
              <p className="text-2xl font-semibold text-primary">{adminMetrics.totalApplications}</p>
            </div>
            <div className="rounded-lg border border-border-light bg-base/35 p-4">
              <p className="text-xs text-tertiary">Documents</p>
              <p className="text-2xl font-semibold text-primary">{adminMetrics.totalDocuments}</p>
            </div>
          </div>
        </Card>
      );
    }

    return null;
  })();

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
      <PageShell title={m.title} description={m.description}>
        {dynamicBody || m.body}
      </PageShell>
    </div>
  );
};

export default WorkspaceViews;
