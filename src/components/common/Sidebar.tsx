import React from 'react';
import {
  LayoutDashboard,
  Layers,
  TrendingDown,
  ShieldAlert,
  Database,
  Info,
  X,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { MineLease } from '../../types';

export type NavTab = 'overview' | 'reserve' | 'production' | 'risk' | 'data' | 'about';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  selectedMine: MineLease;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  activeAlertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  selectedMine,
  isMobileOpen = false,
  onCloseMobile,
  activeAlertCount,
}) => {
  const navItems = [
    {
      id: 'overview' as NavTab,
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
      tag: 'Live Ops',
    },
    {
      id: 'reserve' as NavTab,
      label: 'Reserve Intelligence',
      icon: <Layers className="w-4 h-4" />,
      tag: 'UNFC/JORC',
    },
    {
      id: 'production' as NavTab,
      label: 'Production Forecast',
      icon: <TrendingDown className="w-4 h-4" />,
      tag: 'Shortfall AI',
    },
    {
      id: 'risk' as NavTab,
      label: 'Risk & Recommendations',
      icon: <ShieldAlert className="w-4 h-4" />,
      count: activeAlertCount,
    },
    {
      id: 'data' as NavTab,
      label: 'Data Explorer',
      icon: <Database className="w-4 h-4" />,
      tag: 'CSV Export',
    },
    {
      id: 'about' as NavTab,
      label: 'About & Architecture',
      icon: <Info className="w-4 h-4" />,
      tag: 'FastAPI Spec',
    },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full justify-between bg-zinc-950 border-r border-zinc-800/80 text-zinc-300 w-64 p-4 select-none">
      {/* Top Brand / Nav Links */}
      <div className="space-y-6">
        {/* Mobile Header Close */}
        <div className="flex items-center justify-between lg:hidden pb-2 border-b border-zinc-800">
          <span className="text-xs font-bold text-zinc-200">Navigation Menu</span>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section title */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-3">
            Core Modules
          </span>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-violet-900/40 text-violet-200 border border-violet-700/60 shadow-md font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-violet-400' : 'text-zinc-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.tag && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-violet-950 text-violet-300 border border-violet-800'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                      }`}
                    >
                      {item.tag}
                    </span>
                  )}

                  {item.count !== undefined && item.count > 0 && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Active Mine Information Card */}
        <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-violet-400" />
              <span>Current Lease</span>
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
              {selectedMine.status}
            </span>
          </div>

          <div>
            <div className="text-xs font-bold text-zinc-100">{selectedMine.name}</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              {selectedMine.district}, {selectedMine.state} ({selectedMine.method})
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/70 text-[10px] font-mono">
            <div>
              <span className="text-zinc-400 block text-[9px]">TARGET TONNES</span>
              <span className="text-zinc-200 font-bold">{selectedMine.dailyTargetTonnes} T/day</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[9px]">AVG GRADE</span>
              <span className="text-violet-300 font-bold">{selectedMine.typicalGradeMnPercent}% Mn</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="space-y-3 pt-4 border-t border-zinc-900">
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 px-1">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-zinc-400" />
            <span>Shift II (Active)</span>
          </span>
          <span className="text-emerald-400 font-semibold">ALL SYSTEMS NOMINAL</span>
        </div>

        <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-850 text-[10px] text-zinc-400 leading-tight">
          <div className="flex items-center gap-1.5 text-zinc-300 font-semibold mb-1">
            <Sparkles className="w-3 h-3 text-violet-400" />
            <span>MOIL Intelligence Suite</span>
          </div>
          <span>Satellite &amp; ML decision support. All displayed outputs run in safe simulated mode.</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0 h-[calc(100vh-61px)] sticky top-[61px]">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative z-50 h-full w-64">{content}</div>
        </div>
      )}
    </>
  );
};
