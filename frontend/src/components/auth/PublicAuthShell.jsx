import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon, ArrowLeft } from 'lucide-react';
import { AppLogo } from '../brand/AppLogo';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import LanguageToggle from '../inclusive/LanguageToggle';
import { cn } from '../ui';

/**
 * Centered auth flows (e.g. recovery) with the same public gradient + orbs as sign-in / sign-up.
 */
export function PublicAuthShell({ children, title, subtitle, footer }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();

  return (
    <div className="relative isolate flex min-h-dvh min-h-screen flex-col overflow-x-hidden font-outfit pub-page-gradient text-primary">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="animate-civiq-pulse-slow absolute -left-1/4 top-0 h-[min(1000px,200vw)] w-[min(1000px,200vw)] rounded-full bg-accent-primary/18 blur-[150px] dark:bg-accent-primary/10" />
        <div
          className="animate-civiq-pulse-slow absolute -right-1/4 bottom-0 h-[min(1000px,200vw)] w-[min(1000px,200vw)] rounded-full bg-teal-500/18 blur-[150px] dark:bg-teal-500/10"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="fixed right-4 top-4 z-[60] flex items-center gap-2 sm:right-6 sm:top-6 sm:gap-3">
        <LanguageToggle />
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? t('topbar.themeToLight') : t('topbar.themeToDark')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-light bg-base/80 text-secondary shadow-lg backdrop-blur transition-all active:scale-95 dark:border-white/10 dark:bg-base/60"
        >
          <span className="relative flex h-[18px] w-[18px] items-center justify-center">
            <Sun
              size={17}
              className={cn('absolute transition-opacity duration-150', theme === 'dark' ? 'opacity-0' : 'opacity-100')}
              aria-hidden
            />
            <Moon
              size={17}
              className={cn('absolute transition-opacity duration-150', theme === 'dark' ? 'opacity-100' : 'opacity-0')}
              aria-hidden
            />
          </span>
        </button>
      </div>

      <header className="relative z-10 border-b border-border-light/80 bg-base/50 backdrop-blur-md dark:border-white/5">
        <div className="mx-auto flex h-[4.25rem] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-12">
          <Link
            to="/"
            className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/35"
            aria-label={t('auth.homeAria')}
          >
            <AppLogo size="lg" lockup />
          </Link>
          <Link
            to="/login"
            className="hidden items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent-primary transition-colors hover:text-accent-hover sm:inline-flex"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t('auth.login.civiqBackHome')}
          </Link>
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col items-center overflow-x-hidden px-4 py-10 sm:px-8 lg:py-14">
        <motion.div
          className="w-full min-w-0 max-w-[440px]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-8 space-y-2 break-words text-center sm:text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-accent-primary">{t('auth.shellEyebrow')}</p>
            <h1 className="text-3xl font-black tracking-tighter text-primary sm:text-4xl">{title}</h1>
            {subtitle ? <p className="text-sm font-medium leading-relaxed text-secondary sm:text-[15px]">{subtitle}</p> : null}
          </div>

          <div className="w-full min-w-0 overflow-x-hidden">{children}</div>
        </motion.div>

        {footer ? (
          <footer className="mx-auto mt-10 w-full min-w-0 max-w-[440px] break-words text-center text-sm text-secondary">{footer}</footer>
        ) : null}
      </div>
    </div>
  );
}
