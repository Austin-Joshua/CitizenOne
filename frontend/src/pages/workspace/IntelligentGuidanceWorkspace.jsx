import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, UserRound, ArrowRight, Shield, ListChecks } from 'lucide-react';
import { Card, Button, Badge, cn } from '../../components/ui';
import { apiFetch, getErrorMessageFromResponse } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';

const DEFAULT_INTEL = {
  totals: { recommended: 0, eligible: 0, highImpact: 0 },
  recommended: [],
};

const SITUATION_SIGNALS = [
  ['health_need', 'guidance.signalHealth'],
  ['education', 'guidance.signalEducation'],
  ['job_loss', 'guidance.signalJobLoss'],
  ['women_empowerment', 'guidance.signalWomen'],
  ['housing_needs', 'guidance.signalHousing'],
  ['retirement', 'guidance.signalRetirement'],
  ['farming_challenges', 'guidance.signalFarming'],
  ['digital_access', 'guidance.signalDigital'],
];

export function IntelligentGuidanceWorkspace() {

  const { t } = useI18n();
  const { user } = useAuth();
  const [lifeEvent, setLifeEvent] = useState('');
  const [situationInput, setSituationInput] = useState('');
  const [intel, setIntel] = useState(DEFAULT_INTEL);
  const [loadError, setLoadError] = useState('');

  // Compose params for API
  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (lifeEvent) p.set('lifeEvent', lifeEvent);
    if (situationInput.trim()) p.set('situation', situationInput.trim());
    return p.toString();
  }, [lifeEvent, situationInput]);

  useEffect(() => {
    let active = true;
    setLoadError('');
    (async () => {
      try {
        const res = await apiFetch(`/api/schemes/intelligence?${params}`);
        if (!res.ok) {
          if (active) setLoadError(await getErrorMessageFromResponse(res));
          return;
        }
        const data = await res.json();
        if (!active) return;
        setIntel({ ...DEFAULT_INTEL, ...data });
      } catch (e) {
        if (active) setLoadError(e?.message || 'Error');
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.id, params]);

  const ranked = useMemo(() => {
    const rec = Array.isArray(intel.recommended) ? intel.recommended : [];
    return [...rec].sort((a, b) => (b.prioritizedScore || 0) - (a.prioritizedScore || 0)).slice(0, 8);
  }, [intel.recommended]);


  return (
    <div className="space-y-6">
      <Card elevated className="!p-5">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-accent-primary/10 text-accent-primary">
            <Sparkles size={20} strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-tertiary">{t('guidance.modeEyebrow')}</p>
            <p className="mt-1 text-sm leading-relaxed text-secondary">{t('guidance.trustNote')}</p>
          </div>
        </div>
        <div className="mt-6">
          <label htmlFor="situation-input" className="block text-xs font-medium text-tertiary mb-1">
            {t('guidance.situationInputLabel', 'Describe your situation (e.g., I am a farmer, I just got married)')}
          </label>
          <input
            id="situation-input"
            type="text"
            className="w-full rounded-lg border border-border-light bg-surface px-3 py-2 text-sm focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20"
            placeholder={t('guidance.situationInputPlaceholder', 'Describe your situation...')}
            value={situationInput}
            onChange={e => setSituationInput(e.target.value)}
            autoComplete="off"
            maxLength={200}
          />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card elevated className="!p-5 lg:col-span-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-tertiary">{t('guidance.situationLabel')}</p>
          <p className="mt-1 text-sm text-secondary">{t('guidance.situationHint')}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {SITUATION_SIGNALS.map(([value, key]) => (
              <button
                key={value}
                type="button"
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                  lifeEvent === value
                    ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                    : 'border-border-light text-secondary hover:border-border-light hover:bg-surface'
                )}
                onClick={() => setLifeEvent((v) => (v === value ? '' : value))}
              >
                {t(key)}
              </button>
            ))}
          </div>
          <Link
            to="/app/profile"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft/45"
          >
            <UserRound size={16} strokeWidth={2} aria-hidden />
            {t('guidance.profileCta')}
            <ArrowRight size={14} strokeWidth={2} aria-hidden />
          </Link>
        </Card>

        <Card elevated className="!p-5 lg:col-span-2">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-tertiary">{t('guidance.rankedTitle')}</p>
              <p className="mt-1 text-sm text-secondary">{t('guidance.rankedSubtitle')}</p>
            </div>
            <Link to="/app/benefits">
              <Button size="sm" variant="secondary">
                {t('guidance.openDiscovery')}
              </Button>
            </Link>
          </div>

          {loadError ? (
            <p className="mt-4 text-sm text-semantic-error" role="alert">
              {loadError}
            </p>
          ) : null}

          <ul className="mt-4 space-y-3">
            {ranked.length === 0 ? (
              <li className="rounded-[14px] border border-dashed border-border-light bg-surface/50 px-4 py-6 text-center text-sm text-secondary">
                {t('guidance.empty')}
              </li>
            ) : (
              ranked.map((s) => (
                <li
                  key={s.id}
                  className="rounded-[14px] border border-border-light bg-base/40 px-4 py-3 transition-colors hover:border-accent-primary/20"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-primary">{s.schemeName}</p>
                      <p className="mt-0.5 text-xs text-secondary">{s.ministryOrDepartment || '—'}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {s.prioritizedScore > 0.75 && (
                          <Badge variant="primary">{t('guidance.impactBadge')}</Badge>
                        )}
                        {(s.applicationStatus === 'not_started' || s.eligibilityBand === 'likely') && (
                          <Badge variant="default">{t('guidance.eligibleBadge')}</Badge>
                        )}
                        {s.governmentLevel === 'state' ? (
                          <Badge variant="default">{t('dashboardPage.levelState')}</Badge>
                        ) : (
                          <Badge variant="default">{t('dashboardPage.levelNational')}</Badge>
                        )}
                      </div>
                      {s.deadline ? (
                        <p className="mt-2 text-xs font-medium text-semantic-warning">
                          {t('guidance.deadline')}: {s.deadline}
                        </p>
                      ) : null}
                      {Array.isArray(s.guidanceExplain?.reasons) && s.guidanceExplain.reasons.length > 0 ? (
                        <div className="mt-3 border-t border-border-light/80 pt-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-tertiary">
                            {t('guidance.whyRanked')}
                          </p>
                          <p className="mt-1 text-[11px] leading-snug text-tertiary">{t('guidance.whyRankedHint')}</p>
                          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed text-secondary">
                            {s.guidanceExplain.reasons.map((r) => (
                              <li key={r.code}>{r.detail}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                    <Link to="/app/benefits" className="shrink-0">
                      <Button size="sm" variant="secondary">
                        {t('guidance.viewDetail')}
                      </Button>
                    </Link>
                  </div>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: t('guidance.step1Title'), desc: t('guidance.step1Desc') },
          { title: t('guidance.step2Title'), desc: t('guidance.step2Desc') },
          { title: t('guidance.step3Title'), desc: t('guidance.step3Desc') },
        ].map((step, i) => (
          <Card key={step.title} className="!p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-surface text-accent-primary">
              {i === 0 ? <Shield size={18} strokeWidth={2} aria-hidden /> : i === 1 ? <Sparkles size={18} strokeWidth={2} aria-hidden /> : <ListChecks size={18} strokeWidth={2} aria-hidden />}
            </div>
            <p className="mt-3 text-[15px] font-medium text-primary">{step.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-secondary">{step.desc}</p>
          </Card>
        ))}
      </div>

      <Card className="!p-5">
        <p className="text-sm text-secondary">
          {t('guidance.footerDesk')}{' '}
          <Link to="/app/services" className="font-medium text-accent-primary hover:underline">
            {t('nav.serviceDesk')}
          </Link>
          {' · '}
          <Link to="/app/vault" className="font-medium text-accent-primary hover:underline">
            {t('nav.documents')}
          </Link>
        </p>
      </Card>
    </div>
  );
}
