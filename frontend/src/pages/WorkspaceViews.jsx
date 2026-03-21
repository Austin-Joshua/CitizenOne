import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/layout/PageShell';
import { Card, Button, Badge, cn } from '../components/ui';
import { apiFetch, getErrorMessageFromResponse } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { WORKSPACE_MODULES as MODULES } from './workspace/workspaceModuleCatalog';
import { SettingsInclusionBody } from './workspace/InclusiveHubBodies';
import { useI18n } from '../context/I18nContext';

const WorkspaceViews = ({ moduleKey }) => {
  const { t } = useI18n();
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
    state: '',
  });
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [alertFeed, setAlertFeed] = useState([]);
  const [securityFeatures, setSecurityFeatures] = useState(null);
  const [adminAudit, setAdminAudit] = useState([]);
  const [vaultError, setVaultError] = useState(null);
  const [benefitsActionError, setBenefitsActionError] = useState(null);
  const [opportunityError, setOpportunityError] = useState(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setVaultError(null);
      setBenefitsActionError(null);
      setOpportunityError(null);
    });
    return () => cancelAnimationFrame(id);
  }, [moduleKey]);

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

  useEffect(() => {
    if (moduleKey !== 'alerts') return;
    let active = true;
    (async () => {
      try {
        const res = await apiFetch('/api/notifications');
        if (!res.ok || !active) return;
        const data = await res.json();
        setAlertFeed(Array.isArray(data.items) ? data.items : []);
      } catch {
        if (active) setAlertFeed([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [moduleKey, user?.id]);

  useEffect(() => {
    if (moduleKey !== 'settings') return;
    let active = true;
    (async () => {
      try {
        const res = await apiFetch('/api/auth/security-features');
        if (!res.ok || !active) return;
        setSecurityFeatures(await res.json());
      } catch {
        if (active) setSecurityFeatures(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [moduleKey, user?.id]);

  useEffect(() => {
    if (moduleKey === 'admin' && user?.role === 'admin') return undefined;
    const id = requestAnimationFrame(() => setAdminAudit([]));
    return () => cancelAnimationFrame(id);
  }, [moduleKey, user?.role]);

  useEffect(() => {
    if (moduleKey !== 'admin' || user?.role !== 'admin') return undefined;
    let active = true;
    (async () => {
      try {
        const res = await apiFetch('/api/audit?limit=50');
        if (!res.ok || !active) return;
        const data = await res.json();
        setAdminAudit(Array.isArray(data.items) ? data.items : []);
      } catch {
        if (active) setAdminAudit([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [moduleKey, user?.role]);

  const dynamicBody = (() => {
    if (moduleKey === 'settings') {
      return (
        <div className="space-y-4">
          <SettingsInclusionBody />
          {MODULES.settings.body}
          <Card elevated className="!p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">{t('settingsWorkspace.preferences')}</p>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              {t('settingsWorkspace.preferencesBody')}{' '}
              <Link to="/app/profile" className="font-medium text-accent-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/35">
                {t('topbar.profile')}
              </Link>
            </p>
          </Card>
          {securityFeatures && (
            <Card elevated className="!p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">{t('settingsWorkspace.security')}</p>
              <p className="mt-2 text-sm leading-relaxed text-secondary">{securityFeatures.mfa?.message}</p>
              <p className="mt-2 text-sm text-secondary">
                {t('settingsWorkspace.sessionNote', { hours: securityFeatures.session?.maxAgeHours ?? '—' })}
              </p>
            </Card>
          )}
        </div>
      );
    }

    if (moduleKey === 'alerts') {
      return (
        <Card elevated className="!p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Inbox</p>
          <p className="mt-1 text-sm text-secondary">
            System notices and updates from service requests and application reviews (refreshed when you open this page).
          </p>
          <div className="mt-4 space-y-3">
            {alertFeed.length === 0 ? (
              <p className="text-sm text-secondary">No notifications loaded.</p>
            ) : (
              alertFeed.map((a) => (
                <div
                  key={a.id}
                  className="flex gap-3 rounded-lg border border-border-light bg-base/40 px-4 py-3 transition-shadow hover:shadow-sm"
                >
                  <Badge variant={a.unread ? 'primary' : 'default'}>{a.type || 'notice'}</Badge>
                  <div>
                    <p className="text-sm font-medium text-primary">{a.title}</p>
                    <p className="text-sm leading-relaxed text-secondary">{a.body}</p>
                    {a.at && (
                      <p className="mt-1 text-[11px] text-tertiary">
                        {new Date(a.at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <Button size="sm" variant="secondary" className="mt-5" type="button" onClick={() => window.location.assign('/app/benefits')}>
            Go to benefit discovery
          </Button>
        </Card>
      );
    }

    if (moduleKey === 'vault') {
      return (
        <Card elevated className="!p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Stored Documents</p>
            <Button
              size="sm"
              onClick={async () => {
                setVaultError(null);
                const name = `Citizen File ${documents.length + 1}`;
                const res = await apiFetch('/api/documents', {
                  method: 'POST',
                  body: JSON.stringify({ name, category: 'General', type: 'PDF', size: '220KB' }),
                });
                if (res.ok) {
                  const created = await res.json();
                  setDocuments((prev) => [created, ...prev]);
                } else {
                  setVaultError(await getErrorMessageFromResponse(res));
                }
              }}
            >
              Upload
            </Button>
          </div>
          {vaultError ? (
            <p className="mb-2 text-sm text-red-600 dark:text-red-400" role="alert">
              {vaultError}
            </p>
          ) : null}
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
            <p className="mt-1 text-xs text-secondary">
              Profile:{' '}
              {[schemeIntel.profile?.stateCode, schemeIntel.profile?.settlement, schemeIntel.profile?.occupation].filter(Boolean).join(' · ') || 'Not set — '}
              <Link to="/app/profile" className="ml-1 font-medium text-accent-primary hover:underline">
                complete in Profile
              </Link>
            </p>
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
            <div className="mt-1.5">
              <input
                className="w-full rounded-lg border border-border-light bg-surface px-2.5 py-1.5 text-sm"
                placeholder="State / region filter (e.g. TN — prioritises state-listed programmes)"
                value={schemeFilters.state}
                onChange={(e) => setSchemeFilters((p) => ({ ...p, state: e.target.value }))}
              />
            </div>
            <div className="mt-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Life-event discovery</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {[
                  ['health_need', 'Health & hospitalisation'],
                  ['emergency_health', 'Emergency care'],
                  ['education', 'Student support'],
                  ['job_loss', 'Job loss'],
                  ['starting_business', 'Start business'],
                  ['marriage_family', 'Marriage & family'],
                  ['women_empowerment', 'Women’s programmes'],
                  ['pregnancy_childcare', 'Pregnancy & childcare'],
                  ['farming_challenges', 'Farming challenges'],
                  ['housing_needs', 'Housing needs'],
                  ['retirement', 'Retirement'],
                  ['digital_access', 'Digital & connectivity'],
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
            {benefitsActionError ? (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
                {benefitsActionError}
              </p>
            ) : null}
            <div className="mt-2 space-y-1.5">
              {tabRows.map((scheme) => (
                <div key={scheme.id} className="rounded-lg border border-border-light bg-base/35 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <button type="button" className="text-left" onClick={() => setSelectedScheme(scheme)}>
                      <p className="text-sm font-medium text-primary">{scheme.schemeName}</p>
                      <p className="text-xs text-secondary mt-0.5">{scheme.ministryOrDepartment || 'Ministry TBD'}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="rounded bg-base/80 px-1.5 py-0 text-[10px] font-medium uppercase text-tertiary">
                          {scheme.governmentLevel === 'state' ? 'State' : 'National'}
                        </span>
                      </div>
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
                        setBenefitsActionError(null);
                        const res = await apiFetch(`/api/schemes/save/${scheme.id}`, { method: 'POST' });
                        if (res.ok) {
                          setSchemeFilters((p) => ({ ...p }));
                        } else {
                          setBenefitsActionError(await getErrorMessageFromResponse(res));
                        }
                      }}
                    >
                      Save
                    </Button>
                    {scheme.applicationStatus === 'not_started' && (
                      <Button
                        size="sm"
                        onClick={async () => {
                          setBenefitsActionError(null);
                          const res = await apiFetch('/api/applications', {
                            method: 'POST',
                            body: JSON.stringify({
                              type: 'scheme',
                              targetId: scheme.id,
                              title: scheme.schemeName,
                              deadline: scheme.deadline || null,
                            }),
                          });
                          if (res.ok) {
                            setSchemeFilters((p) => ({ ...p }));
                          } else {
                            setBenefitsActionError(await getErrorMessageFromResponse(res));
                          }
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
                  No schemes match the current filters. Clear filters or{' '}
                  <Link to="/app/profile" className="font-medium text-accent-primary hover:underline">
                    complete your profile
                  </Link>{' '}
                  to improve eligibility matching.
                </div>
              )}
            </div>
          </Card>
          <Card elevated className="!p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Application Guidance Panel</p>
            {selectedScheme ? (
              <div className="mt-1.5 max-h-[min(72vh,640px)] space-y-1.5 overflow-y-auto text-sm pr-1">
                <p className="font-medium text-primary">{selectedScheme.schemeName}</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary">{selectedScheme.governmentLevel === 'state' ? 'State' : 'Central'}</Badge>
                  {(selectedScheme.targetStates || []).slice(0, 4).map((st) => (
                    <Badge key={st} variant="default">{st}</Badge>
                  ))}
                </div>
                <p className="text-secondary">{selectedScheme.description || 'Description will appear once scheme data is connected.'}</p>
                {selectedScheme.benefitEstimate && (selectedScheme.benefitEstimate.narrative || selectedScheme.benefitEstimate.amountMin != null) && (
                  <div className="rounded-lg border border-border-light bg-base/35 p-3">
                    <p className="text-xs uppercase tracking-wide text-tertiary">Benefit estimate</p>
                    {selectedScheme.benefitEstimate.amountMin != null && (
                      <p className="mt-1 text-primary">
                        {selectedScheme.benefitEstimate.currency || 'INR'}{' '}
                        {selectedScheme.benefitEstimate.amountMin}
                        {selectedScheme.benefitEstimate.amountMax != null && selectedScheme.benefitEstimate.amountMax !== selectedScheme.benefitEstimate.amountMin
                          ? ` – ${selectedScheme.benefitEstimate.amountMax}`
                          : ''}
                        {selectedScheme.benefitEstimate.unit ? ` · ${selectedScheme.benefitEstimate.unit}` : ''}
                      </p>
                    )}
                    {selectedScheme.benefitEstimate.narrative && (
                      <p className="mt-1 text-secondary">{selectedScheme.benefitEstimate.narrative}</p>
                    )}
                  </div>
                )}
                <div className="rounded-lg border border-border-light bg-base/35 p-3">
                  <p className="text-xs uppercase tracking-wide text-tertiary">Step-by-step</p>
                  <ol className="mt-1 list-decimal pl-5 text-secondary">
                    {(selectedScheme.guidanceSteps?.length ? selectedScheme.guidanceSteps : ['Create profile', 'Prepare documents', 'Submit application']).map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
                {selectedScheme.whereToApply && (
                  <div className="rounded-lg border border-border-light bg-base/35 p-3">
                    <p className="text-xs uppercase tracking-wide text-tertiary">Where to apply</p>
                    <p className="mt-1 text-secondary">{selectedScheme.whereToApply}</p>
                  </div>
                )}
                <div className="rounded-lg border border-border-light bg-base/35 p-3">
                  <p className="text-xs uppercase tracking-wide text-tertiary">Timing & renewal</p>
                  <p className="text-secondary">
                    Processing: ~{selectedScheme.estimatedProcessingTimeDays ?? 'TBD'} days · Mode: {selectedScheme.applicationMode || 'TBD'}
                  </p>
                  {selectedScheme.applicationWindow && (
                    <p className="mt-1 text-secondary">
                      Window: {selectedScheme.applicationWindow.type}
                      {selectedScheme.applicationWindow.notes ? ` — ${selectedScheme.applicationWindow.notes}` : ''}
                    </p>
                  )}
                  {selectedScheme.deadline && (
                    <p className="mt-1 text-amber-700 dark:text-amber-400">Deadline: {selectedScheme.deadline}</p>
                  )}
                  {selectedScheme.renewalCycle && (
                    <p className="mt-1 text-secondary">Renewal cycle: {selectedScheme.renewalCycle}</p>
                  )}
                  {selectedScheme.renewalRequirements && (
                    <p className="mt-1 text-secondary">Renewal: {selectedScheme.renewalRequirements}</p>
                  )}
                </div>
                <div className="rounded-lg border border-border-light bg-base/35 p-3">
                  <p className="text-xs uppercase tracking-wide text-tertiary">Document checklist</p>
                  <ul className="mt-1 space-y-1">
                    {(selectedScheme.documentRequirements?.length ? selectedScheme.documentRequirements : (selectedScheme.requiredDocuments || []).map((l) => ({ id: l, label: l, category: 'General', required: true }))).map((doc) => {
                      const missing = (selectedScheme.missingDocumentDetails || []).some((m) => m.id === doc.id || m.label === doc.label);
                      return (
                        <li
                          key={doc.id || doc.label}
                          className={cn('text-sm', missing ? 'font-medium text-amber-700 dark:text-amber-400' : 'text-secondary')}
                        >
                          {doc.required === false ? '(Optional) ' : ''}{doc.label}
                          {doc.category && doc.category !== 'General' ? ` · ${doc.category}` : ''}
                          {missing ? ' — missing in vault' : ''}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                {(selectedScheme.supportContacts || []).length > 0 && (
                  <div className="rounded-lg border border-border-light bg-base/35 p-3">
                    <p className="text-xs uppercase tracking-wide text-tertiary">Local & helpline support</p>
                    <ul className="mt-1 space-y-2 text-secondary">
                      {selectedScheme.supportContacts.map((c, i) => (
                        <li key={`${c.name}-${i}`}>
                          <span className="font-medium text-primary">{c.name}</span>
                          {c.role ? ` · ${c.role}` : ''}
                          {c.phone && <span className="block text-xs">Tel: {c.phone}</span>}
                          {c.email && <span className="block text-xs">{c.email}</span>}
                          {c.address && <span className="block text-xs">{c.address}</span>}
                          {c.hours && <span className="block text-xs">{c.hours}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
                <p className="text-secondary">
                  Official portal:{' '}
                  {selectedScheme.officialLink ? (
                    <a className="text-accent-primary hover:underline" href={selectedScheme.officialLink} target="_blank" rel="noreferrer">
                      Open link
                    </a>
                  ) : (
                    'TBD'
                  )}
                </p>
                <p className="text-xs text-tertiary">Use your browser’s print or save-as-PDF to keep this checklist.</p>
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
          {opportunityError ? (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
              {opportunityError}
            </p>
          ) : null}
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
                      setOpportunityError(null);
                      const res = await apiFetch('/api/applications', {
                        method: 'POST',
                        body: JSON.stringify({ type: 'opportunity', targetId: opp.id, title: opp.title }),
                      });
                      if (res.ok) {
                        setOpportunities((prev) =>
                          prev.map((o) => (o.id === opp.id ? { ...o, pursued: true, applicationStatus: 'submitted' } : o))
                        );
                      } else {
                        setOpportunityError(await getErrorMessageFromResponse(res));
                      }
                    }}
                  >
                    Pursue
                  </Button>
                )}
              </div>
            ))}
            {opportunities.length === 0 && (
              <p className="rounded-lg border border-dashed border-border-light bg-base/25 px-4 py-6 text-center text-sm text-secondary">
                No opportunities are listed for your account right now. Check back after datasets are refreshed, or review programmes in Benefit Discovery.
              </p>
            )}
          </div>
        </Card>
      );
    }

    if (moduleKey === 'progress') {
      return (
        <Card elevated className="!p-5">
          <p className="text-sm font-semibold text-primary">Progress summary</p>
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

    if (moduleKey === 'analytics') {
      const roleNorm = user?.role === 'service_provider' ? 'staff' : user?.role || 'citizen';
      const isStaffOrAdmin = roleNorm === 'staff' || roleNorm === 'admin';
      const recent = Array.isArray(activitySummary?.activities) ? activitySummary.activities : [];
      return (
        <div className="space-y-4">
          <Card elevated className="!p-5">
            <p className="text-sm font-semibold text-primary">Activity overview</p>
            <p className="mt-1 text-xs text-secondary">Counts reflect this deployment and your signed-in account.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border-light bg-base/35 p-4">
                <p className="text-xs text-tertiary">Applications</p>
                <p className="text-2xl font-semibold text-primary">{activitySummary?.applications ?? applications.length}</p>
              </div>
              <div className="rounded-lg border border-border-light bg-base/35 p-4">
                <p className="text-xs text-tertiary">Documents</p>
                <p className="text-2xl font-semibold text-primary">{activitySummary?.documents ?? 0}</p>
              </div>
              <div className="rounded-lg border border-border-light bg-base/35 p-4">
                <p className="text-xs text-tertiary">Completed / approved items</p>
                <p className="text-2xl font-semibold text-primary">{activitySummary?.completedTasks ?? 0}</p>
              </div>
              <div className="rounded-lg border border-border-light bg-base/35 p-4">
                <p className="text-xs text-tertiary">Open service requests (yours)</p>
                <p className="text-2xl font-semibold text-primary">{activitySummary?.myOpenServiceRequests ?? 0}</p>
              </div>
            </div>
            {isStaffOrAdmin && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {activitySummary?.staffServiceQueueCount != null && (
                  <div className="rounded-lg border border-border-light bg-base/35 p-4">
                    <p className="text-xs text-tertiary">Service desk queue (organisation)</p>
                    <p className="text-2xl font-semibold text-primary">{activitySummary.staffServiceQueueCount}</p>
                  </div>
                )}
                {activitySummary?.applicationQueueCount != null && (
                  <div className="rounded-lg border border-border-light bg-base/35 p-4">
                    <p className="text-xs text-tertiary">Applications awaiting review</p>
                    <p className="text-2xl font-semibold text-primary">{activitySummary.applicationQueueCount}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
          <Card elevated className="!p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">Recent activity</p>
            {recent.length === 0 ? (
              <p className="mt-2 text-sm text-secondary">No recent events recorded.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm text-secondary">
                {recent.map((a) => (
                  <li key={a.id || `${a.type}-${a.createdAt}`} className="rounded-lg border border-border-light bg-base/30 px-3 py-2">
                    <span className="font-medium text-primary capitalize">{a.type || 'event'}</span>
                    {a.message || a.title ? ` — ${a.message || a.title}` : ''}
                    {a.createdAt ? (
                      <span className="mt-0.5 block text-[11px] text-tertiary">{new Date(a.createdAt).toLocaleString()}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      );
    }

    if (moduleKey === 'admin') {
      return (
        <div className="space-y-4">
          {MODULES.admin.body}
          {adminMetrics && (
            <Card elevated className="!p-5">
              <p className="text-sm font-semibold text-primary">Live operational metrics</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-lg border border-border-light bg-base/35 p-4">
                  <p className="text-xs text-tertiary">Registered users</p>
                  <p className="text-2xl font-semibold text-primary">{adminMetrics.totalUsers}</p>
                </div>
                <div className="rounded-lg border border-border-light bg-base/35 p-4">
                  <p className="text-xs text-tertiary">Applications (all)</p>
                  <p className="text-2xl font-semibold text-primary">{adminMetrics.totalApplications}</p>
                </div>
                <div className="rounded-lg border border-border-light bg-base/35 p-4">
                  <p className="text-xs text-tertiary">Documents</p>
                  <p className="text-2xl font-semibold text-primary">{adminMetrics.totalDocuments}</p>
                </div>
                <div className="rounded-lg border border-border-light bg-base/35 p-4">
                  <p className="text-xs text-tertiary">Service queue open</p>
                  <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                    {adminMetrics.pendingServiceRequests ?? 0}
                  </p>
                </div>
                <div className="rounded-lg border border-border-light bg-base/35 p-4">
                  <p className="text-xs text-tertiary">Apps awaiting review</p>
                  <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                    {adminMetrics.pendingApplicationReviews ?? 0}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm">
                <Link to="/app/services" className="font-medium text-accent-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/35">
                  Open service desk for queues and decisions →
                </Link>
              </p>
            </Card>
          )}
          {user?.role === 'admin' && (
            <Card elevated className="!p-5">
              <p className="text-sm font-semibold text-primary">Audit log (recent)</p>
              <p className="mt-1 text-xs text-secondary">Security-relevant events; excludes credential material.</p>
              <div className="mt-3 max-h-[min(50vh,420px)] overflow-auto rounded-lg border border-border-light">
                {adminAudit.length === 0 ? (
                  <p className="p-4 text-sm text-secondary">No events recorded yet.</p>
                ) : (
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="sticky top-0 bg-surface/95 text-[10px] font-semibold uppercase tracking-wider text-tertiary">
                      <tr>
                        <th className="px-3 py-2">Time</th>
                        <th className="px-3 py-2">Action</th>
                        <th className="px-3 py-2">Outcome</th>
                        <th className="hidden px-3 py-2 sm:table-cell">Detail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light text-primary">
                      {adminAudit.map((row) => (
                        <tr key={row.id}>
                          <td className="whitespace-nowrap px-3 py-2 text-secondary">{new Date(row.ts).toLocaleString()}</td>
                          <td className="px-3 py-2 font-medium">{row.action}</td>
                          <td className="px-3 py-2">
                            <Badge variant={row.outcome === 'failure' ? 'danger' : row.outcome === 'denied' ? 'warning' : 'primary'}>
                              {row.outcome}
                            </Badge>
                          </td>
                          <td className="hidden max-w-[200px] truncate px-3 py-2 text-secondary sm:table-cell">{row.detail || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>
          )}
        </div>
      );
    }

    return null;
  })();

  const m = MODULES[moduleKey];
  if (!m) {
    return (
      <PageShell title={t('workspace.unknownTitle')} description={t('workspace.unknownDesc')}>
        <p className="text-sm text-secondary">
          {t('workspace.unknownModule')}: <code className="rounded bg-base px-1.5 py-0.5 text-primary">{moduleKey}</code>
        </p>
      </PageShell>
    );
  }
  const title = m.titleKey ? t(m.titleKey) : m.title || '';
  const description = m.descriptionKey ? t(m.descriptionKey) : m.description || '';
  const staticBody = m.Body ? <m.Body /> : m.body;
  const bodyContent = dynamicBody ?? staticBody;
  return (
    <div className="space-y-5">
      <PageShell title={title} description={description}>
        {bodyContent}
      </PageShell>
    </div>
  );
};

export default WorkspaceViews;
