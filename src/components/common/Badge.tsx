import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  variant?: 'premium' | 'basic' | 'gold' | 'success' | 'warning' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'sm',
  className = '',
  children
}) => {
  const baseStyles = 'inline-flex items-center font-label-caps uppercase tracking-wider rounded-full font-semibold';

  const variantStyles = {
    premium: 'bg-surface-cream text-deep-espresso border border-border-delicate shadow-sm',
    basic: 'bg-surface-subtle text-text-muted border border-border-delicate/60',
    gold: 'bg-gold-foil/20 text-deep-espresso border border-gold-foil/40',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-700/20',
    warning: 'bg-amber-50 text-amber-900 border border-amber-500/20',
    neutral: 'bg-surface-container-high text-on-surface-variant'
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs'
  };

  return (
    <span
      className={twMerge(
        clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)
      )}
    >
      {children}
    </span>
  );
};
