import React, { useEffect, useMemo, useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import PageShell from '../components/layout/PageShell';
import { Card, Badge, Button } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { apiFetch } from '../lib/api';

const BillingPage = () => {
  const { t } = useI18n();
  useDocumentTitle(t('billingPage.documentTitle'));
  const { user, updateProfile } = useAuth();
  const [plan, setPlan] = useState(user?.plan || 'free');
  const [saving, setSaving] = useState(false);
  const [catalog, setCatalog] = useState([]);

  useEffect(() => {
    let a = true;
    (async () => {
      try {
        const res = await apiFetch('/api/plans');
        if (!res.ok || !a) return;
        const data = await res.json();
        setCatalog(Array.isArray(data) ? data : []);
      } catch {
        if (a) setCatalog([]);
      }
    })();
    return () => {
      a = false;
    };
  }, []);

  useEffect(() => {
    setPlan(user?.plan || 'free');
  }, [user?.plan]);

  const billingHistory = [];

  const localizedFallbackPlans = useMemo(
    () => [
      {
        id: 'free',
        name: t('billingPage.planFree'),
        priceMonthly: 0,
        features: [
          t('billingPage.featCoreDashboard'),
          t('billingPage.featSchemeDiscovery'),
          t('billingPage.featServiceRequests'),
        ],
      },
      {
        id: 'premium',
        name: t('billingPage.planPremium'),
        priceMonthly: 29,
        features: [t('billingPage.featAdvancedTools'), t('billingPage.featPrioritySupport')],
      },
      {
        id: 'institutional',
        name: t('billingPage.planInstitutional'),
        priceMonthly: null,
        features: [
          t('billingPage.featVolumeLicensing'),
          t('billingPage.featSSO'),
          t('billingPage.featDedicatedSupport'),
        ],
      },
    ],
    [t]
  );

  const displayPlans = catalog.length > 0 ? catalog : localizedFallbackPlans;

  return (
    <PageShell
      title={t('billingPage.pageTitle')}
      description={t('billingPage.pageDescription')}
    >
      <Card elevated className="!mb-4 !p-4">
        <p className="text-sm text-secondary">{t('billingPage.introCard')}</p>
      </Card>

      <Card elevated className="!mb-4 !p-4">
        <p className="text-sm font-semibold text-primary">{t('billingPage.paymentsTitle')}</p>
        <p className="mt-2 text-sm leading-relaxed text-secondary">{t('billingPage.paymentsBody')}</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {displayPlans.map((p) => (
          <Card key={p.id} elevated className="!p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-primary">{p.name}</h3>
              {plan === p.id && <Badge variant="primary">{t('billingPage.currentBadge')}</Badge>}
            </div>
            <p className="mt-2 text-3xl font-semibold text-primary">
              {p.priceMonthly == null ? (
                <span className="text-xl">{t('billingPage.priceCustom')}</span>
              ) : (
                <>
                  {p.priceMonthly === 0 ? '$0' : `$${p.priceMonthly}`}
                  {p.priceMonthly != null && p.priceMonthly > 0 ? (
                    <span className="text-sm font-medium text-secondary">{t('billingPage.perMonth')}</span>
                  ) : null}
                </>
              )}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-secondary">
              {(p.features || []).map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            {p.id === 'institutional' ? (
              <Button className="mt-5 w-full" variant="secondary" type="button" disabled>
                {t('billingPage.contactProcurement')}
              </Button>
            ) : (
              <Button
                className="mt-5 w-full"
                variant={plan === p.id ? 'secondary' : 'primary'}
                type="button"
                onClick={async () => {
                  if (p.id !== 'free' && p.id !== 'premium') return;
                  setSaving(true);
                  try {
                    if (p.id === 'premium') {
                      const res = await apiFetch('/api/billing/checkout-session', { method: 'POST', body: '{}' });
                      const data = await res.json().catch(() => ({}));
                      if (res.ok && data.url) {
                        window.location.href = data.url;
                        return;
                      }
                    }
                    await updateProfile({ plan: p.id });
                    setPlan(p.id);
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving || plan === p.id}
              >
                {plan === p.id
                  ? t('billingPage.btnSelected')
                  : p.id === 'premium'
                    ? t('billingPage.btnUpgrade')
                    : t('billingPage.btnSelectFree')}
              </Button>
            )}
          </Card>
        ))}
      </div>

      <Card elevated className="!mt-6 !p-5">
        <h3 className="text-lg font-semibold text-primary">{t('billingPage.invoiceTitle')}</h3>
        <p className="mt-1 text-sm text-secondary">{t('billingPage.invoiceBody')}</p>
        {billingHistory.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-border-light bg-base/30 px-4 py-6 text-center text-sm text-secondary">
            {t('billingPage.noInvoices')}
          </p>
        ) : null}
      </Card>
    </PageShell>
  );
};

export default BillingPage;
