import React from 'react';
import { cn } from './Button';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string | number; label: string }[];
  variant?: 'light' | 'dark';
}

export const Select: React.FC<SelectProps> = ({ label, options, variant = 'light', className, ...props }) => {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label className={cn(
        "text-[9px] uppercase tracking-[0.1em] font-bold",
        variant === 'dark' ? "text-gray-500" : "text-gray-400"
      )}>
        {label}
      </label>
      <select
        className={cn(
          "px-2 py-1.5 text-xs rounded border transition-all cursor-pointer font-sans",
          variant === 'light' 
            ? "bg-white border-gray-200 text-gray-900 focus:border-forest-500" 
            : "bg-[#1a1f20] border-[#272b2c] text-cream-100 focus:border-forest-400"
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
};
