import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variants = {
  primary: 'bg-gradient-to-r from-rosa-500 to-lila-500 hover:from-rosa-600 hover:to-lila-600 text-white shadow-lg shadow-rosa-200',
  secondary: 'bg-white hover:bg-rosa-50 text-rosa-600 border border-rosa-200 shadow-sm',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200',
  gold: 'bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-white shadow-lg shadow-gold-200',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-6 py-3.5 text-lg',
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) => (
  <button
    className={`rounded-2xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);
