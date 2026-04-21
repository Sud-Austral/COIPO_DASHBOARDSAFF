import React from 'react';
import { cn } from './ui/Button';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  align?: 'left' | 'right' | 'center';
  mono?: boolean;
  muted?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  maxRows?: number;
  striped?: boolean;
  onRowClick?: (row: T) => void;
  className?: string;
  variant?: 'light' | 'dark';
}

export function DataTable<T extends { id?: string | number }>({ 
  columns, 
  rows, 
  maxRows = 20, 
  striped = true, 
  onRowClick,
  className,
  variant = 'light'
}: DataTableProps<T>) {
  const rowList = rows.slice(0, maxRows);

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-[11px] sm:text-xs text-left">
        <thead className={cn(
          "sticky top-0 z-10",
          variant === 'light' ? "bg-cream-50 text-gray-500" : "bg-[#0e1111] text-gray-500"
        )}>
          <tr>
            {columns.map((col, i) => (
              <th 
                key={i} 
                className={cn(
                  "p-2 font-bold uppercase tracking-wider border-b",
                  variant === 'light' ? "border-gray-100" : "border-[#272b2c]",
                  col.align === 'right' ? "text-right" : col.align === 'center' ? "text-center" : "text-left"
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={variant === 'light' ? "text-gray-900" : "text-cream-400"}>
          {rowList.map((row, i) => (
            <tr 
              key={row.id || i}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "transition-colors",
                onRowClick && "cursor-pointer",
                striped && i % 2 !== 0 && (variant === 'light' ? "bg-gray-50/50" : "bg-[#1a1f20]"),
                onRowClick && (variant === 'light' ? "hover:bg-forest-50" : "hover:bg-forest-500/10")
              )}
            >
              {columns.map((col, j) => (
                <td 
                  key={j} 
                  className={cn(
                    "p-2 border-b",
                    variant === 'light' ? "border-gray-50" : "border-[#272b2c]/30",
                    col.mono && "font-mono font-medium",
                    col.muted && (variant === 'light' ? "text-gray-400" : "text-gray-500"),
                    col.align === 'right' ? "text-right" : col.align === 'center' ? "text-center" : "text-left"
                  )}
                >
                  {col.render ? col.render(row) : (row as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="p-8 text-center text-gray-400 italic">
          No se encontraron registros activos.
        </div>
      )}
    </div>
  );
}
