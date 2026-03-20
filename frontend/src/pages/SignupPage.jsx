import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Input, Badge } from '../components/ui';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'citizen',
    plan: 'free',
    remember: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form);
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.message || 'Unable to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4 py-10">
      <Card elevated className="w-full max-w-[460px] !p-6">
        <Badge variant="primary" className="mb-2">Create account</Badge>
        <h1 className="text-2xl font-semibold">Join Citizen One</h1>
        <p className="mt-1 text-sm text-secondary">Set up your secure workspace.</p>
        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <Input label="Name" icon={<User />} value={form.name} onChange={(e) => onChange('name', e.target.value)} required />
          <Input label="Email" icon={<Mail />} type="email" value={form.email} onChange={(e) => onChange('email', e.target.value)} required />
          <Input label="Password" icon={<Lock />} type="password" value={form.password} onChange={(e) => onChange('password', e.target.value)} required />

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="ml-0.5 text-[11px] font-semibold uppercase tracking-wider text-secondary">Role</span>
              <div className="relative">
                <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tertiary" />
                <select
                  className="w-full rounded-lg border border-border-light bg-surface py-2.5 pl-10 pr-3 text-[15px] text-primary focus:border-accent-primary/35 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                  value={form.role}
                  onChange={(e) => onChange('role', e.target.value)}
                >
                  <option value="citizen">Individual citizen</option>
                  <option value="organization">Organization / NGO</option>
                  <option value="service_provider">Service provider</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </label>
            <label className="space-y-1.5">
              <span className="ml-0.5 text-[11px] font-semibold uppercase tracking-wider text-secondary">Plan</span>
              <select
                className="w-full rounded-lg border border-border-light bg-surface px-3 py-2.5 text-[15px] text-primary focus:border-accent-primary/35 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                value={form.plan}
                onChange={(e) => onChange('plan', e.target.value)}
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
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
            Remember session
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</Button>
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="secondary" size="sm" disabled>Google (soon)</Button>
            <Button type="button" variant="secondary" size="sm" disabled>Microsoft (soon)</Button>
          </div>
        </form>
        <p className="mt-4 text-sm text-secondary">
          Already have an account? <Link to="/login" className="text-accent-primary hover:underline">Login</Link>
        </p>
      </Card>
    </div>
  );
};

export default SignupPage;
