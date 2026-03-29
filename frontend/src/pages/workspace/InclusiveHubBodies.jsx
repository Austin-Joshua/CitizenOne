import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../../components/ui';
import { useI18n } from '../../context/I18nContext';
import { useInclusion } from '../../context/InclusionContext';

export function InclusionWorkspaceBody() {
  const { t } = useI18n();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card elevated className="!p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">{t('accessibility.title')}</p>
        <p className="mt-2 text-sm leading-relaxed text-secondary">{t('accessibility.easyHint')}</p>
        <p className="mt-2 text-sm text-secondary">{t('voice.subtitle')}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/app/settings">
            <Button size="sm">{t('nav.settings')}</Button>
          </Link>
          <Link to="/app/offline">
            <Button size="sm" variant="secondary">
              {t('nav.offlineAccess')}
            </Button>
          </Link>
        </div>
      </Card>
      <Card elevated className="!p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">{t('sms.title')}</p>
        <p className="mt-2 text-sm leading-relaxed text-secondary">{t('sms.lead')}</p>
        <Link to="/app/sms" className="mt-4 inline-block">
          <Button size="sm" variant="secondary">
            {t('modules.sms.title')}
          </Button>
        </Link>
      </Card>
    </div>
  );
}

export function OfflineWorkspaceBody() {
  const { t } = useI18n();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card elevated className="!p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">{t('connectivity.liteMode')}</p>
        <p className="mt-2 text-sm leading-relaxed text-secondary">{t('connectivity.liteHint')}</p>
        <p className="mt-3 text-sm text-secondary">{t('connectivity.savedLaterBody')}</p>
      </Card>
      <Card elevated className="!p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">{t('connectivity.offlineTitle')}</p>
        <p className="mt-2 text-sm leading-relaxed text-secondary">{t('connectivity.offlineBody')}</p>
        <Link to="/app/benefits" className="mt-4 inline-block">
          <Button size="sm">{t('connectivity.openBenefits')}</Button>
        </Link>
      </Card>
    </div>
  );
}

export function SmsWorkspaceBody() {
  const { t } = useI18n();
  return (
    <Card elevated className="!space-y-4 !p-5">
      <p className="text-sm leading-relaxed text-secondary">{t('sms.lead')}</p>
      <ul className="list-disc space-y-2 pl-5 text-sm text-secondary">
        <li>{t('sms.bullet1')}</li>
        <li>{t('sms.bullet2')}</li>
        <li>{t('sms.bullet3')}</li>
      </ul>
      <p className="text-sm text-secondary">{t('sms.profileNote')}</p>
      <Link to="/app/profile">
        <Button size="sm">{t('sms.goProfile')}</Button>
      </Link>
    </Card>
  );
}

export function SettingsInclusionBody() {
  const { t } = useI18n();
  const { easyMode, setEasyMode, liteMode, setLiteMode } = useInclusion();

  return (
    <Card elevated className="!mb-4 !space-y-4 !p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">{t('accessibility.title')}</p>
      <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-border-light bg-base/30 px-4 py-3">
        <span>
          <span className="block text-[15px] font-medium text-primary">{t('accessibility.easyMode')}</span>
          <span className="mt-1 block text-sm text-secondary">{t('accessibility.easyHint')}</span>
        </span>
        <input
          type="checkbox"
          className="mt-1 h-5 w-5 rounded border-border-light text-accent-primary focus:ring-accent-primary/30"
          checked={easyMode}
          onChange={(e) => setEasyMode(e.target.checked)}
        />
      </label>
      <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-border-light bg-base/30 px-4 py-3">
        <span>
          <span className="block text-[15px] font-medium text-primary">{t('connectivity.liteMode')}</span>
          <span className="mt-1 block text-sm text-secondary">{t('connectivity.liteHint')}</span>
        </span>
        <input
          type="checkbox"
          className="mt-1 h-5 w-5 rounded border-border-light text-accent-primary focus:ring-accent-primary/30"
          checked={liteMode}
          onChange={(e) => setLiteMode(e.target.checked)}
        />
      </label>
      <p className="text-xs text-tertiary">{t('accessibility.voiceOptional')}</p>
    </Card>
  );
}
