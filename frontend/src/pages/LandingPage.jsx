import React, { useCallback, useMemo } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, CheckCircle2, Cpu, Fingerprint, Bot, Sun, Moon } from 'lucide-react';
import { cn } from '../components/ui';
import { AppLogo } from '../components/brand/AppLogo';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../context/I18nContext';
import LanguageToggle from '../components/inclusive/LanguageToggle';

export default function LandingPage() {
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();

  useDocumentTitle(t('landing.documentTitle'));

  const scrollTo = useCallback((id) => {
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const navItems = useMemo(
    () => [
      { id: 'landing-platform', label: t('landing.navPlatform') },
      { id: 'landing-solutions', label: t('landing.navSolutions') },
      { id: 'landing-vision', label: t('landing.navVision') },
      { id: 'landing-network', label: t('landing.navNetwork') },
    ],
    [t]
  );

  const valueProps = useMemo(
    () => [
      { icon: Cpu, title: t('landing.replicaVal1Title'), desc: t('landing.replicaVal1Desc') },
      { icon: Fingerprint, title: t('landing.replicaVal2Title'), desc: t('landing.replicaVal2Desc') },
      { icon: Globe, title: t('landing.replicaVal3Title'), desc: t('landing.replicaVal3Desc') },
    ],
    [t]
  );

  const platformFeatures = useMemo(
    () => [
      { title: t('landing.replicaFeat1Title'), desc: t('landing.replicaFeat1Desc') },
      { title: t('landing.replicaFeat2Title'), desc: t('landing.replicaFeat2Desc') },
      { title: t('landing.replicaFeat3Title'), desc: t('landing.replicaFeat3Desc') },
    ],
    [t]
  );

  const stats = useMemo(
    () => [
      t('landing.replicaStat1'),
      t('landing.replicaStat2'),
      t('landing.replicaStat3'),
      t('landing.replicaStat4'),
    ],
    [t]
  );

  return (
    <div
      className={cn(
        'font-outfit min-h-dvh min-h-screen overflow-x-hidden text-primary transition-colors duration-300 selection:bg-accent-primary/30',
        'pub-page-gradient'
      )}
    >
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="animate-civiq-pulse-slow absolute -left-1/4 top-0 h-[min(1000px,220vw)] w-[min(1000px,220vw)] rounded-full bg-accent-primary/10 blur-[150px] dark:bg-accent-primary/15" />
        <div
          className="animate-civiq-pulse-slow absolute -right-1/4 bottom-0 h-[min(1000px,220vw)] w-[min(1000px,220vw)] rounded-full bg-teal-500/10 blur-[200px] dark:bg-teal-500/10"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border-light bg-pub-nav backdrop-blur-2xl transition-colors duration-300 dark:border-white/5">
        <div className="mx-auto flex h-[5.25rem] max-w-7xl items-center gap-2 px-4 sm:h-24 sm:gap-3 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center py-0.5 sm:py-1">
            <CitizenOneLogo className="h-10 w-auto max-h-12 max-w-[min(100%,min(640px,86vw))] object-contain object-left sm:h-16 sm:max-h-[4.25rem] md:h-[4.25rem] md:max-h-[4.5rem] lg:h-[4.5rem] lg:max-h-20 xl:max-w-[min(100%,720px)]" />
          </Link>

          <div
            className="scrollbar-none min-w-0 flex-1 overflow-x-auto"
            role="navigation"
            aria-label={t('landing.menuLabel')}
          >
            <ul className="flex h-[5.25rem] min-w-max items-center justify-center gap-4 px-1 sm:h-24 sm:gap-6 md:gap-8 lg:gap-10">
              {navItems.map((item) => (
                <li key={item.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => scrollTo(item.id)}
                    className="whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] text-tertiary transition-colors hover:text-accent-primary"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <LanguageToggle />
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-light bg-base/80 text-secondary backdrop-blur transition-all hover:scale-105 hover:text-accent-primary dark:border-white/10 dark:bg-base/60"
              aria-label={theme === 'dark' ? t('topbar.themeToLight') : t('topbar.themeToDark')}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
            </button>
            <Link
              to="/login"
              className="whitespace-nowrap px-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary transition-colors hover:text-accent-primary sm:px-3 sm:text-xs md:text-sm"
            >
              {t('public.login')}
            </Link>
            <Link
              to="/signup"
              className="whitespace-nowrap rounded-xl border border-accent-primary/20 bg-accent-primary px-3 py-2 text-[10px] font-bold text-white shadow-lg shadow-accent-primary/25 transition-all active:scale-95 sm:px-4 sm:text-xs md:text-sm"
            >
              {t('public.getStarted')}
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-40 sm:pt-44 lg:pt-48">
        <section className="mx-auto mb-24 max-w-7xl px-4 text-center sm:mb-32 sm:px-6 lg:mb-60">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent-primary/20 bg-accent-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-accent-primary dark:text-accent-primary">
            <Bot className="h-3.5 w-3.5 fill-current" aria-hidden />
            {t('landing.replicaEyebrow')}
          </div>
          <h1 className="mb-8 text-5xl font-black leading-[0.88] tracking-tighter text-primary min-[400px]:text-6xl sm:mb-10 sm:text-7xl md:text-8xl md:leading-[0.85] lg:text-[min(9rem,11vw)]">
            <span className="block">{t('landing.replicaHeroL1')}</span>
            <span className="block">{t('landing.replicaHeroL2')}</span>
            <span className="text-gradient-pub-hero block">{t('landing.replicaHeroL3')}</span>
          </h1>
          <p className="mx-auto mb-12 max-w-3xl text-base font-medium leading-relaxed text-secondary sm:mb-16 sm:text-xl md:text-2xl">
            {t('landing.replicaHeroDeck')}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link
              to="/signup"
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-10 py-5 text-lg font-black text-white shadow-2xl transition-all hover:scale-105 active:scale-95 dark:bg-white dark:text-primary sm:w-auto sm:px-12 sm:py-6 sm:text-xl"
            >
              {t('landing.replicaPrimaryCta')}
              <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => scrollTo('landing-solutions')}
              className="w-full rounded-2xl border border-border-light bg-base/70 px-10 py-5 text-lg font-bold text-primary transition-all hover:border-border-light hover:bg-base dark:border-white/10 dark:bg-base/50 dark:text-primary dark:hover:border-white/20 sm:w-auto sm:px-12 sm:py-6 sm:text-xl"
            >
              {t('landing.replicaSecondaryCta')}
            </button>
          </div>
        </section>

        <section id="landing-platform" className="mx-auto mb-24 max-w-7xl scroll-mt-24 px-4 sm:mb-32 sm:px-6 lg:mb-60">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {valueProps.map((item, i) => (
              <div
                key={i}
                className="group pub-marketing-card rounded-[2rem] border p-8 shadow-xl transition-all hover:-translate-y-2 hover:border-accent-primary/30 hover:shadow-2xl sm:p-10 md:rounded-[2.5rem]"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-primary/10 text-accent-primary transition-all group-hover:bg-accent-primary group-hover:text-white">
                  <item.icon className="h-7 w-7" aria-hidden />
                </div>
                <h3 className="mb-3 text-xl font-black tracking-tight text-primary sm:text-2xl">{item.title}</h3>
                <p className="font-medium leading-relaxed text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="landing-solutions"
          className="scroll-mt-28 border-y border-border-light py-16 dark:border-white/5 sm:scroll-mt-32 sm:py-24 lg:py-40"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24 xl:gap-32">
              <div>
                <h2 className="mb-8 text-4xl font-black leading-[0.9] tracking-tighter text-primary sm:text-5xl md:text-6xl">
                  {t('landing.replicaPlatformKicker')} <br />
                  <span className="text-accent-primary">{t('landing.replicaPlatformAccent')}</span>
                </h2>
                <div className="space-y-8 sm:space-y-10">
                  {platformFeatures.map((item, i) => (
                    <div key={i} className="group flex gap-6 sm:gap-8">
                      <div className="h-14 w-1.5 shrink-0 rounded-full bg-accent-primary/20 transition-colors group-hover:bg-accent-primary sm:h-16" />
                      <div className="min-w-0">
                        <h4 className="mb-2 text-lg font-black text-primary sm:text-xl">{item.title}</h4>
                        <p className="text-base font-medium leading-relaxed text-secondary sm:text-lg">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div
                id="landing-vision"
                className="relative pub-marketing-card scroll-mt-28 space-y-8 rounded-[2rem] border p-8 shadow-xl sm:scroll-mt-32 sm:rounded-[3rem] sm:p-10 lg:p-12"
              >
                <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-accent-primary/10 blur-[100px]" aria-hidden />
                <div className="relative space-y-5 sm:space-y-6">
                  {stats.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-lg font-black tracking-tight text-accent-primary sm:gap-4 sm:text-xl">
                      <CheckCircle2 className="h-6 w-6 shrink-0" aria-hidden />
                      <span className="text-left">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="relative border-t border-border-light pt-8 dark:border-white/5">
                  <p className="mb-4 text-xs font-bold uppercase tracking-widest text-tertiary">
                    {t('landing.replicaTrustedBy')}
                  </p>
                  <div className="flex gap-3 opacity-40 sm:gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-10 w-10 rounded-xl bg-secondary/30 dark:bg-white/10 sm:h-12 sm:w-12" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="landing-network" className="scroll-mt-28 px-4 py-16 text-center sm:scroll-mt-32 sm:py-24 lg:py-40">
          <h2 className="mb-8 text-4xl font-black leading-none tracking-tighter text-primary sm:mb-12 sm:text-6xl md:text-7xl lg:text-8xl">
            {t('landing.replicaCtaTitle')}{' '}
            <span className="text-accent-primary">{t('landing.replicaCtaAccent')}</span>
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-base font-medium text-secondary sm:mb-16 sm:text-xl">
            {t('landing.replicaCtaBody')}
          </p>
          <Link
            to="/signup"
            className="inline-flex rounded-[2rem] bg-accent-primary px-10 py-6 text-xl font-black text-white shadow-pub-cta transition-all hover:scale-105 hover:bg-accent-hover active:scale-95 sm:px-16 sm:py-8 sm:text-2xl"
          >
            {t('landing.replicaCtaButton')}
          </Link>
        </section>

        <footer className="border-t border-border-light bg-base/60 py-16 dark:border-white/5 dark:bg-base/50 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-12 grid grid-cols-1 gap-12 text-center md:mb-20 md:grid-cols-4 md:gap-16 md:text-left">
              <div className="md:col-span-2">
                <div className="mb-6 flex justify-center md:justify-start">
                  <AppLogo size="lg" lockup className="w-full max-w-2xl md:max-w-3xl" />
                </div>
                <p className="mx-auto max-w-sm font-medium leading-relaxed text-secondary md:mx-0">{t('landing.footerBlurb')}</p>
              </div>
              <div>
                <h4 className="mb-6 text-xs font-black uppercase tracking-widest text-primary">{t('landing.footerColPlatform')}</h4>
                <ul className="space-y-3 text-sm font-bold text-secondary">
                  <li>
                    <button type="button" onClick={() => scrollTo('landing-platform')} className="hover:text-accent-primary">
                      {t('landing.footerLinkOverview')}
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => scrollTo('landing-solutions')} className="hover:text-accent-primary">
                      {t('landing.navSolutions')}
                    </button>
                  </li>
                  <li>
                    <Link to="/signup" className="hover:text-accent-primary">
                      {t('landing.footerLinkRoadmap')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/signup" className="hover:text-accent-primary">
                      {t('landing.footerLinkIntegrations')}
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-6 text-xs font-black uppercase tracking-widest text-primary">{t('landing.footerColSolutions')}</h4>
                <ul className="space-y-3 text-sm font-bold text-secondary">
                  <li>
                    <button type="button" onClick={() => scrollTo('landing-platform')} className="hover:text-accent-primary">
                      {t('landing.footerLinkAbout')}
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => scrollTo('landing-solutions')} className="hover:text-accent-primary">
                      {t('landing.footerLinkSustainability')}
                    </button>
                  </li>
                  <li>
                    <Link to="/signup" className="hover:text-accent-primary">
                      {t('landing.footerLinkContact')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className="hover:text-accent-primary">
                      {t('landing.footerLinkPortalLogin')}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-8 border-t border-border-light pt-10 opacity-80 dark:border-white/5 dark:opacity-50 md:flex-row md:pt-16">
              <p className="text-center text-[10px] font-bold uppercase tracking-widest text-tertiary md:text-left">{t('landing.footerDemo')}</p>
              <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-tertiary sm:gap-10">
                <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-accent-primary">
                  {t('landing.footerLegalPrivacy')}
                </button>
                <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-accent-primary">
                  {t('landing.footerLegalSafety')}
                </button>
                <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-accent-primary">
                  {t('landing.footerLegalNotice')}
                </button>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
