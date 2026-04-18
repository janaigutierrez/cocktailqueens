import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = ({ label, className = '', ...props }: InputProps) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-semibold text-rosa-600 mb-1.5">{label}</label>
    )}
    <input
      className={`w-full px-4 py-3 rounded-2xl border border-rosa-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-rosa-400 focus:border-transparent transition-all placeholder:text-rosa-300 ${className}`}
      {...props}
    />
  </div>
);
