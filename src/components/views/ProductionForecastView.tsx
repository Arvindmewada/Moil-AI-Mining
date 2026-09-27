import React, { useState } from 'react';
import {
  ProductionForecastInput,
  ProductionForecastResult,
  MineLease,
} from '../../types';
import { InteractiveBarChart } from '../charts/InteractiveBarChart';
import { SensitivityTornadoChart } from '../charts/SensitivityTornadoChart';
import { ScientificCaveatBanner } from '../common/ScientificCaveatBanner';
import {
  TrendingDown,
  Sliders,
  AlertTriangle,
  Zap,
  CloudRain,
  Wrench,
  RotateCcw,
  IndianRupee,
  Calendar,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface ProductionForecastViewProps {
  selectedMine: MineLease;
  forecastInput: ProductionForecastInput;
  onChangeInput: (newInput: ProductionForecastInput) => void;
  forecastResult: ProductionForecastResult;
  onResetToBaseline: () => void;
}

export const ProductionForecastView: React.FC<ProductionForecastViewProps> = ({
  selectedMine,
  forecastInput,
  onChangeInput,
  forecastResult,
  onResetToBaseline,
}) => {
  const [mitigationToast, setMitigationToast] = useState<string | null>(null);

  const handleSliderChange = (field: keyof ProductionForecastInput, val: number) => {
    onChangeInput({
      ...forecastInput,
      [field]: val,
    });
  };

  // Scenario Presets
  const applyScenario = (type: 'monsoon' | 'optimized' | 'curtailment') => {
    if (type === 'monsoon') {
      onChangeInput({
        ...forecastInput,
        expectedMonsoonRainfallMm: 340,
        dewateringCapacityKLPerHour: 450,
        fleetAvailabilityPercent: 68,
      });
      showToast('Monsoon Surge Scenario Applied: 340mm rainfall & 68% fleet availability');
    } else if (type === 'optimized') {
      onChangeInput({
        ...forecastInput,
        fleetAvailabilityPercent: 94,
        blastingEfficiencyPercent: 92,
        powerGridReliabilityPercent: 96,
        dewateringCapacityKLPerHour: 950,
      });
      showToast('Optimized Operational Scenario: 94% fleet uptime & 950 KL/hr pumping');
    } else {
      onChangeInput({
        ...forecastInput,
        powerGridReliabilityPercent: 65,
        fleetAvailabilityPercent: 72,
        blastingEfficiencyPercent: 75,
      });
      showToast('Grid Outage Scenario: 65% power reliability with standby generators');
    }
  };

  const showToast = (msg: string) => {
    setMitigationToast(msg);
    setTimeout(() => setMitigationToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <ScientificCaveatBanner />

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-rose-400" />
              Production Shortfall &amp; Operational Bottleneck Forecaster
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
              Predictive Shortfall Model
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time sensitivity analysis across weather, equipment availability, and power supply for {selectedMine.name}
          </p>
        </div>

        {/* Action buttons & Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs">
            <span className="text-[10px] text-zinc-500 font-mono pl-1 hidden sm:inline">Stress Tests:</span>
            <button
              type="button"
              onClick={() => applyScenario('monsoon')}
              className="px-2 py-1 rounded bg-zinc-800 hover:bg-sky-950 hover:text-sky-300 text-zinc-300 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
            >
              <CloudRain className="w-3 h-3 text-sky-400" />
              Monsoon Surge
            </button>
            <button
              type="button"
              onClick={() => applyScenario('optimized')}
              className="px-2 py-1 rounded bg-zinc-800 hover:bg-emerald-950 hover:text-emerald-300 text-zinc-300 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Peak Uptime
            </button>
            <button
              type="button"
              onClick={() => applyScenario('curtailment')}
              className="px-2 py-1 rounded bg-zinc-800 hover:bg-amber-950 hover:text-amber-300 text-zinc-300 text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              Grid Dip
            </button>
          </div>

          <button
            type="button"
            onClick={onResetToBaseline}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg border border-zinc-700 text-xs font-semibold transition cursor-pointer"
            title="Reset parameters to mine baseline"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* KPI Cards with interactive click handlers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => showToast(`Total scheduled dispatch plan: ${forecastResult.totalForecastTargetTonnes.toLocaleString()} Tonnes over ${forecastInput.forecastMonths} months`)}
          className="bg-zinc-900/90 hover:bg-zinc-850 hover:border-zinc-700 border border-zinc-800 rounded-xl p-4 shadow-md transition cursor-pointer group"
          title="Click to inspect scheduled dispatch breakdown"
        >
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
            Total Target Plan
          </span>
          <div className="text-2xl font-bold font-mono text-zinc-100 group-hover:text-violet-300 transition-colors">
            {forecastResult.totalForecastTargetTonnes.toLocaleString()}{' '}
            <span className="text-xs text-zinc-400">Tonnes</span>
          </div>
          <span className="text-[11px] text-zinc-400 mt-2 block">
            {forecastInput.forecastMonths}-month scheduled dispatch target
          </span>
        </div>

        <div
          onClick={() => showToast(`Predicted output: ${forecastResult.totalForecastPredictedTonnes.toLocaleString()} Tonnes based on current operational inputs`)}
          className="bg-zinc-900/90 hover:bg-zinc-850 hover:border-emerald-500/50 border border-zinc-800 rounded-xl p-4 shadow-md transition cursor-pointer group"
          title="Click to inspect yield calculation"
        >
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
            Predicted Production Yield
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400 group-hover:text-emerald-300 transition-colors">
            {forecastResult.totalForecastPredictedTonnes.toLocaleString()}{' '}
            <span className="text-xs text-zinc-400">Tonnes</span>
          </div>
          <span className="text-[11px] text-zinc-400 mt-2 block">
            Factoring equipment + rain constraints
          </span>
        </div>

        <div
          onClick={() => showToast(`Projected deficit of ${forecastResult.netShortfallTonnes.toLocaleString()} Tonnes (${forecastResult.netShortfallPercent}%). Review bottlenecks below.`)}
          className="bg-zinc-900/90 hover:bg-zinc-850 hover:border-rose-500/60 border border-rose-900/60 rounded-xl p-4 shadow-md transition cursor-pointer group"
          title="Click to inspect shortfall drivers"
        >
          <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider block mb-1">
            Projected Shortfall Deficit
          </span>
          <div className="text-2xl font-bold font-mono text-rose-400 group-hover:text-rose-300 transition-colors">
            -{forecastResult.netShortfallTonnes.toLocaleString()}{' '}
            <span className="text-xs text-rose-300">({forecastResult.netShortfallPercent}%)</span>
          </div>
          <span className="text-[11px] text-zinc-400 mt-2 block">
            Status:{' '}
            <strong className="text-rose-400 font-mono">
              {forecastResult.netShortfallPercent > 15 ? 'HIGH RISK' : 'MODERATE RISK'}
            </strong>
          </span>
        </div>

        <div
          onClick={() => showToast(`Revenue at risk: ₹${forecastResult.financialRevenueAtRiskLakhs.toLocaleString()} Lakhs computed at MOIL grade price realization`)}
          className="bg-zinc-900/90 hover:bg-zinc-850 hover:border-amber-500/60 border border-zinc-800 rounded-xl p-4 shadow-md transition cursor-pointer group"
          title="Click to inspect financial valuation basis"
        >
          <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider block mb-1">
            Financial Revenue At Risk
          </span>
          <div className="text-2xl font-bold font-mono text-amber-400 group-hover:text-amber-300 transition-colors">
            ₹{forecastResult.financialRevenueAtRiskLakhs.toLocaleString()}{' '}
            <span className="text-xs text-zinc-400">Lakhs</span>
          </div>
          <span className="text-[11px] text-zinc-400 mt-2 block">
            At benchmark ₹10,500/T realization
          </span>
        </div>
      </div>

      {/* Main Grid: Control Sliders & Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Panel */}
        <div className="lg:col-span-4 bg-zinc-950/90 border border-zinc-800 rounded-xl p-4 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-violet-400" />
              Dynamic Operational Inputs
            </span>
            <span className="text-[10px] font-mono text-zinc-400">Adjust in Real-Time</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Target Monthly Output */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-zinc-300">Monthly Target (Tonnes)</span>
                <span className="font-mono font-bold text-violet-400">
                  {forecastInput.monthlyTargetTonnes.toLocaleString()} T
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="80000"
                step="1000"
                value={forecastInput.monthlyTargetTonnes}
                onChange={(e) => handleSliderChange('monthlyTargetTonnes', parseFloat(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer"
              />
            </div>

            {/* Fleet Mechanical Availability */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-zinc-300 flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-zinc-400" />
                  Fleet Availability (%)
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {forecastInput.fleetAvailabilityPercent}%
                </span>
              </div>
              <input
                type="range"
                min="45"
                max="100"
                step="1"
                value={forecastInput.fleetAvailabilityPercent}
                onChange={(e) => handleSliderChange('fleetAvailabilityPercent', parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[10px] text-zinc-400">Dumpers, LHDs &amp; Skip Hoist Availability</span>
            </div>

            {/* Blasting Efficiency */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-zinc-300">Blasting Cycle Efficiency (%)</span>
                <span className="font-mono font-bold text-violet-400">
                  {forecastInput.blastingEfficiencyPercent}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="1"
                value={forecastInput.blastingEfficiencyPercent}
                onChange={(e) => handleSliderChange('blastingEfficiencyPercent', parseFloat(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer"
              />
              <span className="text-[10px] text-zinc-400">Muckpile fragmentation &amp; throw factor</span>
            </div>

            {/* Expected Monsoon Rainfall */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-zinc-300 flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                  Expected Rainfall (mm/mo)
                </span>
                <span className="font-mono font-bold text-sky-400">
                  {forecastInput.expectedMonsoonRainfallMm} mm
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="400"
                step="10"
                value={forecastInput.expectedMonsoonRainfallMm}
                onChange={(e) => handleSliderChange('expectedMonsoonRainfallMm', parseFloat(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <span className="text-[10px] text-zinc-400">Satellite IMERG forecast for pit flood risks</span>
            </div>

            {/* Dewatering Pump Capacity */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-zinc-300">Dewatering Capacity (KL/hr)</span>
                <span className="font-mono font-bold text-sky-300">
                  {forecastInput.dewateringCapacityKLPerHour} KL/hr
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="1200"
                step="50"
                value={forecastInput.dewateringCapacityKLPerHour}
                onChange={(e) => handleSliderChange('dewateringCapacityKLPerHour', parseFloat(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <span className="text-[10px] text-zinc-400">Submersible sumps &amp; pipeline capacity</span>
            </div>

            {/* Power Grid Reliability */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-zinc-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Power Grid Uptime (%)
                </span>
                <span className="font-mono font-bold text-amber-400">
                  {forecastInput.powerGridReliabilityPercent}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="1"
                value={forecastInput.powerGridReliabilityPercent}
                onChange={(e) => handleSliderChange('powerGridReliabilityPercent', parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[10px] text-zinc-400">State grid supply &amp; captive DG sets</span>
            </div>

            {/* Forecast Months Horizon Buttons */}
            <div>
              <span className="text-zinc-300 block mb-1.5 font-medium">Forecast Horizon</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[3, 6, 9, 12].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSliderChange('forecastMonths', m)}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                      forecastInput.forecastMonths === m
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {m} Mos
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Sensitivity Panel */}
        <div className="lg:col-span-8 space-y-6">
          {/* Monthly Comparison Bar Chart */}
          <InteractiveBarChart
            items={forecastResult.monthlyTimeline}
          />

          {/* Interactive Sensitivity Tornado Chart */}
          <SensitivityTornadoChart
            bottlenecks={forecastResult.criticalBottlenecks}
            totalShortfallTonnes={forecastResult.netShortfallTonnes}
            onMitigationApplied={(saved) => {
              showToast(`Mitigation simulation logged! Recovered ${saved.toLocaleString()} Tonnes from planned interventions.`);
            }}
          />
        </div>
      </div>

      {/* Floating notification */}
      {mitigationToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-amber-500/80 text-amber-200 text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 max-w-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{mitigationToast}</span>
        </div>
      )}
    </div>
  );
};
