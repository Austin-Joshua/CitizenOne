import React, { useEffect, useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import { Button, Card, Input, Badge, cn } from '../components/ui';
import { AppLogo } from '../components/brand/AppLogo';
import LanguageToggle from '../components/inclusive/LanguageToggle';

const SignupPage = () => {
  const { t } = useI18n();
  useDocumentTitle(t('auth.signup.documentTitle'));
  const navigate = useNavigate();
  const { signup, user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'citizen',
    plan: 'free',
    remember: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) navigate('/app/dashboard', { replace: true });
  }, [user, loading, navigate]);

  const onChange = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signup(form);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.message || t('auth.signup.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary/20 border-t-accent-primary" aria-hidden />
        <span className="sr-only">{t('auth.loadingSession')}</span>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-base px-4 py-8 sm:py-10">
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-accent-tertiary/10 blur-[90px]" aria-hidden />

      <div className="relative z-10 mx-auto mb-6 flex w-full max-w-[460px] flex-wrap items-center justify-between gap-3">
        <Link
          to="/"
          className="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/40"
          aria-label={t('auth.homeAria')}
        >
          <AppLogo size="sm" />
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <LanguageToggle />
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t('topbar.themeToLight') : t('topbar.themeToDark')}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-light bg-surface/80 text-secondary transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/40"
          >
            <span className="relative flex h-[18px] w-[18px] items-center justify-center">
              <Sun
                size={17}
                className={cn(
                  'absolute transition-all duration-200',
                  theme === 'dark' ? 'scale-0 rotate-90 opacity-0' : 'scale-100 opacity-100'
                )}
                aria-hidden
              />
              <Moon
                size={17}
                className={cn(
                  'absolute transition-all duration-200',
                  theme === 'dark' ? 'scale-100 opacity-100' : 'scale-0 -rotate-90 opacity-0'
                )}
                aria-hidden
              />
            </span>
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mx-auto w-full max-w-[460px]"
      >
        <Card elevated className="!p-6">
          <Badge variant="primary" className="mb-2">
            {t('auth.signup.badge')}
          </Badge>
          <h1 className="text-2xl font-semibold text-primary">{t('auth.signup.heading')}</h1>
          <p className="mt-1 text-sm text-secondary">{t('auth.signup.intro')}</p>
          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            <Input
              label={t('auth.signup.fullName')}
              icon={<User strokeWidth={2} />}
              value={form.name}
              onChange={(e) => onChange('name', e.target.value)}
              required
            />
            <Input
              label={t('auth.signup.email')}
              icon={<Mail strokeWidth={2} />}
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => onChange('email', e.target.value)}
              required
            />
            <Input
              label={t('auth.signup.password')}
              icon={<Lock strokeWidth={2} />}
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => onChange('password', e.target.value)}
              required
              minLength={8}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="ml-0.5 text-[11px] font-semibold uppercase tracking-wider text-secondary">{t('auth.signup.role')}</span>
                <div className="relative">
                  <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tertiary" aria-hidden />
                  <select
                    className="w-full rounded-lg border border-border-light bg-surface py-2.5 pl-10 pr-3 text-[15px] text-primary focus:border-accent-primary/35 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                    value={form.role}
                    onChange={(e) => onChange('role', e.target.value)}
                  >
                    <option value="citizen">{t('auth.signup.roleCitizen')}</option>
                    <option value="student">{t('auth.signup.roleStudent')}</option>
                    <option value="organization">{t('auth.signup.roleOrg')}</option>
                  </select>
                </div>
              </label>
              <label className="space-y-1.5">
                <span className="ml-0.5 text-[11px] font-semibold uppercase tracking-wider text-secondary">{t('auth.signup.plan')}</span>
                <select
                  className="w-full rounded-lg border border-border-light bg-surface px-3 py-2.5 text-[15px] text-primary focus:border-accent-primary/35 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                  value={form.plan}
                  onChange={(e) => onChange('plan', e.target.value)}
                >
                  <option value="free">{t('auth.signup.planFree')}</option>
                  <option value="premium">{t('auth.signup.planPremium')}</option>
                </select>
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm text-secondary">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border-light text-accent-primary focus:ring-accent-primary/30"
                checked={form.remember}
                onChange={(e) => onChange('remember', e.target.checked)}
              />
              {t('auth.signup.remember')}
            </label>

            <div role="status" aria-live="polite" className="min-h-[1.25rem] text-sm text-red-600 dark:text-red-400">
              {error || ''}
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? t('auth.signup.submitting') : t('auth.signup.submit')}
            </Button>
          </form>
          <p className="mt-4 text-sm text-secondary">
            {t('auth.signup.haveAccount')}{' '}
            <Link to="/login" className="font-medium text-accent-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/35">
              {t('auth.signup.signIn')}
            </Link>
            {' · '}
            <Link
              to="/login/recovery"
              className="font-medium text-accent-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/35"
            >
              {t('auth.login.forgotPassword')}
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignupPage;
