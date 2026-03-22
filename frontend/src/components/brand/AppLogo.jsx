import React from 'react';
import { cn } from '../ui';
import { CitizenOneLogo } from './CitizenOneLogo';
import { useI18n } from '../../context/I18nContext';

const SIZE_CLASS = {
  /** Compact (e.g. auth header) */
  sm: 'h-12 w-auto max-w-full object-contain object-left sm:h-14',
  /** Default */
  md: 'h-14 w-auto max-w-full object-contain object-left sm:h-16',
  /** Top bar / emphasis */
  lg: 'h-16 w-auto max-w-full object-contain object-left sm:h-[4.5rem] md:h-20',
};

const LOCKUP_CLASS = {
  sm: 'h-12 w-auto max-w-full object-contain object-left sm:h-14',
  md: 'h-14 w-auto max-w-full object-contain object-left sm:h-16',
  lg: 'h-16 w-auto max-w-full object-contain object-left sm:h-[4.75rem] md:h-20 lg:h-[5.5rem]',
};

/**
 * Application brand: PNG lockup from `/branding/citizen-one-logo.png`, optionally with separate wordmark + tagline.
 * Use `lockup` when the PNG already includes the wordmark (avoids duplicate text next to the image).
 */
export function AppLogo({
  className,
  size = 'md',
  lockup = false,
  showTitle = true,
  showWordmark = true,
  title,
  subtitle,
}) {
  const { t } = useI18n();
  const titleText = title ?? t('brand.wordmark');

  if (lockup) {
    return (
      <div className={cn('flex min-w-0 items-center', className)}>
        <CitizenOneLogo className={cn(LOCKUP_CLASS[size] || LOCKUP_CLASS.md, 'shrink-0')} decorative={false} />
      </div>
    );
  }

  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <CitizenOneLogo className={cn(SIZE_CLASS[size] || SIZE_CLASS.md, 'shrink-0')} decorative />
      <div className="min-w-0 leading-tight">
        {showTitle ? (
          <p className="truncate font-outfit text-base font-semibold tracking-tight text-primary sm:text-lg">
            {titleText}
          </p>
        ) : null}
        {showWordmark && subtitle ? (
          <p className="truncate text-[11px] text-secondary sm:text-xs">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
