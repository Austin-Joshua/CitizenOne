import React, { useEffect, useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { Button, Card, Input, Badge } from '../components/ui';
import { PublicAuthShell } from '../components/auth/PublicAuthShell';

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
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary/20 border-t-accent-primary" aria-hidden />
        <span className="sr-only">{t('auth.loadingSession')}</span>
      </div>
    );
  }

  return (
    <PublicAuthShell
      title={t('auth.signup.heading')}
      subtitle={t('auth.signup.intro')}
      footer={
        <div className="space-y-3 text-sm text-secondary">
          <p>
            {t('auth.signup.haveAccount')}{' '}
            <Link
              to="/login"
              className="font-medium text-accent-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft/45"
            >
              {t('auth.signup.signIn')}
            </Link>
          </p>
          <p>
            <Link
              to="/"
              className="font-medium text-accent-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft/45"
            >
              {t('auth.login.home')}
            </Link>
            {' · '}
            <Link
              to="/login/recovery"
              className="font-medium text-accent-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft/45"
            >
              {t('auth.login.forgotPassword')}
            </Link>
          </p>
        </div>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}
      >
        <Card elevated className="!p-5 sm:!p-6">
          <Badge variant="primary" className="mb-4">
            {t('auth.signup.badge')}
          </Badge>
          <form className="space-y-4" onSubmit={onSubmit}>
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
                    className="w-full rounded-xl border border-border-light bg-surface py-2.5 pl-10 pr-3 text-[15px] text-primary shadow-xs transition-[border-color,box-shadow] focus:border-accent-primary/40 focus:outline-none focus:ring-2 focus:ring-accent-soft/25"
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
                  className="w-full rounded-xl border border-border-light bg-surface px-3 py-2.5 text-[15px] text-primary shadow-xs focus:border-accent-primary/40 focus:outline-none focus:ring-2 focus:ring-accent-soft/25"
                  value={form.plan}
                  onChange={(e) => onChange('plan', e.target.value)}
                >
                  <option value="free">{t('auth.signup.planFree')}</option>
                  <option value="premium">{t('auth.signup.planPremium')}</option>
                </select>
              </label>
            </div>

            <label className="flex min-h-[44px] items-center gap-3 text-sm text-secondary">
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
            <Button type="submit" className="w-full min-h-11" disabled={submitting}>
              {submitting ? t('auth.signup.submitting') : t('auth.signup.submit')}
            </Button>
          </form>
        </Card>
      </motion.div>
    </PublicAuthShell>
  );
};

export default SignupPage;
