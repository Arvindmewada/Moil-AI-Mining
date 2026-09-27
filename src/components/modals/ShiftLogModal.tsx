import React, { useState } from 'react';
import { X, Clock, Pickaxe, CheckCircle2, AlertTriangle, ShieldCheck, Truck, Users, RefreshCw } from 'lucide-react';
import { MineLease } from '../../types';

interface ShiftLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMine: MineLease;
}

export const ShiftLogModal: React.FC<ShiftLogModalProps> = ({
  isOpen,
  onClose,
  activeMine,
}) => {
  const [activeShift, setActiveShift] = useState<'A' | 'B' | 'C'>('A');
  const [acknowledged, setAcknowledged] = useState(false);

  if (!isOpen) return null;

  const shiftData = {
    A: {
      name: 'Shift A (Morning)',
      time: '06:00 - 14:00 IST',
      supervisor: 'Er. R. K. Patle (Shift Incharge)',
      crews: 48,
      tonnesHauled: Math.round(activeMine.dailyTargetTonnes * 0.42),
      targetTonnes: Math.round(activeMine.dailyTargetTonnes * 0.40),
      dumperCycles: 64,
      blastingStatus: 'Pre-shift blast cleared at 05:30 IST',
      safetyStatus: 'Zero LTI (Lost Time Injury)',
      ventilationStatus: 'Auxiliary fan bank #2 at 94% flow',
      hoistCycles: 82,
    },
    B: {
      name: 'Shift B (Evening)',
      time: '14:00 - 22:00 IST',
      supervisor: 'Er. S. M. Deshmukh',
      crews: 42,
      tonnesHauled: Math.round(activeMine.dailyTargetTonnes * 0.38),
      targetTonnes: Math.round(activeMine.dailyTargetTonnes * 0.38),
      dumperCycles: 58,
      blastingStatus: 'Scheduled bench blast 21:30 IST',
      safetyStatus: 'Routine gas & roof bolt inspection passed',
      ventilationStatus: 'Full intake 112 m³/s active',
      hoistCycles: 74,
    },
    C: {
      name: 'Shift C (Night / Maintenance)',
      time: '22:00 - 06:00 IST',
      supervisor: 'Er. Amit Verma (Maint. Lead)',
      crews: 28,
      tonnesHauled: Math.round(activeMine.dailyTargetTonnes * 0.22),
      targetTonnes: Math.round(activeMine.dailyTargetTonnes * 0.22),
      dumperCycles: 34,
      blastingStatus: 'De-dusting and water spraying in progress',
      safetyStatus: 'Preventive belt overhaul at level -180m',
      ventilationStatus: 'Exhaust shaft dampers at nominal',
      hoistCycles: 40,
    },
  }[activeShift];

  const achievementRate = Math.round((shiftData.tonnesHauled / shiftData.targetTonnes) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-zinc-100 text-lg">Shift Operations & Production Log</h3>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Live Shift
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {activeMine.name} • Mining Method: {activeMine.method}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Shift Selector */}
          <div className="flex items-center gap-2 p-1.5 bg-zinc-950 rounded-xl border border-zinc-800">
            {(['A', 'B', 'C'] as const).map((shift) => (
              <button
                key={shift}
                onClick={() => setActiveShift(shift)}
                className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
                  activeShift === shift
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                Shift {shift} {shift === 'A' ? '(Current)' : ''}
              </button>
            ))}
          </div>

          {/* Shift KPI Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
              <span className="text-[11px] text-zinc-500 block">Actual Realization</span>
              <span className="text-lg font-bold text-amber-400">{shiftData.tonnesHauled.toLocaleString()} t</span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">+{achievementRate - 100}% of target</span>
            </div>
            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
              <span className="text-[11px] text-zinc-500 block">Shift Target</span>
              <span className="text-lg font-bold text-zinc-200">{shiftData.targetTonnes.toLocaleString()} t</span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">{shiftData.time}</span>
            </div>
            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
              <span className="text-[11px] text-zinc-500 block">Crew On-Duty</span>
              <span className="text-lg font-bold text-cyan-400">{shiftData.crews} Miners</span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">Incharge: {shiftData.supervisor.split(' ')[1]}</span>
            </div>
            <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
              <span className="text-[11px] text-zinc-500 block">Hoist Cycles</span>
              <span className="text-lg font-bold text-violet-400">{shiftData.hoistCycles} Skips</span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">{shiftData.dumperCycles} haul trucks</span>
            </div>
          </div>

          {/* Technical Diagnostics */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Shift Verification Checklist</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 bg-zinc-950/50 rounded-lg border border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-zinc-300">Safety & DGMS Compliance</span>
                </div>
                <span className="text-xs font-medium text-emerald-400">{shiftData.safetyStatus}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-zinc-950/50 rounded-lg border border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <Pickaxe className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-zinc-300">Blasting & Heading Clearance</span>
                </div>
                <span className="text-xs font-medium text-amber-300">{shiftData.blastingStatus}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-zinc-950/50 rounded-lg border border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-zinc-300">Underground Mine Ventilation</span>
                </div>
                <span className="text-xs font-medium text-cyan-300">{shiftData.ventilationStatus}</span>
              </div>
            </div>
          </div>

          {/* Handover Notice */}
          <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl flex items-start gap-3">
            <Users className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs font-semibold text-zinc-200">Shift Handover Protocol</span>
              <p className="text-xs text-zinc-400 mt-0.5">
                Logged by {shiftData.supervisor} at mine supervisory terminal. All active underground faces have been cleared for drill-blast and ore mucking.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          <div className="text-xs text-zinc-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Sync Frequency: 15-minute telemetry interval
          </div>
          <button
            onClick={() => {
              setAcknowledged(true);
              setTimeout(() => {
                setAcknowledged(false);
                onClose();
              }, 600);
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-lg text-xs transition-colors flex items-center gap-2"
          >
            {acknowledged ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Handover Acknowledged
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Acknowledge Shift Status
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
