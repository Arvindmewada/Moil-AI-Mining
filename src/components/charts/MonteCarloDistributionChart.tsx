import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { Sparkles, Activity } from 'lucide-react';

interface MonteCarloDistributionChartProps {
  p90: number;
  p50: number;
  p10: number;
  avgGradeMn: number;
  height?: number;
}

export const MonteCarloDistributionChart: React.FC<MonteCarloDistributionChartProps> = ({
  p90,
  p50,
  p10,
  avgGradeMn,
  height = 200,
}) => {
  // Generate a smooth bell curve with 19 sample intervals between conservative and optimistic bounds
  const span = Math.max(1, p10 - p90);
  const minVal = Math.max(0.5, p90 - span * 0.35);
  const maxVal = p10 + span * 0.35;
  const step = (maxVal - minVal) / 20;

  const chartData = [];
  const sigma = span / 2.56; // P90 to P10 covers ~2.56 sigma in normal distribution

  for (let i = 0; i <= 20; i++) {
    const tonnage = Math.round((minVal + i * step) * 100) / 100;
    // Normal distribution PDF
    const exponent = -0.5 * Math.pow((tonnage - p50) / (sigma || 1), 2);
    const probabilityDensity = Math.round(Math.exp(exponent) * 1000) / 10; // 0 to 100 relative height

    // Determine percentile category
    let tier = 'Inferred (333)';
    let confidence = 50;
    if (tonnage <= p90) {
      tier = 'Proved Reserve (111)';
      confidence = 90;
    } else if (tonnage <= p50) {
      tier = 'Probable Reserve (122)';
      confidence = 75;
    } else if (tonnage <= p10) {
      tier = 'Indicated Resource (222)';
      confidence = 30;
    } else {
      tier = 'Exploration Potential';
      confidence = 10;
    }

    const containedMn = Math.round((tonnage * (avgGradeMn / 100)) * 100) / 100;
    const valuationCr = Math.round(tonnage * 1_000_000 * 10500 * (avgGradeMn / 44) / 10_000_000);

    chartData.push({
      tonnage,
      tonnageLabel: `${tonnage} MT`,
      probabilityDensity,
      tier,
      confidence,
      containedMn,
      valuationCr,
    });
  }

  // Custom Interactive Tooltip
  const CustomDistributionTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-950/95 border border-violet-700/80 shadow-2xl rounded-xl p-3.5 text-xs text-zinc-100 backdrop-blur-xl min-w-[270px] animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
            <span className="font-extrabold text-sm text-violet-300 font-mono">{data.tonnageLabel}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-950 border border-violet-700 text-violet-300 font-bold">
              {data.confidence}% Probable
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">UNFC Classification:</span>
              <span className="font-semibold text-zinc-200">{data.tier}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Contained Metal:</span>
              <span className="font-mono font-bold text-emerald-400">{data.containedMn} MT Mn</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Gross Ore Valuation:</span>
              <span className="font-mono font-bold text-amber-400">₹{data.valuationCr.toLocaleString()} Cr</span>
            </div>

            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
              <span>Geostatistical Curve Density:</span>
              <span className="font-mono text-violet-400 font-bold">{data.probabilityDensity}% peak</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-violet-400" />
          Continuous Geostatistical Probability Density Curve
        </span>
        <span className="text-[10px] font-mono text-zinc-500">
          Interactive Recharts Tooltip: Hover to inspect confidence &amp; valuation
        </span>
      </div>

      <div className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl p-3" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 15, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="monteCarloAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />

            <XAxis
              dataKey="tonnage"
              stroke="#71717a"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#3f3f46' }}
              tickFormatter={(v) => `${v} MT`}
            />

            <YAxis
              stroke="#71717a"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#3f3f46' }}
              tickFormatter={(v) => `${v}%`}
            />

            <Tooltip content={<CustomDistributionTooltip />} />

            {/* P90 Conservative Reference Line */}
            <ReferenceLine
              x={p90}
              stroke="#e4e4e7"
              strokeDasharray="3 3"
              label={{ value: 'P90', fill: '#d4d4d8', fontSize: 10, position: 'top' }}
            />

            {/* P50 Median Reference Line */}
            <ReferenceLine
              x={p50}
              stroke="#a855f7"
              strokeWidth={2}
              label={{ value: 'P50 Median', fill: '#c084fc', fontSize: 10, position: 'top' }}
            />

            {/* P10 Optimistic Reference Line */}
            <ReferenceLine
              x={p10}
              stroke="#38bdf8"
              strokeDasharray="3 3"
              label={{ value: 'P10', fill: '#7dd3fc', fontSize: 10, position: 'top' }}
            />

            <Area
              type="monotone"
              dataKey="probabilityDensity"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              fill="url(#monteCarloAreaGrad)"
              activeDot={{ r: 5, fill: '#c084fc', stroke: '#09090b', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
