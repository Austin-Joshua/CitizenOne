import React, { useEffect, useId, useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowRight, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';
import { Button, Input, Card, cn } from '../components/ui';
import LanguageToggle from '../components/inclusive/LanguageToggle';
import { AuthSplitLayout } from '../components/auth/AuthSplitLayout';
import { getUserDisplayName } from '../lib/userDisplayName';
import { getPostLoginPath } from '../lib/postLoginPath';

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

const DENSE_AUTH_LOCALES = new Set(['ta', 'ml', 'kn', 'te', 'hi']);

const LoginPage = () => {
  const { t, locale } = useI18n();
  const denseAuth = DENSE_AUTH_LOCALES.has(locale);
  const { theme, toggleTheme } = useTheme();
  useDocumentTitle(t('auth.login.documentTitle'));
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, completeMfaLogin, user, loading } = useAuth();

  const [step, setStep] = useState('credentials');
  const [mfaPendingToken, setMfaPendingToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [email, setEmail] = useState(() => readLastLoginEmail());
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const passwordId = useId();
  const togglePwdId = useId();

  const idleNotice = searchParams.get('reason') === 'idle';
  const sessionNotice = searchParams.get('reason') === 'session-expired';
  const verifiedNotice = searchParams.get('verified') === '1';

  useEffect(() => {
    if (!loading && user) navigate(getPostLoginPath(user), { replace: true });
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
      const result = await login(em, password, remember);
      if (result?.mfaRequired && result.mfaPendingToken) {
        persistLastLoginEmail(em);
        setMfaPendingToken(result.mfaPendingToken);
        setMfaCode('');
        setStep('mfa');
        return;
      }
      persistLastLoginEmail(em);
      if (result?.user) navigate(getPostLoginPath(result.user));
      else navigate('/app/dashboard');
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
      const loggedInUser = await completeMfaLogin(mfaPendingToken, code, remember);
      persistLastLoginEmail(email.trim());
      navigate(getPostLoginPath(loggedInUser));
    } catch (error) {
      setFormError(error.message || t('auth.login.mfaErrorGeneric'));
    } finally {
      setIsLoading(false);
    }
  };

  const shellTitle = step === 'mfa' ? t('auth.login.titleMfa') : t('auth.login.titleSignIn');
  const shellSubtitle = step === 'mfa' ? t('auth.login.subMfa') : t('auth.login.subSignIn');

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

  const switchFooter = (
    <div className={cn(denseAuth && 'tracking-wide')}>
      <p className="text-center text-sm">
        <span className="pub-text-secondary font-medium">{t('auth.login.footerNeedAccount')} </span>
        <Link to="/signup" className="font-black text-accent-primary hover:underline">
          {t('auth.login.register')}
        </Link>
      </p>
      <p className="pub-text-secondary mt-3 text-center text-xs">
        <Link to="/login/recovery" className="font-semibold text-accent-primary hover:underline">
          {t('auth.login.forgotPassword')}
        </Link>
        <span className="mx-2 text-primary/30 dark:text-primary/40" aria-hidden>
          ·
        </span>
        <Link to="/" className="font-semibold text-accent-primary hover:underline">
          {t('auth.login.home')}
        </Link>
      </p>
    </div>
  );

  return (
    <AuthSplitLayout
      visualTitle={t('auth.login.civiqVisualTitle')}
      visualAccent={t('auth.login.civiqVisualAccent')}
      visualLead={t('auth.login.civiqVisualLead')}
      mobileBrandLine={t('auth.login.civiqMobileBrand')}
      footer={switchFooter}
    >
      <div className="mx-auto w-full min-w-0 max-w-md">
        <div className="mb-5 lg:mb-7">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-accent-primary">{t('auth.login.eyebrow')}</p>
          <h1 className="mb-2 text-3xl font-black tracking-tighter text-primary sm:text-4xl lg:text-[2.125rem] lg:leading-tight">{shellTitle}</h1>
          <p
            className={cn(
              'pub-text-secondary text-sm font-medium leading-relaxed',
              denseAuth && 'leading-[1.75] tracking-wide'
            )}
          >
            {shellSubtitle}
          </p>
        </div>
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

                  <label className="pub-text-secondary flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl text-sm font-medium">
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
