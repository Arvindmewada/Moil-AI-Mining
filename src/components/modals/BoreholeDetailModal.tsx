import React from 'react';
import { X, Layers, Database, Sparkles, CheckCircle2 } from 'lucide-react';
import { BoreholeData } from '../../types';

interface BoreholeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  borehole: BoreholeData | null;
}

export const BoreholeDetailModal: React.FC<BoreholeDetailModalProps> = ({
  isOpen,
  onClose,
  borehole,
}) => {
  if (!isOpen || !borehole) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/10 border border-violet-500/30 rounded-xl text-violet-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-zinc-100 text-lg">Borehole Assay Log: {borehole.holeId}</h3>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/30">
                  {borehole.unfcClassification}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Logged: {borehole.dateLogged} • Collar Elevation: {borehole.collarElevationM}m RL
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
          {/* Grade Grid */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Geochemical Assay Composition
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
                <span className="text-[11px] text-zinc-500 block">Mn Grade</span>
                <span className="text-xl font-bold text-amber-400">{borehole.mnGradePercent}%</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">
                  {borehole.mnGradePercent >= 44 ? 'High Grade Braunite' : 'Medium Commercial Grade'}
                </span>
              </div>
              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
                <span className="text-[11px] text-zinc-500 block">Fe Grade</span>
                <span className="text-xl font-bold text-zinc-300">{borehole.feGradePercent}%</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Ratio Mn:Fe = {(borehole.mnGradePercent / borehole.feGradePercent).toFixed(1)}</span>
              </div>
              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
                <span className="text-[11px] text-zinc-500 block">Phosphorus (P)</span>
                <span className="text-xl font-bold text-rose-400">{borehole.pGradePercent}%</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">
                  {borehole.pGradePercent < 0.15 ? 'Low P (Standard)' : 'Higher P (Blend Required)'}
                </span>
              </div>
              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800">
                <span className="text-[11px] text-zinc-500 block">Silica (SiO₂)</span>
                <span className="text-xl font-bold text-cyan-400">{borehole.sio2GradePercent}%</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Bulk: {borehole.bulkDensity} t/m³</span>
              </div>
            </div>
          </div>

          {/* Intercept Visual Bar */}
          <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-zinc-300">Downhole Intercept Profile</span>
              <span className="text-xs text-amber-400 font-mono">
                {borehole.oreInterceptStartM}m → {borehole.oreInterceptEndM}m ({borehole.interceptThicknessM}m true thickness)
              </span>
            </div>
            {/* Visual stratigraphy column */}
            <div className="h-6 w-full bg-zinc-800 rounded-lg overflow-hidden flex items-stretch">
              <div
                style={{ width: `${(borehole.oreInterceptStartM / borehole.totalDepthM) * 100}%` }}
                className="bg-zinc-700/60 flex items-center justify-center text-[10px] text-zinc-400 font-mono"
                title={`Overburden: 0 to ${borehole.oreInterceptStartM}m`}
              >
                Hanging Wall
              </div>
              <div
                style={{ width: `${(borehole.interceptThicknessM / borehole.totalDepthM) * 100}%` }}
                className="bg-amber-500 flex items-center justify-center text-[10px] text-zinc-950 font-bold"
                title={`Ore Intercept: ${borehole.interceptThicknessM}m @ ${borehole.mnGradePercent}% Mn`}
              >
                Ore Bed
              </div>
              <div
                style={{ width: `${((borehole.totalDepthM - borehole.oreInterceptEndM) / borehole.totalDepthM) * 100}%` }}
                className="bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-500 font-mono"
                title={`Footwall: ${borehole.oreInterceptEndM}m to ${borehole.totalDepthM}m`}
              >
                Footwall
              </div>
            </div>
            <div className="flex justify-between text-[11px] text-zinc-500 mt-1.5 font-mono">
              <span>0m Collar</span>
              <span>Total Depth: {borehole.totalDepthM}m</span>
            </div>
          </div>

          {/* Geological Metadata */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-950/50 rounded-xl border border-zinc-800">
              <span className="text-[11px] text-zinc-500 block">Dominant Lithology</span>
              <span className="text-sm font-semibold text-zinc-200 mt-1 block">{borehole.lithology}</span>
              <p className="text-[11px] text-zinc-400 mt-0.5">Sausar Group metasedimentary horizon</p>
            </div>
            <div className="p-3 bg-zinc-950/50 rounded-xl border border-zinc-800">
              <span className="text-[11px] text-zinc-500 block">Grid Coordinates</span>
              <span className="text-sm font-semibold text-zinc-200 mt-1 font-mono block">
                E: {borehole.easting.toFixed(0)}, N: {borehole.northing.toFixed(0)}
              </span>
              <p className="text-[11px] text-zinc-400 mt-0.5">UTM Zone 44N projection</p>
            </div>
          </div>

          <div className="p-3 bg-violet-950/20 border border-violet-800/40 rounded-xl flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-300 leading-relaxed">
              <strong>Geostatistical Confidence:</strong> Core recovery rate &gt;92%. XRF assay and wet chemical titration completed by MOIL Central Laboratory. Verified compliant with UNFC/IBM mineral estimation guidelines.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          <span className="text-xs text-zinc-400 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-zinc-500" />
            Core Library ID: CR-{borehole.holeId}-2024
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded-lg text-xs transition-colors flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Close Assay View
          </button>
        </div>
      </div>
    </div>
  );
};
