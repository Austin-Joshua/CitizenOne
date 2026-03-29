import React, { useEffect, useId, useMemo, useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { Button, Input, Card } from '../components/ui';
import { PublicAuthShell } from '../components/auth/PublicAuthShell';

const AccountRecoveryPage = () => {
  const { t } = useI18n();
  useDocumentTitle(t('auth.recovery.documentTitle'));
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, requestPasswordReset, validatePasswordResetToken, confirmPasswordReset } = useAuth();

  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ackMessage, setAckMessage] = useState('');
  const pwdId = useId();
  const pwd2Id = useId();
  const toggleId = useId();
  const toggle2Id = useId();

  const recoverySteps = useMemo(
    () => [
      t('auth.recovery.stepRequest'),
      t('auth.recovery.stepVerify'),
      t('auth.recovery.stepNewPassword'),
      t('auth.recovery.stepDone'),
    ],
    [t]
  );

  useEffect(() => {
    if (!loading && user) navigate('/app/dashboard', { replace: true });
  }, [user, loading, navigate]);

  const urlToken = searchParams.get('token')?.trim() || '';
  const [resolvingLink, setResolvingLink] = useState(Boolean(urlToken));

  useEffect(() => {
    if (!urlToken) {
      setResolvingLink(false);
      return undefined;
    }
    if (loading) return undefined;
    let active = true;
    setResolvingLink(true);
    (async () => {
      const ok = await validatePasswordResetToken(urlToken);
      if (!active) return;
      setToken(urlToken);
      setStep(ok ? 'password' : 'verify');
      setResolvingLink(false);
    })();
    return () => {
      active = false;
    };
  }, [urlToken, loading, validatePasswordResetToken]);

  const onRequest = async (e) => {
    e.preventDefault();
    setError('');
    const em = email.trim();
    if (!em) {
      setError(t('auth.recovery.errorEmail'));
      return;
    }
    setBusy(true);
    try {
      const data = await requestPasswordReset(em);
      setAckMessage(data.message || '');
      if (data._unsafeDevelopmentResetToken) {
        setToken(data._unsafeDevelopmentResetToken);
      }
      setStep('verify');
      setError('');
    } catch (err) {
      setError(err.message || t('auth.recovery.errorStart'));
    } finally {
      setBusy(false);
    }
  };

  const onValidateContinue = async (e) => {
    e.preventDefault();
    setError('');
    const resetToken = token.trim();
    if (!resetToken) {
      setError(t('auth.recovery.errorCodeMissing'));
      return;
    }
    setBusy(true);
    try {
      const ok = await validatePasswordResetToken(resetToken);
      if (!ok) {
        setError(t('auth.recovery.errorCodeInvalid'));
        return;
      }
      setStep('password');
    } catch {
      setError(t('auth.recovery.errorCodeVerify'));
    } finally {
      setBusy(false);
    }
  };

  const onSetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError(t('auth.recovery.errorPwdShort'));
      return;
    }
    if (password !== passwordConfirm) {
      setError(t('auth.recovery.errorPwdMatch'));
      return;
    }
    setBusy(true);
    try {
      await confirmPasswordReset(token.trim(), password);
      setStep('done');
    } catch (err) {
      setError(err.message || t('auth.recovery.errorPwdUpdate'));
    } finally {
      setBusy(false);
    }
  };

  if (loading || resolvingLink) {
    return (
      <PublicAuthShell
        title={t('auth.recovery.title')}
        subtitle={resolvingLink ? t('auth.recovery.subtitleVerifying') : t('auth.recovery.loading')}
        footer={null}
      >
        <div className="flex justify-center py-16" role="status" aria-live="polite">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary/20 border-t-accent-primary" aria-hidden />
          <span className="sr-only">{resolvingLink ? t('auth.recovery.srVerifying') : t('auth.recovery.srLoading')}</span>
        </div>
      </PublicAuthShell>
    );
  }

  return (
    <PublicAuthShell
      title={t('auth.recovery.title')}
      subtitle={t('auth.recovery.subtitle')}
      footer={
        <p className="text-sm text-secondary">
          <Link to="/login" className="font-medium text-accent-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/35">
            {t('auth.recovery.footerReturn')}
          </Link>
          {' · '}
          <Link to="/" className="font-medium text-accent-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/35">
            {t('auth.recovery.footerHome')}
          </Link>
        </p>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-4"
      >
        <ol className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wider text-tertiary" aria-label={t('auth.recovery.stepsAria')}>
          {recoverySteps.map((label, i) => {
            const active =
              (step === 'request' && i === 0) ||
              (step === 'verify' && i === 1) ||
              (step === 'password' && i === 2) ||
              (step === 'done' && i === 3);
            const done =
              (step === 'verify' && i === 0) ||
              (step === 'password' && i <= 1) ||
              (step === 'done' && i <= 2);
            return (
              <li
                key={label}
                className={`rounded-full border px-2.5 py-1 ${
                  active
                    ? 'border-accent-primary text-accent-primary'
                    : done
                      ? 'border-border-light text-secondary'
                      : 'border-border-light/60 text-tertiary'
                }`}
              >
                {i + 1}. {label}
              </li>
            );
          })}
        </ol>

        {step === 'request' && (
          <Card elevated className="!p-5 sm:!p-6">
            <h2 className="text-sm font-semibold text-primary">{t('auth.recovery.step1Title')}</h2>
            <p className="mt-1 text-sm text-secondary">{t('auth.recovery.step1Body')}</p>
            <form className="mt-4 space-y-4" onSubmit={onRequest} noValidate>
              <Input
                label={t('auth.login.email')}
                type="email"
                autoComplete="email"
                icon={<Mail strokeWidth={2} />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.login.emailPlaceholder')}
              />
              <div role="alert" aria-live="polite" className="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
              <Button type="submit" disabled={busy} className="w-full min-h-11">
                {busy ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
                ) : (
                  t('auth.recovery.step1Continue')
                )}
              </Button>
            </form>
          </Card>
        )}

        {step === 'verify' && (
          <Card elevated className="!p-5 sm:!p-6">
            <h2 className="text-sm font-semibold text-primary">{t('auth.recovery.step2Title')}</h2>
            <p className="mt-1 text-sm text-secondary">{ackMessage || t('auth.recovery.step2Fallback')}</p>
            <form className="mt-4 space-y-4" onSubmit={onValidateContinue} noValidate>
              <Input
                label={t('auth.recovery.verificationCode')}
                type="text"
                autoComplete="one-time-code"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder={t('auth.recovery.pasteCode')}
              />
              <div role="alert" aria-live="polite" className="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="button" variant="secondary" className="min-h-11 sm:flex-1" onClick={() => setStep('request')}>
                  {t('auth.recovery.back')}
                </Button>
                <Button type="submit" disabled={busy} className="min-h-11 sm:flex-1">
                  {busy ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
                  ) : (
                    t('auth.recovery.step1Continue')
                  )}
                  <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
                </Button>
              </div>
            </form>
          </Card>
        )}

        {step === 'password' && (
          <Card elevated className="!p-5 sm:!p-6">
            <h2 className="text-sm font-semibold text-primary">{t('auth.recovery.step3Title')}</h2>
            <p className="mt-1 text-sm text-secondary">{t('auth.recovery.step3Body')}</p>
            <form className="mt-4 space-y-4" onSubmit={onSetPassword} noValidate>
              <div className="space-y-1.5">
                <label htmlFor={pwdId} className="ml-0.5 text-[11px] font-semibold uppercase tracking-wider text-secondary">
                  {t('auth.recovery.newPassword')}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-tertiary [&_svg]:size-[15px]">
                    <Lock strokeWidth={2} aria-hidden />
                  </div>
                  <input
                    id={pwdId}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-border-light bg-surface py-2.5 pl-10 pr-12 text-[15px] text-primary focus:border-accent-primary/35 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                  />
                  <button
                    id={toggleId}
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                    className="absolute inset-y-0 right-0 flex min-w-11 items-center justify-center text-secondary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-primary/35"
                  >
                    {showPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor={pwd2Id} className="ml-0.5 text-[11px] font-semibold uppercase tracking-wider text-secondary">
                  {t('auth.recovery.confirmPassword')}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-tertiary [&_svg]:size-[15px]">
                    <Lock strokeWidth={2} aria-hidden />
                  </div>
                  <input
                    id={pwd2Id}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="w-full rounded-lg border border-border-light bg-surface py-2.5 pl-10 pr-12 text-[15px] text-primary focus:border-accent-primary/35 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                  />
                  <button
                    id={toggle2Id}
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? t('auth.recovery.hidePasswords') : t('auth.recovery.showPasswords')}
                    className="absolute inset-y-0 right-0 flex min-w-11 items-center justify-center text-secondary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-primary/35"
                  >
                    {showPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
                  </button>
                </div>
              </div>
              <div role="alert" aria-live="polite" className="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
              <Button type="submit" disabled={busy} className="w-full min-h-11">
                {busy ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
                ) : (
                  t('auth.recovery.updatePassword')
                )}
              </Button>
            </form>
          </Card>
        )}

        {step === 'done' && (
          <Card elevated className="!p-5 sm:!p-6">
            <h2 className="text-sm font-semibold text-primary">{t('auth.recovery.step4Title')}</h2>
            <p className="mt-2 text-sm leading-relaxed text-secondary">{t('auth.recovery.step4Body')}</p>
            <Button className="mt-6 w-full min-h-11" type="button" onClick={() => navigate('/login', { replace: true })}>
              {t('auth.recovery.goSignIn')}
            </Button>
          </Card>
        )}
      </motion.div>
    </PublicAuthShell>
  );
};

export default AccountRecoveryPage;
