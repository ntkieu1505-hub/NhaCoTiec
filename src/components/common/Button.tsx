import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'subtle' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-label-md font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-full';

  const variantStyles = {
    primary: 'bg-burgundy-wine text-surface-cream hover:bg-[#851622] shadow-md shadow-rose-950/20',
    secondary: 'bg-deep-espresso text-surface-cream hover:bg-[#1a1715] shadow-sm',
    outline: 'border border-burgundy-wine/40 bg-surface-card text-deep-espresso hover:bg-surface-subtle/50',
    subtle: 'bg-surface-subtle text-deep-espresso hover:bg-surface-container-high border border-border-delicate',
    ghost: 'text-deep-espresso hover:bg-surface-subtle',
    danger: 'bg-error text-white hover:bg-red-700'
  };

  const sizeStyles = {
    sm: 'h-8 px-3 text-xs gap-1',
    md: 'h-10 px-5 text-sm gap-1.5',
    lg: 'h-12 px-7 text-base gap-2 font-semibold'
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )
      )}
      {...props}
    >
      {children}
    </button>
  );
};
