import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import { MonthlyForecastItem } from '../../types';
import { CloudRain, Wrench, Zap, AlertTriangle, CheckCircle2, TrendingDown, Layers, BarChart2 } from 'lucide-react';

interface InteractiveBarChartProps {
  items: MonthlyForecastItem[];
  height?: number;
  title?: string;
  subtitle?: string;
}

export const InteractiveBarChart: React.FC<InteractiveBarChartProps> = ({
  items,
  height = 260,
  title = 'Target vs Predicted Monthly Production (Tonnes)',
  subtitle = 'Hover over any monthly bar for detailed operational loss and run-rate breakdowns',
}) => {
  const [displayMode, setDisplayMode] = useState<'grouped' | 'stacked' | 'shortfall'>('grouped');

  if (!items || items.length === 0) {
    return <div className="p-4 text-center text-sm text-zinc-500">No forecast data available</div>;
  }

  const chartData = items.map((item) => {
    const isShortfall = item.shortfallTonnes > 0;
    const achievementPct = Math.round((item.predictedTonnes / item.targetTonnes) * 1000) / 10;
    const dailyTarget = Math.round(item.targetTonnes / 26);
    const dailyActual = Math.round(item.predictedTonnes / 26);
    const dailyShortfall = Math.max(0, dailyTarget - dailyActual);

    return {
      month: item.month.split(' ')[0],
      monthFull: item.month,
      targetTonnes: item.targetTonnes,
      predictedTonnes: item.predictedTonnes,
      shortfallTonnes: item.shortfallTonnes,
      shortfallPercent: item.shortfallPercent,
      achievementPct,
      dailyTarget,
      dailyActual,
      dailyShortfall,
      monsoonLoss: item.monsoonImpactTonnes,
      equipmentLoss: item.equipmentDowntimeTonnes,
      powerLoss: item.powerInterruptionTonnes,
      riskLevel: item.riskLevel,
      isShortfall,
    };
  });

  // Custom Interactive Tooltip
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const hasDeficit = data.shortfallTonnes > 0;

      return (
        <div className="bg-zinc-950/95 border border-zinc-700/90 shadow-2xl rounded-2xl p-4 text-xs text-zinc-100 backdrop-blur-xl min-w-[320px] max-w-[350px] animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 mb-3">
            <div>
              <span className="font-extrabold text-sm text-zinc-100 tracking-tight">{data.monthFull}</span>
              <span className="text-[10px] text-zinc-400 block font-mono">Monthly Extraction Profile</span>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase border shadow-sm ${
                data.riskLevel === 'Critical'
                  ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                  : data.riskLevel === 'High'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                  : data.riskLevel === 'Moderate'
                  ? 'bg-sky-950/80 text-sky-300 border-sky-800'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
              }`}
            >
              {data.riskLevel} Risk
            </span>
          </div>

          {/* Achievement Bar */}
          <div className="mb-3 bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-2.5">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-zinc-400">Target Fulfillment:</span>
              <span className={`font-mono font-bold ${data.achievementPct >= 100 ? 'text-emerald-400' : data.achievementPct >= 85 ? 'text-amber-400' : 'text-rose-400'}`}>
                {data.achievementPct}% ({data.predictedTonnes.toLocaleString()} / {data.targetTonnes.toLocaleString()} T)
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  data.achievementPct >= 100 ? 'bg-emerald-500' : data.achievementPct >= 85 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, data.achievementPct)}%` }}
              />
            </div>
          </div>

          {/* Core Metrics */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-900/50">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-zinc-500" />
                <span>Scheduled Target:</span>
              </span>
              <span className="font-mono font-semibold text-zinc-200">
                {data.targetTonnes.toLocaleString()} Tonnes
              </span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-900/50">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span>Predicted Realization:</span>
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {data.predictedTonnes.toLocaleString()} Tonnes
              </span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-900/50">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                <span>Shortfall Deficit:</span>
              </span>
              <span className={`font-mono font-bold ${hasDeficit ? 'text-rose-400' : 'text-emerald-400'}`}>
                {hasDeficit ? `-${data.shortfallTonnes.toLocaleString()} T (${data.shortfallPercent}%)` : 'None (On Target)'}
              </span>
            </div>

            {/* Run-Rate Daily Breakdown */}
            <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">Daily Run-Rate</span>
                <span className="text-zinc-200 font-bold">{data.dailyActual.toLocaleString()} T/day</span>
                <span className="text-[9px] text-zinc-500 block mt-0.5">Plan: {data.dailyTarget.toLocaleString()} T/d</span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">Daily Deficit</span>
                <span className={`font-bold ${data.dailyShortfall > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {data.dailyShortfall > 0 ? `-${data.dailyShortfall.toLocaleString()} T/d` : '0 T/d'}
                </span>
                <span className="text-[9px] text-zinc-500 block mt-0.5">3 Shifts/day</span>
              </div>
            </div>

            {/* Loss Factor Derate Badges */}
            {hasDeficit && (
              <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Loss Contribution Breakdown:
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                  <div className="p-1.5 rounded bg-sky-950/40 border border-sky-900/60 text-sky-300">
                    <div className="flex items-center gap-1 text-[9px] text-sky-400 mb-0.5">
                      <CloudRain className="w-3 h-3" />
                      <span>Monsoon</span>
                    </div>
                    <span>-{data.monsoonLoss.toLocaleString()} T</span>
                  </div>
                  <div className="p-1.5 rounded bg-rose-950/40 border border-rose-900/60 text-rose-300">
                    <div className="flex items-center gap-1 text-[9px] text-rose-400 mb-0.5">
                      <Wrench className="w-3 h-3" />
                      <span>Fleet Maint.</span>
                    </div>
                    <span>-{data.equipmentLoss.toLocaleString()} T</span>
                  </div>
                  <div className="p-1.5 rounded bg-amber-950/40 border border-amber-900/60 text-amber-300">
                    <div className="flex items-center gap-1 text-[9px] text-amber-400 mb-0.5">
                      <Zap className="w-3 h-3" />
                      <span>Grid Dip</span>
                    </div>
                    <span>-{data.powerLoss.toLocaleString()} T</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 shadow-lg select-none">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-violet-400" />
            {title}
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Display Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-1 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setDisplayMode('grouped')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
              displayMode === 'grouped'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Grouped Target vs Actual
          </button>
          <button
            type="button"
            onClick={() => setDisplayMode('shortfall')}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
              displayMode === 'shortfall'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Shortfall Gap Focus
          </button>
        </div>
      </div>

      {/* Recharts BarChart Container */}
      <div className="w-full bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-3" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 15, right: 15, left: 10, bottom: 5 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />

            <XAxis
              dataKey="month"
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#3f3f46' }}
            />

            <YAxis
              stroke="#71717a"
              fontSize={10}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k T`}
              tickLine={false}
              axisLine={{ stroke: '#3f3f46' }}
            />

            {/* Interactive Tooltip with Rich Detailed Metrics */}
            <Tooltip
              content={<CustomBarTooltip />}
              cursor={{ fill: 'rgba(139, 92, 246, 0.08)' }}
            />

            {displayMode === 'grouped' && (
              <>
                <Bar
                  dataKey="targetPlan"
                  name="Target Scheduled"
                  fill="#52525b"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="predictedTonnes"
                  name="Predicted Output"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="shortfallTonnes"
                  name="Shortfall Deficit"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </>
            )}

            {displayMode === 'shortfall' && (
              <Bar
                dataKey="shortfallTonnes"
                name="Shortfall Deficit (Tonnes)"
                radius={[6, 6, 0, 0]}
                maxBarSize={45}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.shortfallTonnes > 6000 ? '#e11d48' : entry.shortfallTonnes > 2000 ? '#f59e0b' : '#10b981'}
                  />
                ))}
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Explanatory Footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-2 px-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-zinc-600 rounded-sm inline-block" />
            <span>Target Plan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-emerald-500 rounded-sm inline-block" />
            <span>Predicted Output</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-rose-500 rounded-sm inline-block" />
            <span>Shortfall Deficit</span>
          </div>
        </div>

        <div className="text-[11px] text-zinc-500 font-mono">
          Interactive Tooltip: Hover over any bar to view monsoon, equipment, and run-rate breakdowns
        </div>
      </div>
    </div>
  );
};
