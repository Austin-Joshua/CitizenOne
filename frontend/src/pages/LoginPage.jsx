import React, { useEffect, useId, useMemo, useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { Button, Input, Card, cn } from '../components/ui';
import { PublicAuthShell } from '../components/auth/PublicAuthShell';
import { getUserDisplayName } from '../lib/userDisplayName';

const LAST_LOGIN_EMAIL_KEY = 'citizenone-last-login-email';

function readLastLoginEmail() {
  try {
    return localStorage.getItem(LAST_LOGIN_EMAIL_KEY)?.trim() || '';
  } catch {
    return '';
  }
}

function persistLastLoginEmail(em) {
  const v = String(em || '').trim();
  if (!v) return;
  try {
    localStorage.setItem(LAST_LOGIN_EMAIL_KEY, v);
  } catch {
    /* ignore */
  }
}

const LoginPage = () => {
  const { t } = useI18n();
  useDocumentTitle(t('auth.login.documentTitle'));
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, completeMfaLogin, user, loading } = useAuth();

  const [step, setStep] = useState('role');
  const [mfaPendingToken, setMfaPendingToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [portalRole, setPortalRole] = useState('resident');
  const [email, setEmail] = useState(() => readLastLoginEmail());
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const passwordId = useId();
  const togglePwdId = useId();

  const portals = useMemo(
    () => [
      {
        value: 'resident',
        title: t('auth.portal.resident.title'),
        description: t('auth.portal.resident.description'),
      },
      {
        value: 'staff',
        title: t('auth.portal.staff.title'),
        description: t('auth.portal.staff.description'),
      },
      {
        value: 'organization',
        title: t('auth.portal.organization.title'),
        description: t('auth.portal.organization.description'),
      },
      {
        value: 'administrator',
        title: t('auth.portal.administrator.title'),
        description: t('auth.portal.administrator.description'),
      },
    ],
    [t]
  );

  const idleNotice = searchParams.get('reason') === 'idle';
  const sessionNotice = searchParams.get('reason') === 'session-expired';
  const verifiedNotice = searchParams.get('verified') === '1';

  useEffect(() => {
    if (!loading && user) navigate('/app/dashboard', { replace: true });
  }, [user, loading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError('');
    const em = email.trim();
    if (!em || !password) {
      setFormError(t('auth.login.errorEmailPassword'));
      return;
    }
    setIsLoading(true);
    try {
      const result = await login(em, password, remember, portalRole);
      if (result?.mfaRequired && result.mfaPendingToken) {
        persistLastLoginEmail(em);
        setMfaPendingToken(result.mfaPendingToken);
        setMfaCode('');
        setStep('mfa');
        return;
      }
      persistLastLoginEmail(em);
      navigate('/app/dashboard');
    } catch (error) {
      setFormError(error.message || t('auth.login.errorGeneric'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const code = mfaCode.trim();
    if (!code || code.length < 6) {
      setFormError(t('auth.login.mfaErrorShort'));
      return;
    }
    setIsLoading(true);
    try {
      await completeMfaLogin(mfaPendingToken, code, remember);
      persistLastLoginEmail(email.trim());
      navigate('/app/dashboard');
    } catch (error) {
      setFormError(error.message || t('auth.login.mfaErrorGeneric'));
    } finally {
      setIsLoading(false);
    }
  };

  const shellTitle =
    step === 'role'
      ? t('auth.login.titleRole')
      : step === 'mfa'
        ? t('auth.login.titleMfa')
        : t('auth.login.titleCredentials');
  const shellSubtitle =
    step === 'mfa'
      ? t('auth.login.subMfa')
      : step === 'role'
        ? t('auth.login.subRole')
        : t('auth.login.subCredentials');

  const showWelcomeBack =
    step === 'credentials' &&
    Boolean(email.trim()) &&
    readLastLoginEmail().toLowerCase() === email.trim().toLowerCase();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary/20 border-t-accent-primary" aria-hidden />
        <span className="sr-only">{t('auth.loadingSession')}</span>
      </div>
    );
  }

  return (
    <PublicAuthShell
      title={shellTitle}
      subtitle={shellSubtitle}
      footer={
        <div className="space-y-4 text-sm text-secondary">
          <p>
            <ShieldCheck className="mr-1 inline-block h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} aria-hidden />
            {t('auth.login.footerHttps')}
          </p>
          <p>
            {t('auth.login.footerNeedAccount')}{' '}
            <Link
              to="/signup"
              className="font-medium text-accent-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/35"
            >
              {t('auth.login.register')}
            </Link>
            {' · '}
            <Link
              to="/login/recovery"
              className="font-medium text-accent-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/35"
            >
              {t('auth.login.forgotPassword')}
            </Link>
            {' · '}
            <Link
              to="/"
              className="font-medium text-accent-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/35"
            >
              {t('auth.login.home')}
            </Link>
            {' · '}
            <span className="text-tertiary">{t('auth.login.footerHelp')}</span>
          </p>
          <p className="text-xs leading-relaxed text-tertiary">{t('auth.login.footerPrivacy')}</p>
        </div>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        {(idleNotice || sessionNotice) && (
          <div
            className="mb-4 rounded-lg border border-border-light bg-surface/80 px-4 py-3 text-sm text-secondary"
            role="status"
          >
            {idleNotice ? t('auth.login.noticeIdle') : t('auth.login.noticeSession')}
          </div>
        )}

        {verifiedNotice && (
          <div
            className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-secondary"
            role="status"
          >
            {t('auth.login.noticeVerified')}
          </div>
        )}

        {step === 'role' && (
          <Card elevated className="!p-5 sm:!p-6">
            <fieldset>
              <legend className="text-[11px] font-semibold uppercase tracking-wider text-secondary">{t('auth.login.signInOption')}</legend>
              <p className="mt-1 text-xs text-tertiary">{t('auth.login.signInOptionHint')}</p>
              <div className="mt-4 grid gap-2.5" role="radiogroup" aria-label={t('auth.login.signInOption')}>
                {portals.map((p) => {
                  const selected = portalRole === p.value;
                  return (
                    <label
                      key={p.value}
                      className={cn(
                        'flex cursor-pointer flex-col rounded-xl border px-4 py-3.5 transition-colors focus-within:ring-2 focus-within:ring-accent-primary/30',
                        selected ? 'border-accent-primary/50 bg-accent-primary/[0.06]' : 'border-border-light bg-base/40 hover:border-border-light'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="portal"
                          value={p.value}
                          checked={selected}
                          onChange={() => setPortalRole(p.value)}
                          className="mt-1 h-4 w-4 shrink-0 border-border-light text-accent-primary focus:ring-accent-primary/35"
                        />
                        <span>
                          <span className="block text-[15px] font-semibold text-primary">{p.title}</span>
                          <span className="mt-0.5 block text-sm leading-snug text-secondary">{p.description}</span>
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            <Button type="button" className="mt-6 w-full" onClick={() => setStep('credentials')}>
              {t('auth.login.continue')}
              <ArrowRight className="ml-1.5 h-4 w-4" strokeWidth={2} aria-hidden />
            </Button>
          </Card>
        )}

        {step === 'mfa' && (
          <Card elevated className="!p-5 sm:!p-6">
            <form className="space-y-4" onSubmit={handleMfaSubmit} noValidate>
              <Input
                label={t('auth.login.authenticatorCode')}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                icon={<ShieldCheck strokeWidth={2} />}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\s/g, ''))}
                placeholder={t('auth.login.codePlaceholder')}
                maxLength={12}
                required
                aria-required="true"
              />
              <div role="alert" aria-live="polite" className="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">
                {formError || ''}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full sm:flex-1"
                  onClick={() => {
                    setStep('credentials');
                    setMfaPendingToken('');
                    setMfaCode('');
                    setFormError('');
                  }}
                >
                  {t('auth.login.back')}
                </Button>
                <Button type="submit" disabled={isLoading} className="w-full min-h-11 sm:flex-1">
                  {isLoading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
                  ) : (
                    <>
                      {t('auth.login.verifyContinue')}
                      <ArrowRight className="ml-1.5 h-4 w-4" strokeWidth={2} aria-hidden />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {step === 'credentials' && (
          <Card elevated className="!p-5 sm:!p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setStep('role');
                  setFormError('');
                }}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-secondary transition-colors hover:bg-base/80 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/35"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                {t('auth.login.changeSignInOption')}
              </button>
              <p className="text-xs text-tertiary">
                {t('auth.login.selected')}{' '}
                <span className="font-medium text-secondary">{portals.find((p) => p.value === portalRole)?.title}</span>
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleLogin} noValidate>
              {showWelcomeBack ? (
                <p
                  className="rounded-lg border border-border-light bg-surface/70 px-3 py-2.5 text-sm leading-relaxed text-secondary"
                  role="status"
                >
                  {t('auth.login.welcomeBack', {
                    name: getUserDisplayName({ email: email.trim() }, email.trim()),
                  })}
                </p>
              ) : null}
              <Input
                label={t('auth.login.email')}
                type="email"
                autoComplete="username"
                inputMode="email"
                icon={<Mail strokeWidth={2} />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.login.emailPlaceholder')}
                required
                aria-required="true"
              />

              <div className="space-y-1.5">
                <label htmlFor={passwordId} className="ml-0.5 text-[11px] font-semibold uppercase tracking-wider text-secondary">
                  {t('auth.login.password')}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-tertiary [&_svg]:size-[15px]">
                    <Lock strokeWidth={2} aria-hidden />
                  </div>
                  <input
                    id={passwordId}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.login.passwordPlaceholder')}
                    required
                    aria-required="true"
                    className="w-full rounded-lg border border-border-light bg-surface py-2.5 pl-10 pr-12 text-[15px] text-primary placeholder:text-tertiary transition-[border-color,box-shadow] focus:border-accent-primary/35 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                  />
                  <button
                    id={togglePwdId}
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                    aria-controls={passwordId}
                    className="absolute inset-y-0 right-0 flex min-w-11 items-center justify-center rounded-r-lg text-secondary transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-primary/35"
                  >
                    {showPassword ? <EyeOff size={18} strokeWidth={2} aria-hidden /> : <Eye size={18} strokeWidth={2} aria-hidden />}
                  </button>
                </div>
              </div>

              <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg text-sm text-secondary">
                <input
                  type="checkbox"
                  className="h-4 w-4 shrink-0 rounded border-border-light text-accent-primary focus:ring-accent-primary/30"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>{t('auth.login.rememberDevice')}</span>
              </label>

              <div role="alert" aria-live="polite" className="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">
                {formError || ''}
              </div>

              <Button type="submit" disabled={isLoading} className="mt-1 w-full min-h-11">
                {isLoading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
                ) : (
                  <>
                    {t('auth.login.signInSecurely')}
                    <ArrowRight className="ml-1.5 h-4 w-4" strokeWidth={2} aria-hidden />
                  </>
                )}
              </Button>
            </form>
          </Card>
        )}
      </motion.div>
    </PublicAuthShell>
  );
};

export default LoginPage;
