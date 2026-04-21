import React from 'react';
import { fmt } from '../utils/formatters';
import { cn } from './ui/Button';

export function StatusPill({ pct, size = 'md' }: { pct: number; size?: 'sm' | 'md' }) {
  let colorClass = 'text-institutional-green bg-institutional-green/10';
  let dotClass = 'bg-institutional-green';
  let label = 'En norma';

  if (pct > 15) {
    colorClass = 'text-institutional-amber bg-institutional-amber/10';
    dotClass = 'bg-institutional-amber';
    label = 'Alerta';
  }
  if (pct > 30) {
    colorClass = 'text-institutional-red bg-institutional-red/10';
    dotClass = 'bg-institutional-red';
    label = 'Crítico';
  }

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 font-medium rounded-full",
      size === 'sm' ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
      colorClass
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", dotClass)} />
      {label} · {fmt.pct(pct, 1)}
    </span>
  );
}

export function ProgressBar({ value, max, color = '#2d4a34', bg = 'rgba(0,0,0,0.05)', height = 8 }: { value: number; max: number; color?: string; bg?: string; height?: number }) {
  const pct = Math.min(100, Math.max(0, (value / (max || 1)) * 100));
  return (
    <div className="w-full relative overflow-hidden rounded-sm" style={{ height, backgroundColor: bg }}>
      <div 
        className="h-full transition-all duration-500 ease-out" 
        style={{ width: `${pct}%`, backgroundColor: color }} 
      />
    </div>
  );
}
