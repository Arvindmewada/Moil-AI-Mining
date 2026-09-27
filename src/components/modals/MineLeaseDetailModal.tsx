import React from 'react';
import { X, MapPin, Pickaxe, Layers, TrendingDown, Database, ArrowRight, ShieldCheck } from 'lucide-react';
import { MineLease } from '../../types';
import { MOIL_MINES } from '../../data/mockMiningData';

interface MineLeaseDetailModalProps {
  isOpen: boolean;
  mine: MineLease | null;
  onClose: () => void;
  onSelectMine: (mine: MineLease) => void;
  onNavigateToTab?: (tab: 'reserve' | 'production' | 'data') => void;
}

export const MineLeaseDetailModal: React.FC<MineLeaseDetailModalProps> = ({
  isOpen,
  mine,
  onClose,
  onSelectMine,
  onNavigateToTab,
}) => {
  if (!isOpen || !mine) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Mine Title & Method */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-950/80 border border-violet-800 text-violet-400">
              <Pickaxe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-100">{mine.name}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-950 text-violet-300 border border-violet-800">
                  {mine.status}
                </span>
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                <span>
                  {mine.district} District, {mine.state} • {mine.coordinates.lat.toFixed(4)}°N, {mine.coordinates.lng.toFixed(4)}°E
                </span>
              </p>
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
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Key Mine Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Mining Method</span>
              <span className="text-sm font-bold text-zinc-100 mt-1 block">{mine.method}</span>
              <span className="text-[10px] text-zinc-400 mt-0.5 block">
                {mine.activeShafts > 0 ? `${mine.activeShafts} Active Shafts` : 'Opencast Quarry'}
              </span>
            </div>

            <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Average Ore Grade</span>
              <span className="text-sm font-bold font-mono text-emerald-400 mt-1 block">
                {mine.typicalGradeMnPercent}% Mn
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5 block">Run-of-Mine</span>
            </div>

            <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Daily Target</span>
              <span className="text-sm font-bold font-mono text-violet-400 mt-1 block">
                {mine.dailyTargetTonnes.toLocaleString()} T
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5 block">Per operating day</span>
            </div>

            <div className="bg-zinc-950/70 p-3 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Annual Output</span>
              <span className="text-sm font-bold font-mono text-amber-400 mt-1 block">
                {mine.historicalAnnualOutputMT} MT
              </span>
              <span className="text-[10px] text-zinc-400 mt-0.5 block">Million Metric Tonnes</span>
            </div>
          </div>

          {/* Geological Description */}
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-2">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
              Stratigraphic &amp; Geological Profile
            </span>
            <div className="text-xs text-zinc-300 leading-relaxed space-y-1.5">
              <p>
                <strong>Host Formation:</strong> Sausar Group Metasedimentary Complex (Chorbaoli / Mansar Formation).
              </p>
              <p>
                <strong>Primary Mineralization:</strong> {mine.primaryOreType}. Characterized by steeply dipping bedded synclines with braunite, pyrolusite, and manganiferous quartzites (Gondite).
              </p>
              <p>
                <strong>Lease Footprint:</strong> {mine.areaHectares} Hectares statutory mining lease under Ministry of Mines, Government of India.
              </p>
            </div>
          </div>

          {/* Quick Mine Switcher */}
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              Switch Active Mine Lease:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MOIL_MINES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectMine(m)}
                  className={`p-2 rounded-lg text-left text-xs transition border flex flex-col justify-between ${
                    m.id === mine.id
                      ? 'bg-violet-950/80 border-violet-600 text-violet-200'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  <span className="font-semibold truncate">{m.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
                    {m.method === 'Underground' ? 'UG' : 'OC'} • {m.typicalGradeMnPercent}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/90 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onSelectMine(mine);
              if (onNavigateToTab) onNavigateToTab('reserve');
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Load in 2.5D Strata Model</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectMine(mine);
              if (onNavigateToTab) onNavigateToTab('production');
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            <span>Forecast Shortfalls</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectMine(mine);
              if (onNavigateToTab) onNavigateToTab('data');
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-sky-400" />
            <span>Boreholes &amp; Assays</span>
          </button>
        </div>
      </div>
    </div>
  );
};
