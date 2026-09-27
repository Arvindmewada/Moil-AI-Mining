import React, { useState } from 'react';
import {
  ReserveEstimateInput,
  ReserveEstimateResult,
  MineLease,
  BoreholeData,
  SatelliteMetrics,
} from '../../types';
import { OreBodyStrataVisualizer } from '../charts/OreBodyStrataVisualizer';
import { MonteCarloDistributionChart } from '../charts/MonteCarloDistributionChart';
import { ScientificCaveatBanner } from '../common/ScientificCaveatBanner';
import { BoreholeDetailModal } from '../modals/BoreholeDetailModal';
import {
  Sliders,
  Sparkles,
  Info,
  Layers,
  Activity,
  Calculator,
  Compass,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  Zap,
  RotateCcw,
  ArrowRight,
  Database,
} from 'lucide-react';

interface ReserveIntelligenceViewProps {
  selectedMine: MineLease;
  reserveInput: ReserveEstimateInput;
  onChangeInput: (newInput: ReserveEstimateInput) => void;
  reserveResult: ReserveEstimateResult;
  boreholes: BoreholeData[];
  satelliteMetrics: SatelliteMetrics;
  onRunModel: () => void;
  isLoading?: boolean;
}

export const ReserveIntelligenceView: React.FC<ReserveIntelligenceViewProps> = ({
  selectedMine,
  reserveInput,
  onChangeInput,
  reserveResult,
  boreholes,
  satelliteMetrics,
  onRunModel,
  isLoading = false,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'strata' | 'unfc' | 'boreholes'>('strata');
  const [selectedBorehole, setSelectedBorehole] = useState<BoreholeData | null>(null);
  const [activeUnfcDetail, setActiveUnfcDetail] = useState<{
    code: string;
    title: string;
    description: string;
    criteria: string;
  } | null>(null);

  const handleSliderChange = (field: keyof ReserveEstimateInput, val: number) => {
    onChangeInput({
      ...reserveInput,
      [field]: val,
    });
  };

  // Preset Geological Scenarios
  const applyPreset = (presetName: 'deep' | 'high_grade' | 'conservative') => {
    if (presetName === 'deep') {
      onChangeInput({
        ...reserveInput,
        depthExtentM: 350,
        dipAngleDeg: 65,
        trueThicknessM: 14,
        inSituMnGrade: 44,
        geologicalLossFactor: 0.12,
      });
    } else if (presetName === 'high_grade') {
      onChangeInput({
        ...reserveInput,
        inSituMnGrade: 46.5,
        bulkDensity: 4.1,
        trueThicknessM: 10,
        miningRecoveryFactor: 0.90,
      });
    } else {
      onChangeInput({
        ...reserveInput,
        depthExtentM: 150,
        dipAngleDeg: 45,
        trueThicknessM: 7,
        inSituMnGrade: 36,
        geologicalLossFactor: 0.15,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <ScientificCaveatBanner />

      {/* Top Header & Fast Model Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-5 h-5 text-violet-400" />
              Manganese Reserve Potential &amp; Geological Modeling
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800">
              UNFC 111 / 222 / 333
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Geostatistical spatial integration of drill core logs with surface remote sensing covariates for {selectedMine.name}
          </p>
        </div>

        {/* Preset Geological Hypotheses & Run Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs">
            <span className="text-[10px] text-zinc-500 font-mono pl-1 hidden sm:inline">Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset('deep')}
              className="px-2 py-1 rounded bg-zinc-800 hover:bg-violet-900/40 hover:text-violet-300 text-zinc-300 text-[11px] font-medium transition cursor-pointer"
              title="Apply Deep Synclinal Extension Scenario"
            >
              Deep Syncline
            </button>
            <button
              type="button"
              onClick={() => applyPreset('high_grade')}
              className="px-2 py-1 rounded bg-zinc-800 hover:bg-emerald-900/40 hover:text-emerald-300 text-zinc-300 text-[11px] font-medium transition cursor-pointer"
              title="Apply High-Grade Braunite Reef Scenario"
            >
              High-Grade Braunite
            </button>
            <button
              type="button"
              onClick={() => applyPreset('conservative')}
              className="px-2 py-1 rounded bg-zinc-800 hover:bg-amber-900/40 hover:text-amber-300 text-zinc-300 text-[11px] font-medium transition cursor-pointer"
              title="Apply Conservative Exploration Target"
            >
              Conservative
            </button>
          </div>

          <button
            type="button"
            onClick={onRunModel}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-violet-950/50 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-violet-200" />
            <span>{isLoading ? 'Recomputing Physics...' : 'Run Simulation Model'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Parameters on Left, Visualizations on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Editable Geological Parameters */}
        <div className="lg:col-span-4 bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 shadow-lg space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-violet-400" />
              <h2 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                Geological &amp; In-Situ Inputs
              </h2>
            </div>
            <button
              type="button"
              onClick={() => applyPreset('conservative')}
              className="text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-zinc-500" />
              Reset
            </button>
          </div>

          <div className="space-y-4">
            {/* Strike Length */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Strike Length</span>
                <span className="font-mono font-bold text-violet-400">{reserveInput.strikeLengthM} meters</span>
              </div>
              <input
                type="range"
                min="400"
                max="2500"
                step="50"
                value={reserveInput.strikeLengthM}
                onChange={(e) => handleSliderChange('strikeLengthM', Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>400m (Sector)</span>
                <span>2,500m (Regional)</span>
              </div>
            </div>

            {/* True Thickness */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">True Bed Thickness</span>
                <span className="font-mono font-bold text-violet-400">{reserveInput.trueThicknessM} meters</span>
              </div>
              <input
                type="range"
                min="3"
                max="25"
                step="0.5"
                value={reserveInput.trueThicknessM}
                onChange={(e) => handleSliderChange('trueThicknessM', Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>3m (Thin Reef)</span>
                <span>25m (Thick Lode)</span>
              </div>
            </div>

            {/* Dip Angle */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Strata Dip Angle</span>
                <span className="font-mono font-bold text-violet-400">{reserveInput.dipAngleDeg}°</span>
              </div>
              <input
                type="range"
                min="30"
                max="80"
                step="1"
                value={reserveInput.dipAngleDeg}
                onChange={(e) => handleSliderChange('dipAngleDeg', Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>30° (Moderate)</span>
                <span>80° (Near Vertical)</span>
              </div>
            </div>

            {/* Depth Extent */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Down-Dip Depth Extent</span>
                <span className="font-mono font-bold text-violet-400">{reserveInput.depthExtentM} meters</span>
              </div>
              <input
                type="range"
                min="100"
                max="600"
                step="25"
                value={reserveInput.depthExtentM}
                onChange={(e) => handleSliderChange('depthExtentM', Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>100m (Near Surface)</span>
                <span>600m (Deep Shaft)</span>
              </div>
            </div>

            {/* In-situ Grade */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">In-Situ Manganese Grade</span>
                <span className="font-mono font-bold text-emerald-400">{reserveInput.inSituMnGrade}% Mn</span>
              </div>
              <input
                type="range"
                min="32"
                max="48"
                step="0.5"
                value={reserveInput.inSituMnGrade}
                onChange={(e) => handleSliderChange('inSituMnGrade', Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>32% (Low Grade)</span>
                <span>48% (Premium Braunite)</span>
              </div>
            </div>

            {/* Bulk Density */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">In-Situ Bulk Density</span>
                <span className="font-mono font-bold text-amber-400">{reserveInput.bulkDensity} t/m³</span>
              </div>
              <input
                type="range"
                min="3.2"
                max="4.4"
                step="0.05"
                value={reserveInput.bulkDensity}
                onChange={(e) => handleSliderChange('bulkDensity', Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>3.20 (Siliceous)</span>
                <span>4.40 (Dense Braunite)</span>
              </div>
            </div>

            {/* Mining Recovery Factor */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-medium">Mining Recovery Factor</span>
                <span className="font-mono font-bold text-zinc-200">
                  {(reserveInput.miningRecoveryFactor * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.70"
                max="0.95"
                step="0.01"
                value={reserveInput.miningRecoveryFactor}
                onChange={(e) => handleSliderChange('miningRecoveryFactor', Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-400"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Strata & Modeling Displays */}
        <div className="lg:col-span-8 space-y-5">
          {/* Subtab Navigation */}
          <div className="flex items-center gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setActiveSubTab('strata')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeSubTab === 'strata'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>2.5D Strata Model</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('unfc')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeSubTab === 'unfc'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>UNFC Classification &amp; Monte Carlo</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('boreholes')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeSubTab === 'boreholes'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Diamond Core Drill Logs ({boreholes.filter((b) => b.mineId === selectedMine.id).length})</span>
            </button>
          </div>

          {/* Subtab 1: 2.5D Strata Model */}
          {activeSubTab === 'strata' && (
            <OreBodyStrataVisualizer
              dipAngleDeg={reserveInput.dipAngleDeg}
              trueThicknessM={reserveInput.trueThicknessM}
              depthExtentM={reserveInput.depthExtentM}
              inSituMnGrade={reserveInput.inSituMnGrade}
              satelliteNdvi={reserveInput.satelliteNdvi}
              satelliteRainfallMm={satelliteMetrics.rainfallMonthlyMm}
            />
          )}

          {/* Subtab 2: UNFC & Uncertainty Distribution */}
          {activeSubTab === 'unfc' && (
            <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-4 shadow-lg space-y-4">
              <div>
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  UNFC Classification Matrix (United Nations Framework Classification)
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Partitioned in accordance with Indian Bureau of Mines (IBM) guidelines • Click cards to inspect criteria
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() =>
                    setActiveUnfcDetail({
                      code: 'UNFC 111 (Proved Mineral Reserve)',
                      title: 'Proved Underground Ore Reserves',
                      description: 'Economically mineable part of measured mineral resource demonstrated by dense diamond drilling & underground level sampling.',
                      criteria: 'Drill Grid: <50m spacing • Geostatistical Error: <10% • Feasibility: Detailed mining plan approved',
                    })
                  }
                  className="bg-zinc-900/80 hover:bg-zinc-850 hover:border-emerald-500/60 border border-emerald-800/80 p-3 rounded-xl cursor-pointer transition-all group shadow-sm"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-emerald-400 group-hover:text-emerald-300">
                      Proved Reserve (111) ↗
                    </span>
                    <span className="font-mono font-bold text-white">
                      {reserveResult.unfcBreakdown.provedMT} MT
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-tight">
                    Confirmed by core intercepts at ~50m borehole spacing and active stope development.
                  </p>
                </div>

                <div
                  onClick={() =>
                    setActiveUnfcDetail({
                      code: 'UNFC 122 (Probable Mineral Reserve)',
                      title: 'Probable Mining Reserves',
                      description: 'Economically mineable part of indicated mineral resource with reasonable degree of geological confidence.',
                      criteria: 'Drill Grid: 50m - 100m spacing • Confidence: High-Moderate • Geotechnical: Basic rock mass ratings available',
                    })
                  }
                  className="bg-zinc-900/80 hover:bg-zinc-850 hover:border-amber-500/60 border border-amber-800/80 p-3 rounded-xl cursor-pointer transition-all group shadow-sm"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-amber-400 group-hover:text-amber-300">
                      Indicated Resource (222) ↗
                    </span>
                    <span className="font-mono font-bold text-white">
                      {reserveResult.unfcBreakdown.indicatedMT} MT
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-tight">
                    Estimated with reasonable geological continuity from wider drill grid spacing (&gt;100m).
                  </p>
                </div>

                <div
                  onClick={() =>
                    setActiveUnfcDetail({
                      code: 'UNFC 333 (Inferred Mineral Resource)',
                      title: 'Inferred Illustrative Potential',
                      description: 'Tonnage and grade estimated from limited geological evidence and deep strike projections. Requires exploratory drilling.',
                      criteria: 'Drill Grid: >100m or extrapolated • Note: Remote sensing cannot confirm underground continuity',
                    })
                  }
                  className="bg-zinc-900/80 hover:bg-zinc-850 hover:border-purple-500/60 border border-purple-800/80 p-3 rounded-xl cursor-pointer transition-all group shadow-sm"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-purple-400 group-hover:text-purple-300">
                      Inferred Potential (333) ↗
                    </span>
                    <span className="font-mono font-bold text-white">
                      {reserveResult.unfcBreakdown.inferredIllustrativeMT} MT
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-tight">
                    Extrapolated deep synclinal limb potential for exploratory diamond drilling prioritization.
                  </p>
                </div>
              </div>

              {/* Dynamic UNFC Popover Details */}
              {activeUnfcDetail && (
                <div className="p-3 bg-zinc-900 border border-violet-700/80 rounded-xl flex items-start justify-between gap-3 text-xs animate-in fade-in">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                      <span className="font-bold text-zinc-100">{activeUnfcDetail.code}</span>
                      <span className="text-[10px] text-violet-300 font-mono bg-violet-950/80 px-2 py-0.5 rounded border border-violet-800">
                        {activeUnfcDetail.title}
                      </span>
                    </div>
                    <p className="text-zinc-300 text-xs">{activeUnfcDetail.description}</p>
                    <div className="text-[11px] text-zinc-400 font-mono">{activeUnfcDetail.criteria}</div>
                  </div>
                  <button
                    onClick={() => setActiveUnfcDetail(null)}
                    className="text-zinc-400 hover:text-zinc-100 p-1 hover:bg-zinc-800 rounded text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Monte Carlo Uncertainty Visualizer */}
              <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl space-y-4">
                <div>
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                    Monte Carlo Geostatistical Uncertainty Distribution
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Continuous probability curve simulated across 5,000 Kriging realizations • Hover curve for probability breakdown
                  </p>
                </div>

                {/* Interactive Recharts Monte Carlo Distribution Curve */}
                <MonteCarloDistributionChart
                  p90={reserveResult.confidenceBand.p90}
                  p50={reserveResult.confidenceBand.p50}
                  p10={reserveResult.confidenceBand.p10}
                  avgGradeMn={reserveInput.inSituMnGrade}
                  height={180}
                />

                <div className="grid grid-cols-3 gap-3 text-center pt-2">
                  <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block font-mono">P90 (Conservative)</span>
                    <span className="text-lg font-bold font-mono text-zinc-200">
                      {reserveResult.confidenceBand.p90} MT
                    </span>
                    <span className="text-[9px] text-emerald-400 block font-mono mt-0.5">90% Confidence</span>
                  </div>
                  <div className="bg-zinc-950 p-2.5 rounded-lg border border-violet-700/80 ring-1 ring-violet-500/30">
                    <span className="text-[10px] text-violet-300 block font-mono">P50 (Median Expected)</span>
                    <span className="text-lg font-bold font-mono text-violet-300">
                      {reserveResult.confidenceBand.p50} MT
                    </span>
                    <span className="text-[9px] text-violet-400 block font-mono mt-0.5">50% Median</span>
                  </div>
                  <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block font-mono">P10 (Optimistic High)</span>
                    <span className="text-lg font-bold font-mono text-zinc-200">
                      {reserveResult.confidenceBand.p10} MT
                    </span>
                    <span className="text-[9px] text-sky-400 block font-mono mt-0.5">10% Upper Decile</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subtab 3: Boreholes Table */}
          {activeSubTab === 'boreholes' && (
            <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Active Diamond Core Borehole Logs ({selectedMine.name}) • Click row to inspect assay
                </span>
                <span className="text-[10px] font-mono text-emerald-400">Chemical Assays Loaded</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300 font-mono">
                  <thead className="bg-zinc-900 text-zinc-400 text-[10px] uppercase">
                    <tr>
                      <th className="p-2">Hole ID</th>
                      <th className="p-2">Collar RL</th>
                      <th className="p-2">Depth</th>
                      <th className="p-2">Intercept</th>
                      <th className="p-2">Mn %</th>
                      <th className="p-2">Fe %</th>
                      <th className="p-2">P %</th>
                      <th className="p-2">UNFC Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {boreholes
                      .filter((b) => b.mineId === selectedMine.id)
                      .map((bh) => (
                        <tr
                          key={bh.holeId}
                          onClick={() => setSelectedBorehole(bh)}
                          className="hover:bg-violet-950/30 cursor-pointer transition-colors group"
                        >
                          <td className="p-2 font-bold text-violet-300 group-hover:text-amber-300 flex items-center gap-1.5">
                            <Database className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400" />
                            {bh.holeId}
                          </td>
                          <td className="p-2">{bh.collarElevationM}m</td>
                          <td className="p-2">{bh.totalDepthM}m</td>
                          <td className="p-2">
                            {bh.oreInterceptStartM}-{bh.oreInterceptEndM}m ({bh.interceptThicknessM}m)
                          </td>
                          <td className="p-2 font-bold text-emerald-400">{bh.mnGradePercent}%</td>
                          <td className="p-2">{bh.feGradePercent}%</td>
                          <td className="p-2">{bh.pGradePercent}%</td>
                          <td className="p-2 text-[10px] text-zinc-400">{bh.unfcClassification}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Model Output KPI Highlights with clickable tooltips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl hover:border-zinc-700 transition">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">In-Situ Tonnage</span>
              <span className="text-xl font-bold font-mono text-zinc-100">
                {reserveResult.totalInSituTonnageMT} <span className="text-xs">MT</span>
              </span>
            </div>

            <div className="bg-zinc-900/80 border border-violet-800/80 p-3 rounded-xl hover:border-violet-600 transition">
              <span className="text-[10px] text-violet-300 uppercase tracking-wider block">Recoverable Ore</span>
              <span className="text-xl font-bold font-mono text-violet-300">
                {reserveResult.recoverableTonnageMT} <span className="text-xs">MT</span>
              </span>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl hover:border-zinc-700 transition">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Contained Metal</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                {reserveResult.containedManganeseMetalMT} <span className="text-xs">MT Mn</span>
              </span>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl hover:border-zinc-700 transition">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Gross Valuation</span>
              <span className="text-xl font-bold font-mono text-amber-400">
                ₹{reserveResult.economicValueEstimateCrINR.toLocaleString()} <span className="text-xs">Cr</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Borehole Detail Modal */}
      {selectedBorehole && (
        <BoreholeDetailModal
          isOpen={!!selectedBorehole}
          borehole={selectedBorehole}
          onClose={() => setSelectedBorehole(null)}
        />
      )}
    </div>
  );
};
