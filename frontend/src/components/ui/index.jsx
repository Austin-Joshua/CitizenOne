import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef(({ className, variant = "primary", size = "default", children, ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-bold tracking-wide uppercase transition-all focus:outline-none focus:ring-2 focus:ring-accent-primary/50 disabled:opacity-50 disabled:pointer-events-none rounded-xl";
  
  const variants = {
    primary: "bg-accent-primary text-white hover:bg-accent-primary/90 shadow-md shadow-accent-primary/20",
    secondary: "bg-glass-base border border-border-light text-primary hover:bg-surface shadow-sm",
    ghost: "bg-transparent text-secondary hover:text-primary hover:bg-glass-base",
    glass: "glass-button"
  };

  const sizes = {
    sm: "h-9 px-4 text-[10px]",
    default: "h-11 px-6 text-xs",
    lg: "h-14 px-8 text-sm"
  };

  return (
    <button ref={ref} className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
});

export const Card = ({ className, children, elevated = false, ...props }) => (
  <div className={cn(elevated ? "glass-elevated py-8 px-10" : "glass-panel p-6", className)} {...props}>
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
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", variants[variant], className)} {...props}>
      {children}
    </span>
  );
};

export const Input = React.forwardRef(({ className, icon, label, ...props }, ref) => (
  <div className="space-y-2">
    {label && <label className="text-[11px] font-black uppercase tracking-widest text-secondary ml-1">{label}</label>}
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-tertiary">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full bg-surface border border-border-light rounded-xl text-[15px] text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary transition-all",
          icon ? "pl-12 pr-4 py-3.5" : "px-4 py-3.5",
          className
        )}
        {...props}
      />
    </div>
  </div>
));
