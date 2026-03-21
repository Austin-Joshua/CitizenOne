import React from 'react';
import { cn } from '../ui';

export function AppLogo({ className, size = 'md', showWordmark = true, title, subtitle }) {
  const box = {
    sm: 'h-8 w-8 rounded-md text-[10px]',
    md: 'h-10 w-10 rounded-lg text-xs',
    lg: 'h-12 w-12 rounded-xl text-sm',
  }[size];

  return (
    <div className={cn('flex min-w-0 items-center gap-2.5', className)}>
      <div
        className={cn(
          'flex shrink-0 items-center justify-center bg-accent-primary font-bold tracking-tight text-white shadow-md shadow-accent-primary/20',
          box
        )}
        aria-hidden
      >
        C1
      </div>
      {showWordmark && (
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold text-primary">{title ?? 'Citizen One'}</p>
          <p className="truncate text-[11px] text-secondary">{subtitle ?? 'Public service workspace'}</p>
        </div>
      )}
    </div>
  );
}
