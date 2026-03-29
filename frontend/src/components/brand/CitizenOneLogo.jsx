import React from 'react';
import { cn } from '../ui';

/** Browser tab + in-app mark (must match `index.html` / `public/Favicon.png`). */
export const BRAND_FAVICON_SRC = '/Favicon.png';

const SIZE_STYLES = {
  sm: {
    icon: 'h-9 w-auto max-h-9 sm:h-10 sm:max-h-10',
    wordmark: 'text-base sm:text-lg',
  },
  md: {
    icon: 'h-10 w-auto max-h-10 sm:h-11 sm:max-h-11 md:h-12 md:max-h-12',
    wordmark: 'text-lg sm:text-xl',
  },
  lg: {
    icon: 'h-11 w-auto max-h-11 sm:h-12 sm:max-h-12 md:h-14 md:max-h-14',
    wordmark: 'text-xl sm:text-2xl md:text-3xl',
  },
  xl: {
    icon: 'h-14 w-auto max-h-14 sm:h-16 sm:max-h-16 md:h-20 md:max-h-20 xl:h-24 xl:max-h-24',
    wordmark: 'text-2xl sm:text-3xl md:text-4xl xl:text-5xl',
  },
};

/**
 * Manual wordmark styled like the brand art: bold Outfit, "Citizen" + "One" (navy/white + cyan).
 */
export function BrandWordmark({ variant = 'default', size = 'md', className }) {
  const onDark = variant === 'onDark';
  const scale = SIZE_STYLES[size]?.wordmark ?? SIZE_STYLES.md.wordmark;
  return (
    <span
      className={cn(
        'inline-flex min-w-0 flex-wrap items-baseline gap-0 font-outfit font-extrabold tracking-[-0.04em]',
        onDark && 'co-brand-wordmark--onDark',
        scale,
        className
      )}
    >
      <span className="co-brand-citizen">Citizen</span>
      <span className="co-brand-one">One</span>
    </span>
  );
}

/**
 * Favicon image + manual wordmark. No `citizen-one-logo.png`.
 */
export function CitizenOneLogo({
  className,
  iconClassName,
  wordmarkClassName,
  decorative = true,
  variant = 'default',
  showWordmark = true,
  size = 'md',
}) {
  const styles = SIZE_STYLES[size] ?? SIZE_STYLES.md;

  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <img
        src={BRAND_FAVICON_SRC}
        alt={decorative ? '' : 'CitizenOne'}
        className={cn(styles.icon, 'shrink-0 object-contain object-left', iconClassName)}
        {...(decorative ? { 'aria-hidden': true } : {})}
      />
      {showWordmark ? (
        <BrandWordmark variant={variant} size={size} className={cn('min-w-0 truncate', wordmarkClassName)} />
      ) : null}
    </div>
  );
}
