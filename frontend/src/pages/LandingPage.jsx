import React, { useMemo } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, FileCheck, Building2, Lock, CheckCircle2, Sun, Moon } from 'lucide-react';
import { Button, Card, Badge, cn } from '../components/ui';
import { AppLogo } from '../components/brand/AppLogo';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import LanguageToggle from '../components/inclusive/LanguageToggle';

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
};

export default function LandingPage() {
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();

  useDocumentTitle(t('landing.documentTitle'));

  const capabilities = useMemo(
    () => [
      { title: t('public.capSchemeTitle'), desc: t('public.capSchemeDesc'), icon: FileCheck },
      { title: t('public.capSecureTitle'), desc: t('public.capSecureDesc'), icon: Shield },
      { title: t('public.capServiceTitle'), desc: t('public.capServiceDesc'), icon: Building2 },
    ],
    [t]
  );

  const trustItems = useMemo(
    () => [t('public.trustSession'), t('public.trustA11y'), t('public.trustPlans')],
    [t]
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-base text-primary">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[min(52vh,420px)] bg-gradient-to-b from-accent-primary/[0.07] to-transparent dark:from-accent-primary/[0.12]" />

      <header className="sticky top-0 z-30 border-b border-border-light bg-base/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="min-w-0 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/40 rounded-lg">
            <AppLogo size="md" title={t('brand.short')} subtitle={t('brand.tagline')} />
          </Link>
          <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
            <LanguageToggle className="[&_button]:min-w-[9rem] sm:[&_button]:min-w-[11rem]" />
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? t('topbar.themeToLight') : t('topbar.themeToDark')}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-light bg-surface/80 text-secondary shadow-sm transition-all hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/40 active:scale-[0.97]"
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
            <Link to="/login">
              <Button variant="ghost" size="sm">
                {t('public.login')}
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">{t('public.getStarted')}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1200px] px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-14">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
        >
          <div className="space-y-6">
            <Badge variant="primary">{t('brand.tagline')}</Badge>
            <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-primary sm:text-4xl lg:text-[2.65rem]">
              {t('public.heroTitle')}
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-secondary sm:text-lg">{t('public.heroSubtitle')}</p>
            <p className="max-w-xl text-sm leading-relaxed text-secondary sm:text-base">{t('landing.heroBody')}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/signup">
                <Button className="shadow-md shadow-accent-primary/20">
                  {t('landing.register')} <ArrowRight className="ml-1.5 h-4 w-4" strokeWidth={2} aria-hidden />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary">{t('landing.signInAlt')}</Button>
              </Link>
            </div>
            <p className="text-sm text-secondary">{t('public.trustLine')}</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-secondary">
              {trustItems.map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2} aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="glass-elevated relative !p-5 sm:!p-6"
          >
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-accent-tertiary/15 blur-2xl" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">{t('landing.atAGlance')}</p>
            <ul className="mt-4 space-y-3 text-sm text-secondary">
              <li className="flex gap-2">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-accent-primary" strokeWidth={2} aria-hidden />
                <span>{t('landing.glanceAuth')}</span>
              </li>
              <li className="flex gap-2">
                <FileCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-primary" strokeWidth={2} aria-hidden />
                <span>{t('landing.glanceBenefits')}</span>
              </li>
              <li className="flex gap-2">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-accent-primary" strokeWidth={2} aria-hidden />
                <span>{t('landing.glancePremium')}</span>
              </li>
            </ul>
          </motion.div>
        </motion.section>

        <section className="mt-16 sm:mt-20">
          <motion.p {...fadeUp} className="text-[11px] font-semibold uppercase tracking-wider text-tertiary">
            {t('landing.capabilitiesLabel')}
          </motion.p>
          <motion.h2 {...fadeUp} className="mt-2 text-xl font-semibold text-primary sm:text-2xl">
            {t('landing.capabilitiesHeading')}
          </motion.h2>
          <motion.p {...fadeUp} className="mt-2 max-w-3xl text-sm text-secondary sm:text-[15px]">
            {t('public.dpiBody')}
          </motion.p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {capabilities.map((c, i) => (
              <motion.div key={c.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }}>
                <Card elevated className="group !h-full !p-5 transition-shadow duration-200 hover:shadow-lg hover:shadow-accent-primary/10">
                  <c.icon
                    className="h-6 w-6 text-accent-primary transition-transform duration-200 group-hover:scale-105"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <p className="mt-3 text-base font-semibold text-primary">{c.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-secondary">{c.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-border-light bg-surface/40 px-4 py-6 sm:px-6">
          <h3 className="text-sm font-semibold text-primary">{t('public.dpiHeading')}</h3>
          <p className="mt-2 text-sm leading-relaxed text-secondary">{t('public.footerTrust')}</p>
          <p className="mt-3 text-sm leading-relaxed text-secondary">{t('public.footerPrivacy')}</p>
        </section>

        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-16 border-t border-border-light pt-8 text-center text-[13px] text-secondary sm:mt-20"
        >
          <p>{t('landing.footerDemo')}</p>
        </motion.footer>
      </main>
    </div>
  );
}
