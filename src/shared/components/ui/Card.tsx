import React from 'react';
import { cn } from './Button';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  variant?: 'white' | 'dark' | 'cream';
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  subtitle, 
  children, 
  className, 
  headerAction,
  variant = 'white'
}) => {
  const bgStyles = {
    white: 'bg-white border-gray-100',
    dark: 'bg-[#0e1111] border-[#272b2c] text-cream-100',
    cream: 'bg-cream-100 border-cream-200',
  };

  return (
    <div className={cn(
      "border flex flex-col p-4 shadow-sm",
      bgStyles[variant],
      className
    )}>
      {(title || subtitle || headerAction) && (
        <div className="flex justify-between items-start mb-4">
          <div>
            {title && <h3 className={cn("text-sm font-semibold", variant === 'dark' ? 'text-cream-50' : 'text-gray-900')}>{title}</h3>}
            {subtitle && <p className="text-[10px] uppercase tracking-wider text-gray-500 mt-0.5 font-mono">{subtitle}</p>}
          </div>
          {headerAction}
        </div>
      )}
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
};
