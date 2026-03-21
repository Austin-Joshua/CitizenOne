import React, { useCallback, useMemo, useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Shield,
  FileCheck,
  Building2,
  Lock,
  CheckCircle2,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { Button, Card, cn } from '../components/ui';
import { AppLogo } from '../components/brand/AppLogo';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import LanguageToggle from '../components/inclusive/LanguageToggle';

const fade = {
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
};

export default function LandingPage() {
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  useDocumentTitle(t('landing.documentTitle'));

  const scrollTo = useCallback((id) => {
    setMobileOpen(false);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const capabilities = useMemo(
    () => [
      { title: t('public.capSchemeTitle'), desc: t('public.capSchemeDesc'), icon: FileCheck },
      { title: t('public.capSecureTitle'), desc: t('public.capSecureDesc'), icon: Shield },
      { title: t('public.capServiceTitle'), desc: t('public.capServiceDesc'), icon: Building2 },
    ],
    [t]
  );

  const platformFeatures = useMemo(
    () => [
      { title: t('landing.platformFeat1Title'), desc: t('landing.platformFeat1Desc') },
      { title: t('landing.platformFeat2Title'), desc: t('landing.platformFeat2Desc') },
      { title: t('landing.platformFeat3Title'), desc: t('landing.platformFeat3Desc') },
    ],
    [t]
  );

  const trustItems = useMemo(
    () => [t('public.trustSession'), t('public.trustA11y'), t('public.trustPlans')],
    [t]
  );

  const stats = useMemo(
    () => [
      { label: t('landing.statSecure'), value: t('landing.statSecureValue') },
      { label: t('landing.statRoles'), value: t('landing.statRolesValue') },
      { label: t('landing.statLanguages'), value: t('landing.statLanguagesValue') },
      { label: t('landing.statDesk'), value: t('landing.statDeskValue') },
    ],
    [t]
  );

  const navItems = useMemo(
    () => [
      { id: 'landing-hero', label: t('landing.navPlatform') },
      { id: 'landing-capabilities', label: t('landing.navCapabilities') },
      { id: 'landing-impact', label: t('landing.navImpact') },
      { id: 'landing-trust', label: t('landing.navTrust') },
    ],
    [t]
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas text-primary">
      <header className="sticky top-0 z-40 border-b border-border-light bg-base/85 backdrop-blur-md supports-[backdrop-filter]:bg-base/70">
        <div className="mx-auto flex h-[4.25rem] max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-20">
          <Link
            to="/"
            className="min-w-0 shrink-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft/45"
            onClick={() => setMobileOpen(false)}
          >
            <AppLogo size="sm" className="sm:hidden" title={t('brand.short')} subtitle={t('brand.tagline')} />
            <span className="hidden sm:block">
              <AppLogo size="md" title={t('brand.short')} subtitle={t('brand.tagline')} />
            </span>
          </Link>

          <nav
            className="mx-auto hidden min-w-0 flex-1 justify-center gap-1 lg:flex"
            aria-label={t('landing.menuLabel')}
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className="rounded-lg px-3 py-2 text-[13px] font-medium text-secondary transition-colors hover:bg-surface hover:text-primary"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
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

            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  {t('public.login')}
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">{t('public.getStarted')}</Button>
              </Link>
            </div>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-light bg-surface text-primary lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="landing-mobile-panel"
              aria-label={mobileOpen ? t('landing.menuClose') : t('landing.menuOpen')}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X size={20} strokeWidth={2} aria-hidden /> : <Menu size={20} strokeWidth={2} aria-hidden />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-[#0f172a]/45 backdrop-blur-[2px] dark:bg-[#020617]/60 lg:hidden"
              aria-label={t('landing.menuClose')}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              id="landing-mobile-panel"
              role="dialog"
              aria-modal="true"
              aria-label={t('landing.menuLabel')}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-0 right-0 top-0 z-50 flex w-[min(100vw-3rem,20rem)] flex-col border-l border-border-light bg-base shadow-elevated-lg lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-border-light px-4 py-4">
                <span className="text-sm font-semibold text-primary">{t('brand.short')}</span>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-secondary hover:bg-surface"
                  aria-label={t('landing.menuClose')}
                  onClick={() => setMobileOpen(false)}
                >
                  <X size={18} strokeWidth={2} aria-hidden />
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3" aria-label={t('landing.menuLabel')}>
                {navItems.map((item, i) => (
                  <motion.button
                    key={item.id}
                    type="button"
                    custom={i}
                    {...navFade}
                    initial="initial"
                    animate="animate"
                    transition={{ ...navFade.transition, delay: 0.04 + i * 0.05 }}
                    onClick={() => scrollTo(item.id)}
                    className="rounded-xl px-3 py-3 text-left text-[15px] font-medium text-primary transition-colors hover:bg-surface"
                  >
                    {item.label}
                  </motion.button>
                ))}
              </nav>
              <div className="border-t border-border-light p-4 space-y-2">
                <Link to="/login" className="block" onClick={() => setMobileOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    {t('public.login')}
                  </Button>
                </Link>
                <Link to="/signup" className="block" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">{t('public.getStarted')}</Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="mx-auto max-w-[1440px] px-4 pb-20 pt-8 sm:px-6 lg:px-20 lg:pb-28 lg:pt-12">
        <div className="mx-auto max-w-[1280px]">
          <section id="landing-hero" className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16">
            <div className="space-y-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-primary">{t('landing.heroEyebrow')}</p>
              <h1 className="text-[2rem] font-semibold leading-[1.12] tracking-tight text-primary sm:text-[2.35rem] lg:text-[2.75rem]">
                <span className="block">{t('landing.heroLine1')}</span>
                <span className="block">{t('landing.heroLine2')}</span>
                <span className="block text-accent-primary">{t('landing.heroLine3')}</span>
              </h1>
              <p className="max-w-xl text-[15px] leading-relaxed text-secondary sm:text-lg">{t('landing.heroDeck')}</p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => scrollTo('landing-capabilities')}>
                  {t('landing.quickExplore')}
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => scrollTo('landing-impact')}>
                  {t('landing.quickDesk')}
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => scrollTo('landing-trust')}>
                  {t('landing.quickRoadmap')}
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link to="/signup">
                  <Button>
                    {t('landing.register')} <ArrowRight className="ml-1.5 h-4 w-4" strokeWidth={2} aria-hidden />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary">{t('landing.signInAlt')}</Button>
                </Link>
              </div>
              <p className="text-sm text-secondary">{t('public.trustLine')}</p>
              <ul className="flex flex-col gap-2 text-[13px] text-secondary sm:flex-row sm:flex-wrap sm:gap-x-6">
                {trustItems.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-semantic-success" strokeWidth={2} aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <Card elevated className="!p-5 sm:!p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-tertiary">{t('landing.atAGlance')}</p>
              <ul className="mt-5 space-y-4 text-sm text-secondary">
                <li className="flex gap-3">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-accent-primary" strokeWidth={2} aria-hidden />
                  <span>{t('landing.glanceAuth')}</span>
                </li>
                <li className="flex gap-3">
                  <FileCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-primary" strokeWidth={2} aria-hidden />
                  <span>{t('landing.glanceBenefits')}</span>
                </li>
                <li className="flex gap-3">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-accent-primary" strokeWidth={2} aria-hidden />
                  <span>{t('landing.glancePremium')}</span>
                </li>
              </ul>
            </Card>
          </section>

          <section id="landing-capabilities" className="mt-20 scroll-mt-28 lg:mt-28">
            <motion.p {...fade} className="text-[11px] font-semibold uppercase tracking-[0.12em] text-tertiary">
              {t('landing.capabilitiesLabel')}
            </motion.p>
            <motion.h2 {...fade} className="ds-section-title mt-2 max-w-3xl">
              {t('landing.capabilitiesHeading')}
            </motion.h2>
            <motion.p {...fade} className="ds-body mt-3 max-w-3xl">
              {t('landing.capabilitiesSub')}
            </motion.p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {capabilities.map((c) => (
                <motion.div key={c.title} {...fade}>
                  <Card elevated className="!h-full !p-6 transition-[box-shadow,transform] duration-200 hover:shadow-elevated-md">
                    <c.icon className="h-7 w-7 text-accent-primary" strokeWidth={2} aria-hidden />
                    <h3 className="mt-5 text-lg font-medium leading-snug text-primary">{c.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-secondary">{c.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          <section id="landing-platform" className="mt-20 scroll-mt-28 lg:mt-28">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-end lg:gap-16">
              <div>
                <motion.p {...fade} className="text-[11px] font-semibold uppercase tracking-[0.12em] text-tertiary">
                  {t('landing.platformKicker')}
                </motion.p>
                <motion.h2 {...fade} className="mt-2 text-[1.65rem] font-semibold leading-tight tracking-tight text-primary sm:text-3xl lg:text-[2.125rem]">
                  {t('landing.platformTitle')}
                </motion.h2>
                <motion.p {...fade} className="ds-body mt-4 max-w-xl">
                  {t('landing.platformLead')}
                </motion.p>
              </div>
              <div className="space-y-6">
                {platformFeatures.map((f, i) => (
                  <motion.div key={f.title} {...fade} transition={{ ...fade.transition, delay: i * 0.06 }}>
                    <h4 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-accent-primary">{f.title}</h4>
                    <p className="mt-2 text-[15px] leading-relaxed text-secondary">{f.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section id="landing-impact" className="mt-20 scroll-mt-28 lg:mt-28">
            <motion.h2 {...fade} className="ds-section-title">
              {t('landing.impactHeading')}
            </motion.h2>
            <motion.p {...fade} className="ds-body mt-2 max-w-2xl">
              {t('landing.impactLead')}
            </motion.p>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-5">
              {stats.map((s) => (
                <motion.div key={s.label} {...fade}>
                  <Card className="!p-4 text-center sm:!p-5">
                    <p className="text-xl font-semibold tracking-tight text-primary sm:text-2xl">{s.value}</p>
                    <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wide text-secondary sm:text-xs">{s.label}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
            <motion.p {...fade} className="mt-8 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-tertiary">
              {t('landing.trustRibbon')}
            </motion.p>
          </section>

          <section id="landing-trust" className="mt-20 scroll-mt-28 lg:mt-28">
            <motion.h2 {...fade} className="ds-section-title">
              {t('landing.trustHeading')}
            </motion.h2>
            <motion.p {...fade} className="ds-body mt-3 max-w-3xl">
              {t('public.dpiBody')}
            </motion.p>
            <motion.div {...fade} className="mt-8 rounded-2xl border border-border-light bg-surface/80 p-6 backdrop-blur-sm lg:p-8">
              <h3 className="ds-card-title">{t('public.dpiHeading')}</h3>
              <p className="mt-3 text-sm leading-relaxed text-secondary">{t('public.footerTrust')}</p>
              <p className="mt-3 text-sm leading-relaxed text-secondary">{t('public.footerPrivacy')}</p>
            </motion.div>
          </section>

          <section id="landing-cta" className="mt-20 scroll-mt-28 lg:mt-28">
            <motion.div
              {...fade}
              className="rounded-2xl border border-border-light bg-accent-primary/[0.07] px-6 py-12 text-center lg:px-16 lg:py-14"
            >
              <h2 className="text-xl font-semibold text-primary sm:text-2xl lg:text-[1.75rem]">{t('landing.ctaBandTitle')}</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm text-secondary sm:text-[15px]">{t('landing.ctaBandBody')}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
                <Link to="/signup">
                  <Button className="w-full min-w-[12rem] sm:w-auto">{t('public.getStarted')}</Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" className="w-full min-w-[12rem] sm:w-auto">
                    {t('public.login')}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </section>

          <footer className="mt-20 border-t border-border-light pt-12 lg:mt-24 lg:pt-16">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <p className="text-lg font-semibold text-primary">{t('landing.footerBrand')}</p>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-secondary">{t('landing.footerBlurb')}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-tertiary">{t('landing.footerColPlatform')}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollTo('landing-hero')}
                      className="text-secondary transition-colors hover:text-primary"
                    >
                      {t('landing.footerLinkOverview')}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollTo('landing-capabilities')}
                      className="text-secondary transition-colors hover:text-primary"
                    >
                      {t('landing.footerLinkCapabilities')}
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollTo('landing-impact')}
                      className="text-secondary transition-colors hover:text-primary"
                    >
                      {t('landing.footerLinkImpact')}
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-tertiary">{t('landing.footerColCompany')}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>
                    <Link to="/signup" className="text-secondary transition-colors hover:text-primary">
                      {t('landing.footerLinkSignup')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className="text-secondary transition-colors hover:text-primary">
                      {t('landing.footerLinkLogin')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/login/recovery" className="text-secondary transition-colors hover:text-primary">
                      {t('landing.footerLinkRecovery')}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border-light pt-8 text-[13px] text-secondary sm:flex-row">
              <p>{t('landing.footerDemo')}</p>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                <span className="cursor-default">{t('landing.footerLegalPrivacy')}</span>
                <span className="cursor-default">{t('landing.footerLegalSafety')}</span>
                <span className="cursor-default">{t('landing.footerLegalNotice')}</span>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
