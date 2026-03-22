import React, { useEffect, useId, useMemo, useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowRight, ArrowLeft, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';
import { Button, Input, Card, cn } from '../components/ui';
import LanguageToggle from '../components/inclusive/LanguageToggle';
import { AuthSplitLayout } from '../components/auth/AuthSplitLayout';
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
  const { theme, toggleTheme } = useTheme();
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
      <div className="font-outfit relative flex min-h-dvh min-h-screen items-center justify-center overflow-hidden pub-page-gradient text-primary">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
          <div className="animate-civiq-pulse-slow absolute -left-1/4 top-0 h-[min(1000px,200vw)] w-[min(1000px,200vw)] rounded-full bg-accent-primary/20 blur-[150px] dark:bg-accent-primary/10" />
          <div
            className="animate-civiq-pulse-slow absolute -right-1/4 bottom-0 h-[min(1000px,200vw)] w-[min(1000px,200vw)] rounded-full bg-teal-500/20 blur-[150px] dark:bg-teal-500/10"
            style={{ animationDelay: '2s' }}
          />
        </div>
        <div className="fixed right-4 top-4 z-[60] flex items-center gap-2 sm:right-6 sm:top-6 sm:gap-3">
          <LanguageToggle />
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-light bg-base/80 shadow-lg backdrop-blur transition-all active:scale-95 dark:border-white/10 dark:bg-base/60"
            aria-label={theme === 'dark' ? t('topbar.themeToLight') : t('topbar.themeToDark')}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-secondary" aria-hidden /> : <Moon className="h-5 w-5 text-secondary" aria-hidden />}
          </button>
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary/25 border-t-accent-primary" aria-hidden />
          <span className="sr-only">{t('auth.loadingSession')}</span>
        </div>
      </div>
    );
  }

  const loginFooter = (
    <>
      <p className="flex flex-wrap items-center justify-center gap-1 text-left text-xs leading-relaxed">
        <ShieldCheck className="inline h-4 w-4 shrink-0 text-accent-primary" strokeWidth={2} aria-hidden />
        {t('auth.login.footerHttps')}
      </p>
      <p>
        {t('auth.login.footerNeedAccount')}{' '}
        <Link to="/signup" className="font-black text-accent-primary hover:underline">
          {t('auth.login.register')}
        </Link>
        {' · '}
        <Link to="/login/recovery" className="font-bold text-accent-primary hover:underline">
          {t('auth.login.forgotPassword')}
        </Link>
        {' · '}
        <Link to="/" className="font-bold text-accent-primary hover:underline">
          {t('auth.login.home')}
        </Link>
      </p>
      <p className="text-[11px] leading-relaxed text-tertiary">{t('auth.login.footerPrivacy')}</p>
    </>
  );

  return (
    <AuthSplitLayout
      visualTitle={t('auth.login.civiqVisualTitle')}
      visualAccent={t('auth.login.civiqVisualAccent')}
      visualLead={t('auth.login.civiqVisualLead')}
      mobileBrandLine={t('auth.login.civiqMobileBrand')}
      footer={loginFooter}
    >
            <div className="mb-6 lg:mb-8">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-accent-primary">{t('auth.login.eyebrow')}</p>
              <h1 className="mb-2 text-3xl font-black tracking-tighter text-primary sm:text-4xl lg:text-[2.125rem] lg:leading-tight">{shellTitle}</h1>
              <p className="text-sm font-medium leading-relaxed text-secondary">{shellSubtitle}</p>
            </div>

            <div className="mx-auto w-full max-w-md flex-1">
              {(idleNotice || sessionNotice) && (
                <div
                  className="mb-4 rounded-xl border border-border-light bg-surface/90 px-4 py-3 text-sm text-secondary"
                  role="status"
                >
                  {idleNotice ? t('auth.login.noticeIdle') : t('auth.login.noticeSession')}
                </div>
              )}

              {verifiedNotice && (
                <div
                  className="mb-4 rounded-xl border border-semantic-success/25 bg-semantic-success-muted px-4 py-3 text-sm text-secondary"
                  role="status"
                >
                  {t('auth.login.noticeVerified')}
                </div>
              )}

              <AnimatePresence mode="wait">
                {step === 'role' && (
                  <motion.div
                    key="role"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Card elevated className="!border-border-light !bg-transparent !p-0 !shadow-none dark:!border-white/5">
                      <fieldset>
                        <legend className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">
                          {t('auth.login.signInOption')}
                        </legend>
                        <p className="mt-2 text-xs font-medium text-secondary">{t('auth.login.signInOptionHint')}</p>
                        <div className="mt-4 grid gap-2.5" role="radiogroup" aria-label={t('auth.login.signInOption')}>
                          {portals.map((p) => {
                            const selected = portalRole === p.value;
                            return (
                              <label
                                key={p.value}
                                className={cn(
                                  'flex cursor-pointer flex-col rounded-xl border px-4 py-3.5 transition-colors focus-within:ring-2 focus-within:ring-accent-primary/25',
                                  selected
                                    ? 'border-accent-primary/50 bg-accent-primary/[0.08]'
                                    : 'border-border-light bg-pub-input hover:border-border-light dark:border-white/10'
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
                                    <span className="block text-[15px] font-bold text-primary">{p.title}</span>
                                    <span className="mt-0.5 block text-sm leading-snug text-secondary">{p.description}</span>
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>
                      <Button
                        type="button"
                        className="mt-6 w-full rounded-xl py-3 text-xs font-black uppercase tracking-widest shadow-lg shadow-accent-primary/20"
                        onClick={() => setStep('credentials')}
                      >
                        {t('auth.login.continue')}
                        <ArrowRight className="ml-1.5 h-4 w-4" strokeWidth={2} aria-hidden />
                      </Button>
                    </Card>
                  </motion.div>
                )}

                {step === 'mfa' && (
                  <motion.div
                    key="mfa"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Card elevated className="!border-0 !bg-transparent !p-0 !shadow-none">
                      <form className="space-y-5" onSubmit={handleMfaSubmit} noValidate>
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
                          className="!bg-pub-input"
                        />
                        <div role="alert" aria-live="polite" className="min-h-[1.25rem] text-sm text-semantic-error">
                          {formError || ''}
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button
                            type="button"
                            variant="secondary"
                            className="w-full rounded-xl sm:flex-1"
                            onClick={() => {
                              setStep('credentials');
                              setMfaPendingToken('');
                              setMfaCode('');
                              setFormError('');
                            }}
                          >
                            {t('auth.login.back')}
                          </Button>
                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full min-h-11 rounded-xl text-xs font-black uppercase tracking-widest sm:flex-1"
                          >
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
                  </motion.div>
                )}

                {step === 'credentials' && (
                  <motion.div
                    key="credentials"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Card elevated className="!border-0 !bg-transparent !p-0 !shadow-none">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setStep('role');
                            setFormError('');
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-bold text-secondary transition-colors hover:bg-pub-input hover:text-primary"
                        >
                          <ArrowLeft className="h-4 w-4" aria-hidden />
                          {t('auth.login.changeSignInOption')}
                        </button>
                        <p className="text-xs text-tertiary">
                          {t('auth.login.selected')}{' '}
                          <span className="font-bold text-secondary">{portals.find((p) => p.value === portalRole)?.title}</span>
                        </p>
                      </div>

                      <form className="space-y-5" onSubmit={handleLogin} noValidate>
                        {showWelcomeBack ? (
                          <p
                            className="rounded-xl border border-border-light bg-pub-input px-3 py-2.5 text-sm leading-relaxed text-secondary"
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
                          className="!bg-pub-input"
                        />

                        <div className="space-y-2">
                          <label
                            htmlFor={passwordId}
                            className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-tertiary"
                          >
                            {t('auth.login.password')}
                          </label>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-tertiary [&_svg]:size-[15px]">
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
                              className="w-full rounded-xl border border-border-light bg-pub-input py-3 pl-11 pr-12 text-sm font-medium text-primary placeholder:text-tertiary transition-all focus:border-accent-primary/40 focus:outline-none focus:ring-4 focus:ring-accent-primary/15 dark:border-white/10"
                            />
                            <button
                              id={togglePwdId}
                              type="button"
                              onClick={() => setShowPassword((s) => !s)}
                              aria-label={showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                              aria-controls={passwordId}
                              className="absolute inset-y-0 right-0 flex min-w-11 items-center justify-center rounded-r-xl text-tertiary transition-colors hover:text-accent-primary"
                            >
                              {showPassword ? <EyeOff size={18} strokeWidth={2} aria-hidden /> : <Eye size={18} strokeWidth={2} aria-hidden />}
                            </button>
                          </div>
                        </div>

                        <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl text-sm font-medium text-secondary">
                          <input
                            type="checkbox"
                            className="h-4 w-4 shrink-0 rounded border-border-light text-accent-primary focus:ring-accent-primary/30"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                          />
                          <span>{t('auth.login.rememberDevice')}</span>
                        </label>

                        <div role="alert" aria-live="polite" className="min-h-[1.25rem] text-sm text-semantic-error">
                          {formError || ''}
                        </div>

                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="mt-2 w-full rounded-xl py-3 text-xs font-black uppercase tracking-widest shadow-lg shadow-accent-primary/25"
                        >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

    </AuthSplitLayout>
  );
};

export default LoginPage;
