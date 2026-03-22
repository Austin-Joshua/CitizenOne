import React from 'react';
import { cn } from '../ui';
import { CitizenOneLogo } from './CitizenOneLogo';

/**
 * App chrome brand: `Favicon.png` + manual “Citizen” / “One” wordmark; optional subtitle line.
 */
export function AppLogo({
  className,
  size = 'md',
  variant = 'default',
  /** Second line (e.g. `t('brand.subtitle')`) */
  subtitle,
  showWordmark = true,
}) {
  return (
    <div className={cn(subtitle ? 'flex min-w-0 flex-col gap-1' : 'min-w-0', className)}>
      <CitizenOneLogo size={size} variant={variant} showWordmark={showWordmark} className="min-w-0" />
      {subtitle ? (
        <p className="truncate pl-0.5 text-[12px] text-tertiary">{subtitle}</p>
      ) : null}
    </div>
  );
}
