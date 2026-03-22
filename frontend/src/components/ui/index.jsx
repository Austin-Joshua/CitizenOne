import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef(({ className, variant = "primary", size = "default", children, ...props }, ref) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-[background-color,box-shadow,transform,color,border-color] duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-soft/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-45 disabled:pointer-events-none rounded-xl active:scale-[0.99]";

  const variants = {
    primary:
      "bg-accent-primary text-white shadow-elevated-sm hover:bg-accent-hover hover:shadow-elevated-md focus-visible:ring-offset-base",
    secondary:
      "border border-border-light bg-base text-primary shadow-xs hover:bg-surface hover:border-border-light",
    ghost: "bg-transparent text-secondary hover:bg-surface hover:text-primary",
    glass: "glass-button",
  };

  const sizes = {
    sm: "h-9 px-3.5 text-xs",
    default: "h-10 min-h-10 px-4 text-sm",
    lg: "h-11 min-h-11 px-5 text-[15px]",
  };

  return (
    <button ref={ref} className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
});

export const Card = ({ className, children, elevated = false, ...props }) => (
  <div
    className={cn(
      elevated ? 'glass-elevated p-4 sm:p-5' : 'app-card p-4 sm:p-5',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const Badge = ({ className, variant = "default", children, ...props }) => {
  const variants = {
    default: "bg-surface text-secondary border border-border-light",
    primary: "bg-accent-primary/10 text-accent-primary border-none",
    warning: "bg-semantic-warning-muted text-semantic-warning border-none",
    danger: "bg-semantic-error-muted text-semantic-error border-none",
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
          'w-full rounded-xl border border-border-light bg-surface text-[15px] text-primary shadow-xs placeholder:text-tertiary transition-[border-color,box-shadow] focus:border-accent-primary/40 focus:outline-none focus:ring-2 focus:ring-accent-soft/25 focus:shadow-elevated-sm',
          icon ? 'py-2.5 pl-10 pr-3' : 'px-3 py-2.5',
          className
        )}
        {...props}
      />
    </div>
  </div>
));
