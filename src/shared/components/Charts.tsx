import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { fmt } from '../../shared/utils/formatters';

export const MultiLineChart = ({ data, series, categories }: { data: any[], series: { key: string, name: string, color: string }[], categories: string[] }) => {
  return (
    <div className="w-full h-full min-h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#888' }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#888', fontFamily: 'JetBrains Mono' }} 
            tickFormatter={(v) => fmt.n(v)}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            itemStyle={{ fontSize: '11px' }}
            labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
          />
          {series.map((s) => (
            <Line 
              key={s.key}
              type="monotone" 
              dataKey={s.key} 
              name={s.name}
              stroke={s.color} 
              strokeWidth={2}
              dot={{ r: 3, fill: s.color }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DonutChart = ({ data, centerValue, centerLabel }: { data: { name: string, value: number, color: string }[], centerValue?: string, centerLabel?: string }) => {
  return (
    <div className="w-full h-full relative flex items-center justify-center min-h-[170px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
             formatter={(v: number) => fmt.n(v)}
             contentStyle={{ borderRadius: '4px', fontSize: '11px' }}
          />
        </PieChart>
      </ResponsiveContainer>
      {(centerValue || centerLabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold font-mono tracking-tighter text-gray-900">{centerValue}</span>
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">{centerLabel}</span>
        </div>
      )}
    </div>
  );
};

export const Sparkline = ({ data, color = '#2d4a34', height = 40 }: { data: number[], color?: string, height?: number }) => {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <Area 
            type="monotone" 
            dataKey="v" 
            stroke={color} 
            fill={`${color}20`} 
            strokeWidth={1.5} 
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
