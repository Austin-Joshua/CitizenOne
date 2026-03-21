import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { AppLogo } from '../brand/AppLogo';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import LanguageToggle from '../inclusive/LanguageToggle';
import { cn } from '../ui';

/**
 * Centered shell for sign-in, sign-up, and recovery — matches public marketing chrome (sticky header, icon language).
 */
export function PublicAuthShell({ children, title, subtitle, footer }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-canvas">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -right-24 -top-24 h-[22rem] w-[22rem] rounded-full bg-accent-soft/12 blur-[100px] dark:bg-accent-primary/10" />
        <div className="absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-accent-primary/8 blur-[90px] dark:bg-accent-soft/5" />
      </div>

      <header className="sticky top-0 z-20 border-b border-border-light bg-base/90 backdrop-blur-md supports-[backdrop-filter]:bg-base/75">
        <div className="mx-auto flex h-[4.25rem] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-20">
          <Link
            to="/"
            className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft/45"
            aria-label={t('auth.homeAria')}
          >
            <AppLogo size="sm" title={t('brand.short')} subtitle={t('brand.tagline')} />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? t('topbar.themeToLight') : t('topbar.themeToDark')}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-light bg-surface text-secondary transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft/45"
            >
              <span className="relative flex h-[18px] w-[18px] items-center justify-center">
                <Sun
                  size={17}
                  className={cn(
                    'absolute transition-opacity duration-150',
                    theme === 'dark' ? 'opacity-0' : 'opacity-100'
                  )}
                  aria-hidden
                />
                <Moon
                  size={17}
                  className={cn(
                    'absolute transition-opacity duration-150',
                    theme === 'dark' ? 'opacity-100' : 'opacity-0'
                  )}
                  aria-hidden
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center px-4 py-10 sm:px-8 lg:py-14">
        <motion.div
          className="w-full max-w-[440px]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-8 space-y-2 text-center sm:text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent-primary">{t('auth.brandEyebrow')}</p>
            <h1 className="ds-page-title">{title}</h1>
            {subtitle ? <p className="text-sm leading-relaxed text-secondary sm:text-[15px]">{subtitle}</p> : null}
          </div>

          <div className="w-full">{children}</div>
        </motion.div>

        {footer ? (
          <footer className="mx-auto mt-10 w-full max-w-[440px] text-center text-sm text-secondary">{footer}</footer>
        ) : null}
      </div>
    </div>
  );
}
