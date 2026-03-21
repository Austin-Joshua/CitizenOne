import React from 'react';
import { cn } from '../ui';

const PageShell = ({ title, description, actions, children, className }) => (
  <div className={cn('space-y-8 lg:space-y-10', className)}>
    <header className="border-b border-border-light pb-8 lg:pb-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 max-w-3xl space-y-2">
          <h1 className="ds-page-title">{title}</h1>
          {description && <p className="ds-body max-w-2xl">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2 lg:pt-1">{actions}</div>}
      </div>
    </header>
    <div className="flex flex-col gap-8 lg:gap-10">{children}</div>
  </div>
);

export default PageShell;
