import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => (
  <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg shadow-rosa-100/50 p-4 border border-rosa-100/50 ${className}`}>
    {children}
  </div>
);
