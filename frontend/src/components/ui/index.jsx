import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef(({ className, variant = "primary", size = "default", children, ...props }, ref) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold tracking-wide uppercase transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/45 disabled:opacity-50 disabled:pointer-events-none rounded-lg active:scale-[0.98]";

  const variants = {
    primary: "bg-accent-primary text-white hover:bg-accent-primary/90 shadow-sm shadow-accent-primary/15",
    secondary: "bg-glass-base border border-border-light text-primary hover:bg-surface shadow-sm",
    ghost: "bg-transparent text-secondary hover:text-primary hover:bg-base/80",
    glass: "glass-button",
  };

  const sizes = {
    sm: "h-9 px-3.5 text-[11px]",
    default: "h-10 px-5 text-xs",
    lg: "h-11 px-6 text-sm",
  };

  return (
    <button ref={ref} className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
});

export const Card = ({ className, children, elevated = false, ...props }) => (
  <div
    className={cn(elevated ? "glass-elevated py-5 px-5 sm:px-6" : "glass-panel p-4 sm:p-5", className)}
    {...props}
  >
    {children}
  </div>
);

export const Badge = ({ className, variant = "default", children, ...props }) => {
  const variants = {
    default: "bg-slate-100 dark:bg-slate-800 text-secondary border border-border-light",
    primary: "bg-accent-primary/10 text-accent-primary border-none",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-none",
    danger: "bg-red-500/10 text-red-600 dark:text-red-400 border-none",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider", variants[variant], className)} {...props}>
      {children}
    </span>
  );
};

export const Input = React.forwardRef(({ className, icon, label, ...props }, ref) => (
  <div className="space-y-1.5">
    {label && (
      <label className="ml-0.5 text-[11px] font-semibold uppercase tracking-wider text-secondary">{label}</label>
    )}
    <div className="relative">
      {icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-tertiary [&_svg]:size-[15px]">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full rounded-lg border border-border-light bg-surface text-[15px] text-primary placeholder:text-tertiary transition-[border-color,box-shadow] focus:border-accent-primary/35 focus:outline-none focus:ring-2 focus:ring-accent-primary/20',
          icon ? 'py-2.5 pl-10 pr-3' : 'px-3 py-2.5',
          className
        )}
        {...props}
      />
    </div>
  </div>
));
