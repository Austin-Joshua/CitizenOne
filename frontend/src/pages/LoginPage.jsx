import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowRight, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button, Input, Card, Badge, cn } from '../components/ui';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 280));
      await login(
        email.trim() || 'admin@citizenone.gov',
        password || 'adminpassword',
        remember
      );
      navigate('/app/dashboard');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base px-4 py-10">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-accent-primary/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[360px] w-[360px] rounded-full bg-accent-secondary/10 blur-[90px]" />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[400px]"
      >
        <div className="absolute -top-12 right-0">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-light bg-surface/80 text-secondary shadow-sm backdrop-blur-sm transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/40 active:scale-[0.97]"
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

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-primary/20 glass-elevated">
            <span className="text-lg font-bold tracking-tight text-primary">C1</span>
          </div>
          <Badge variant="primary" className="mb-2">
            Sign in
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-primary">Citizen One</h1>
          <p className="mt-1 text-xs text-secondary sm:text-[13px]">Infrastructure & governance console</p>
        </div>

        <Card elevated className="!p-5 sm:!p-6">
          <form className="space-y-4" onSubmit={handleLogin}>
            <Input
              label="Email"
              type="email"
              icon={<Mail strokeWidth={2} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@citizenone.gov"
              required
            />

            <Input
              label="Password"
              type="password"
              icon={<Lock strokeWidth={2} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <label className="flex cursor-pointer items-center gap-2 text-xs text-secondary">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-border-light text-accent-primary focus:ring-accent-primary/30"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember this device
            </label>

            <Button type="submit" disabled={isLoading} className="mt-1 w-full">
              {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-1.5 h-4 w-4" strokeWidth={2} />
                </>
              )}
            </Button>
          </form>
        </Card>

        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 glass-panel px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-secondary">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2} />
            Encrypted session
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-secondary">
          Need an account?{' '}
          <Link to="/signup" className="text-accent-primary hover:underline">Sign up</Link>
          {' · '}
          <Link to="/" className="text-accent-primary hover:underline">Back to landing</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
