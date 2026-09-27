import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export interface LineChartPoint {
  label: string;
  values: Record<string, number>;
}

export interface LineSeriesConfig {
  key: string;
  label: string;
  color: string;
  dashed?: boolean;
}

interface InteractiveLineChartProps {
  data: LineChartPoint[];
  series: LineSeriesConfig[];
  unit?: string;
  height?: number;
  title?: string;
}

export const InteractiveLineChart: React.FC<InteractiveLineChartProps> = ({
  data,
  series,
  unit = 'Tonnes',
  height = 240,
  title,
}) => {
  if (!data || data.length === 0) {
    return <div className="p-4 text-center text-sm text-zinc-500">No chart data available</div>;
  }

  // Format data for Recharts: flatten values into top-level keys
  const formattedData = data.map((d) => ({
    name: d.label,
    ...d.values,
  }));

  // Custom Interactive Tooltip
  const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950/95 border border-zinc-700/90 shadow-2xl rounded-xl p-3.5 text-xs text-zinc-100 backdrop-blur-md min-w-[220px] animate-in fade-in zoom-in-95 duration-100">
          <div className="font-bold text-zinc-200 border-b border-zinc-800 pb-1.5 mb-2 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-zinc-400 font-mono">{unit}</span>
          </div>
          <div className="space-y-1.5">
            {payload.map((entry: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span>{entry.name}:</span>
                </span>
                <span className="font-mono font-bold text-zinc-100">
                  {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value} {unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {title && (
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
          {title}
        </div>
      )}
      <div className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl p-3" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#3f3f46' }}
            />
            <YAxis
              stroke="#71717a"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#3f3f46' }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomLineTooltip />} />
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2.5}
                strokeDasharray={s.dashed ? '4 4' : undefined}
                dot={{ r: 3.5, strokeWidth: 1.5, stroke: '#09090b', fill: s.color }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: '#09090b' }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
