import React, { useEffect, useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { Button, Card, Input, Badge } from '../components/ui';
import { AuthSplitLayout } from '../components/auth/AuthSplitLayout';

const SignupPage = () => {
  const { t } = useI18n();
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
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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

  useEffect(() => {
    if (!loading && user) navigate('/app/dashboard', { replace: true });
  }, [user, loading, navigate]);

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

  const signupFooter = (
    <>
      <p>
        {t('auth.signup.haveAccount')}{' '}
        <Link to="/login" className="font-black text-accent-primary hover:underline">
          {t('auth.signup.signIn')}
        </Link>
      </p>
      <p className="text-xs leading-relaxed text-tertiary">{t('auth.signup.footerNote')}</p>
      <p>
        <Link to="/" className="font-bold text-accent-primary hover:underline">
          {t('auth.login.home')}
        </Link>
        {' · '}
        <Link to="/login/recovery" className="font-bold text-accent-primary hover:underline">
          {t('auth.login.forgotPassword')}
        </Link>
      </p>
    </>
  );

  return (
    <AuthSplitLayout
      visualTitle={t('auth.signup.visualTitle')}
      visualAccent={t('auth.signup.visualAccent')}
      visualLead={t('auth.signup.visualLead')}
      mobileBrandLine={t('auth.signup.mobileBrand')}
      footer={signupFooter}
    >
      <div className="mb-6 lg:mb-8">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-accent-primary">{t('auth.signup.eyebrow')}</p>
        <h1 className="mb-2 text-3xl font-black tracking-tighter text-primary sm:text-4xl lg:text-[2.125rem] lg:leading-tight">
          {t('auth.signup.heading')}
        </h1>
        <p className="text-sm font-medium leading-relaxed text-secondary">{t('auth.signup.intro')}</p>
      </div>

      <div className="mx-auto w-full max-w-md flex-1">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}
        >
          <Card
            elevated
            className="!border-border-light !bg-pub-input/30 !p-5 !shadow-none dark:!border-white/10 sm:!p-6"
          >
            <Badge variant="primary" className="mb-4 text-[10px] font-black uppercase tracking-widest">
              {t('auth.signup.badge')}
            </Badge>
            <form className="space-y-4" onSubmit={onSubmit}>
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

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">{t('auth.signup.role')}</span>
                  <div className="relative">
                    <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tertiary" aria-hidden />
                    <select
                      className="w-full rounded-xl border border-border-light bg-pub-input py-2.5 pl-10 pr-3 text-[15px] font-medium text-primary transition-[border-color,box-shadow] focus:border-accent-primary/40 focus:outline-none focus:ring-2 focus:ring-accent-primary/15 dark:border-white/10"
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
                  <span className="ml-1 text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">{t('auth.signup.plan')}</span>
                  <select
                    className="w-full rounded-xl border border-border-light bg-pub-input px-3 py-2.5 text-[15px] font-medium text-primary focus:border-accent-primary/40 focus:outline-none focus:ring-2 focus:ring-accent-primary/15 dark:border-white/10"
                    value={form.plan}
                    onChange={(e) => onChange('plan', e.target.value)}
                  >
                    <option value="free">{t('auth.signup.planFree')}</option>
                    <option value="premium">{t('auth.signup.planPremium')}</option>
                  </select>
                </label>
              </div>

              <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl text-sm font-medium text-secondary">
                <input
                  type="checkbox"
                  className="h-4 w-4 shrink-0 rounded border-border-light text-accent-primary focus:ring-accent-primary/30"
                  checked={form.remember}
                  onChange={(e) => onChange('remember', e.target.checked)}
                />
                {t('auth.signup.remember')}
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
