import React, { useState } from 'react';
import { X, Wrench, CloudRain, Zap, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

interface MitigationSimulatorModalProps {
  isOpen: boolean;
  factor: string | null;
  impactTonnes: number;
  impactPercentage?: number;
  mitigationHint: string;
  onClose: () => void;
  onApplyMitigation: (savedTonnes: number) => void;
}

export const MitigationSimulatorModal: React.FC<MitigationSimulatorModalProps> = ({
  isOpen,
  factor,
  impactTonnes,
  impactPercentage = 30,
  mitigationHint,
  onClose,
  onApplyMitigation,
}) => {
  const [applied, setApplied] = useState(false);

  if (!isOpen || !factor) return null;

  const isRain = factor.toLowerCase().includes('monsoon') || factor.toLowerCase().includes('water');
  const isPower = factor.toLowerCase().includes('power') || factor.toLowerCase().includes('grid');

  const getIcon = () => {
    if (isRain) return <CloudRain className="w-6 h-6 text-sky-400" />;
    if (isPower) return <Zap className="w-6 h-6 text-amber-400" />;
    return <Wrench className="w-6 h-6 text-rose-400" />;
  };

  const recoveredTonnes = Math.round(impactTonnes * 0.72);

  const handleApply = () => {
    onApplyMitigation(recoveredTonnes);
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-800 border border-zinc-700">{getIcon()}</div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                Operational Mitigation Optimizer
              </h2>
              <span className="text-xs text-zinc-400 font-mono">1-Click Dispatch Simulation</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Target Bottleneck</span>
            <div className="text-base font-bold text-zinc-100 mt-0.5">{factor}</div>
            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-zinc-800/80 text-xs font-mono">
              <div>
                <span className="text-zinc-400 block text-[10px]">CURRENT DEFICIT</span>
                <span className="text-rose-400 font-bold">-{impactTonnes.toLocaleString()} Tonnes</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px]">SHORTFALL SHARE</span>
                <span className="text-amber-400 font-bold">{impactPercentage}% of Total Deficit</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-xl p-4 space-y-2">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Recommended Prescriptive Mitigation Action
            </span>
            <p className="text-xs text-zinc-200 leading-relaxed">{mitigationHint}</p>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3 text-xs flex items-center justify-between font-mono">
            <span className="text-zinc-400">Simulated Recovery Output:</span>
            <span className="font-bold text-emerald-400 text-sm">+{recoveredTonnes.toLocaleString()} Tonnes</span>
          </div>

          {applied && (
            <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-200 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Mitigation deployed! Recalculating production forecast...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={applied}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-950/50 active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply Mitigation to Plan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
