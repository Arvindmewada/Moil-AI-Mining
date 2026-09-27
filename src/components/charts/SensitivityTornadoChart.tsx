import React, { useState } from 'react';
import { AlertTriangle, Wrench, CloudRain, Zap, Sparkles, ChevronRight } from 'lucide-react';
import { MitigationSimulatorModal } from '../modals/MitigationSimulatorModal';

interface BottleneckItem {
  factor: string;
  impactPercentage: number;
  impactTonnes: number;
  mitigationHint: string;
}

interface SensitivityTornadoChartProps {
  bottlenecks: BottleneckItem[];
  totalShortfallTonnes: number;
  onMitigationApplied?: (savedTonnes: number) => void;
}

export const SensitivityTornadoChart: React.FC<SensitivityTornadoChartProps> = ({
  bottlenecks,
  totalShortfallTonnes,
  onMitigationApplied,
}) => {
  const [selectedBottleneck, setSelectedBottleneck] = useState<BottleneckItem | null>(null);

  const getIcon = (factor: string) => {
    if (factor.toLowerCase().includes('monsoon') || factor.toLowerCase().includes('water')) {
      return <CloudRain className="w-4 h-4 text-sky-400 shrink-0" />;
    }
    if (factor.toLowerCase().includes('power') || factor.toLowerCase().includes('grid')) {
      return <Zap className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    return <Wrench className="w-4 h-4 text-rose-400 shrink-0" />;
  };

  const getColor = (pct: number) => {
    if (pct >= 40) return 'bg-rose-500';
    if (pct >= 25) return 'bg-amber-500';
    return 'bg-sky-500';
  };

  return (
    <>
      <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Operational Bottleneck Sensitivity (Shortfall Drivers)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Contribution to total projected shortfall ({totalShortfallTonnes.toLocaleString()} Tonnes) • Click any driver to simulate mitigation
            </p>
          </div>
          <span className="text-[11px] text-violet-400 bg-violet-950/40 border border-violet-800/40 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Interactive Simulator
          </span>
        </div>

        <div className="space-y-4">
          {bottlenecks.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedBottleneck(item)}
              title={`Click to simulate AI mitigation for ${item.factor}`}
              className="bg-zinc-900/60 border border-zinc-800/80 hover:border-violet-500/60 hover:bg-zinc-850 rounded-xl p-3.5 transition-all duration-200 cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-between text-xs mb-2 gap-2">
                <div className="flex items-center gap-2 font-medium text-zinc-200 group-hover:text-amber-300 transition-colors">
                  <div className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 group-hover:border-amber-500/40 group-hover:bg-amber-500/10 transition-colors">
                    {getIcon(item.factor)}
                  </div>
                  <span className="font-semibold">{item.factor}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-semibold text-zinc-100">
                    {item.impactTonnes.toLocaleString()} Tonnes
                  </span>
                  <span className="font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-900/80 text-[11px]">
                    {item.impactPercentage}%
                  </span>
                  <div className="p-1 bg-zinc-800 rounded-md text-zinc-400 group-hover:text-amber-400 group-hover:bg-amber-500/10 transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-2.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getColor(item.impactPercentage)}`}
                  style={{ width: `${Math.max(5, Math.min(100, item.impactPercentage))}%` }}
                />
              </div>

              {/* Actionable Hint & Trigger Button */}
              <div className="flex items-center justify-between text-[11px] text-zinc-400 bg-zinc-950/70 p-2 rounded-lg border border-zinc-800/60 gap-2">
                <div className="flex items-start gap-1.5 flex-1">
                  <span className="text-emerald-400 font-semibold uppercase text-[10px] shrink-0">AI Action:</span>
                  <span className="line-clamp-1">{item.mitigationHint}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBottleneck(item);
                  }}
                  className="px-2 py-1 rounded bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/30 text-violet-300 text-[10px] font-semibold flex items-center gap-1 shrink-0 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-violet-400" />
                  Simulate Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mitigation Simulator Modal */}
      {selectedBottleneck && (
        <MitigationSimulatorModal
          isOpen={!!selectedBottleneck}
          factor={selectedBottleneck.factor}
          impactTonnes={selectedBottleneck.impactTonnes}
          impactPercentage={selectedBottleneck.impactPercentage}
          mitigationHint={selectedBottleneck.mitigationHint}
          onClose={() => setSelectedBottleneck(null)}
          onApplyMitigation={(saved) => {
            if (onMitigationApplied) onMitigationApplied(saved);
          }}
        />
      )}
    </>
  );
};
