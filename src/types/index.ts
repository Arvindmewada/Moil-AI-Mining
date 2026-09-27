/**
 * Data structures and contracts for MOIL AI Mining Operations
 */

export type MiningMethod = 'Underground' | 'Opencast' | 'Combined';

export interface MineLease {
  id: string;
  name: string;
  state: 'Madhya Pradesh' | 'Maharashtra';
  district: string;
  method: MiningMethod;
  coordinates: {
    lat: number;
    lng: number;
  };
  areaHectares: number;
  status: 'Active' | 'Expanding' | 'Exploration Stage';
  primaryOreType: string;
  typicalGradeMnPercent: number;
  activeShafts: number;
  dailyTargetTonnes: number;
  historicalAnnualOutputMT: number;
}

export interface BoreholeData {
  holeId: string;
  mineId: string;
  easting: number;
  northing: number;
  collarElevationM: number;
  totalDepthM: number;
  oreInterceptStartM: number;
  oreInterceptEndM: number;
  interceptThicknessM: number;
  mnGradePercent: number;
  feGradePercent: number;
  pGradePercent: number;
  sio2GradePercent: number;
  bulkDensity: number; // t/m³
  lithology: 'Gondite' | 'Manganiferous Quartzite' | 'Schist' | 'High-grade Braunite' | 'Psilomelane-Pyrolusite';
  unfcClassification: '111 (Proved)' | '122 (Probable)' | '222 (Indicated)' | '333 (Inferred)';
  dateLogged: string;
}

export interface SatelliteMetrics {
  mineId: string;
  timestamp: string;
  ndvi: number; // Normalized Difference Vegetation Index (-0.1 to 0.9)
  rainfallMonthlyMm: number; // IMERG GPM estimated rainfall (mm)
  soilMoistureRadarDb: number; // Sentinel-1 radar backscatter (dB)
  landSurfaceTempCelsius: number; // Landsat/MODIS LST (°C)
  monsoonRiskIndex: number; // 0 to 100
  pitWaterloggingRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
  surfaceAlterationAnomalyScore: number; // 0 to 10 (remote sensing gossan/surface spectral anomaly)
  scientificNotice: string;
}

export interface ReserveEstimateInput {
  mineId: string;
  strikeLengthM: number; // Strike length along ore zone (m)
  trueThicknessM: number; // True thickness of manganese bed (m)
  dipAngleDeg: number; // Dip angle (degrees)
  depthExtentM: number; // Depth extent modeled (m)
  bulkDensity: number; // In-situ specific gravity (t/m³, typically 3.2 - 4.4 for Mn ore)
  inSituMnGrade: number; // Estimated % Mn (e.g., 34% - 46%)
  miningRecoveryFactor: number; // 0.70 to 0.95
  geologicalLossFactor: number; // 0.05 to 0.20
  // Satellite-derived surface covariates (strictly contextual/surface)
  satelliteNdvi: number;
  satelliteRainfallMm: number;
  surfaceAnomalyIndex: number;
}

export interface ReserveEstimateResult {
  isSimulated: boolean;
  totalInSituTonnageMT: number; // Million Tonnes
  recoverableTonnageMT: number;
  containedManganeseMetalMT: number;
  estimatedGradeMn: number;
  confidenceBand: {
    p10: number; // Optimistic (MT)
    p50: number; // Expected median (MT)
    p90: number; // Conservative (MT)
  };
  unfcBreakdown: {
    provedMT: number; // UNFC 111
    probableMT: number; // UNFC 122
    indicatedMT: number; // UNFC 222
    inferredIllustrativeMT: number; // UNFC 333 / AI potential
  };
  economicValueEstimateCrINR: number; // Estimated gross value in Crore INR (at benchmark Mn prices)
  surfaceFeasibilityScore: number; // 0-100 based on terrain/satellite feasibility
  scientificCaveat: string;
}

export interface ProductionForecastInput {
  mineId: string;
  forecastMonths: number;
  monthlyTargetTonnes: number;
  blastingEfficiencyPercent: number; // 60 - 100%
  fleetAvailabilityPercent: number; // 50 - 100% (Dumpers, LHDs, Skip hoists)
  crusherThroughputTonnesPerHour: number;
  powerGridReliabilityPercent: number;
  expectedMonsoonRainfallMm: number;
  dewateringCapacityKLPerHour: number;
  shiftHoursPerDay: number;
  workDaysPerMonth: number;
}

export interface MonthlyForecastItem {
  month: string;
  targetTonnes: number;
  predictedTonnes: number;
  shortfallTonnes: number;
  shortfallPercent: number;
  monsoonImpactTonnes: number;
  equipmentDowntimeTonnes: number;
  powerInterruptionTonnes: number;
  riskLevel: 'Normal' | 'Moderate' | 'High' | 'Critical';
}

export interface ProductionForecastResult {
  isSimulated: boolean;
  totalForecastTargetTonnes: number;
  totalForecastPredictedTonnes: number;
  netShortfallTonnes: number;
  netShortfallPercent: number;
  financialRevenueAtRiskLakhs: number;
  criticalBottlenecks: {
    factor: string;
    impactPercentage: number;
    impactTonnes: number;
    mitigationHint: string;
  }[];
  monthlyTimeline: MonthlyForecastItem[];
  simulationRunTime: string;
}

export interface RiskAlert {
  id: string;
  mineId: string;
  title: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  category: 'Operational' | 'Environmental' | 'Geotechnical' | 'Grade Compliance';
  description: string;
  triggerCondition: string;
  recommendedAction: string;
  estimatedImpact: string;
  detectedAt: string;
  resolved: boolean;
}

export interface AIRecommendation {
  id: string;
  mineId: string;
  title: string;
  category: 'Mine Planning' | 'Fleet Dispatch' | 'Monsoon Preparedness' | 'Blending & Beneficiation' | 'Operational';
  expectedGain: string;
  feasibilityScore: number; // 0 - 100
  urgency: 'Immediate' | 'Next Shift' | 'Weekly Plan' | 'Strategic';
  actionSteps: string[];
  justification: string;
  algorithmOrigin: string; // e.g. "XGBoost Shortfall Predictor + Spatial Kriging"
  confidencePercent: number;
}

export interface BackendConfig {
  baseUrl: string;
  mode: 'DEMO_MODE' | 'LIVE_FASTAPI';
  timeoutMs: number;
  lastPingStatus: 'unknown' | 'connected' | 'disconnected' | 'checking';
  lastPingTime?: string;
  serverVersion?: string;
}
