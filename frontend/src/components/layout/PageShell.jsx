import React from 'react';
import { cn } from '../ui';

const PageShell = ({ title, description, actions, children, className }) => (
  <div className={cn('space-y-4', className)}>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight text-primary sm:text-2xl">{title}</h1>
        {description && <p className="max-w-4xl text-sm leading-relaxed text-secondary sm:text-[15px]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
    {children}
  </div>
);

export default PageShell;
