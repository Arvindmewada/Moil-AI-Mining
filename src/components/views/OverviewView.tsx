import React, { useState } from 'react';
import {
  MineLease,
  SatelliteMetrics,
  RiskAlert,
  ReserveEstimateResult,
  ProductionForecastResult,
} from '../../types';
import { MOIL_MINES } from '../../data/mockMiningData';
import { MetricCard } from '../common/MetricCard';
import { ScientificCaveatBanner } from '../common/ScientificCaveatBanner';
import { ProductionBenchmarkLineChart } from '../charts/ProductionBenchmarkLineChart';
import { SatelliteSensorModal, SensorType } from '../modals/SatelliteSensorModal';
import { MineLeaseDetailModal } from '../modals/MineLeaseDetailModal';
import {
  Layers,
  TrendingDown,
  CloudRain,
  Radio,
  MapPin,
  ArrowRight,
  ShieldAlert,
  Compass,
  Cpu,
  Droplets,
  Thermometer,
  Trees,
  Sparkles,
  ChevronRight,
  Eye,
  Pickaxe,
} from 'lucide-react';
import { NavTab } from '../common/Sidebar';

interface OverviewViewProps {
  selectedMine: MineLease;
  onSelectMine: (mine: MineLease) => void;
  onNavigate: (tab: NavTab) => void;
  satelliteData: SatelliteMetrics;
  reserveResult: ReserveEstimateResult;
  productionResult: ProductionForecastResult;
  alerts: RiskAlert[];
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  selectedMine,
  onSelectMine,
  onNavigate,
  satelliteData,
  reserveResult,
  productionResult,
  alerts,
}) => {
  const [mapHoveredMine, setMapHoveredMine] = useState<MineLease | null>(null);
  const [selectedSensorModal, setSelectedSensorModal] = useState<SensorType | null>(null);
  const [modalMineDetail, setModalMineDetail] = useState<MineLease | null>(null);

  // Geographic bounds for Central India Manganese Belt schematic
  const mapWidth = 580;
  const mapHeight = 320;
  const minLng = 78.8;
  const maxLng = 80.6;
  const minLat = 21.2;
  const maxLat = 22.1;

  const getMapX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * (mapWidth - 80) + 40;
  const getMapY = (lat: number) => (1 - (lat - minLat) / (maxLat - minLat)) * (mapHeight - 80) + 40;

  return (
    <div className="space-y-6">
      {/* Scientific Integrity Banner */}
      <ScientificCaveatBanner />

      {/* Primary KPI Grid with interactive click navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Illustrative Ore Potential"
          value={reserveResult.recoverableTonnageMT.toFixed(2)}
          unit="Million Tonnes"
          delta={{ value: `${reserveResult.estimatedGradeMn}% Mn`, isPositive: true, label: 'Modeled Grade' }}
          icon={<Layers className="w-5 h-5 text-violet-400" />}
          badge={{ text: 'DEMO / UNFC 333', variant: 'purple' }}
          onClick={() => onNavigate('reserve')}
          tooltip="Click to explore 2.5D Strata, Monte Carlo & Reserve Intelligence"
        />

        <MetricCard
          title="Projected Shortfall Deficit"
          value={productionResult.netShortfallTonnes.toLocaleString()}
          unit="Tonnes"
          delta={{
            value: `-${productionResult.netShortfallPercent}%`,
            isPositive: false,
            label: 'Target Variance',
          }}
          icon={<TrendingDown className="w-5 h-5 text-rose-400" />}
          badge={{
            text: productionResult.netShortfallPercent > 15 ? 'HIGH RISK' : 'MODERATE RISK',
            variant: productionResult.netShortfallPercent > 15 ? 'danger' : 'warning',
          }}
          onClick={() => onNavigate('production')}
          tooltip="Click to inspect 6-Month Production Forecast & Bottleneck Sensitivity"
        />

        <MetricCard
          title="Monsoon Inflow Saturation"
          value={`${satelliteData.rainfallMonthlyMm} mm`}
          unit="IMERG GPM"
          subtitle={`Pit Risk: ${satelliteData.pitWaterloggingRisk}`}
          icon={<CloudRain className="w-5 h-5 text-sky-400" />}
          badge={{
            text: satelliteData.pitWaterloggingRisk.toUpperCase(),
            variant: satelliteData.pitWaterloggingRisk === 'Severe' ? 'danger' : 'warning',
          }}
          onClick={() => setSelectedSensorModal('rainfall')}
          tooltip="Click to inspect satellite IMERG Precipitation & radar soil telemetry"
        />

        <MetricCard
          title="Active Geo-Alerts"
          value={alerts.filter((a) => !a.resolved).length}
          unit="Unresolved"
          subtitle="Real-time sensor telemetry"
          icon={<ShieldAlert className="w-5 h-5 text-amber-400" />}
          badge={{ text: 'OPERATIONAL', variant: 'warning' }}
          onClick={() => onNavigate('risk')}
          tooltip="Click to open Risk & AI Recommendations Dashboard"
        />
      </div>

      {/* Main Section: Mine Map Schematic & Production Horizon */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Central India Manganese Belt Interactive Schematic Map */}
        <div className="lg:col-span-7 bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <Compass className="w-4 h-4 text-violet-400" />
                Central India Manganese Belt — MOIL Lease Network
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Balaghat (MP) • Bhandara &amp; Nagpur (MH) Sausar Group Metasedimentary Belt • Click node to inspect lease
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setModalMineDetail(selectedMine)}
                className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-violet-950/60 hover:bg-violet-900/60 text-violet-300 border border-violet-800 flex items-center gap-1 transition cursor-pointer"
                title="Inspect selected mine lease profile"
              >
                <Eye className="w-3 h-3" />
                Inspect Lease
              </button>
            </div>
          </div>

          {/* SVG Map Schematic */}
          <div className="relative w-full bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-2 my-2 overflow-hidden">
            <svg
              viewBox={`0 0 ${mapWidth} ${mapHeight}`}
              className="w-full h-auto select-none"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Regional Grid Lines */}
              <defs>
                <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#27272a" strokeWidth="0.5" />
                </pattern>
                <linearGradient id="stateGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              <rect width={mapWidth} height={mapHeight} fill="url(#gridPattern)" />

              {/* State Border Line (MP / Maharashtra) */}
              <path
                d="M 20 180 Q 220 160 380 185 T 560 170"
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                fill="none"
              />
              <text x="50" y="150" fill="#818cf8" fontSize="10" fontFamily="sans-serif" opacity="0.6">
                MADHYA PRADESH (Balaghat District)
              </text>
              <text x="50" y="210" fill="#a78bfa" fontSize="10" fontFamily="sans-serif" opacity="0.6">
                MAHARASHTRA (Bhandara &amp; Nagpur Districts)
              </text>

              {/* Geological Sausar Group Manganese Horizon Band */}
              <path
                d="M 60 210 Q 240 180 390 175 Q 490 140 540 110"
                stroke="#7c3aed"
                strokeWidth="12"
                strokeOpacity="0.25"
                strokeLinecap="round"
                fill="none"
              />
              <text x="310" y="160" fill="#c084fc" fontSize="9" fontFamily="monospace">
                Sausar Manganese Ore Bed Strike Line (~130 km)
              </text>

              {/* Connecting Haulage / Rail Lines between mines */}
              {MOIL_MINES.map((mine, i) => {
                const nextMine = MOIL_MINES[(i + 1) % MOIL_MINES.length];
                return (
                  <line
                    key={`line-${mine.id}`}
                    x1={getMapX(mine.coordinates.lng)}
                    y1={getMapY(mine.coordinates.lat)}
                    x2={getMapX(nextMine.coordinates.lng)}
                    y2={getMapY(nextMine.coordinates.lat)}
                    stroke="#3f3f46"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                  />
                );
              })}

              {/* Mine Lease Nodes */}
              {MOIL_MINES.map((mine) => {
                const cx = getMapX(mine.coordinates.lng);
                const cy = getMapY(mine.coordinates.lat);
                const isSelected = selectedMine.id === mine.id;
                const isHovered = mapHoveredMine?.id === mine.id;

                return (
                  <g
                    key={mine.id}
                    className="cursor-pointer transition-transform"
                    onClick={() => {
                      onSelectMine(mine);
                      setModalMineDetail(mine);
                    }}
                    onMouseEnter={() => setMapHoveredMine(mine)}
                    onMouseLeave={() => setMapHoveredMine(null)}
                  >
                    {/* Pulsing ring for selected mine */}
                    {isSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="14"
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="2"
                        className="animate-ping"
                        opacity="0.4"
                      />
                    )}

                    {/* Mine Node Circle */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 8 : isHovered ? 7 : 5.5}
                      fill={isSelected ? '#a855f7' : mine.method === 'Underground' ? '#38bdf8' : '#fbbf24'}
                      stroke="#09090b"
                      strokeWidth="2"
                    />

                    {/* Label */}
                    <text
                      x={cx + 10}
                      y={cy + 4}
                      fill={isSelected ? '#f3e8ff' : isHovered ? '#e4e4e7' : '#a1a1aa'}
                      fontSize={isSelected ? '11' : '10'}
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      fontFamily="sans-serif"
                    >
                      {mine.name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover details tooltip */}
            {mapHoveredMine && (
              <div className="absolute bottom-3 left-3 bg-zinc-950/95 border border-zinc-700/80 rounded-lg p-2.5 shadow-xl text-xs max-w-xs backdrop-blur-md animate-in fade-in">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-zinc-100">{mapHoveredMine.name}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-zinc-800 text-zinc-300">
                    {mapHoveredMine.method}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 space-y-0.5 font-mono">
                  <div>
                    District: {mapHoveredMine.district}, {mapHoveredMine.state}
                  </div>
                  <div>Daily Target: {mapHoveredMine.dailyTargetTonnes.toLocaleString()} t/day</div>
                  <div>Avg Grade: {mapHoveredMine.typicalGradeMnPercent}% Mn</div>
                </div>
                <div className="mt-1.5 pt-1 border-t border-zinc-800 flex items-center justify-between text-[10px] text-violet-400">
                  <span>Click node to inspect full operations profile</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            )}
          </div>

          {/* Map Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800 text-[11px] text-zinc-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
                <span>Underground Mine</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span>Opencast / Mixed</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                <span>Active Selection</span>
              </span>
            </div>
            <div className="text-[10px] font-mono text-zinc-500">
              Selected: <strong className="text-zinc-300">{selectedMine.name}</strong> ({selectedMine.district})
            </div>
          </div>
        </div>

        {/* 6-Month Production Forecast Mini View (Recharts Line Chart) */}
        <div className="lg:col-span-5 bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                Production vs. Benchmark Horizon
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">Projected monthly trajectory vs. targets &amp; benchmarks</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('production')}
              className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition cursor-pointer"
            >
              <span>Scenario Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="my-1">
            <ProductionBenchmarkLineChart items={productionResult.monthlyTimeline} mine={selectedMine} />
          </div>

          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-zinc-400">
              Shortfall Gap: <strong className="text-rose-400">{productionResult.netShortfallTonnes.toLocaleString()} Tonnes</strong>
            </span>
            <button
              type="button"
              onClick={() => onNavigate('production')}
              className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <span>Explore Bottlenecks &amp; Mitigations</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Satellite Sensor Telemetry & Immediate Risk Flags */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Environmental & Surface Covariates with Interactive Sensor Modals */}
        <div className="lg:col-span-6 bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                Surface &amp; Environmental Telemetry
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Click icon to inspect sensor
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <button
              type="button"
              onClick={() => setSelectedSensorModal('ndvi')}
              title="Click to view Sentinel-2 NDVI vegetative cover telemetry & pit slope analysis"
              className="bg-zinc-900/70 hover:bg-zinc-850 hover:border-emerald-500/60 border border-zinc-800 p-2.5 rounded-xl text-center transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400 group-hover:text-emerald-300 mb-1">
                <Trees className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>NDVI Index</span>
              </div>
              <span className="text-lg font-mono font-bold text-emerald-400">{satelliteData.ndvi}</span>
              <span className="text-[9px] text-zinc-400 block mt-0.5">Vegetation Cover ↗</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSensorModal('rainfall')}
              title="Click to view IMERG GPM precipitation telemetry & water ingress curves"
              className="bg-zinc-900/70 hover:bg-zinc-850 hover:border-sky-500/60 border border-zinc-800 p-2.5 rounded-xl text-center transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400 group-hover:text-sky-300 mb-1">
                <Droplets className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
                <span>Precipitation</span>
              </div>
              <span className="text-lg font-mono font-bold text-sky-400">
                {satelliteData.rainfallMonthlyMm} <span className="text-xs">mm</span>
              </span>
              <span className="text-[9px] text-zinc-400 block mt-0.5">IMERG Monthly ↗</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSensorModal('soil_moisture')}
              title="Click to view Sentinel-1 SAR Radar soil moisture & pit saturation dynamics"
              className="bg-zinc-900/70 hover:bg-zinc-850 hover:border-purple-500/60 border border-zinc-800 p-2.5 rounded-xl text-center transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400 group-hover:text-purple-300 mb-1">
                <Radio className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
                <span>Radar Soil Mo.</span>
              </div>
              <span className="text-lg font-mono font-bold text-purple-400">
                {satelliteData.soilMoistureRadarDb} <span className="text-xs">dB</span>
              </span>
              <span className="text-[9px] text-zinc-400 block mt-0.5">Sentinel-1 SAR ↗</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSensorModal('temperature')}
              title="Click to view Landsat / MODIS Land Surface Temperature & thermal anomaly analysis"
              className="bg-zinc-900/70 hover:bg-zinc-850 hover:border-amber-500/60 border border-zinc-800 p-2.5 rounded-xl text-center transition-all cursor-pointer group shadow-sm"
            >
              <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400 group-hover:text-amber-300 mb-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Surface Temp</span>
              </div>
              <span className="text-lg font-mono font-bold text-amber-400">
                {satelliteData.landSurfaceTempCelsius}°C
              </span>
              <span className="text-[9px] text-zinc-400 block mt-0.5">MODIS LST ↗</span>
            </button>
          </div>

          <div className="p-3 bg-zinc-900/80 border border-zinc-800/90 rounded-lg text-xs leading-relaxed text-zinc-300">
            <span className="font-semibold text-sky-300">Remote Sensing Context: </span>
            {satelliteData.scientificNotice}
          </div>
        </div>

        {/* Priority Action Alerts with clickable items */}
        <div className="lg:col-span-6 bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                Immediate Operational Risk Flags
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('risk')}
              className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1 transition cursor-pointer"
            >
              <span>View All ({alerts.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[220px] pr-1">
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                onClick={() => onNavigate('risk')}
                title="Click to view full dispatch & mitigation playbook in Risk Recommendations"
                className="bg-zinc-900/70 hover:bg-zinc-850 hover:border-violet-500/60 border border-zinc-800/90 rounded-xl p-3 transition cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-zinc-200 group-hover:text-amber-300 transition-colors">
                    {alert.title}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        alert.severity === 'Critical'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : alert.severity === 'High'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      }`}
                    >
                      {alert.severity.toUpperCase()}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-200 transition-colors" />
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-tight">{alert.description}</p>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mt-2 pt-1.5 border-t border-zinc-800">
                  <span className="text-amber-400">Impact: {alert.estimatedImpact}</span>
                  <span>{alert.detectedAt} • Click for playbook ↗</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Satellite Sensor Modal */}
      {selectedSensorModal && (
        <SatelliteSensorModal
          isOpen={!!selectedSensorModal}
          initialSensor={selectedSensorModal}
          metrics={satelliteData}
          onClose={() => setSelectedSensorModal(null)}
        />
      )}

      {/* Mine Lease Detail Modal */}
      {modalMineDetail && (
        <MineLeaseDetailModal
          isOpen={!!modalMineDetail}
          mine={modalMineDetail}
          onClose={() => setModalMineDetail(null)}
          onSelectMine={(m) => {
            onSelectMine(m);
            setModalMineDetail(null);
          }}
        />
      )}
    </div>
  );
};
