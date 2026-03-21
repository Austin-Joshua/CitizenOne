import React, { useEffect, useMemo, useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import PageShell from '../components/layout/PageShell';
import { Card, Button, Badge, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';

const emptySchemeProfile = () => ({
  age: '',
  gender: '',
  maritalStatus: '',
  income: '',
  occupation: '',
  education: '',
  stateCode: '',
  district: '',
  settlement: '',
  socialCategory: '',
  familyHouseholdSize: '',
  dependentsUnder18: '',
  specialConditions: [],
});

const SPECIAL_IDS = [
  'farmer',
  'disability',
  'pregnant',
  'health_vulnerable',
  'crop_risk',
  'unemployed',
  'girl_child',
  'vulnerable_child',
];

const ROLE_KEY = {
  citizen: 'roleCitizen',
  student: 'roleStudent',
  organization: 'roleOrganization',
  staff: 'roleStaff',
  admin: 'roleAdmin',
  service_provider: 'roleServiceProvider',
};

const ProfilePage = () => {
  const { t } = useI18n();
  useDocumentTitle(t('profilePage.documentTitle'));
  const { user, updateProfile, resendEmailVerification } = useAuth();
  const [verifyMsg, setVerifyMsg] = useState('');
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [largeText, setLargeText] = useState(Boolean(user?.preferences?.largeText));
  const [highContrast, setHighContrast] = useState(Boolean(user?.preferences?.highContrast));
  const [simpleLanguage, setSimpleLanguage] = useState(Boolean(user?.preferences?.simpleLanguage));
  const [schemeProfile, setSchemeProfile] = useState(emptySchemeProfile);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');

  const specialKeyMap = useMemo(
    () => ({
      farmer: 'specialFarmer',
      disability: 'specialDisability',
      pregnant: 'specialPregnant',
      health_vulnerable: 'specialHealth',
      crop_risk: 'specialCrop',
      unemployed: 'specialUnemployed',
      girl_child: 'specialGirlChild',
      vulnerable_child: 'specialVulnerableChild',
    }),
    []
  );

  useEffect(() => {
    setName(user?.name || '');
    setLargeText(Boolean(user?.preferences?.largeText));
    setHighContrast(Boolean(user?.preferences?.highContrast));
    setSimpleLanguage(Boolean(user?.preferences?.simpleLanguage));
    const sp = user?.schemeProfile || {};
    setSchemeProfile({
      age: sp.age != null ? String(sp.age) : '',
      gender: sp.gender || '',
      maritalStatus: sp.maritalStatus || '',
      income: sp.income != null ? String(sp.income) : '',
      occupation: sp.occupation || '',
      education: sp.education || '',
      stateCode: sp.stateCode || '',
      district: sp.district || '',
      settlement: sp.settlement || '',
      socialCategory: sp.socialCategory || '',
      familyHouseholdSize: sp.familyHouseholdSize != null ? String(sp.familyHouseholdSize) : '',
      dependentsUnder18: sp.dependentsUnder18 != null ? String(sp.dependentsUnder18) : '',
      specialConditions: Array.isArray(sp.specialConditions) ? sp.specialConditions : [],
    });
  }, [user]);

  const roleLabel = () => {
    const r = user?.role || 'member';
    const k = ROLE_KEY[r] || 'roleMember';
    return t(`profilePage.${k}`);
  };

  const toggleSpecial = (id) => {
    setSchemeProfile((prev) => {
      const set = new Set(prev.specialConditions);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...prev, specialConditions: [...set] };
    });
  };

  const saveAll = async () => {
    setSaving(true);
    setSaved('');
    try {
      await updateProfile({
        name,
        preferences: { largeText, highContrast, simpleLanguage },
        schemeProfile: {
          age: schemeProfile.age === '' ? null : Number(schemeProfile.age),
          gender: schemeProfile.gender,
          maritalStatus: schemeProfile.maritalStatus,
          income: schemeProfile.income === '' ? null : Number(schemeProfile.income),
          occupation: schemeProfile.occupation,
          education: schemeProfile.education,
          stateCode: schemeProfile.stateCode,
          district: schemeProfile.district,
          settlement: schemeProfile.settlement,
          socialCategory: schemeProfile.socialCategory,
          familyHouseholdSize: schemeProfile.familyHouseholdSize === '' ? null : Number(schemeProfile.familyHouseholdSize),
          dependentsUnder18: schemeProfile.dependentsUnder18 === '' ? null : Number(schemeProfile.dependentsUnder18),
          specialConditions: schemeProfile.specialConditions,
        },
      });
      setSaved(t('profilePage.saved'));
    } catch {
      setSaved(t('profilePage.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell
      title={t('profilePage.pageTitle')}
      description={t('profilePage.pageDescription')}
      actions={
        <Button size="sm" variant="secondary" onClick={saveAll} disabled={saving}>
          {saving ? t('profilePage.saveSaving') : t('profilePage.saveIdle')}
        </Button>
      }
    >
      {user?.emailVerified === false && (
        <Card elevated className="!mb-4 !border-amber-500/25 !p-4" role="status">
          <p className="text-sm font-medium text-primary">{t('profilePage.verifyTitle')}</p>
          <p className="mt-1 text-sm text-secondary">{t('profilePage.verifyBody')}</p>
          {verifyMsg ? <p className="mt-2 text-xs text-secondary">{verifyMsg}</p> : null}
          <Button
            size="sm"
            className="mt-3"
            type="button"
            disabled={verifyBusy}
            onClick={async () => {
              setVerifyMsg('');
              setVerifyBusy(true);
              try {
                const data = await resendEmailVerification();
                setVerifyMsg(
                  data._developmentVerificationUrl
                    ? `${t('profilePage.verifyDevLink')} ${data._developmentVerificationUrl}`
                    : data.message || t('profilePage.verifyRequestReceived')
                );
              } catch (e) {
                setVerifyMsg(e.message || t('profilePage.verifyCouldNotResend'));
              } finally {
                setVerifyBusy(false);
              }
            }}
          >
            {verifyBusy ? t('profilePage.resendSending') : t('profilePage.resendVerify')}
          </Button>
        </Card>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        <Card elevated className="!p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-primary/15 text-sm font-semibold text-accent-primary">
              {(user?.name || t('profilePage.userFallback')).slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-primary">{user?.name || t('profilePage.userFallback')}</p>
              <p className="truncate text-xs text-secondary">{user?.email}</p>
            </div>
          </div>
          <Badge variant="primary" className="w-fit">
            {roleLabel()}
          </Badge>
          <Badge variant="default" className="w-fit">
            {t('profilePage.planLabel')} {user?.plan || 'free'}
          </Badge>
        </Card>
        <Card elevated className="!p-4 space-y-3">
          <Input label={t('profilePage.displayName')} value={name} onChange={(e) => setName(e.target.value)} />
          <Input label={t('profilePage.email')} type="email" defaultValue={user?.email || ''} readOnly className="opacity-90" />
          <p className="text-[11px] text-tertiary">{t('profilePage.emailFixedHint')}</p>
          {saved ? <p className="text-xs text-secondary">{saved}</p> : null}
        </Card>

        <Card elevated className="!p-4 md:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">{t('profilePage.schemeSection')}</p>
          <p className="mt-1 text-sm text-secondary">{t('profilePage.schemeIntro')}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label={t('profilePage.fieldAge')}
              type="number"
              min={0}
              value={schemeProfile.age}
              onChange={(e) => setSchemeProfile((p) => ({ ...p, age: e.target.value }))}
            />
            <label className="space-y-1.5">
              <span className="ml-0.5 text-[11px] font-semibold uppercase tracking-wider text-secondary">{t('profilePage.fieldGender')}</span>
              <select
                className="w-full rounded-lg border border-border-light bg-surface px-3 py-2.5 text-[15px] text-primary"
                value={schemeProfile.gender}
                onChange={(e) => setSchemeProfile((p) => ({ ...p, gender: e.target.value }))}
              >
                <option value="">{t('profilePage.genderPreferNot')}</option>
                <option value="male">{t('profilePage.genderMale')}</option>
                <option value="female">{t('profilePage.genderFemale')}</option>
                <option value="other">{t('profilePage.genderOther')}</option>
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="ml-0.5 text-[11px] font-semibold uppercase tracking-wider text-secondary">{t('profilePage.fieldMarital')}</span>
              <select
                className="w-full rounded-lg border border-border-light bg-surface px-3 py-2.5 text-[15px] text-primary"
                value={schemeProfile.maritalStatus}
                onChange={(e) => setSchemeProfile((p) => ({ ...p, maritalStatus: e.target.value }))}
              >
                <option value="">{t('profilePage.selectDash')}</option>
                <option value="single">{t('profilePage.maritalSingle')}</option>
                <option value="married">{t('profilePage.maritalMarried')}</option>
                <option value="widowed">{t('profilePage.maritalWidowed')}</option>
                <option value="divorced">{t('profilePage.maritalDivorced')}</option>
              </select>
            </label>
            <Input
              label={t('profilePage.fieldIncome')}
              type="number"
              min={0}
              value={schemeProfile.income}
              onChange={(e) => setSchemeProfile((p) => ({ ...p, income: e.target.value }))}
            />
            <label className="space-y-1.5">
              <span className="ml-0.5 text-[11px] font-semibold uppercase tracking-wider text-secondary">{t('profilePage.fieldOccupation')}</span>
              <select
                className="w-full rounded-lg border border-border-light bg-surface px-3 py-2.5 text-[15px] text-primary"
                value={schemeProfile.occupation}
                onChange={(e) => setSchemeProfile((p) => ({ ...p, occupation: e.target.value }))}
              >
                <option value="">{t('profilePage.selectDash')}</option>
                <option value="farmer">{t('profilePage.occupationFarmer')}</option>
                <option value="student">{t('profilePage.occupationStudent')}</option>
                <option value="job_seeker">{t('profilePage.occupationJobSeeker')}</option>
                <option value="self_employed">{t('profilePage.occupationSelfEmployed')}</option>
                <option value="entrepreneur">{t('profilePage.occupationEntrepreneur')}</option>
                <option value="informal_worker">{t('profilePage.occupationInformal')}</option>
                <option value="gig_worker">{t('profilePage.occupationGig')}</option>
                <option value="government_employee">{t('profilePage.occupationGovernment')}</option>
                <option value="other">{t('profilePage.occupationOther')}</option>
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="ml-0.5 text-[11px] font-semibold uppercase tracking-wider text-secondary">{t('profilePage.fieldEducation')}</span>
              <select
                className="w-full rounded-lg border border-border-light bg-surface px-3 py-2.5 text-[15px] text-primary"
                value={schemeProfile.education}
                onChange={(e) => setSchemeProfile((p) => ({ ...p, education: e.target.value }))}
              >
                <option value="">{t('profilePage.selectDash')}</option>
                <option value="none">{t('profilePage.eduNone')}</option>
                <option value="primary">{t('profilePage.eduPrimary')}</option>
                <option value="secondary">{t('profilePage.eduSecondary')}</option>
                <option value="graduate">{t('profilePage.eduGraduate')}</option>
                <option value="postgraduate">{t('profilePage.eduPostgraduate')}</option>
              </select>
            </label>
            <Input
              label={t('profilePage.fieldState')}
              value={schemeProfile.stateCode}
              onChange={(e) => setSchemeProfile((p) => ({ ...p, stateCode: e.target.value }))}
            />
            <Input
              label={t('profilePage.fieldDistrict')}
              value={schemeProfile.district}
              onChange={(e) => setSchemeProfile((p) => ({ ...p, district: e.target.value }))}
            />
            <label className="space-y-1.5">
              <span className="ml-0.5 text-[11px] font-semibold uppercase tracking-wider text-secondary">{t('profilePage.fieldSettlement')}</span>
              <select
                className="w-full rounded-lg border border-border-light bg-surface px-3 py-2.5 text-[15px] text-primary"
                value={schemeProfile.settlement}
                onChange={(e) => setSchemeProfile((p) => ({ ...p, settlement: e.target.value }))}
              >
                <option value="">{t('profilePage.selectDash')}</option>
                <option value="rural">{t('profilePage.settlementRural')}</option>
                <option value="urban">{t('profilePage.settlementUrban')}</option>
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="ml-0.5 text-[11px] font-semibold uppercase tracking-wider text-secondary">{t('profilePage.fieldSocial')}</span>
              <select
                className="w-full rounded-lg border border-border-light bg-surface px-3 py-2.5 text-[15px] text-primary"
                value={schemeProfile.socialCategory}
                onChange={(e) => setSchemeProfile((p) => ({ ...p, socialCategory: e.target.value }))}
              >
                <option value="">{t('profilePage.selectDash')}</option>
                <option value="general">{t('profilePage.socialGeneral')}</option>
                <option value="sc">{t('profilePage.socialSC')}</option>
                <option value="st">{t('profilePage.socialST')}</option>
                <option value="obc">{t('profilePage.socialOBC')}</option>
              </select>
            </label>
            <Input
              label={t('profilePage.fieldHousehold')}
              type="number"
              min={1}
              value={schemeProfile.familyHouseholdSize}
              onChange={(e) => setSchemeProfile((p) => ({ ...p, familyHouseholdSize: e.target.value }))}
            />
            <Input
              label={t('profilePage.fieldDependents')}
              type="number"
              min={0}
              value={schemeProfile.dependentsUnder18}
              onChange={(e) => setSchemeProfile((p) => ({ ...p, dependentsUnder18: e.target.value }))}
            />
          </div>
          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-secondary">{t('profilePage.specialConditions')}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SPECIAL_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleSpecial(id)}
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                    schemeProfile.specialConditions.includes(id)
                      ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                      : 'border-border-light text-secondary'
                  }`}
                >
                  {t(`profilePage.${specialKeyMap[id]}`)}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card elevated className="!p-4 space-y-3 md:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">{t('profilePage.a11ySection')}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex items-center gap-2 text-sm text-secondary">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border-light text-accent-primary"
                checked={largeText}
                onChange={(e) => setLargeText(e.target.checked)}
              />
              {t('profilePage.a11yLargeText')}
            </label>
            <label className="flex items-center gap-2 text-sm text-secondary">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border-light text-accent-primary"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
              />
              {t('profilePage.a11yHighContrast')}
            </label>
            <label className="flex items-center gap-2 text-sm text-secondary">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border-light text-accent-primary"
                checked={simpleLanguage}
                onChange={(e) => setSimpleLanguage(e.target.checked)}
              />
              {t('profilePage.a11ySimpleLanguage')}
            </label>
          </div>
          <div className="rounded-lg border border-border-light bg-base/40 p-3 text-sm text-secondary">{t('profilePage.sessionSecurityNote')}</div>
        </Card>
      </div>
    </PageShell>
  );
};

export default ProfilePage;
