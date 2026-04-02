import React, { useEffect, useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { Button, Card, Input, Badge, cn } from '../components/ui';
import { AuthSplitLayout } from '../components/auth/AuthSplitLayout';
import { getPostLoginPath } from '../lib/postLoginPath';

const DENSE_AUTH_LOCALES = new Set(['ta', 'ml', 'kn', 'te', 'hi']);

const SignupPage = () => {
  const { t, locale } = useI18n();
  const denseAuth = DENSE_AUTH_LOCALES.has(locale);
  useDocumentTitle(t('auth.signup.documentTitle'));
  const navigate = useNavigate();
  const { signup, user, loading } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'citizen',
    plan: 'free',
    remember: true,
    farmName: '',
    phone: '',
    location: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onChange = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const newUser = await signup(form);
      navigate(newUser ? getPostLoginPath(newUser) : '/app/dashboard');
    } catch (err) {
      setError(err.message || t('auth.signup.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!loading && user) navigate(getPostLoginPath(user), { replace: true });
  }, [user, loading, navigate]);

  const switchFooter = (
    <div className={cn(denseAuth && 'tracking-wide')}>
      <p className="text-center text-sm">
        <span className="pub-text-secondary font-medium">{t('auth.signup.haveAccount')} </span>
        <Link to="/login" className="font-black text-accent-primary hover:underline">
          {t('auth.signup.signIn')}
        </Link>
      </p>
      <p className="pub-text-secondary mt-3 text-center text-xs">
        <Link to="/" className="font-semibold text-accent-primary hover:underline">
          {t('auth.login.home')}
        </Link>
        <span className="mx-2 text-primary/30 dark:text-primary/40" aria-hidden>
          ·
        </span>
        <Link to="/login/recovery" className="font-semibold text-accent-primary hover:underline">
          {t('auth.login.forgotPassword')}
        </Link>
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="font-outfit flex min-h-dvh min-h-screen items-center justify-center pub-page-gradient text-primary">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
          <div className="animate-civiq-pulse-slow absolute -left-1/4 top-0 h-[min(1000px,200vw)] w-[min(1000px,200vw)] rounded-full bg-accent-primary/20 blur-[150px] dark:bg-accent-primary/10" />
        </div>
        <div className="relative z-10 h-8 w-8 animate-spin rounded-full border-2 border-accent-primary/20 border-t-accent-primary" aria-hidden />
        <span className="sr-only">{t('auth.loadingSession')}</span>
      </div>
    );
  }

  return (
    <AuthSplitLayout
      visualTitle={t('auth.signup.visualTitle')}
      visualAccent={t('auth.signup.visualAccent')}
      visualLead={t('auth.signup.visualLead')}
      mobileBrandLine={t('auth.signup.mobileBrand')}
      footer={switchFooter}
    >
      <div className="mx-auto w-full min-w-0 max-w-md">
        <div className="mb-4 lg:mb-6">
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.28em] text-accent-primary">{t('auth.signup.eyebrow')}</p>
          <h1 className="mb-2 text-2xl font-black tracking-tighter text-primary sm:text-3xl lg:text-[2rem] lg:leading-tight">
            {t('auth.signup.heading')}
          </h1>
          <div
            className={cn(
              'space-y-1.5 rounded-xl border border-border-light/80 bg-pub-input/40 px-3.5 py-2.5 dark:border-white/10 sm:px-4',
              denseAuth && 'tracking-wide'
            )}
          >
            <p className="pub-text-secondary text-xs sm:text-sm font-medium leading-relaxed">{t('auth.signup.intro')}</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        >
          <Card
            elevated
            className="!border-border-light !bg-pub-input/30 !p-5 !shadow-none dark:!border-white/10 sm:!p-6"
          >
            <Badge variant="primary" className="mb-4 text-[10px] font-black uppercase tracking-widest">
              {t('auth.signup.badge')}
            </Badge>
            <form className="space-y-5" onSubmit={onSubmit}>
              <Input
                label={t('auth.signup.fullName')}
                icon={<User strokeWidth={2} />}
                value={form.name}
                onChange={(e) => onChange('name', e.target.value)}
                required
                className="!bg-pub-input"
              />
              <Input
                label={t('auth.signup.email')}
                icon={<Mail strokeWidth={2} />}
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => onChange('email', e.target.value)}
                required
                className="!bg-pub-input"
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
                className="!bg-pub-input"
              />

              <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
                <label className="min-w-0 space-y-1.5">
                  <span className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">{t('auth.signup.role')}</span>
                  <div className="relative min-w-0">
                    <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tertiary" aria-hidden />
                    <select
                      className="h-11 w-full min-w-0 rounded-xl border border-border-light bg-pub-input py-2 pl-10 pr-3 text-sm font-medium text-primary transition-[border-color,box-shadow] focus:border-accent-primary/40 focus:outline-none focus:ring-2 focus:ring-accent-primary/15 dark:border-white/10 sm:text-[15px]"
                      value={form.role}
                      onChange={(e) => onChange('role', e.target.value)}
                    >
                      <option value="citizen">{t('auth.signup.roleCitizen', 'Citizen')}</option>
                      <option value="farmer">{t('auth.signup.roleFarmer', 'Farmer (AgriFlux)')}</option>
                      <option value="student">{t('auth.signup.roleStudent')}</option>
                      <option value="organization">{t('auth.signup.roleOrg')}</option>
                    </select>
                  </div>
                </label>
                <label className="min-w-0 space-y-1.5">
                  <span className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">{t('auth.signup.plan')}</span>
                  <select
                    className="h-11 w-full min-w-0 rounded-xl border border-border-light bg-pub-input px-3 py-2 text-sm font-medium text-primary focus:border-accent-primary/40 focus:outline-none focus:ring-2 focus:ring-accent-primary/15 dark:border-white/10 sm:text-[15px]"
                    value={form.plan}
                    onChange={(e) => onChange('plan', e.target.value)}
                  >
                    <option value="free">{t('auth.signup.planFree')}</option>
                    <option value="premium">{t('auth.signup.planPremium')}</option>
                  </select>
                </label>
              </div>

              <label className="pub-text-secondary flex min-h-[48px] cursor-pointer items-start gap-3 rounded-xl pt-0.5 text-sm font-medium sm:items-center">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-border-light text-accent-primary focus:ring-accent-primary/30 sm:mt-0"
                  checked={form.remember}
                  onChange={(e) => onChange('remember', e.target.checked)}
                />
                <span className={cn(denseAuth && 'leading-relaxed tracking-wide')}>{t('auth.signup.remember')}</span>
              </label>

              <div role="status" aria-live="polite" className="min-h-[1.25rem] text-sm text-semantic-error">
                {error || ''}
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl py-3 text-xs font-black uppercase tracking-widest shadow-lg shadow-accent-primary/25"
                disabled={submitting}
              >
                {submitting ? t('auth.signup.submitting') : t('auth.signup.submit')}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </AuthSplitLayout>
  );
};

export default SignupPage;
