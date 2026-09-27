/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MineLease,
  ReserveEstimateInput,
  ReserveEstimateResult,
  ProductionForecastInput,
  ProductionForecastResult,
  RiskAlert,
  AIRecommendation,
  BoreholeData,
} from './types';
import {
  MOIL_MINES,
  INITIAL_BOREHOLES,
  SATELLITE_ENV_REGISTRY,
  INITIAL_RISK_ALERTS,
  INITIAL_RECOMMENDATIONS,
} from './data/mockMiningData';
import { SimulationEngine } from './services/simulationEngine';
import { apiService } from './services/apiService';

import { Header } from './components/common/Header';
import { Sidebar, NavTab } from './components/common/Sidebar';

import { OverviewView } from './components/views/OverviewView';
import { ReserveIntelligenceView } from './components/views/ReserveIntelligenceView';
import { ProductionForecastView } from './components/views/ProductionForecastView';
import { RiskRecommendationsView } from './components/views/RiskRecommendationsView';
import { DataExplorerView } from './components/views/DataExplorerView';
import { AboutAndDeploymentView } from './components/views/AboutAndDeploymentView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [selectedMine, setSelectedMine] = useState<MineLease>(MOIL_MINES[0]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [boreholes, setBoreholes] = useState<BoreholeData[]>(INITIAL_BOREHOLES);
  const [alerts, setAlerts] = useState<RiskAlert[]>(INITIAL_RISK_ALERTS);

  // Derive initial reserve inputs based on mine characteristics
  const getInitialReserveInput = useCallback((mine: MineLease): ReserveEstimateInput => {
    const isOpencast = mine.method === 'Opencast';
    const sat = SATELLITE_ENV_REGISTRY[mine.id] || SATELLITE_ENV_REGISTRY['balaghat'];
    return {
      mineId: mine.id,
      strikeLengthM: isOpencast ? 950 : 1600,
      trueThicknessM: isOpencast ? 16.5 : 12.0,
      dipAngleDeg: isOpencast ? 45 : 68,
      depthExtentM: isOpencast ? 180 : 420,
      bulkDensity: 3.85,
      inSituMnGrade: mine.typicalGradeMnPercent,
      miningRecoveryFactor: isOpencast ? 0.90 : 0.82,
      geologicalLossFactor: 0.08,
      satelliteNdvi: sat.ndvi,
      satelliteRainfallMm: sat.rainfallMonthlyMm,
      surfaceAnomalyIndex: sat.surfaceAlterationAnomalyScore,
    };
  }, []);

  // Derive initial production forecast inputs based on mine characteristics
  const getInitialProductionInput = useCallback((mine: MineLease): ProductionForecastInput => {
    const sat = SATELLITE_ENV_REGISTRY[mine.id] || SATELLITE_ENV_REGISTRY['balaghat'];
    return {
      mineId: mine.id,
      forecastMonths: 6,
      monthlyTargetTonnes: mine.dailyTargetTonnes * 26,
      blastingEfficiencyPercent: 88,
      fleetAvailabilityPercent: 82,
      crusherThroughputTonnesPerHour: Math.round((mine.dailyTargetTonnes * 26) / (26 * 16 * 0.75)),
      powerGridReliabilityPercent: 91,
      expectedMonsoonRainfallMm: sat.rainfallMonthlyMm,
      dewateringCapacityKLPerHour: mine.method === 'Opencast' ? 2200 : 1600,
      shiftHoursPerDay: 16,
      workDaysPerMonth: 26,
    };
  }, []);

  const [reserveInput, setReserveInput] = useState<ReserveEstimateInput>(getInitialReserveInput(MOIL_MINES[0]));
  const [forecastInput, setForecastInput] = useState<ProductionForecastInput>(getInitialProductionInput(MOIL_MINES[0]));

  // Reserve calculation result
  const [reserveResult, setReserveResult] = useState<ReserveEstimateResult>(() =>
    SimulationEngine.calculateReserveEstimate(getInitialReserveInput(MOIL_MINES[0]))
  );

  // Production calculation result
  const [productionResult, setProductionResult] = useState<ProductionForecastResult>(() =>
    SimulationEngine.calculateProductionForecast(getInitialProductionInput(MOIL_MINES[0]))
  );

  // Prescriptive recommendations
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(INITIAL_RECOMMENDATIONS);
  const [isLoadingModel, setIsLoadingModel] = useState(false);

  // Update inputs whenever user picks a new mine
  const handleSelectMine = (mine: MineLease) => {
    setSelectedMine(mine);
    const newResIn = getInitialReserveInput(mine);
    const newProdIn = getInitialProductionInput(mine);
    setReserveInput(newResIn);
    setForecastInput(newProdIn);

    const newRes = SimulationEngine.calculateReserveEstimate(newResIn);
    const newProd = SimulationEngine.calculateProductionForecast(newProdIn);
    setReserveResult(newRes);
    setProductionResult(newProd);

    // Merge baseline recommendations with dynamic contextual actions
    const dynamicRecs = SimulationEngine.generateContextualRecommendations(newProd, mine.id);
    const mineRecs = INITIAL_RECOMMENDATIONS.filter((r) => r.mineId === mine.id);
    setRecommendations([...mineRecs, ...dynamicRecs]);
  };

  // Run or recalculate reserve model
  const handleRunReserveModel = async () => {
    setIsLoadingModel(true);
    try {
      const res = await apiService.predictReserve(reserveInput);
      setReserveResult(res);
    } finally {
      setIsLoadingModel(false);
    }
  };

  // Trigger recalculations on input changes
  const handleReserveInputChange = (newInput: ReserveEstimateInput) => {
    setReserveInput(newInput);
    const res = SimulationEngine.calculateReserveEstimate(newInput);
    setReserveResult(res);
  };

  const handleForecastInputChange = (newInput: ProductionForecastInput) => {
    setForecastInput(newInput);
    const prod = SimulationEngine.calculateProductionForecast(newInput);
    setProductionResult(prod);
    const dynamicRecs = SimulationEngine.generateContextualRecommendations(prod, selectedMine.id);
    const baseRecs = INITIAL_RECOMMENDATIONS.filter((r) => r.mineId === selectedMine.id);
    setRecommendations([...baseRecs, ...dynamicRecs]);
  };

  // Reset demo state back to default
  const handleResetDemo = () => {
    const defaultMine = MOIL_MINES[0];
    setSelectedMine(defaultMine);
    const defaultRes = getInitialReserveInput(defaultMine);
    const defaultProd = getInitialProductionInput(defaultMine);
    setReserveInput(defaultRes);
    setForecastInput(defaultProd);
    setReserveResult(SimulationEngine.calculateReserveEstimate(defaultRes));
    setProductionResult(SimulationEngine.calculateProductionForecast(defaultProd));
    setAlerts(INITIAL_RISK_ALERTS.map((a) => ({ ...a, resolved: false })));
    setRecommendations(INITIAL_RECOMMENDATIONS);
  };

  const handleToggleResolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: !a.resolved } : a))
    );
  };

  const currentSatelliteData = useMemo(() => {
    return SATELLITE_ENV_REGISTRY[selectedMine.id] || SATELLITE_ENV_REGISTRY['balaghat'];
  }, [selectedMine]);

  const activeAlertCount = useMemo(() => {
    return alerts.filter((a) => !a.resolved).length;
  }, [alerts]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-violet-600 selection:text-white">
      {/* Top Header */}
      <Header
        selectedMine={selectedMine}
        onSelectMine={handleSelectMine}
        onResetDemo={handleResetDemo}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onNavigateTab={setCurrentTab}
      />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          selectedMine={selectedMine}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          activeAlertCount={activeAlertCount}
        />

        {/* Dynamic Main Workspace View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-zinc-950 via-zinc-925 to-zinc-950">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'overview' && (
              <OverviewView
                selectedMine={selectedMine}
                onSelectMine={handleSelectMine}
                onNavigate={setCurrentTab}
                satelliteData={currentSatelliteData}
                reserveResult={reserveResult}
                productionResult={productionResult}
                alerts={alerts}
              />
            )}

            {currentTab === 'reserve' && (
              <ReserveIntelligenceView
                selectedMine={selectedMine}
                reserveInput={reserveInput}
                onChangeInput={handleReserveInputChange}
                reserveResult={reserveResult}
                boreholes={boreholes}
                satelliteMetrics={currentSatelliteData}
                onRunModel={handleRunReserveModel}
                isLoading={isLoadingModel}
              />
            )}

            {currentTab === 'production' && (
              <ProductionForecastView
                selectedMine={selectedMine}
                forecastInput={forecastInput}
                onChangeInput={handleForecastInputChange}
                forecastResult={productionResult}
                onResetToBaseline={() => handleForecastInputChange(getInitialProductionInput(selectedMine))}
              />
            )}

            {currentTab === 'risk' && (
              <RiskRecommendationsView
                selectedMine={selectedMine}
                alerts={alerts}
                recommendations={recommendations}
                onToggleResolveAlert={handleToggleResolveAlert}
              />
            )}

            {currentTab === 'data' && (
              <DataExplorerView boreholes={boreholes} selectedMine={selectedMine} />
            )}

            {currentTab === 'about' && <AboutAndDeploymentView />}
          </div>
        </main>
      </div>
    </div>
  );
}
