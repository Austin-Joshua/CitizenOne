import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PageShell from '../components/layout/PageShell';
import { Card, Button, Badge, Input, cn } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { apiFetch, getApiBase, getAuthToken } from '../lib/api';
import { RefreshCw } from 'lucide-react';
import {
  labelServiceRequestCategory,
  labelServiceRequestStatus,
  labelApplicationStatus,
  labelApplicationType,
} from '../lib/queueLabels';

function normalizeRole(role) {
  if (role === 'service_provider') return 'staff';
  return role || 'citizen';
}

export default function ServiceRequestsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const role = normalizeRole(user?.role);
  const isStaff = role === 'staff' || role === 'admin';
  const isOrg = role === 'organization';
  const isEndUser = role === 'citizen' || role === 'student';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [busy, setBusy] = useState(false);
  const [staffNote, setStaffNote] = useState('');

  const serviceReqKey = useMemo(() => ['service-requests', user?.id], [user?.id]);
  const appsQueueKey = useMemo(() => ['applications', 'queue', user?.id], [user?.id]);

  const { data: rows = [], refetch: refetchRows } = useQuery({
    queryKey: serviceReqKey,
    queryFn: async () => {
      const res = await apiFetch('/api/service-requests');
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: Boolean(user?.id),
  });

  const { data: appsQueue = [], refetch: refetchApps } = useQuery({
    queryKey: appsQueueKey,
    queryFn: async () => {
      const res = await apiFetch('/api/applications/queue');
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: Boolean(user?.id) && (isStaff || isOrg),
  });

  const invalidateQueues = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['service-requests'] });
    void queryClient.invalidateQueries({ queryKey: ['applications', 'queue'] });
  }, [queryClient]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      const id = window.setInterval(() => {
        invalidateQueues();
      }, 30000);
      return () => window.clearInterval(id);
    }

    const base = getApiBase();
    const url = `${base}/api/events/stream?access_token=${encodeURIComponent(token)}`;
    let es;
    try {
      es = new EventSource(url);
    } catch {
      es = null;
    }

    const onInvalidate = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data?.type === 'service-requests' || data?.type === 'applications') {
          invalidateQueues();
        }
      } catch {
        /* ignore */
      }
    };

    if (es) {
      es.addEventListener('message', onInvalidate);
    }

    const fallback = window.setInterval(() => {
      invalidateQueues();
    }, 60000);

    return () => {
      window.clearInterval(fallback);
      if (es) {
        es.removeEventListener('message', onInvalidate);
        es.close();
      }
    };
  }, [invalidateQueues]);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      const res = await apiFetch('/api/service-requests', {
        method: 'POST',
        body: JSON.stringify({ title: title.trim(), description, category }),
      });
      if (res.ok) {
        setTitle('');
        setDescription('');
        await queryClient.invalidateQueries({ queryKey: serviceReqKey });
      }
    } finally {
      setBusy(false);
    }
  };

  const reviewApp = async (id, status) => {
    if (!isStaff) return;
    setBusy(true);
    try {
      const res = await apiFetch(`/api/applications/${encodeURIComponent(id)}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note: staffNote }),
      });
      if (res.ok) {
        setStaffNote('');
        await queryClient.invalidateQueries({ queryKey: appsQueueKey });
      }
    } finally {
      setBusy(false);
    }
  };

  const decide = async (id, status) => {
    setBusy(true);
    try {
      const res = await apiFetch(`/api/service-requests/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, resolutionNote: staffNote }),
      });
      if (res.ok) {
        setStaffNote('');
        await queryClient.invalidateQueries({ queryKey: serviceReqKey });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell
      title={t('serviceDesk.pageTitle')}
      description={t('serviceDesk.pageDescription')}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {isEndUser && (
          <Card elevated className="!p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">{t('serviceDesk.newRequest')}</p>
            <form className="mt-3 space-y-3" onSubmit={submit}>
              <Input label={t('serviceDesk.subject')} value={title} onChange={(e) => setTitle(e.target.value)} required />
              <label className="block space-y-1.5">
                <span className="ml-0.5 text-[11px] font-semibold uppercase tracking-wider text-secondary">{t('serviceDesk.category')}</span>
                <select
                  className="w-full rounded-lg border border-border-light bg-surface px-3 py-2.5 text-[15px] text-primary"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="general">{t('serviceDesk.catGeneral')}</option>
                  <option value="benefits">{t('serviceDesk.catBenefits')}</option>
                  <option value="documents">{t('serviceDesk.catDocuments')}</option>
                  <option value="technical">{t('serviceDesk.catTechnical')}</option>
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="ml-0.5 text-[11px] font-semibold uppercase tracking-wider text-secondary">{t('serviceDesk.details')}</span>
                <textarea
                  className="min-h-[100px] w-full rounded-lg border border-border-light bg-surface px-3 py-2.5 text-[15px] text-primary"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('serviceDesk.detailsPlaceholder')}
                />
              </label>
              <Button type="submit" disabled={busy} className="w-full sm:w-auto">
                {busy ? t('serviceDesk.submitSending') : t('serviceDesk.submitRequest')}
              </Button>
            </form>
          </Card>
        )}

        {!isEndUser && !isStaff && (
          <Card elevated className="!p-5 lg:col-span-2">
            <p className="text-sm text-secondary">{t('serviceDesk.orgVisibility')}</p>
          </Card>
        )}

        <Card elevated className={cn('!p-5', isEndUser ? '' : 'lg:col-span-2')}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">
              {isStaff || isOrg ? t('serviceDesk.queue') : t('serviceDesk.yourRequests')}
            </p>
            <button
              type="button"
              onClick={() => void refetchRows()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-light px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-secondary transition-colors hover:border-accent-primary/30 hover:text-accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/35"
            >
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              {t('serviceDesk.sync')}
            </button>
          </div>
          <div className="space-y-2">
            {rows.length === 0 && <p className="text-sm text-secondary">{t('serviceDesk.noRequests')}</p>}
            {rows.map((r) => (
              <div
                key={r.id}
                className="rounded-lg border border-border-light bg-base/40 px-3 py-2.5 text-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-primary">{r.title}</p>
                    <p className="text-xs text-secondary">
                      {(r.requesterName && `${r.requesterName} · `) || ''}
                      {labelServiceRequestCategory(r.category, t)}
                    </p>
                    {r.description ? <p className="mt-1 text-secondary">{r.description}</p> : null}
                  </div>
                  <Badge
                    variant={
                      r.status === 'approved'
                        ? 'primary'
                        : r.status === 'rejected'
                          ? 'danger'
                          : r.status === 'in_review'
                            ? 'warning'
                            : 'default'
                    }
                  >
                    {labelServiceRequestStatus(r.status, t)}
                  </Badge>
                </div>
                {r.resolutionNote ? (
                  <p className="mt-2 text-xs text-secondary">
                    {t('serviceDesk.notePrefix')} {r.resolutionNote}
                  </p>
                ) : null}
                {isStaff && ['submitted', 'in_review'].includes(r.status) && (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-border-light pt-3">
                    <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => decide(r.id, 'in_review')}>
                      {t('serviceDesk.actionInReview')}
                    </Button>
                    <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => decide(r.id, 'approved')}>
                      {t('serviceDesk.actionApprove')}
                    </Button>
                    <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => decide(r.id, 'rejected')}>
                      {t('serviceDesk.actionReject')}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {(isStaff || isOrg) && (
        <Card elevated className="!mt-4 !p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">{t('serviceDesk.applicationsTitle')}</p>
            <button
              type="button"
              onClick={() => void refetchApps()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-light px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-secondary transition-colors hover:border-accent-primary/30 hover:text-accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/35"
            >
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              {t('serviceDesk.sync')}
            </button>
          </div>
          {isStaff && <p className="mb-3 text-xs text-secondary">{t('serviceDesk.staffNoteHint')}</p>}
          <div className="space-y-2">
            {appsQueue.length === 0 && <p className="text-sm text-secondary">{t('serviceDesk.noApplications')}</p>}
            {appsQueue.map((a) => (
              <div key={a.id} className="rounded-lg border border-border-light bg-base/40 px-3 py-2.5 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-primary">{a.title}</p>
                    <p className="text-xs text-secondary">
                      {a.applicantName} · {labelApplicationType(a.type, t)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      a.status === 'approved'
                        ? 'primary'
                        : a.status === 'rejected'
                          ? 'danger'
                          : a.status === 'under_review' || a.status === 'in_progress'
                            ? 'warning'
                            : 'default'
                    }
                  >
                    {labelApplicationStatus(a.status, t)}
                  </Badge>
                </div>
                {isStaff && ['submitted', 'in_progress', 'under_review'].includes(a.status) && (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-border-light pt-3">
                    <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => reviewApp(a.id, 'under_review')}>
                      {t('serviceDesk.actionUnderReview')}
                    </Button>
                    <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => reviewApp(a.id, 'approved')}>
                      {t('serviceDesk.actionApprove')}
                    </Button>
                    <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => reviewApp(a.id, 'rejected')}>
                      {t('serviceDesk.actionReject')}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </PageShell>
  );
}
