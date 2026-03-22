import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import { cn } from '../ui';
import { AppLogo } from '../brand/AppLogo';
import { CitizenOneLogo } from '../brand/CitizenOneLogo';
import LanguageToggle from '../inclusive/LanguageToggle';
import { useI18n } from '../../context/I18nContext';
import { useTheme } from '../../context/ThemeContext';

/**
 * CIVIQ-style split auth shell: gradient page, pulse orbs, marketing column + form column.
 */
export function AuthSplitLayout({
  visualTitle,
  visualAccent,
  visualLead,
  mobileBrandLine,
  backTo = '/',
  backLabel,
  children,
  footer,
  panelClassName,
}) {
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const back = backLabel ?? t('auth.login.civiqBackHome');

  return (
    <div className="font-outfit relative flex min-h-dvh min-h-screen items-center justify-center overflow-x-hidden overflow-y-auto pub-page-gradient px-3 py-8 text-primary sm:px-4 sm:py-10 lg:px-6">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="animate-civiq-pulse-slow absolute -left-1/4 top-0 h-[min(1000px,200vw)] w-[min(1000px,200vw)] rounded-full bg-accent-primary/20 blur-[150px] dark:bg-accent-primary/10" />
        <div
          className="animate-civiq-pulse-slow absolute -right-1/4 bottom-0 h-[min(1000px,200vw)] w-[min(1000px,200vw)] rounded-full bg-teal-500/20 blur-[150px] dark:bg-teal-500/10"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="fixed right-4 top-4 z-[60] flex items-center gap-2 sm:right-6 sm:top-6 sm:gap-3">
        <LanguageToggle />
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-light bg-base/80 shadow-lg backdrop-blur transition-all active:scale-95 dark:border-white/10 dark:bg-base/60"
          aria-label={theme === 'dark' ? t('topbar.themeToLight') : t('topbar.themeToDark')}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-secondary" aria-hidden /> : <Moon className="h-5 w-5 text-secondary" aria-hidden />}
        </button>
      </div>

      <div
        className={cn(
          'auth-flip-enter relative z-10 w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-border-light bg-pub-panel shadow-pub-3xl dark:border-white/5 sm:rounded-[2.5rem]',
          'lg:max-h-[min(720px,92dvh)]',
          panelClassName
        )}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:min-h-[min(720px,92dvh)]">
          <div className="pub-auth-visual-bg relative hidden overflow-hidden lg:block">
            <Link
              to={backTo}
              className="group absolute left-8 top-8 z-20 flex w-fit items-center gap-2 p-1 text-white/70 transition-colors hover:text-white lg:left-10 lg:top-10"
            >
              <ArrowLeft className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-x-1" aria-hidden />
              <span className="text-xs font-black uppercase tracking-widest">{back}</span>
            </Link>
            <div className="relative z-10 flex h-full flex-col justify-center p-10 xl:p-14">
              <div className="space-y-6">
                <div className="relative max-w-[min(100%,280px)]">
                  <CitizenOneLogo variant="onDark" className="h-[4.5rem] w-auto max-h-none max-w-full object-contain object-left sm:h-20 md:h-24 xl:h-28" />
                </div>
                <h2 className="text-4xl font-black leading-[0.95] tracking-tighter text-white xl:text-5xl">
                  {visualTitle} <br />
                  <span className="text-emerald-300">{visualAccent}</span>
                </h2>
                <div className="h-1.5 w-20 rounded-full bg-emerald-400" aria-hidden />
                <p className="max-w-sm text-base font-medium leading-relaxed text-white/85">{visualLead}</p>
              </div>
            </div>
          </div>

          <div className="flex max-h-[min(90dvh,840px)] flex-col overflow-y-auto bg-pub-panel p-6 sm:p-8 lg:max-h-none lg:p-12 xl:p-14">
            <div className="mb-6 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 lg:hidden">
              <AppLogo size="md" lockup className="min-w-0 w-full max-w-full shrink-0 sm:w-auto sm:max-w-md" />
              <div className="min-w-0 sm:flex-1">
                <p className="text-xs font-medium text-secondary sm:truncate">{mobileBrandLine}</p>
              </div>
            </div>
            {children}
            {footer ? (
              <div className="mx-auto mt-8 w-full max-w-md space-y-4 border-t border-border-light pt-6 text-center text-sm text-secondary dark:border-white/5">
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
