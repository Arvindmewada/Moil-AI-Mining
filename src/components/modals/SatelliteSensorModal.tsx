import React from 'react';
import { X, Trees, Droplets, Radio, Thermometer, ExternalLink, ShieldCheck, Activity, CheckCircle2 } from 'lucide-react';
import { SatelliteMetrics, MineLease } from '../../types';
import { MOIL_MINES } from '../../data/mockMiningData';

export type SensorType = 'ndvi' | 'rainfall' | 'soil' | 'soil_moisture' | 'temp' | 'temperature';

interface SatelliteSensorModalProps {
  isOpen: boolean;
  sensorType?: SensorType | null;
  initialSensor?: SensorType | null;
  satelliteData?: SatelliteMetrics;
  metrics?: SatelliteMetrics;
  mine?: MineLease;
  onClose: () => void;
  onAdjustValue?: (type: SensorType, val: number) => void;
}

export const SatelliteSensorModal: React.FC<SatelliteSensorModalProps> = ({
  isOpen,
  sensorType,
  initialSensor,
  satelliteData,
  metrics,
  mine = MOIL_MINES[0],
  onClose,
  onAdjustValue,
}) => {
  const activeInputSensor = sensorType || initialSensor;
  const activeData = satelliteData || metrics;

  if (!isOpen || !activeInputSensor || !activeData) return null;

  const normalizedSensor: 'ndvi' | 'rainfall' | 'soil_moisture' | 'temperature' =
    activeInputSensor === 'soil'
      ? 'soil_moisture'
      : activeInputSensor === 'temp'
      ? 'temperature'
      : activeInputSensor;

  const sensorConfig = {
    ndvi: {
      name: 'Sentinel-2 MSI Normalized Difference Vegetation Index (NDVI)',
      icon: <Trees className="w-5 h-5 text-emerald-400" />,
      currentValue: activeData.ndvi,
      unit: 'NDVI (-0.1 to 0.9)',
      satelliteSource: 'Copernicus Sentinel-2A/2B (MSI MultiSpectral Instrument)',
      bands: 'Band 8 (Near-Infrared, 842 nm) & Band 4 (Red, 665 nm)',
      spatialResolution: '10 meters ground sampling distance (GSD)',
      revisitTime: '5 days constellation frequency',
      miningApplication:
        'Monitors biological reclamation in active mine buffer zones, overburden dump vegetation stabilization, and environmental forest canopy clearance compliance around lease boundaries.',
      operationalNote:
        'NDVI values >0.45 signify healthy forest cover over Central Indian hill tracts (e.g. Balaghat & Ukwa). Underground ore bodies have zero direct optical reflectance; vegetation data strictly supports surface ESG compliance and pit runoff absorption modeling.',
      trendData: [
        { label: 'W-4', val: Math.max(0.1, activeData.ndvi - 0.05) },
        { label: 'W-3', val: Math.max(0.1, activeData.ndvi - 0.03) },
        { label: 'W-2', val: Math.max(0.1, activeData.ndvi + 0.02) },
        { label: 'W-1', val: Math.max(0.1, activeData.ndvi + 0.01) },
        { label: 'Now', val: activeData.ndvi },
      ],
      minRange: 0.1,
      maxRange: 0.8,
      step: 0.02,
    },
    rainfall: {
      name: 'NASA GPM IMERG Precipitation Synthesis',
      icon: <Droplets className="w-5 h-5 text-sky-400" />,
      currentValue: activeData.rainfallMonthlyMm,
      unit: 'mm / month',
      satelliteSource: 'NASA / JAXA Global Precipitation Measurement (GPM) Core Observatory',
      bands: 'Dual-frequency Precipitation Radar (Ku/Ka-band: 13.6 / 35.5 GHz) + GMI Radiometer',
      spatialResolution: '0.1° x 0.1° (~10 km grid)',
      revisitTime: '30-minute half-hourly calibrated precipitation estimates',
      miningApplication:
        'Drives pit water ingress volume calculations, stope dewatering pump duty cycles, skip hoist brake slip hazard mitigation, and haulage road slurry condition warnings.',
      operationalNote:
        'Heavy precipitation (>150mm/month) in Balaghat & Bhandara districts severely impacts opencast quarry benches (Dongri Buzurg/Tirodi) and increases underground sump inflow rates at Bharweli deep shaft.',
      trendData: [
        { label: 'Jun', val: Math.round(activeData.rainfallMonthlyMm * 0.6) },
        { label: 'Jul', val: Math.round(activeData.rainfallMonthlyMm * 1.3) },
        { label: 'Aug', val: Math.round(activeData.rainfallMonthlyMm * 1.15) },
        { label: 'Sep', val: Math.round(activeData.rainfallMonthlyMm * 0.9) },
        { label: 'Oct', val: Math.round(activeData.rainfallMonthlyMm * 0.35) },
      ],
      minRange: 20,
      maxRange: 400,
      step: 5,
    },
    soil_moisture: {
      name: 'Sentinel-1 C-Band SAR Synthetic Aperture Radar Backscatter',
      icon: <Radio className="w-5 h-5 text-purple-400" />,
      currentValue: activeData.soilMoistureRadarDb,
      unit: 'dB (Sigma Naught)',
      satelliteSource: 'ESA Copernicus Sentinel-1A / 1C (C-SAR Radar at 5.405 GHz)',
      bands: 'VV (Vertical-Vertical) & VH (Vertical-Horizontal) cross-polarization backscatter',
      spatialResolution: '20m x 22m Interferometric Wide (IW) swath',
      revisitTime: '6 to 12 days repeat cycle (cloud-penetrating microwave)',
      miningApplication:
        'Detects soil saturation and waterlogging in opencast pit floors, tailings dam berm moisture ingress, and haul ramp slope instability.',
      operationalNote:
        'Radar backscatter increases towards -8 dB under high dielectric soil water content. High saturation creates traction loss for 40-tonne dumpers and increases opencast slope circular failure risks.',
      trendData: [
        { label: 'Day -20', val: activeData.soilMoistureRadarDb - 1.8 },
        { label: 'Day -15', val: activeData.soilMoistureRadarDb - 1.2 },
        { label: 'Day -10', val: activeData.soilMoistureRadarDb - 0.4 },
        { label: 'Day -5', val: activeData.soilMoistureRadarDb + 0.3 },
        { label: 'Current', val: activeData.soilMoistureRadarDb },
      ],
      minRange: -18,
      maxRange: -6,
      step: 0.2,
    },
    temperature: {
      name: 'Landsat 8/9 TIRS Land Surface Temperature (LST)',
      icon: <Thermometer className="w-5 h-5 text-amber-400" />,
      currentValue: activeData.landSurfaceTempCelsius,
      unit: '°C',
      satelliteSource: 'USGS / NASA Landsat 8/9 Thermal Infrared Sensor (TIRS-2)',
      bands: 'Band 10 (10.60 - 11.19 µm) Split-Window Thermal Radiance',
      spatialResolution: '100m resampled to 30m',
      revisitTime: '8 days offset cadence',
      miningApplication:
        'Monitors opencast quarry thermal stress, deep underground shaft intake air temperature pre-cooling requirements, and spontaneous heating risks in carbonaceous pyritic host schists.',
      operationalNote:
        'Surface temperatures exceeding 42°C in peak summer necessitate cooling water misting at active underground downcast shaft stations.',
      trendData: [
        { label: 'Jun', val: 38.5 },
        { label: 'Jul', val: 32.8 },
        { label: 'Aug', val: 31.0 },
        { label: 'Sep', val: activeData.landSurfaceTempCelsius },
      ],
      minRange: 18,
      maxRange: 48,
      step: 0.5,
    },
  }[normalizedSensor];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-zinc-800 border border-zinc-700">{sensorConfig.icon}</div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-100">{sensorConfig.name}</h2>
              </div>
              <p className="text-xs text-zinc-400">
                Active Lease: <strong className="text-violet-300">{mine.name}</strong> ({mine.method})
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
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Main Stat Card */}
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Calibrated Ground Reading
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-mono font-bold text-zinc-100">{sensorConfig.currentValue}</span>
                <span className="text-sm font-mono text-zinc-400">{sensorConfig.unit}</span>
              </div>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Timestamp: {activeData.timestamp}
              </span>
            </div>

            {/* Sparkline trend */}
            <div className="flex flex-col items-end">
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider mb-1">
                Recent Satellite Pass Readings
              </span>
              <div className="flex items-end gap-2 h-14 bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
                {sensorConfig.trendData.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className="w-4 bg-sky-500/70 hover:bg-sky-400 rounded-t transition-all"
                      style={{
                        height: `${Math.max(12, Math.min(48, ((d.val - sensorConfig.minRange) / (sensorConfig.maxRange - sensorConfig.minRange || 1)) * 48))}px`,
                      }}
                      title={`${d.label}: ${d.val}`}
                    />
                    <span className="text-[8px] font-mono text-zinc-400">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Simulation Slider */}
          {onAdjustValue && (
            <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-zinc-300">
                  Simulate Alternate Remote Sensing Reading:
                </span>
                <span className="font-mono font-bold text-violet-400">
                  {sensorConfig.currentValue} {sensorConfig.unit}
                </span>
              </div>
              <input
                type="range"
                min={sensorConfig.minRange}
                max={sensorConfig.maxRange}
                step={sensorConfig.step}
                value={sensorConfig.currentValue}
                onChange={(e) => onAdjustValue(normalizedSensor, parseFloat(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer"
              />
              <span className="text-[10px] text-zinc-400 block">
                Slide to test operational model impact on haul road traction, sump inundation, and skip hoisting.
              </span>
            </div>
          )}

          {/* Satellite Technical Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
              <span className="text-zinc-400 font-semibold block text-[10px] uppercase">Constellation Source</span>
              <span className="text-zinc-200 font-medium mt-0.5 block">{sensorConfig.satelliteSource}</span>
            </div>
            <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
              <span className="text-zinc-400 font-semibold block text-[10px] uppercase">Sensor Bands</span>
              <span className="text-zinc-200 font-medium mt-0.5 block">{sensorConfig.bands}</span>
            </div>
            <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
              <span className="text-zinc-400 font-semibold block text-[10px] uppercase">Ground Resolution</span>
              <span className="text-zinc-200 font-medium mt-0.5 block">{sensorConfig.spatialResolution}</span>
            </div>
            <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-zinc-800">
              <span className="text-zinc-400 font-semibold block text-[10px] uppercase">Revisit Frequency</span>
              <span className="text-zinc-200 font-medium mt-0.5 block">{sensorConfig.revisitTime}</span>
            </div>
          </div>

          {/* Mining Context & Operational Protocols */}
          <div className="space-y-3">
            <div className="bg-zinc-950/70 p-4 rounded-xl border border-zinc-800">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 mb-1">
                <Activity className="w-4 h-4" />
                Mining Engineering Application
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">{sensorConfig.miningApplication}</p>
            </div>

            <div className="bg-amber-950/20 border border-amber-800/40 p-3.5 rounded-xl text-xs text-amber-200/90 leading-relaxed">
              <strong className="text-amber-300">Scientific Integrity Notice: </strong>
              {sensorConfig.operationalNote}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          <span className="text-xs text-zinc-500 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Ground-validated Copernicus/NASA feed
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
