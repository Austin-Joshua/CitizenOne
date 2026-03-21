import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { AppLogo } from '../brand/AppLogo';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../context/I18nContext';
import LanguageToggle from '../inclusive/LanguageToggle';
import { cn } from '../ui';

/**
 * Shared header for dedicated sign-in and account recovery pages (government-style consistency).
 */
export function PublicAuthShell({ children, title, subtitle, footer }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-base px-4 py-8 sm:py-10">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-accent-primary/10 blur-[100px]" aria-hidden />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-[360px] w-[360px] rounded-full bg-emerald-500/10 blur-[90px]" aria-hidden />

      <header className="relative z-10 mx-auto mb-8 flex w-full max-w-lg flex-col gap-4 border-b border-border-light pb-6 sm:max-w-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
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
              className="flex h-11 min-w-11 items-center justify-center rounded-lg border border-border-light bg-surface/80 text-secondary shadow-sm backdrop-blur-sm transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/40 active:scale-[0.97]"
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
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary">{t('auth.brandEyebrow')}</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-primary sm:text-2xl">{title}</h1>
          {subtitle ? <p className="mt-2 max-w-xl text-sm leading-relaxed text-secondary">{subtitle}</p> : null}
        </div>
      </header>

      <div className="relative z-10 mx-auto w-full max-w-lg flex-1 sm:max-w-xl">{children}</div>

      {footer ? <footer className="relative z-10 mx-auto mt-10 w-full max-w-lg text-center sm:max-w-xl">{footer}</footer> : null}
    </div>
  );
}
