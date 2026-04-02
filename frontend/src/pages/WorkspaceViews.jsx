import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, Download, Eye, Trash2, Sparkles, BarChart3, Activity, Plus, Search, TrendingUp, Target, Zap, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import { Card, Button, Badge, cn } from '../components/ui';
import { apiFetch, getErrorMessageFromResponse } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { WORKSPACE_MODULES as MODULES } from './workspace/workspaceModuleCatalog';
import { IntelligentGuidanceWorkspace } from './workspace/IntelligentGuidanceWorkspace';
import { SettingsInclusionBody } from './workspace/InclusiveHubBodies';
import { AlertsWorkspace } from './workspace/AlertsWorkspace';
import { ProgressWorkspace } from './workspace/ProgressWorkspace';
import { useI18n } from '../context/I18nContext';

// Improved Bar Chart Component
function BarChart({ data, maxValue }) {
  const colors = ["#3b82f6", "#10b981", "#f59e42", "#ef4444"];
  // Visual tweak: blue bar (index 0) is 10% shorter, red bar (index 3) is 30% taller (max 100px)
  return (
    <div className="flex items-end justify-start gap-8 h-32 px-2">
      {data.map((item, index) => {
        let barHeight = maxValue > 0 ? (item.value / maxValue) * 80 : 0;
        if (index === 0) barHeight *= 0.9; // blue
        if (index === 2) barHeight = Math.max(barHeight * 1.7, barHeight + 10); // yellow (Comp)
        if (index === 3) barHeight = Math.max(barHeight * 1.3, barHeight + 12); // red
        barHeight = Math.min(barHeight, 100);
        return (
          <div key={index} className="flex flex-col items-center" style={{ minWidth: 48 }}>
            <div
              className="w-8 rounded-t mb-1"
              style={{
                height: `${barHeight}px`,
                background: colors[index % colors.length],
                opacity: 0.85,
                minHeight: 6,
              }}
            ></div>
            <span className="text-xs text-secondary mt-1">{item.label}</span>
            <span className="text-xs text-primary font-semibold mt-0.5">{item.value}</span>
          </div>
        );
      })}
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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

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
      return <AlertsWorkspace alertFeed={alertFeed} />;
    }

    if (moduleKey === 'vault') {
      const [searchQuery, setSearchQuery] = useState('');
      const [sortBy, setSortBy] = useState('date');
      const [categoryFilter, setCategoryFilter] = useState('');
      const [uploadProgress, setUploadProgress] = useState(0);
      const [isDragOver, setIsDragOver] = useState(false);

      const categories = ['ID Proof', 'Education', 'Financial', 'Other'];

      const getExpiryStatus = (expiresAt) => {
        if (!expiresAt) return { status: 'Valid', color: 'text-green-600', icon: '🟢' };
        const now = new Date();
        const expiry = new Date(expiresAt);
        const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) return { status: 'Expired', color: 'text-red-600', icon: '🔴', message: 'Expired' };
        if (daysLeft <= 10) return { status: 'Expiring Soon', color: 'text-yellow-600', icon: '🟡', message: `Expires in ${daysLeft} days` };
        return { status: 'Valid', color: 'text-green-600', icon: '🟢' };
      };

      const filteredDocuments = documents
        .filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .filter((d) => !categoryFilter || d.category === categoryFilter)
        .sort((a, b) => {
          if (sortBy === 'name') return a.name.localeCompare(b.name);
          if (sortBy === 'expiry') {
            const aExpiry = new Date(a.expiresAt || '9999-12-31');
            const bExpiry = new Date(b.expiresAt || '9999-12-31');
            return aExpiry - bExpiry;
          }
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });

      const handleUpload = async (files) => {
        setVaultError(null);
        setUploadProgress(0);
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const formData = new FormData();
          formData.append('file', file);
          formData.append('name', file.name);
          formData.append('category', categoryFilter || 'Other');
          formData.append('type', file.type.split('/')[1].toUpperCase());
          const res = await apiFetch('/api/documents', { method: 'POST', body: formData });
          if (res.ok) {
            const created = await res.json();
            setDocuments((prev) => [created, ...prev]);
          } else {
            setVaultError(await getErrorMessageFromResponse(res));
          }
          setUploadProgress(((i + 1) / files.length) * 100);
        }
        setUploadProgress(0);
      };

      const handleDelete = async (id) => {
        const res = await apiFetch(`/api/documents/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setDocuments((prev) => prev.filter((d) => d.id !== id));
        } else {
          setVaultError(await getErrorMessageFromResponse(res));
        }
      };

      const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
      };

      const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
      };

      const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        handleUpload(files);
      };

      return (
        <div className="space-y-6">
          {/* Header */}
          <Card elevated className="!p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-tertiary">Document Vault</p>
                <p className="mt-1 text-sm text-secondary">Securely store and manage your important documents</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="rounded-lg border border-border-light bg-surface px-3 py-2 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                  className="rounded-lg border border-border-light bg-surface px-3 py-2 text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="expiry">Sort by Expiry</option>
                </select>
                <select
                  className="rounded-lg border border-border-light bg-surface px-3 py-2 text-sm"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Upload Area */}
          <Card elevated className="!p-5">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver ? 'border-accent-primary bg-accent-primary/10' : 'border-border-light'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload size={48} className="mx-auto mb-4 text-secondary" />
              <p className="text-lg font-medium text-primary mb-2">Upload Documents</p>
              <p className="text-sm text-secondary mb-4">Drag and drop files here or click to browse</p>
              <input
                type="file"
                multiple
                className="hidden"
                id="file-upload"
                onChange={(e) => handleUpload(Array.from(e.target.files))}
              />
              <label htmlFor="file-upload">
                <Button variant="secondary">Choose Files</Button>
              </label>
              {uploadProgress > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-surface rounded-full h-2">
                    <div className="bg-accent-primary h-2 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                  <p className="text-xs text-secondary mt-1">Uploading... {Math.round(uploadProgress)}%</p>
                </div>
              )}
            </div>
          </Card>

          {/* AI Insights */}
          <Card elevated className="!p-5">
            <div className="flex items-start gap-3">
              <Sparkles size={20} className="text-accent-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">AI Insight</p>
                <p className="text-sm text-secondary mt-1">
                  You may need to upload an income certificate for scheme eligibility. This could unlock additional benefits.
                </p>
                <Button size="sm" className="mt-3" onClick={() => setCategoryFilter('Financial')}>
                  Upload Now
                </Button>
              </div>
            </div>
          </Card>

          {/* Documents List */}
          <Card elevated className="!p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-tertiary mb-4">Your Documents</p>
            {vaultError && (
              <p className="mb-4 text-sm text-semantic-error" role="alert">{vaultError}</p>
            )}
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto mb-4 text-secondary" />
                <p className="text-lg font-medium text-primary mb-2">No documents uploaded</p>
                <p className="text-sm text-secondary">Add documents to unlock scheme recommendations and keep your records organized.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDocuments.map((d) => {
                  const expiryInfo = getExpiryStatus(d.expiresAt);
                  return (
                    <div key={d.id} className="rounded-lg border border-border-light bg-base/35 p-4 hover:border-accent-primary/20 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <FileText size={24} className="text-secondary mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-primary truncate">{d.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="default">{d.type}</Badge>
                              <Badge variant="default">{d.category}</Badge>
                              <span className={`text-xs ${expiryInfo.color}`}>
                                {expiryInfo.icon} {expiryInfo.status}
                              </span>
                              {d.verified ? (
                                <span className="text-xs text-green-600">Verified ✔</span>
                              ) : (
                                <span className="text-xs text-yellow-600">Not Verified</span>
                              )}
                            </div>
                            {expiryInfo.message && (
                              <p className="text-xs text-semantic-warning mt-1">{expiryInfo.message}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => window.open(`/api/documents/${d.id}/download`, '_blank')}>
                            <Download size={16} />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => window.open(`/api/documents/${d.id}/view`, '_blank')}>
                            <Eye size={16} />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(d.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      );
    }

    if (moduleKey === 'benefits') {
      const tabRows = schemeIntel[schemeTab] || [];
      return (
        <div className="grid gap-3 lg:grid-cols-[2.2fr_1fr]">
          <Card elevated className="!p-4 lg:col-span-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">{t('benefits.schemeIntelTitle')}</p>
            <p className="mt-1 text-xs text-secondary">
              {t('benefits.profile')}: {' '}
              {[schemeIntel.profile?.stateCode, schemeIntel.profile?.settlement, schemeIntel.profile?.occupation].filter(Boolean).join(' · ') || t('benefits.profileNotSet')}
              <Link to="/app/profile" className="ml-1 font-medium text-accent-primary hover:underline">
                {t('benefits.completeInProfile')}
              </Link>
            </p>
            <div className="mt-2 grid gap-1.5 sm:grid-cols-3">
              <input
                className="rounded-lg border border-border-light bg-surface px-2.5 py-1.5 text-sm"
                placeholder={t('benefits.searchSchemes')}
                value={schemeFilters.search}
                onChange={(e) => setSchemeFilters((p) => ({ ...p, search: e.target.value }))}
              />
              <input
                className="rounded-lg border border-border-light bg-surface px-2.5 py-1.5 text-sm"
                placeholder={t('benefits.category')}
                value={schemeFilters.category}
                onChange={(e) => setSchemeFilters((p) => ({ ...p, category: e.target.value }))}
              />
              <select
                className="rounded-lg border border-border-light bg-surface px-2.5 py-1.5 text-sm"
                value={schemeFilters.governmentLevel}
                onChange={(e) => setSchemeFilters((p) => ({ ...p, governmentLevel: e.target.value }))}
              >
                <option value="">{t('benefits.allLevels')}</option>
                <option value="central">{t('benefits.central')}</option>
                <option value="state">{t('benefits.state')}</option>
              </select>
            </div>
            <div className="mt-1.5 grid gap-1.5 sm:grid-cols-4">
              <input
                className="rounded-lg border border-border-light bg-surface px-2.5 py-1.5 text-sm"
                placeholder={t('benefits.beneficiary')}
                value={schemeFilters.beneficiary}
                onChange={(e) => setSchemeFilters((p) => ({ ...p, beneficiary: e.target.value }))}
              />
              <input
                className="rounded-lg border border-border-light bg-surface px-2.5 py-1.5 text-sm"
                placeholder={t('benefits.location')}
                value={schemeFilters.location}
                onChange={(e) => setSchemeFilters((p) => ({ ...p, location: e.target.value }))}
              />
              <input
                className="rounded-lg border border-border-light bg-surface px-2.5 py-1.5 text-sm"
                placeholder={t('benefits.sdg')}
                value={schemeFilters.sdg}
                onChange={(e) => setSchemeFilters((p) => ({ ...p, sdg: e.target.value.toUpperCase() }))}
              />
              <input
                className="rounded-lg border border-border-light bg-surface px-2.5 py-1.5 text-sm"
                placeholder={t('benefits.department')}
                value={schemeFilters.department}
                onChange={(e) => setSchemeFilters((p) => ({ ...p, department: e.target.value }))}
              />
            </div>
            <div className="mt-1.5">
              <input
                className="w-full rounded-lg border border-border-light bg-surface px-2.5 py-1.5 text-sm"
                placeholder={t('benefits.stateRegionFilter')}
                value={schemeFilters.state}
                onChange={(e) => setSchemeFilters((p) => ({ ...p, state: e.target.value }))}
              />
            </div>
            <div className="mt-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">{t('benefits.lifeEventDiscovery')}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {[
                  ['health_need', t('benefits.healthHospitalisation')],
                  ['emergency_health', t('benefits.emergencyCare')],
                  ['education', t('benefits.studentSupport')],
                  ['job_loss', t('benefits.jobLoss')],
                  ['starting_business', t('benefits.startBusiness')],
                  ['marriage_family', t('benefits.marriageFamily')],
                  ['women_empowerment', t('benefits.womensProgrammes')],
                  ['pregnancy_childcare', t('benefits.pregnancyChildcare')],
                  ['farming_challenges', t('benefits.farmingChallenges')],
                  ['housing_needs', t('benefits.housingNeeds')],
                  ['retirement', t('benefits.retirement')],
                  ['digital_access', t('benefits.digitalConnectivity')],
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
                ['recommended', t('benefits.recommended', { count: schemeIntel.totals?.recommended || 0 })],
                ['eligible', t('benefits.eligible', { count: schemeIntel.totals?.eligible || 0 })],
                ['highImpact', t('benefits.highImpact', { count: schemeIntel.totals?.highImpact || 0 })],
                ['saved', t('benefits.saved', { count: schemeIntel.totals?.saved || 0 })],
                ['applied', t('benefits.applied', { count: schemeIntel.totals?.applied || 0 })],
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
                      <p className="text-xs text-secondary mt-0.5">{scheme.ministryOrDepartment || t('benefits.ministryTBD')}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="rounded bg-base/80 px-1.5 py-0 text-[10px] font-medium uppercase text-tertiary">
                          {scheme.governmentLevel === 'state' ? t('benefits.state') : t('benefits.national')}
                        </span>
                      </div>
                    </button>
                    <Badge variant={scheme.applicationStatus === 'not_started' ? 'warning' : 'primary'}>
                      {t(`benefits.status.${scheme.applicationStatus}`)}
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {(scheme.tnwiseAlignedSdgs || []).map((sdg) => (
                      <Badge key={`${scheme.id}-${sdg}`} variant="secondary">{sdg}</Badge>
                    ))}
                    {scheme.prioritizedScore > 0.8 && <Badge variant="primary">{t('benefits.highImpactBadge')}</Badge>}
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
                      {t('benefits.save')}
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
                        {t('benefits.apply')}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {tabRows.length === 0 && (
                <div className="rounded-lg border border-dashed border-border-light bg-base/25 px-3 py-4 text-sm text-secondary">
                  {t('benefits.noSchemesMatch')}{' '}
                  <Link to="/app/profile" className="font-medium text-accent-primary hover:underline">
                    {t('benefits.completeProfile')}
                  </Link>{' '}
                  {t('benefits.improveEligibility')}
                </div>
              )}
            </div>
          </Card>
          <Card elevated className="!p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">{t('benefits.guidancePanel')}</p>
            {selectedScheme ? (
              <div className="mt-1.5 max-h-[min(72vh,640px)] space-y-1.5 overflow-y-auto text-sm pr-1">
                <p className="font-medium text-primary">{selectedScheme.schemeName}</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary">{selectedScheme.governmentLevel === 'state' ? t('benefits.state') : t('benefits.central')}</Badge>
                  {(selectedScheme.targetStates || []).slice(0, 4).map((st) => (
                    <Badge key={st} variant="default">{st}</Badge>
                  ))}
                </div>
                <p className="text-secondary">{selectedScheme.description || t('benefits.descriptionFallback')}</p>
                {selectedScheme.benefitEstimate && (selectedScheme.benefitEstimate.narrative || selectedScheme.benefitEstimate.amountMin != null) && (
                  <div className="rounded-lg border border-border-light bg-base/35 p-3">
                    <p className="text-xs uppercase tracking-wide text-tertiary">{t('benefits.benefitEstimate')}</p>
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
                  <p className="text-xs uppercase tracking-wide text-tertiary">{t('benefits.stepByStep')}</p>
                  <ol className="mt-1 list-decimal pl-5 text-secondary">
                    {(selectedScheme.guidanceSteps?.length ? selectedScheme.guidanceSteps : [t('benefits.defaultStep1'), t('benefits.defaultStep2'), t('benefits.defaultStep3')]).map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
                {selectedScheme.whereToApply && (
                  <div className="rounded-lg border border-border-light bg-base/35 p-3">
                    <p className="text-xs uppercase tracking-wide text-tertiary">{t('benefits.whereToApply')}</p>
                    <p className="mt-1 text-secondary">{selectedScheme.whereToApply}</p>
                  </div>
                )}
                <div className="rounded-lg border border-border-light bg-base/35 p-3">
                  <p className="text-xs uppercase tracking-wide text-tertiary">{t('benefits.timingRenewal')}</p>
                  <p className="text-secondary">
                    {t('benefits.processing')}: ~{selectedScheme.estimatedProcessingTimeDays ?? t('benefits.tbd')} {t('benefits.days')} · {t('benefits.mode')}: {selectedScheme.applicationMode || t('benefits.tbd')}
                  </p>
                  {selectedScheme.applicationWindow && (
                    <p className="mt-1 text-secondary">
                      {t('benefits.window')}: {selectedScheme.applicationWindow.type}
                      {selectedScheme.applicationWindow.notes ? ` — ${selectedScheme.applicationWindow.notes}` : ''}
                    </p>
                  )}
                  {selectedScheme.deadline && (
                    <p className="mt-1 text-amber-700 dark:text-amber-400">{t('benefits.deadline')}: {selectedScheme.deadline}</p>
                  )}
                  {selectedScheme.renewalCycle && (
                    <p className="mt-1 text-secondary">{t('benefits.renewalCycle')}: {selectedScheme.renewalCycle}</p>
                  )}
                  {selectedScheme.renewalRequirements && (
                    <p className="mt-1 text-secondary">{t('benefits.renewal')}: {selectedScheme.renewalRequirements}</p>
                  )}
                </div>
                <div className="rounded-lg border border-border-light bg-base/35 p-3">
                  <p className="text-xs uppercase tracking-wide text-tertiary">{t('benefits.documentChecklist')}</p>
                  <ul className="mt-1 space-y-1">
                    {(selectedScheme.documentRequirements?.length ? selectedScheme.documentRequirements : (selectedScheme.requiredDocuments || []).map((l) => ({ id: l, label: l, category: 'General', required: true }))).map((doc) => {
                      const missing = (selectedScheme.missingDocumentDetails || []).some((m) => m.id === doc.id || m.label === doc.label);
                      return (
                        <li
                          key={doc.id || doc.label}
                          className={cn('text-sm', missing ? 'font-medium text-amber-700 dark:text-amber-400' : 'text-secondary')}
                        >
                          {doc.required === false ? t('benefits.optional') : ''}{doc.label}
                          {doc.category && doc.category !== 'General' ? ` · ${doc.category}` : ''}
                          {missing ? ` — ${t('benefits.missingInVault')}` : ''}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                {(selectedScheme.supportContacts || []).length > 0 && (
                  <div className="rounded-lg border border-border-light bg-base/35 p-3">
                    <p className="text-xs uppercase tracking-wide text-tertiary">{t('benefits.localHelplineSupport')}</p>
                    <ul className="mt-1 space-y-2 text-secondary">
                      {selectedScheme.supportContacts.map((c, i) => (
                        <li key={`${c.name}-${i}`}>
                          <span className="font-medium text-primary">{c.name}</span>
                          {c.role ? ` · ${c.role}` : ''}
                          {c.phone && <span className="block text-xs">{t('benefits.tel')}: {c.phone}</span>}
                          {c.email && <span className="block text-xs">{c.email}</span>}
                          {c.address && <span className="block text-xs">{c.address}</span>}
                          {c.hours && <span className="block text-xs">{c.hours}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="rounded-lg border border-border-light bg-base/35 p-3">
                  <p className="text-xs uppercase tracking-wide text-tertiary">{t('benefits.officialSourceAttribution')}</p>
                  <p className="mt-1 text-secondary">
                    {t('benefits.sourceType')}: <span className="text-primary">{selectedScheme.sourceAttribution?.sourceType || t('benefits.policyBrief')}</span>
                  </p>
                  <p className="text-secondary">
                    {t('benefits.lastVerified')}: <span className="text-primary">{selectedScheme.sourceAttribution?.lastVerifiedDate || t('benefits.unknown')}</span>
                  </p>
                  <p className="text-secondary">
                    {t('benefits.policyNotes')}: {selectedScheme.sourceAttribution?.policyNotes || t('benefits.noPolicyNotes')}
                  </p>
                </div>
                <p className="text-secondary">
                  {t('benefits.officialPortal')}: {' '}
                  {selectedScheme.officialLink ? (
                    <a className="text-accent-primary hover:underline" href={selectedScheme.officialLink} target="_blank" rel="noreferrer">
                      {t('benefits.openLink')}
                    </a>
                  ) : (
                    t('benefits.tbd')
                  )}
                </p>
                <p className="text-xs text-tertiary">{t('benefits.printChecklist')}</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-secondary">{t('benefits.selectScheme')}</p>
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
      return <ProgressWorkspace applications={applications} activitySummary={activitySummary} />;
    }

    if (moduleKey === 'assistant') {
      return <IntelligentGuidanceWorkspace />;
    }

    if (moduleKey === 'urbanRuralBridge') {
      const UrbanRuralOpportunityBridge = React.lazy(() => import('./UrbanRuralOpportunityBridge.jsx'));
      return (
        <React.Suspense fallback={<div className="p-8 text-center">Loading Urban–Rural Bridge...</div>}>
          <UrbanRuralOpportunityBridge />
        </React.Suspense>
      );
    }

    if (moduleKey === 'analytics') {
      const roleNorm = user?.role === 'service_provider' ? 'staff' : user?.role || 'citizen';
      const isStaffOrAdmin = roleNorm === 'staff' || roleNorm === 'admin';
      const recent = Array.isArray(activitySummary?.activities) ? activitySummary.activities : [];

      // Enhanced summary
      const apps = activitySummary?.applications ?? applications.length;
      const docs = activitySummary?.documents ?? 0;
      const completed = activitySummary?.completedTasks ?? 0;
      const openRequests = activitySummary?.myOpenServiceRequests ?? 0;

      // Mock chart data
      const activityChartData = [
        { label: 'Apps', value: apps },
        { label: 'Docs', value: docs },
        { label: 'Comp', value: completed },
        { label: 'Req', value: openRequests },
      ];
      const timeChartData = [
        { label: 'Week 1', value: 2 },
        { label: 'Week 2', value: 4 },
        { label: 'Week 3', value: 3 },
        { label: 'Week 4', value: 5 },
      ];

      // Recent activities with icons
      const recentActivities = recent.slice(0, 5).map(a => ({
        ...a,
        icon: a.type === 'application' ? FileText : a.type === 'document' ? Upload : Activity,
        time: a.createdAt ? new Date(a.createdAt).toLocaleString() : 'Recently',
      }));

      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Insight & Analytics</h1>
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

          {/* Enhanced Overview Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card elevated className="!p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary">Applications</p>
                  <p className="text-2xl font-bold text-primary">{apps}</p>
                  <p className="text-xs text-secondary">Active applications</p>
                </div>
              </div>
            </Card>

            <Card elevated className="!p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary">Documents</p>
                  <p className="text-2xl font-bold text-primary">{docs}</p>
                  <p className="text-xs text-secondary">Uploaded files</p>
                </div>
              </div>
            </Card>

            <Card elevated className="!p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary">Completed</p>
                  <p className="text-2xl font-bold text-primary">{completed}</p>
                  <p className="text-xs text-secondary">Approved items</p>
                </div>
              </div>
            </Card>

            <Card elevated className="!p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary">Open Requests</p>
                  <p className="text-2xl font-bold text-primary">{openRequests}</p>
                  <p className="text-xs text-secondary">Service requests</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Visual Analytics */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card elevated className="!p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-accent-primary" />
                <h3 className="font-semibold text-primary">Insight Breakdown</h3>
              </div>
              <BarChart data={activityChartData} maxValue={Math.max(...activityChartData.map(d => d.value), 1)} />
            </Card>

            <Card elevated className="!p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-accent-primary" />
                <h3 className="font-semibold text-primary">Activity Over Time</h3>
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
                <p className="text-2xl font-bold text-primary">{apps > 0 ? Math.round((completed / apps) * 100) : 0}%</p>
              </div>
              <div>
                <p className="text-sm text-secondary">Average Processing Time</p>
                <p className="text-2xl font-bold text-primary">10 days</p>
              </div>
              <div>
                <p className="text-sm text-secondary">Success Rate</p>
                <p className="text-2xl font-bold text-primary">80%</p>
              </div>
            </div>
          </Card>

          {/* AI Insights */}
          <Card elevated className="!p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-accent-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold text-primary">AI Insights</h3>
                  <p className="mt-1 text-sm text-secondary">
                    You have {openRequests} open service requests. Consider uploading additional documents to speed up processing.
                  </p>
                </div>
              </div>
              <Button size="sm" variant="primary">
                Take Action
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
            {recentActivities.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="mx-auto h-12 w-12 text-secondary" />
                <h3 className="mt-4 text-lg font-semibold text-primary">No activity yet</h3>
                <p className="mt-2 text-secondary">Start by applying for a scheme or uploading documents to see your progress and insights.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id || `${activity.type}-${activity.createdAt}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface transition-colors">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-primary/10">
                        <Icon className="h-4 w-4 text-accent-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-primary">{activity.message || activity.title || 'Activity'}</p>
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
            )}
          </Card>

          {isStaffOrAdmin && (
            <Card elevated className="!p-5">
              <p className="text-sm font-semibold text-primary">Staff/Admin Metrics</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
            </Card>
          )}
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
                  <p className="text-2xl font-semibold text-accent-primary">
                    {adminMetrics.pendingServiceRequests ?? 0}
                  </p>
                </div>
                <div className="rounded-lg border border-border-light bg-base/35 p-4">
                  <p className="text-xs text-tertiary">Apps awaiting review</p>
                  <p className="text-2xl font-semibold text-accent-primary">
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
    <div className="space-y-6">
      <PageShell title={title} description={description}>
        {bodyContent}
      </PageShell>
    </div>
  );
};

export default WorkspaceViews;
