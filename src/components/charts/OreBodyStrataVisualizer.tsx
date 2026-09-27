import React, { useState } from 'react';
import { Layers, Droplets, Satellite, Compass, Sparkles, AlertCircle, Info, ChevronRight, CheckCircle2 } from 'lucide-react';
import { BoreholeDetailModal } from '../modals/BoreholeDetailModal';
import { SatelliteSensorModal, SensorType } from '../modals/SatelliteSensorModal';
import { MOCK_BOREHOLES, MOCK_SATELLITE_DATA } from '../../data/mockMiningData';
import { BoreholeData } from '../../types';

interface OreBodyStrataVisualizerProps {
  dipAngleDeg: number;
  trueThicknessM: number;
  depthExtentM: number;
  inSituMnGrade: number;
  satelliteNdvi: number;
  satelliteRainfallMm: number;
}

export const OreBodyStrataVisualizer: React.FC<OreBodyStrataVisualizerProps> = ({
  dipAngleDeg,
  trueThicknessM,
  depthExtentM,
  inSituMnGrade,
  satelliteNdvi,
  satelliteRainfallMm,
}) => {
  const [showSatelliteOverlay, setShowSatelliteOverlay] = useState(true);
  const [showDrillholes, setShowDrillholes] = useState(true);
  const [showFaults, setShowFaults] = useState(true);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  // Modals state
  const [selectedBorehole, setSelectedBorehole] = useState<BoreholeData | null>(null);
  const [satelliteModalSensor, setSatelliteModalSensor] = useState<SensorType | null>(null);
  const [activeLayerInfo, setActiveLayerInfo] = useState<{
    title: string;
    description: string;
    stats: string;
  } | null>(null);

  // SVG dimensions
  const svgWidth = 720;
  const svgHeight = 360;

  // Visual parameters scaled from props
  const clampedDip = Math.max(25, Math.min(75, dipAngleDeg));
  const dipRad = (clampedDip * Math.PI) / 180;
  const scaledThickness = 12 + ((trueThicknessM - 2) / 24) * 32;

  // Surface line
  const surfaceY = 65;

  // Vein origin near surface
  const veinStartX = 240;
  const veinStartY = surfaceY + 28;
  const veinLength = 320;
  const veinEndX = veinStartX + Math.cos(dipRad) * veinLength;
  const veinEndY = Math.min(svgHeight - 30, veinStartY + Math.sin(dipRad) * veinLength);

  // Perpendicular vector for thickness
  const perpX = -Math.sin(dipRad) * scaledThickness;
  const perpY = Math.cos(dipRad) * scaledThickness;

  const orePolygonPoints = [
    `${veinStartX},${veinStartY}`,
    `${veinStartX + perpX},${veinStartY + perpY}`,
    `${veinEndX + perpX},${veinEndY + perpY}`,
    `${veinEndX},${veinEndY}`,
  ].join(' ');

  // Water table level
  const waterTableY = surfaceY + Math.max(15, 60 - (satelliteRainfallMm / 250) * 30);

  const bh1 = MOCK_BOREHOLES[0] || {
    holeId: 'BH-BGT-01',
    mineId: 'bgt-01',
    easting: 423500,
    northing: 2420800,
    collarElevationM: 320,
    totalDepthM: 320,
    oreInterceptStartM: 115,
    oreInterceptEndM: 129,
    interceptThicknessM: 14,
    mnGradePercent: 44.5,
    feGradePercent: 6.8,
    pGradePercent: 0.12,
    sio2GradePercent: 9.4,
    bulkDensity: 3.85,
    lithology: 'High-grade Braunite',
    unfcClassification: '111 (Proved)',
    dateLogged: '2024-03-12',
  };

  const bh2 = MOCK_BOREHOLES[1] || {
    ...bh1,
    holeId: 'BH-BGT-02',
    totalDepthM: 280,
    oreInterceptStartM: 95,
    oreInterceptEndM: 107,
    interceptThicknessM: 12,
    mnGradePercent: 42.0,
    unfcClassification: '122 (Probable)',
  };

  return (
    <div className="w-full bg-zinc-950/90 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
      {/* Top control bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-zinc-800 gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-semibold text-zinc-200 tracking-wide uppercase">
            2.5D Geological Strata & Subsurface Model
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-violet-950/80 text-violet-300 border border-violet-800 font-mono">
            {clampedDip}° Dip | {trueThicknessM}m True Thickness | {inSituMnGrade}% Mn
          </span>
        </div>

        {/* Layer toggles with interactive buttons */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setShowSatelliteOverlay(!showSatelliteOverlay)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition text-xs font-medium cursor-pointer ${
              showSatelliteOverlay
                ? 'bg-sky-950/80 text-sky-300 border border-sky-700 shadow-sm'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-zinc-200'
            }`}
            title="Toggle satellite remote sensing overlay"
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>Satellite Ingress</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDrillholes(!showDrillholes)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition text-xs font-medium cursor-pointer ${
              showDrillholes
                ? 'bg-amber-950/80 text-amber-300 border border-amber-700 shadow-sm'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-zinc-200'
            }`}
            title="Toggle diamond core drillhole logs"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Core Drillholes</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFaults(!showFaults)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition text-xs font-medium cursor-pointer ${
              showFaults
                ? 'bg-rose-950/80 text-rose-300 border border-rose-700 shadow-sm'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:text-zinc-200'
            }`}
            title="Toggle structural fault planes"
          >
            <span>Fault Planes</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full p-2 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Manganese Ore Body Pattern */}
            <pattern id="mnOrePattern" width="16" height="16" patternUnits="userSpaceOnUse">
              <rect width="16" height="16" fill="#4c1d95" />
              <circle cx="4" cy="4" r="2" fill="#7c3aed" />
              <circle cx="12" cy="12" r="2.5" fill="#a78bfa" />
              <circle cx="12" cy="4" r="1.5" fill="#2e1065" />
              <circle cx="4" cy="12" r="1.8" fill="#c4b5fd" />
            </pattern>

            {/* Overburden gravel pattern */}
            <pattern id="overburdenPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="#27272a" />
              <path d="M 0 10 L 20 10 M 10 0 L 10 20" stroke="#3f3f46" strokeWidth="0.5" />
            </pattern>

            {/* Gondite Schist host rock pattern */}
            <pattern id="schistPattern" width="24" height="24" patternUnits="userSpaceOnUse">
              <rect width="24" height="24" fill="#18181b" />
              <line x1="0" y1="6" x2="24" y2="6" stroke="#27272a" strokeWidth="1" strokeDasharray="6 2" />
              <line x1="0" y1="18" x2="24" y2="18" stroke="#27272a" strokeWidth="1" strokeDasharray="6 2" />
            </pattern>

            {/* Sky gradient */}
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#082f49" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.1" />
            </linearGradient>

            {/* Satellite radar wave effect */}
            <linearGradient id="radarWave" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Above-ground Sky atmosphere */}
          <rect x="0" y="0" width={svgWidth} height={surfaceY} fill="url(#skyGrad)" />

          {/* Satellite Orbit Line & Beam */}
          {showSatelliteOverlay && (
            <g
              className="cursor-pointer group"
              onClick={() => setSatelliteModalSensor('rainfall')}
            >
              <title>Click to view Sentinel-2 &amp; IMERG Precipitation Telemetry</title>
              <line x1="0" y1="14" x2={svgWidth} y2="14" stroke="#0284c7" strokeDasharray="4 6" opacity="0.6" />
              <circle cx="160" cy="14" r="6" fill="#38bdf8" className="animate-pulse" />
              <text x="175" y="18" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                Sentinel-2 / IMERG GPM Track ↗ [Click to Inspect]
              </text>
              {/* Radar Ingress Cone to surface */}
              <polygon points="160,14 60,65 260,65" fill="url(#radarWave)" opacity="0.6" />
              {/* Rain Ingress arrows */}
              <g stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 3">
                <line x1="80" y1="28" x2="80" y2="58" />
                <line x1="120" y1="24" x2="120" y2="60" />
                <line x1="200" y1="26" x2="200" y2="58" />
                <line x1="240" y1="30" x2="240" y2="62" />
              </g>
              <text x="250" y="38" fill="#7dd3fc" fontSize="9" fontFamily="sans-serif">
                Rainfall Infiltration: {satelliteRainfallMm} mm/mo (Click Sensor)
              </text>
            </g>
          )}

          {/* Topography Surface Line with Vegetative Canopy (NDVI) */}
          <path
            d={`M 0,${surfaceY + 8} Q 180,${surfaceY - 14} 360,${surfaceY} T 720,${surfaceY + 6}`}
            fill="none"
            stroke="#16a34a"
            strokeWidth="3.5"
            className="cursor-pointer"
            onClick={() => setSatelliteModalSensor('ndvi')}
          />
          {/* Grass / Vegetation spikes representing NDVI */}
          {Array.from({ length: 30 }).map((_, idx) => {
            const x = 20 + idx * 24;
            const h = 4 + satelliteNdvi * 12;
            return (
              <line
                key={idx}
                x1={x}
                y1={surfaceY}
                x2={x}
                y2={surfaceY - h}
                stroke="#22c55e"
                strokeWidth="1.5"
                opacity="0.8"
                className="cursor-pointer"
                onClick={() => setSatelliteModalSensor('ndvi')}
              />
            );
          })}

          {/* Overburden Layer (Saprolite / Alluvium) */}
          <rect
            x="0"
            y={surfaceY}
            width={svgWidth}
            height="28"
            fill="url(#overburdenPattern)"
            opacity="0.9"
            className="cursor-pointer"
            onClick={() =>
              setActiveLayerInfo({
                title: 'Surface Overburden & Lateritic Cap',
                description: 'Weathered laterite and soil capping ranging from 8m to 28m thickness across the strike ridge.',
                stats: 'Bulk Density: 2.1 t/m³ • Clay Content: High',
              })
            }
          />
          <text x="15" y={surfaceY + 18} fill="#a1a1aa" fontSize="9" fontFamily="sans-serif">
            Overburden / Laterite Cap (~25m) [Click to Inspect]
          </text>

          {/* Host Rock: Mansar Formation Gondite / Quartzite */}
          <rect
            x="0"
            y={surfaceY + 28}
            width={svgWidth}
            height={svgHeight - surfaceY - 28}
            fill="url(#schistPattern)"
            className="cursor-pointer"
            onClick={() =>
              setActiveLayerInfo({
                title: 'Mansar Formation (Sausar Group)',
                description: 'Metasedimentary quartz-muscovite schists and gonditic manganese silicate rocks forming the hanging and footwall.',
                stats: 'Compressive Strength: 65 MPa • RQD: 78%',
              })
            }
          />

          {/* Water Table Inundation Line */}
          <g
            className="cursor-pointer"
            onClick={() => setSatelliteModalSensor('soil_moisture')}
          >
            <title>Click to inspect hydrogeology and soil moisture backscatter</title>
            <line
              x1="0"
              y1={waterTableY}
              x2={svgWidth}
              y2={waterTableY}
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="6 4"
              opacity="0.8"
            />
            <text x="520" y={waterTableY - 6} fill="#38bdf8" fontSize="9" fontFamily="sans-serif">
              Phreatic Water Table (-{(waterTableY - surfaceY).toFixed(0)}m) ↗ [Sensor]
            </text>
          </g>

          {/* Manganese Ore Body (Dipping Seam) */}
          <g
            className="cursor-pointer group"
            onMouseEnter={() => setHoveredElement('orebody')}
            onMouseLeave={() => setHoveredElement(null)}
            onClick={() =>
              setActiveLayerInfo({
                title: `Primary Manganese Ore Seam (${inSituMnGrade}% Mn)`,
                description: `High-density Braunite-Pyrolusite reef bed dipping at ${clampedDip}° with true thickness of ${trueThicknessM}m and ${depthExtentM}m modeled depth extent.`,
                stats: `Grade: ${inSituMnGrade}% Mn • Bulk Density: 3.85 t/m³ • UNFC: 111 / 122`,
              })
            }
          >
            <polygon
              points={orePolygonPoints}
              fill="url(#mnOrePattern)"
              stroke="#c084fc"
              strokeWidth="2"
              className="transition-opacity group-hover:opacity-90"
            />
            {/* Centerline label */}
            <text
              x={(veinStartX + veinEndX) / 2 - 40}
              y={(veinStartY + veinEndY) / 2}
              fill="#f5d0fe"
              fontSize="11"
              fontWeight="bold"
              fontFamily="sans-serif"
              transform={`rotate(${clampedDip * 0.7}, ${(veinStartX + veinEndX) / 2}, ${(veinStartY + veinEndY) / 2})`}
            >
              Braunite Ore Seam ({inSituMnGrade}% Mn)
            </text>
          </g>

          {/* Fault Plane Intersect */}
          {showFaults && (
            <g
              className="cursor-pointer"
              onClick={() =>
                setActiveLayerInfo({
                  title: 'Transcurrent Shear Fault F-1',
                  description: 'Normal oblique-slip fault zone with 8m apparent displacement. Requires geotechnical ground support and hydraulic grouting.',
                  stats: 'Dip: 75° NW • Gouge Width: 1.2m',
                })
              }
            >
              <title>Click to inspect Fault F-1</title>
              <line
                x1="440"
                y1={surfaceY}
                x2="320"
                y2={svgHeight - 10}
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeDasharray="8 4"
                opacity="0.85"
              />
              <text x="330" y={svgHeight - 20} fill="#f43f5e" fontSize="9" fontFamily="monospace" fontWeight="bold">
                Fault F-1 (Click Info)
              </text>
            </g>
          )}

          {/* Diamond Core Drillhole Logs */}
          {showDrillholes && (
            <g>
              {/* BH-01 */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedBorehole(bh1)}
              >
                <title>Click to view detailed assay log for Borehole BH-01</title>
                <line
                  x1="320"
                  y1={surfaceY}
                  x2="320"
                  y2={surfaceY + 280}
                  stroke="#fbbf24"
                  strokeWidth="2"
                  className="group-hover:stroke-amber-300"
                />
                <circle cx="320" cy={surfaceY} r="4" fill="#fbbf24" className="group-hover:r-5 transition-all" />
                <text x="326" y={surfaceY + 12} fill="#fbbf24" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  BH-01 [Assay ↗]
                </text>
                <line
                  x1="320"
                  y1={veinStartY + 85}
                  x2="320"
                  y2={veinStartY + 85 + scaledThickness * 1.3}
                  stroke="#c084fc"
                  strokeWidth="6"
                />
              </g>

              {/* BH-02 */}
              <g
                className="cursor-pointer group"
                onClick={() => setSelectedBorehole(bh2)}
              >
                <title>Click to view detailed assay log for Borehole BH-02</title>
                <line
                  x1="490"
                  y1={surfaceY}
                  x2="380"
                  y2={surfaceY + 270}
                  stroke="#f59e0b"
                  strokeWidth="2"
                  className="group-hover:stroke-amber-300"
                />
                <circle cx="490" cy={surfaceY} r="4" fill="#f59e0b" className="group-hover:r-5 transition-all" />
                <text x="496" y={surfaceY + 12} fill="#f59e0b" fontSize="9" fontFamily="monospace" fontWeight="bold">
                  BH-02 [Assay ↗]
                </text>
              </g>
            </g>
          )}

          {/* Underground Mining Levels */}
          <g opacity="0.9">
            {/* Level 1 Drive */}
            <g
              className="cursor-pointer"
              onClick={() =>
                setActiveLayerInfo({
                  title: 'Level -100m Haulage Drive',
                  description: 'Trackless electric LHD & dumper haulage roadway connected to skip loading pocket.',
                  stats: 'Cross-section: 4.2m x 3.8m • Extraction: 450 t/day',
                })
              }
            >
              <rect x="180" y={surfaceY + 95} width="60" height="14" fill="#27272a" stroke="#a1a1aa" strokeWidth="1" />
              <text x="185" y={surfaceY + 105} fill="#f4f4f5" fontSize="8" fontFamily="monospace">
                L-1 Haulage
              </text>
            </g>

            {/* Level 2 Drive */}
            <g
              className="cursor-pointer"
              onClick={() =>
                setActiveLayerInfo({
                  title: 'Level -200m Deep Exploration Drive',
                  description: 'Deep stope development face tapping high-grade primary Braunite reserves below water table.',
                  stats: 'Cross-section: 4.0m x 3.6m • Dewatering: Active',
                })
              }
            >
              <rect x="235" y={surfaceY + 165} width="60" height="14" fill="#27272a" stroke="#a1a1aa" strokeWidth="1" />
              <text x="240" y={surfaceY + 175} fill="#f4f4f5" fontSize="8" fontFamily="monospace">
                L-2 Deep
              </text>
            </g>

            {/* Vertical Main Shaft */}
            <g
              className="cursor-pointer"
              onClick={() =>
                setActiveLayerInfo({
                  title: 'Main Production Hoist Shaft',
                  description: 'Circular concrete-lined vertical shaft equipped with twin 8.5-tonne balanced skip hoists.',
                  stats: 'Diameter: 6.5m • Hoisting Speed: 8 m/s • Capacity: 3,200 t/day',
                })
              }
            >
              <rect x="110" y={surfaceY - 15} width="18" height="240" fill="#18181b" stroke="#71717a" strokeWidth="1.5" />
              <polygon points={`110,${surfaceY - 15} 119,${surfaceY - 32} 128,${surfaceY - 15}`} fill="#a1a1aa" />
              <text x="75" y={surfaceY - 20} fill="#d4d4d8" fontSize="9" fontFamily="sans-serif">
                Main Hoist Shaft
              </text>
            </g>
          </g>

          {/* Depth Scale on Left */}
          <g>
            <line x1="25" y1={surfaceY} x2="25" y2={svgHeight - 20} stroke="#52525b" strokeWidth="1.5" />
            {[0, 100, 200, 300].map((d) => {
              const y = surfaceY + (d / 300) * (svgHeight - surfaceY - 30);
              return (
                <g key={d}>
                  <line x1="20" y1={y} x2="25" y2={y} stroke="#a1a1aa" strokeWidth="1.5" />
                  <text x="8" y={y + 3} fill="#71717a" fontSize="8" fontFamily="monospace">
                    -{d}m
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Dynamic Strata Inspector Banner */}
        {activeLayerInfo && (
          <div className="mt-3 p-3 bg-zinc-900 border border-violet-700/80 rounded-xl flex items-start justify-between gap-3 text-xs animate-in fade-in duration-150">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="font-semibold text-violet-200">{activeLayerInfo.title}</span>
                <span className="text-[10px] text-zinc-400 font-mono bg-zinc-800 px-2 py-0.5 rounded">
                  {activeLayerInfo.stats}
                </span>
              </div>
              <p className="text-zinc-300 text-xs leading-relaxed">{activeLayerInfo.description}</p>
            </div>
            <button
              onClick={() => setActiveLayerInfo(null)}
              className="text-zinc-400 hover:text-zinc-100 p-1 hover:bg-zinc-800 rounded text-xs"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Interactive Legend below visualizer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 py-2.5 bg-zinc-900 border-t border-zinc-800 text-[11px] text-zinc-400 select-none">
        <button
          type="button"
          onClick={() =>
            setActiveLayerInfo({
              title: `Braunite Manganese Ore (${inSituMnGrade}% Mn)`,
              description: 'Primary economic mineralization bed bounded by hanging wall quartz-muscovite schist.',
              stats: `True Thickness: ${trueThicknessM}m • Grade: ${inSituMnGrade}% Mn`,
            })
          }
          className="flex items-center gap-2 hover:text-purple-300 text-left transition-colors cursor-pointer"
        >
          <span className="w-3 h-3 rounded bg-purple-700 border border-purple-400 inline-block" />
          <span>Mn Orebody ({inSituMnGrade}% Mn) ↗</span>
        </button>
        <button
          type="button"
          onClick={() => setSelectedBorehole(bh1)}
          className="flex items-center gap-2 hover:text-amber-300 text-left transition-colors cursor-pointer"
        >
          <span className="w-3 h-1.5 bg-amber-400 inline-block" />
          <span>Core Drillhole Log ↗</span>
        </button>
        <button
          type="button"
          onClick={() => setSatelliteModalSensor('soil_moisture')}
          className="flex items-center gap-2 hover:text-sky-300 text-left transition-colors cursor-pointer"
        >
          <span className="w-3 h-1 border-t-2 border-dashed border-sky-400 inline-block" />
          <span>Water Table Inundation ↗</span>
        </button>
        <button
          type="button"
          onClick={() =>
            setActiveLayerInfo({
              title: 'Structural Fault F-1 Discontinuity',
              description: 'Regional fault cross-cutting manganese horizon, causing local water seepage into Level -2.',
              stats: 'Strike: N35°E • Displacement: 8m',
            })
          }
          className="flex items-center gap-2 hover:text-rose-300 text-left transition-colors cursor-pointer"
        >
          <span className="w-3 h-1 border-t-2 border-dashed border-rose-500 inline-block" />
          <span>Fault Plane Discontinuity ↗</span>
        </button>
      </div>

      {/* Borehole Log Modal */}
      {selectedBorehole && (
        <BoreholeDetailModal
          isOpen={!!selectedBorehole}
          borehole={selectedBorehole}
          onClose={() => setSelectedBorehole(null)}
        />
      )}

      {/* Satellite Sensor Detail Modal */}
      {satelliteModalSensor && (
        <SatelliteSensorModal
          isOpen={!!satelliteModalSensor}
          initialSensor={satelliteModalSensor}
          metrics={MOCK_SATELLITE_DATA[0]}
          onClose={() => setSatelliteModalSensor(null)}
        />
      )}
    </div>
  );
};
