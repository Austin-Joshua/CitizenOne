import React from 'react';
import { cn } from '../ui';

const PageShell = ({ title, description, actions, children, className }) => (
  <div className={cn('space-y-8', className)}>
    <header className="flex flex-col gap-4 border-b border-border-light pb-8 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 max-w-3xl space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-primary lg:text-[1.65rem] lg:leading-snug">{title}</h1>
        {description && (
          <p className="text-[15px] leading-relaxed text-secondary">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2 lg:pt-1">{actions}</div>}
    </header>
    <div className="space-y-8">{children}</div>
  </div>
);

export default PageShell;
