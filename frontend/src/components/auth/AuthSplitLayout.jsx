import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import { cn } from '../ui';
import { AppLogo } from '../brand/AppLogo';
import LanguageToggle from '../inclusive/LanguageToggle';
import { useI18n } from '../../context/I18nContext';
import { useTheme } from '../../context/ThemeContext';

const DENSE_INDIC_LOCALES = new Set(['ta', 'ml', 'kn', 'te', 'hi']);

/**
 * CIVIQ-style split auth shell: gradient page, pulse orbs, marketing column + form column.
 * Optional `footer` renders below the scrollable form area (always visible at bottom of the pane).
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
  const { t, locale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const back = backLabel ?? t('auth.login.civiqBackHome');
  const denseIndic = DENSE_INDIC_LOCALES.has(locale);

  return (
    <div className="font-outfit relative flex min-h-dvh min-h-screen flex-col overflow-x-hidden overflow-y-auto pub-page-gradient px-3 py-6 text-primary sm:px-4 sm:py-10 lg:px-6">
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

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center py-2 sm:py-4">
        <div
          key={location.pathname}
          className={cn('auth-flip-enter w-full flex flex-col gap-0', panelClassName)}
        >
          <div
            className={cn(
              'relative z-10 w-full overflow-hidden rounded-[1.75rem] border border-border-light bg-pub-panel shadow-pub-3xl dark:border-white/5 sm:rounded-[2.5rem]',
              'lg:min-h-[720px]'
            )}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:min-h-[720px]">
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
                    <div className="relative w-full max-w-lg">
                      <AppLogo variant="onDark" size="xl" />
                    </div>
                    <h2 className="text-4xl font-black leading-[0.95] tracking-tighter text-white xl:text-5xl">
                      {visualTitle} <br />
                      <span className="text-emerald-300">{visualAccent}</span>
                    </h2>
                    <div className="h-1.5 w-20 rounded-full bg-emerald-400" aria-hidden />
                    <p
                      className={cn(
                        'max-w-md text-base font-medium leading-relaxed text-white/85',
                        denseIndic && 'text-[15px] leading-[1.75] tracking-wide'
                      )}
                    >
                      {visualLead}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  'flex flex-col bg-pub-panel',
                  'px-6 pt-6 sm:px-8 lg:px-12 lg:pt-12 xl:px-14 xl:pt-14',
                  footer ? 'pb-0' : 'pb-8 sm:pb-10 lg:pb-14'
                )}
              >
                <div className="mb-5 shrink-0 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 lg:mb-6 lg:hidden">
                  <AppLogo size="md" className="min-w-0 w-full max-w-full shrink-0 sm:w-auto sm:max-w-md" />
                  <div className="min-w-0 sm:flex-1">
                    <p
                      className={cn(
                        'text-xs font-medium text-secondary sm:line-clamp-2',
                        denseIndic && 'leading-relaxed tracking-wide sm:line-clamp-none'
                      )}
                    >
                      {mobileBrandLine}
                    </p>
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
                  <div className="flex min-w-0 flex-col pb-1">{children}</div>
                </div>
                {footer ? (
                  <div className="mx-auto w-full max-w-md shrink-0 border-t border-border-light pt-5 dark:border-white/10">
                    <div className="pb-6 sm:pb-8 lg:pb-10">{footer}</div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
