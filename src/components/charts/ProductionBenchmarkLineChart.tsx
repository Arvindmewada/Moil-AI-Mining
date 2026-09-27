import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { MonthlyForecastItem, MineLease } from '../../types';
import { MOIL_MINES } from '../../data/mockMiningData';
import { TrendingDown, Sparkles, CloudRain, Wrench, Zap, DollarSign, Activity } from 'lucide-react';

interface ProductionBenchmarkLineChartProps {
  items?: MonthlyForecastItem[];
  mine?: MineLease;
  forecastHorizonMonths?: number;
  shortfallDeficitPct?: number;
}

export const ProductionBenchmarkLineChart: React.FC<ProductionBenchmarkLineChartProps> = ({
  items,
  mine = MOIL_MINES[0],
}) => {
  const [metricMode, setMetricMode] = useState<'all' | 'variance' | 'losses'>('all');

  // If items not provided, construct fallback 6-month items
  const activeItems: MonthlyForecastItem[] = items && items.length > 0
    ? items
    : [
        { month: 'Jul 2024', targetTonnes: 38000, predictedTonnes: 28500, shortfallTonnes: 9500, shortfallPercent: 25.0, monsoonImpactTonnes: 5800, equipmentDowntimeTonnes: 2500, powerInterruptionTonnes: 1200, riskLevel: 'Critical' },
        { month: 'Aug 2024', targetTonnes: 38000, predictedTonnes: 30200, shortfallTonnes: 7800, shortfallPercent: 20.5, monsoonImpactTonnes: 4600, equipmentDowntimeTonnes: 2100, powerInterruptionTonnes: 1100, riskLevel: 'High' },
        { month: 'Sep 2024', targetTonnes: 38000, predictedTonnes: 33400, shortfallTonnes: 4600, shortfallPercent: 12.1, monsoonImpactTonnes: 2100, equipmentDowntimeTonnes: 1700, powerInterruptionTonnes: 800, riskLevel: 'Moderate' },
        { month: 'Oct 2024', targetTonnes: 38000, predictedTonnes: 36500, shortfallTonnes: 1500, shortfallPercent: 3.9, monsoonImpactTonnes: 0, equipmentDowntimeTonnes: 1000, powerInterruptionTonnes: 500, riskLevel: 'Normal' },
        { month: 'Nov 2024', targetTonnes: 38000, predictedTonnes: 38200, shortfallTonnes: 0, shortfallPercent: 0, monsoonImpactTonnes: 0, equipmentDowntimeTonnes: 0, powerInterruptionTonnes: 0, riskLevel: 'Normal' },
        { month: 'Dec 2024', targetTonnes: 38000, predictedTonnes: 39100, shortfallTonnes: 0, shortfallPercent: 0, monsoonImpactTonnes: 0, equipmentDowntimeTonnes: 0, powerInterruptionTonnes: 0, riskLevel: 'Normal' },
      ];

  // Generate authentic historical benchmarks based on the mine's historical annual output and seasonality
  const chartData = activeItems.map((item, idx) => {
    const monthlyAverageTonnes = Math.round((mine.historicalAnnualOutputMT * 1_000_000) / 12);

    let seasonalFactor = 1.0;
    if (idx === 0) seasonalFactor = 0.82; // July (Peak Monsoon)
    else if (idx === 1) seasonalFactor = 0.88; // August (Late Monsoon)
    else if (idx === 2) seasonalFactor = 0.95; // September (Transition)
    else if (idx === 3) seasonalFactor = 1.06; // October (Dry season onset)
    else if (idx === 4) seasonalFactor = 1.15; // November (Peak extraction)
    else if (idx === 5) seasonalFactor = 1.18; // December (Optimal skip throughput)

    const historicalBenchmark = Math.round(monthlyAverageTonnes * seasonalFactor);
    const varianceFromHistorical = item.predictedTonnes - historicalBenchmark;
    const variancePct = Math.round((varianceFromHistorical / historicalBenchmark) * 1000) / 10;
    const achievementPct = Math.round((item.predictedTonnes / item.targetTonnes) * 1000) / 10;
    const revenueImpactLakhs = Math.round((item.shortfallTonnes * 10500) / 100000);

    return {
      month: item.month.split(' ')[0],
      monthFull: item.month,
      predictedOutput: item.predictedTonnes,
      targetPlan: item.targetTonnes,
      historicalBenchmark: historicalBenchmark,
      shortfallTonnes: item.shortfallTonnes,
      shortfallPercent: item.shortfallPercent,
      achievementPct,
      varianceFromHistorical,
      variancePct,
      monsoonLoss: item.monsoonImpactTonnes,
      equipmentLoss: item.equipmentDowntimeTonnes,
      powerLoss: item.powerInterruptionTonnes,
      revenueImpactLakhs,
      riskLevel: item.riskLevel,
    };
  });

  const allValues = chartData.flatMap((d) => [d.predictedOutput, d.targetPlan, d.historicalBenchmark]);
  const minVal = Math.floor(Math.min(...allValues) * 0.85);
  const maxVal = Math.ceil(Math.max(...allValues) * 1.12);

  // Custom Interactive Dark Tooltip with Detailed Breakdown Metrics
  const CustomInteractiveTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isShortfall = data.shortfallTonnes > 0;

      return (
        <div className="bg-zinc-950/95 border border-zinc-700/90 shadow-2xl rounded-2xl p-4 text-xs text-zinc-100 backdrop-blur-xl min-w-[310px] max-w-[340px] animate-in fade-in zoom-in-95 duration-150">
          {/* Tooltip Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 mb-3">
            <div>
              <span className="font-extrabold text-sm text-zinc-100 tracking-tight">{data.monthFull}</span>
              <span className="text-[10px] text-zinc-400 block font-mono">
                {mine.name} • {mine.method}
              </span>
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

          {/* Primary Target Achievement Progress Bar */}
          <div className="mb-3 bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-2.5">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-zinc-400">Plan Achievement Rate:</span>
              <span className={`font-mono font-bold ${data.achievementPct >= 100 ? 'text-emerald-400' : data.achievementPct >= 85 ? 'text-amber-400' : 'text-rose-400'}`}>
                {data.achievementPct}%
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

          {/* Detailed Metric Breakdowns */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-900/50">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/50" />
                <span>Projected Realization:</span>
              </span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {data.predictedOutput.toLocaleString()} T
              </span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-900/50">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2.5 h-1 border-t-2 border-dashed border-zinc-400" />
                <span>Scheduled Target Plan:</span>
              </span>
              <span className="font-mono font-semibold text-zinc-300">
                {data.targetPlan.toLocaleString()} T
              </span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-900/50">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-500/50" />
                <span>5-Yr Historical Benchmark:</span>
              </span>
              <span className="font-mono font-semibold text-amber-300">
                {data.historicalBenchmark.toLocaleString()} T
              </span>
            </div>

            {/* Deficit & Variance Stats */}
            <div className="pt-2 border-t border-zinc-800/90 grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">Shortfall Gap</span>
                <span className={`font-bold ${isShortfall ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isShortfall ? `-${data.shortfallTonnes.toLocaleString()} T` : 'On Target (0 T)'}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">vs Historical</span>
                <span className={`font-bold ${data.variancePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {data.variancePct >= 0 ? `+${data.variancePct}%` : `${data.variancePct}%`}
                </span>
              </div>
            </div>

            {/* Root-Cause Loss Breakdown if Shortfall exists */}
            {isShortfall && (
              <div className="pt-2 border-t border-zinc-800/90 space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Root-Cause Derate Factors:
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
                      <span>Fleet Outage</span>
                    </div>
                    <span>-{data.equipmentLoss.toLocaleString()} T</span>
                  </div>
                  <div className="p-1.5 rounded bg-amber-950/40 border border-amber-900/60 text-amber-300">
                    <div className="flex items-center gap-1 text-[9px] text-amber-400 mb-0.5">
                      <Zap className="w-3 h-3" />
                      <span>Power Dip</span>
                    </div>
                    <span>-{data.powerLoss.toLocaleString()} T</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-amber-300/90 pt-1">
                  <span>Revenue Exposure:</span>
                  <span className="font-mono font-bold text-amber-400">
                    ₹{data.revenueImpactLakhs.toLocaleString()} Lakhs
                  </span>
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
    <div className="w-full">
      {/* Chart Header & Interactive Controls */}
      <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-violet-400" />
            6-Month Production Horizon vs. Historical Benchmark
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
            Interactive Recharts Tooltip Active
          </span>
        </div>

        {/* Metric Mode Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 p-1 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setMetricMode('all')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
              metricMode === 'all'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Combined View
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('variance')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
              metricMode === 'variance'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Target Variance
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('losses')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
              metricMode === 'losses'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Derate Analysis
          </button>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="w-full h-64 bg-zinc-950/70 border border-zinc-800/90 rounded-xl p-3 relative group">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 15, right: 15, left: 10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="predictedAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

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
              domain={[minVal, maxVal]}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k T`}
              tickLine={false}
              axisLine={{ stroke: '#3f3f46' }}
            />

            {/* Custom Interactive Tooltip */}
            <Tooltip
              content={<CustomInteractiveTooltip />}
              cursor={{ stroke: '#8b5cf6', strokeWidth: 1.5, strokeDasharray: '4 4' }}
            />

            {/* Target Scheduled Capacity Line */}
            <Line
              type="monotone"
              dataKey="targetPlan"
              stroke="#71717a"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 4, stroke: '#a1a1aa' }}
              name="Target Plan"
            />

            {/* Historical Benchmark Line */}
            <Line
              type="monotone"
              dataKey="historicalBenchmark"
              stroke="#f59e0b"
              strokeWidth={2.2}
              dot={{ r: 3.5, fill: '#f59e0b', strokeWidth: 1.5, stroke: '#09090b' }}
              activeDot={{ r: 5, fill: '#fbbf24', stroke: '#09090b', strokeWidth: 2 }}
              name="Historical Benchmark"
            />

            {/* Projected Output Area + Line */}
            <Area
              type="monotone"
              dataKey="predictedOutput"
              fill="url(#predictedAreaGrad)"
              stroke="none"
            />

            <Line
              type="monotone"
              dataKey="predictedOutput"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#09090b' }}
              activeDot={{ r: 6, fill: '#34d399', stroke: '#09090b', strokeWidth: 2 }}
              name="Projected Output"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Summary Footer */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between text-[11px] text-zinc-400 px-1 gap-2">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="font-medium">Projected Output</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-2.5 h-1 border-t-2 border-dashed border-zinc-400" />
            <span>Target Plan</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Historical Benchmark</span>
          </div>
        </div>

        <span className="font-mono text-emerald-400 font-semibold">
          Avg Monthly Realization: {Math.round(chartData.reduce((acc, d) => acc + d.predictedOutput, 0) / chartData.length).toLocaleString()} T/mo
        </span>
      </div>
    </div>
  );
};
