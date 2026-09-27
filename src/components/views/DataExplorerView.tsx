import React, { useState, useMemo } from 'react';
import { BoreholeData, MineLease, SatelliteMetrics } from '../../types';
import { MOIL_MINES, SATELLITE_ENV_REGISTRY } from '../../data/mockMiningData';
import { ScientificCaveatBanner } from '../common/ScientificCaveatBanner';
import { BoreholeDetailModal } from '../modals/BoreholeDetailModal';
import { ShiftLogModal } from '../modals/ShiftLogModal';
import { SatelliteSensorModal, SensorType } from '../modals/SatelliteSensorModal';
import {
  Database,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Eye,
  Radio,
  Clock,
} from 'lucide-react';

interface DataExplorerViewProps {
  boreholes: BoreholeData[];
  selectedMine: MineLease;
}

export const DataExplorerView: React.FC<DataExplorerViewProps> = ({ boreholes, selectedMine }) => {
  const [activeTab, setActiveTab] = useState<'boreholes' | 'shifts' | 'satellite'>('boreholes');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMine, setFilterMine] = useState<string>('all');
  const [minMnGrade, setMinMnGrade] = useState<number>(30);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Modals state
  const [inspectedBorehole, setInspectedBorehole] = useState<BoreholeData | null>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [satelliteModalSensor, setSatelliteModalSensor] = useState<{
    sensor: SensorType;
    metrics: SatelliteMetrics;
  } | null>(null);

  // Simulated daily shift logs generated deterministically
  const shiftLogs = useMemo(() => {
    const list = [];
    const dates = [
      '2024-09-24',
      '2024-09-23',
      '2024-09-22',
      '2024-09-21',
      '2024-09-20',
      '2024-09-19',
      '2024-09-18',
      '2024-09-17',
      '2024-09-16',
      '2024-09-15',
    ];

    for (const mine of MOIL_MINES) {
      for (const d of dates) {
        for (const shift of [1, 2, 3]) {
          const target = Math.round(mine.dailyTargetTonnes / 3);
          const variance = Math.sin(shift * 1.5 + mine.id.length) * 0.18;
          const actual = Math.round(target * (0.88 + variance));
          const shortfall = Math.max(0, target - actual);
          list.push({
            id: `SHIFT-${mine.id.toUpperCase().slice(0, 3)}-${d}-${shift}`,
            mineId: mine.id,
            mineName: mine.name,
            date: d,
            shiftNumber: shift,
            targetTonnes: target,
            actualTonnes: actual,
            shortfallTonnes: shortfall,
            avgGradeMn: Math.round((mine.typicalGradeMnPercent + variance * 2) * 10) / 10,
            blastingRounds: shift === 2 ? 2 : 1,
            skipTrips: Math.round(actual / 8),
            status: shortfall > target * 0.15 ? 'Shortfall Alert' : 'Nominal',
          });
        }
      }
    }
    return list;
  }, []);

  // Filtered boreholes
  const filteredBoreholes = useMemo(() => {
    return boreholes.filter((b) => {
      const matchesMine = filterMine === 'all' || b.mineId === filterMine;
      const matchesSearch =
        b.holeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.lithology.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.unfcClassification.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGrade = b.mnGradePercent >= minMnGrade;
      return matchesMine && matchesSearch && matchesGrade;
    });
  }, [boreholes, filterMine, searchQuery, minMnGrade]);

  // Filtered shift logs
  const filteredShifts = useMemo(() => {
    return shiftLogs.filter((s) => {
      const matchesMine = filterMine === 'all' || s.mineId === filterMine;
      const matchesSearch =
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.mineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.date.includes(searchQuery);
      return matchesMine && matchesSearch;
    });
  }, [shiftLogs, filterMine, searchQuery]);

  // CSV Export utility
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (activeTab === 'boreholes') {
      headers = [
        'Hole ID',
        'Mine ID',
        'Collar Elevation (m)',
        'Total Depth (m)',
        'Intercept Start (m)',
        'Intercept End (m)',
        'True Thickness (m)',
        'Mn %',
        'Fe %',
        'P %',
        'SiO2 %',
        'Bulk Density (t/m3)',
        'Lithology',
        'UNFC Code',
      ];
      rows = filteredBoreholes.map((b) => [
        b.holeId,
        b.mineId,
        b.collarElevationM,
        b.totalDepthM,
        b.oreInterceptStartM,
        b.oreInterceptEndM,
        b.interceptThicknessM,
        b.mnGradePercent,
        b.feGradePercent,
        b.pGradePercent,
        b.sio2GradePercent,
        b.bulkDensity,
        b.lithology,
        b.unfcClassification,
      ]);
    } else if (activeTab === 'shifts') {
      headers = [
        'Shift ID',
        'Mine Name',
        'Date',
        'Shift No',
        'Target (Tonnes)',
        'Actual (Tonnes)',
        'Shortfall (Tonnes)',
        'Avg Mn %',
        'Blasting Rounds',
        'Status',
      ];
      rows = filteredShifts.map((s) => [
        s.id,
        s.mineName,
        s.date,
        s.shiftNumber,
        s.targetTonnes,
        s.actualTonnes,
        s.shortfallTonnes,
        s.avgGradeMn,
        s.blastingRounds,
        s.status,
      ]);
    } else {
      headers = [
        'Mine ID',
        'Timestamp',
        'NDVI',
        'Monthly Rainfall (mm)',
        'Radar Soil Mo (dB)',
        'Surface Temp (C)',
        'Pit Risk',
        'Surface Anomaly Score',
      ];
      rows = Object.values(SATELLITE_ENV_REGISTRY).map((s) => [
        s.mineId,
        s.timestamp,
        s.ndvi,
        s.rainfallMonthlyMm,
        s.soilMoistureRadarDb,
        s.landSurfaceTempCelsius,
        s.pitWaterloggingRisk,
        s.surfaceAlterationAnomalyScore,
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MOIL_${activeTab}_dataset_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(`Exported ${rows.length} records to CSV!`);
    setTimeout(() => setExportNotice(null), 3000);
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
              <Database className="w-5 h-5 text-violet-400" />
              Mining Geological, Production &amp; Satellite Data Explorer
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800">
              CSV Export Ready
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Search, filter, inspect and export multi-source datasets • Click any record for instant high-res inspector
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold transition shadow-md cursor-pointer active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Export {activeTab.toUpperCase()} (CSV)</span>
        </button>
      </div>

      {/* Dataset Tab Switcher & Search Bar */}
      <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-4 shadow-lg space-y-4">
        {/* Dataset Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('boreholes')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'boreholes'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Borehole Core Assays ({filteredBoreholes.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('shifts')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'shifts'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Shift Production Logs ({filteredShifts.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('satellite')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'satellite'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Satellite Telemetry Registry (7 Leases)</span>
            </button>
          </div>

          <div className="text-[11px] text-zinc-500 font-mono">
            Showing {activeTab === 'boreholes' ? filteredBoreholes.length : activeTab === 'shifts' ? filteredShifts.length : 7} matching rows
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, lithology, date, or lease..."
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg pl-9 pr-3 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Mine Filter */}
          <div className="sm:col-span-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400 shrink-0" />
            <select
              value={filterMine}
              onChange={(e) => setFilterMine(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="all">All MOIL Mine Leases</option>
              {MOIL_MINES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.district})
                </option>
              ))}
            </select>
          </div>

          {/* Grade Threshold Slider (Boreholes tab) */}
          {activeTab === 'boreholes' && (
            <div className="sm:col-span-3 flex items-center gap-2">
              <span className="text-[11px] text-zinc-400 shrink-0">Min Mn:</span>
              <input
                type="range"
                min="30"
                max="46"
                value={minMnGrade}
                onChange={(e) => setMinMnGrade(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="font-mono font-bold text-emerald-400 shrink-0">{minMnGrade}%</span>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto max-h-[520px] rounded-xl border border-zinc-800">
          {activeTab === 'boreholes' && (
            <table className="w-full text-left text-xs text-zinc-300 font-mono">
              <thead className="bg-zinc-900 sticky top-0 z-10 text-zinc-400 text-[10px] uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3">Hole ID</th>
                  <th className="p-3">Mine</th>
                  <th className="p-3">Collar RL</th>
                  <th className="p-3">Depth</th>
                  <th className="p-3">Ore Intercept</th>
                  <th className="p-3">Mn Grade %</th>
                  <th className="p-3">Fe %</th>
                  <th className="p-3">P %</th>
                  <th className="p-3">SiO2 %</th>
                  <th className="p-3">Density</th>
                  <th className="p-3">Lithology</th>
                  <th className="p-3">UNFC Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredBoreholes.map((bh) => (
                  <tr
                    key={bh.holeId}
                    onClick={() => setInspectedBorehole(bh)}
                    className="hover:bg-violet-950/30 transition cursor-pointer group"
                    title="Click to view detailed geochemical core log"
                  >
                    <td className="p-3 font-bold text-violet-300 group-hover:text-amber-300 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400" />
                      {bh.holeId}
                    </td>
                    <td className="p-3 font-sans text-zinc-300">{bh.mineId.toUpperCase()}</td>
                    <td className="p-3">{bh.collarElevationM}m</td>
                    <td className="p-3">{bh.totalDepthM}m</td>
                    <td className="p-3">
                      {bh.oreInterceptStartM} - {bh.oreInterceptEndM}m ({bh.interceptThicknessM}m)
                    </td>
                    <td className="p-3 font-bold text-emerald-400">{bh.mnGradePercent}%</td>
                    <td className="p-3">{bh.feGradePercent}%</td>
                    <td className="p-3 text-amber-400">{bh.pGradePercent}%</td>
                    <td className="p-3 text-zinc-400">{bh.sio2GradePercent}%</td>
                    <td className="p-3">{bh.bulkDensity} t/m³</td>
                    <td className="p-3 font-sans text-zinc-300">{bh.lithology}</td>
                    <td className="p-3">
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-zinc-850 text-zinc-300 border border-zinc-700">
                        {bh.unfcClassification}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'shifts' && (
            <table className="w-full text-left text-xs text-zinc-300 font-mono">
              <thead className="bg-zinc-900 sticky top-0 z-10 text-zinc-400 text-[10px] uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3">Shift ID</th>
                  <th className="p-3">Mine Lease</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Shift</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Actual Output</th>
                  <th className="p-3">Shortfall Deficit</th>
                  <th className="p-3">Avg Mn Grade</th>
                  <th className="p-3">Blasting</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filteredShifts.slice(0, 100).map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setIsShiftModalOpen(true)}
                    className="hover:bg-amber-950/20 transition cursor-pointer group"
                    title="Click to view shift telemetry & handover details"
                  >
                    <td className="p-3 font-bold text-sky-300 group-hover:text-amber-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400" />
                      {s.id}
                    </td>
                    <td className="p-3 font-sans text-zinc-300">{s.mineName}</td>
                    <td className="p-3">{s.date}</td>
                    <td className="p-3">Shift {s.shiftNumber}</td>
                    <td className="p-3">{s.targetTonnes} T</td>
                    <td className="p-3 font-bold text-emerald-400">{s.actualTonnes} T</td>
                    <td className="p-3 font-bold text-rose-400">
                      {s.shortfallTonnes > 0 ? `-${s.shortfallTonnes} T` : '0 T'}
                    </td>
                    <td className="p-3 text-violet-300">{s.avgGradeMn}%</td>
                    <td className="p-3">{s.blastingRounds} rounds</td>
                    <td className="p-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          s.shortfallTonnes > 0
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'satellite' && (
            <table className="w-full text-left text-xs text-zinc-300 font-mono">
              <thead className="bg-zinc-900 sticky top-0 z-10 text-zinc-400 text-[10px] uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3">Mine Lease</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">NDVI Index</th>
                  <th className="p-3">Rainfall (mm)</th>
                  <th className="p-3">Radar Soil Mo. (dB)</th>
                  <th className="p-3">LST Surface (°C)</th>
                  <th className="p-3">Pit Water Risk</th>
                  <th className="p-3">Surface Anomaly</th>
                  <th className="p-3">Scientific Guidance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {Object.values(SATELLITE_ENV_REGISTRY).map((s) => (
                  <tr
                    key={s.mineId}
                    onClick={() => setSatelliteModalSensor({ sensor: 'rainfall', metrics: s })}
                    className="hover:bg-sky-950/20 transition cursor-pointer group"
                    title="Click to view full remote sensing telemetry modal"
                  >
                    <td className="p-3 font-bold text-violet-300 group-hover:text-sky-300 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-zinc-500 group-hover:text-sky-400" />
                      {s.mineId.toUpperCase()}
                    </td>
                    <td className="p-3 text-zinc-400">{s.timestamp.slice(0, 10)}</td>
                    <td className="p-3 text-emerald-400">{s.ndvi}</td>
                    <td className="p-3 text-sky-400">{s.rainfallMonthlyMm} mm</td>
                    <td className="p-3 text-purple-400">{s.soilMoistureRadarDb} dB</td>
                    <td className="p-3 text-amber-400">{s.landSurfaceTempCelsius}°C</td>
                    <td className="p-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          s.pitWaterloggingRisk === 'Severe'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {s.pitWaterloggingRisk}
                      </span>
                    </td>
                    <td className="p-3">{s.surfaceAlterationAnomalyScore} / 10</td>
                    <td className="p-3 font-sans text-[11px] text-zinc-400 max-w-xs truncate" title={s.scientificNotice}>
                      {s.scientificNotice}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Floating Export Notice */}
      {exportNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-emerald-500/80 text-emerald-200 text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Borehole Detail Modal */}
      {inspectedBorehole && (
        <BoreholeDetailModal
          isOpen={!!inspectedBorehole}
          borehole={inspectedBorehole}
          onClose={() => setInspectedBorehole(null)}
        />
      )}

      {/* Shift Log Modal */}
      {isShiftModalOpen && (
        <ShiftLogModal
          isOpen={isShiftModalOpen}
          onClose={() => setIsShiftModalOpen(false)}
          activeMine={selectedMine}
        />
      )}

      {/* Satellite Sensor Modal */}
      {satelliteModalSensor && (
        <SatelliteSensorModal
          isOpen={!!satelliteModalSensor}
          initialSensor={satelliteModalSensor.sensor}
          metrics={satelliteModalSensor.metrics}
          onClose={() => setSatelliteModalSensor(null)}
        />
      )}
    </div>
  );
};
