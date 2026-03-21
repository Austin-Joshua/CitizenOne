import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages } from 'lucide-react';
import { cn } from '../ui';
import { SUPPORTED_LOCALES, useI18n } from '../../context/I18nContext';

const panelMotion = {
  initial: { opacity: 0, y: -6, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.99 },
  transition: { duration: 0.14, ease: [0.16, 1, 0.3, 1] },
};

const triggerClass =
  'flex h-10 min-w-[10.5rem] shrink-0 items-center justify-center gap-2 rounded-lg border border-border-light bg-surface/60 px-2.5 text-left text-[13px] font-medium text-primary transition-colors hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/40 sm:min-w-[11rem]';

export default function LanguageToggle({ className }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = SUPPORTED_LOCALES.find((l) => l.code === locale) || SUPPORTED_LOCALES[0];

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current?.contains(e.target)) return;
      setOpen(false);
    };
    if (open) {
      document.addEventListener('mousedown', onDoc);
      return () => document.removeEventListener('mousedown', onDoc);
    }
    return undefined;
  }, [open]);

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        type="button"
        className={cn(triggerClass)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t('topbar.chooseLanguage')}
        onClick={() => setOpen((o) => !o)}
      >
        <Languages size={18} strokeWidth={2} className="shrink-0 text-accent-primary" aria-hidden />
        <span className="min-w-0 flex-1 truncate text-left">
          <span className="block truncate leading-tight">{current.native}</span>
          <span className="block truncate text-[10px] font-normal uppercase tracking-wide text-tertiary">
            {t('topbar.language')}
          </span>
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            {...panelMotion}
            role="listbox"
            aria-label={t('topbar.chooseLanguage')}
            className="absolute right-0 top-[calc(100%+6px)] z-[60] max-h-72 min-w-[11rem] overflow-y-auto rounded-xl border border-border-light bg-surface py-1 shadow-lg sm:left-0 sm:right-auto"
          >
            {SUPPORTED_LOCALES.map((l) => (
              <li key={l.code} role="option" aria-selected={l.code === locale}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full flex-col items-start px-3 py-2.5 text-left text-[14px] transition-colors hover:bg-base',
                    l.code === locale && 'bg-accent-primary/10 font-semibold text-accent-primary'
                  )}
                  onClick={() => {
                    setLocale(l.code);
                    setOpen(false);
                  }}
                >
                  <span>{l.native}</span>
                  <span className="text-[11px] font-normal text-secondary">{l.label}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
