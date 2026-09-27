import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  delta?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: {
    text: string;
    variant: 'default' | 'success' | 'warning' | 'danger' | 'purple';
  };
  accentColor?: string;
  onClick?: () => void;
  tooltip?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  delta,
  subtitle,
  icon,
  badge,
  onClick,
  tooltip,
}) => {
  const getBadgeClass = (variant?: 'default' | 'success' | 'warning' | 'danger' | 'purple') => {
    switch (variant) {
      case 'success':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'warning':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'danger':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'purple':
        return 'bg-violet-950 text-violet-300 border-violet-800';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      title={tooltip || (isClickable ? `Click to inspect ${title}` : undefined)}
      className={`bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 shadow-md flex flex-col justify-between transition-all duration-200 select-none group relative ${
        isClickable
          ? 'cursor-pointer hover:border-violet-600/80 hover:bg-zinc-850 hover:shadow-xl hover:shadow-violet-950/20 active:scale-[0.98]'
          : 'hover:border-zinc-700/80'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider group-hover:text-zinc-200 transition-colors">
          {title}
        </span>
        <div className="flex items-center gap-1.5">
          {isClickable && (
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-violet-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          )}
          {icon && (
            <div
              className={`p-1.5 rounded-lg bg-zinc-800/80 text-zinc-300 transition-transform duration-200 ${
                isClickable ? 'group-hover:scale-110 group-hover:bg-violet-950/80 group-hover:text-violet-300' : ''
              }`}
            >
              {icon}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <span className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100 tracking-tight group-hover:text-white transition-colors">
          {value}
        </span>
        {unit && <span className="text-xs text-zinc-400 font-medium">{unit}</span>}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-zinc-800/70 text-xs">
        {delta && (
          <div className="flex items-center gap-1">
            <span
              className={`font-semibold font-mono ${
                delta.isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {delta.isPositive ? '+' : ''}
              {delta.value}
            </span>
            {delta.label && <span className="text-[11px] text-zinc-500">{delta.label}</span>}
          </div>
        )}

        {subtitle && !delta && <span className="text-[11px] text-zinc-400">{subtitle}</span>}

        {badge && (
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getBadgeClass(
              badge.variant
            )}`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {isClickable && (
        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-500/40 group-hover:bg-violet-400 transition-colors" />
      )}
    </div>
  );
};
