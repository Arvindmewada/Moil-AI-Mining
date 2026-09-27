import React, { useState, useEffect } from 'react';
import {
  Pickaxe,
  Server,
  RotateCcw,
  Sliders,
  ChevronDown,
  Layers,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { MineLease, BackendConfig } from '../../types';
import { MOIL_MINES } from '../../data/mockMiningData';
import { apiService } from '../../services/apiService';
import { BackendSettingsModal } from './BackendSettingsModal';
import { ShiftLogModal } from '../modals/ShiftLogModal';
import { MineLeaseDetailModal } from '../modals/MineLeaseDetailModal';

interface HeaderProps {
  selectedMine: MineLease;
  onSelectMine: (mine: MineLease) => void;
  onResetDemo: () => void;
  onOpenMobileMenu?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedMine,
  onSelectMine,
  onResetDemo,
  onOpenMobileMenu,
  onNavigateTab,
}) => {
  const [config, setConfig] = useState<BackendConfig>(apiService.getConfig());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isLeaseModalOpen, setIsLeaseModalOpen] = useState(false);
  const [resetToast, setResetToast] = useState(false);

  useEffect(() => {
    const unsub = apiService.subscribe((c) => setConfig(c));
    return unsub;
  }, []);

  const handleResetClick = () => {
    onResetDemo();
    setResetToast(true);
    setTimeout(() => setResetToast(false), 2600);
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Project title & Mobile toggle & Clickable logo */}
        <div className="flex items-center gap-3">
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
              title="Open Navigation Menu"
            >
              <Layers className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={() => setIsLeaseModalOpen(true)}
            className="flex items-center gap-2.5 cursor-pointer group"
            title="Click to view detailed MOIL Lease Specification & Operations Overview"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-800 p-0.5 shadow-lg shadow-purple-950/50 flex items-center justify-center group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Pickaxe className="w-5 h-5 text-violet-400 group-hover:text-violet-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-zinc-100 group-hover:text-violet-300 transition-colors">
                  MOIL AI Mining
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-950 text-violet-300 border border-violet-800/80">
                  Manganese Ops
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium hidden sm:block">
                Manganese Ore India Limited • Click to inspect mine
              </p>
            </div>
          </div>
        </div>

        {/* Center: Lease Selector & Clickable MapPin */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={() => setIsLeaseModalOpen(true)}
              className="p-1.5 mr-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-violet-400 border border-zinc-750 transition cursor-pointer"
              title={`Click to inspect ${selectedMine.name} full geological lease profile`}
            >
              <MapPin className="w-4 h-4" />
            </button>
            <div className="relative">
              <label className="text-[10px] text-zinc-400 block font-mono -mb-0.5 hidden md:block">
                ACTIVE MINE LEASE
              </label>
              <div className="relative">
                <select
                  value={selectedMine.id}
                  onChange={(e) => {
                    const m = MOIL_MINES.find((item) => item.id === e.target.value);
                    if (m) onSelectMine(m);
                  }}
                  className="appearance-none bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-700/80 hover:border-zinc-600 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-zinc-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500 transition shadow-inner"
                >
                  {MOIL_MINES.map((mine) => (
                    <option key={mine.id} value={mine.id} className="bg-zinc-900 text-zinc-200">
                      {mine.name} ({mine.method}) - {mine.state}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Shift Status + Runtime Mode Badge + Reset Demo Button + Backend Settings */}
        <div className="flex items-center gap-2">
          {/* Shift Tracker Button */}
          <button
            type="button"
            onClick={() => setIsShiftModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 hover:text-amber-300 text-xs font-mono transition cursor-pointer"
            title="Click to view Live Underground Shift Handover & Production Log"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline font-semibold">Shift A</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          {/* Mode Badge / Connector */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition cursor-pointer ${
              config.mode === 'LIVE_FASTAPI'
                ? config.lastPingStatus === 'connected'
                  ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-amber-950/60 border-amber-700 text-amber-300 hover:bg-amber-900/60'
                : 'bg-zinc-900 border-zinc-750 text-zinc-300 hover:bg-zinc-800'
            }`}
            title="Click to configure FastAPI Backend & Model endpoints"
          >
            <Server className="w-3.5 h-3.5" />
            <span className="hidden md:inline font-semibold">
              {config.mode === 'LIVE_FASTAPI' ? 'LIVE API' : 'DEMO MODE'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                config.mode === 'LIVE_FASTAPI'
                  ? config.lastPingStatus === 'connected'
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-amber-400'
                  : 'bg-violet-400'
              }`}
            />
          </button>

          {/* Reset Demo Button */}
          <button
            type="button"
            onClick={handleResetClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-zinc-300 hover:text-white text-xs font-medium transition active:scale-95 shadow-sm cursor-pointer"
            title="Reset all inputs, forecasts, and logs back to baseline"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        </div>
      </header>

      {/* Floating notification when reset is clicked */}
      {resetToast && (
        <div className="fixed top-16 right-6 z-50 bg-zinc-900 border border-emerald-500/80 text-emerald-200 text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Demo state and geological baseline parameters restored!</span>
        </div>
      )}

      {/* Backend Settings Modal */}
      <BackendSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Shift Log Modal */}
      <ShiftLogModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        activeMine={selectedMine}
      />

      {/* Mine Lease Detail Modal */}
      <MineLeaseDetailModal
        isOpen={isLeaseModalOpen}
        onClose={() => setIsLeaseModalOpen(false)}
        mine={selectedMine}
        onSelectMine={(m) => {
          onSelectMine(m);
          setIsLeaseModalOpen(false);
        }}
      />
    </>
  );
};
