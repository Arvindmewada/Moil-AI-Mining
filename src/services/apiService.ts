/**
 * Configurable API Service Layer for MOIL AI Mining.
 * Handles communication with external FastAPI endpoints:
 *   - GET  /health
 *   - POST /predict/reserve
 *   - POST /predict/production
 *   - POST /recommend
 *   - POST /analyze
 *
 * When backend is offline or set to DEMO_MODE, it transparently falls back
 * to the deterministic local physics/geological SimulationEngine.
 * Never pretends mock data is live AI.
 */

import {
  BackendConfig,
  ReserveEstimateInput,
  ReserveEstimateResult,
  ProductionForecastInput,
  ProductionForecastResult,
  AIRecommendation,
} from '../types';
import { SimulationEngine } from './simulationEngine';

const CONFIG_STORAGE_KEY = 'moil_ai_backend_config';

const DEFAULT_CONFIG: BackendConfig = {
  baseUrl: 'http://localhost:8000',
  mode: 'DEMO_MODE',
  timeoutMs: 4000,
  lastPingStatus: 'unknown',
};

class ApiService {
  private config: BackendConfig;
  private listeners: ((config: BackendConfig) => void)[] = [];

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): BackendConfig {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback silently if localStorage is restricted
    }
    return { ...DEFAULT_CONFIG };
  }

  public getConfig(): BackendConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<BackendConfig>): BackendConfig {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));
    } catch {
      // Ignore storage errors
    }
    this.notifyListeners();
    return this.config;
  }

  public subscribe(callback: (config: BackendConfig) => void): () => void {
    this.listeners.push(callback);
    callback(this.config);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.config));
  }

  /**
   * Pings the FastAPI backend health endpoint: GET /health
   */
  public async checkHealth(): Promise<{
    connected: boolean;
    statusText: string;
    version?: string;
    details?: any;
  }> {
    this.updateConfig({ lastPingStatus: 'checking' });
    const targetUrl = `${this.config.baseUrl.replace(/\/+$/, '')}/health`;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);

      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (response.ok) {
        const data = await response.json();
        this.updateConfig({
          lastPingStatus: 'connected',
          lastPingTime: new Date().toLocaleTimeString(),
          serverVersion: data.version || 'FastAPI v1.0.0 (MOIL Mining Engine)',
        });
        return {
          connected: true,
          statusText: 'Connected to FastAPI service',
          version: data.version,
          details: data,
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      const isAbort = err.name === 'AbortError';
      const msg = isAbort
        ? `Connection timed out after ${this.config.timeoutMs}ms`
        : `Could not reach ${targetUrl} (${err.message || 'Service offline'})`;

      this.updateConfig({
        lastPingStatus: 'disconnected',
        lastPingTime: new Date().toLocaleTimeString(),
      });

      return {
        connected: false,
        statusText: msg,
      };
    }
  }

  /**
   * Estimates manganese reserve potential.
   * Calls POST /predict/reserve if in LIVE_FASTAPI mode, otherwise falls back to local engine.
   */
  public async predictReserve(input: ReserveEstimateInput): Promise<ReserveEstimateResult> {
    if (this.config.mode === 'LIVE_FASTAPI' && this.config.lastPingStatus === 'connected') {
      try {
        const url = `${this.config.baseUrl.replace(/\/+$/, '')}/predict/reserve`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (response.ok) {
          const result = await response.json();
          return {
            ...result,
            isSimulated: false, // Confirmed from live model endpoint
          };
        }
      } catch (err) {
        console.warn('FastAPI /predict/reserve unavailable, reverting to local simulation engine:', err);
      }
    }

    // Default or fallback: local deterministic engine
    return SimulationEngine.calculateReserveEstimate(input);
  }

  /**
   * Forecasts production shortfall.
   * Calls POST /predict/production if live, otherwise falls back to local engine.
   */
  public async predictProduction(input: ProductionForecastInput): Promise<ProductionForecastResult> {
    if (this.config.mode === 'LIVE_FASTAPI' && this.config.lastPingStatus === 'connected') {
      try {
        const url = `${this.config.baseUrl.replace(/\/+$/, '')}/predict/production`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (response.ok) {
          const result = await response.json();
          return {
            ...result,
            isSimulated: false,
          };
        }
      } catch (err) {
        console.warn('FastAPI /predict/production failed, falling back to local simulation engine:', err);
      }
    }

    return SimulationEngine.calculateProductionForecast(input);
  }

  /**
   * Fetches prescriptive recommendations.
   * Calls POST /recommend if live, otherwise falls back to local engine.
   */
  public async getRecommendations(
    shortfallResult: ProductionForecastResult,
    mineId: string
  ): Promise<AIRecommendation[]> {
    if (this.config.mode === 'LIVE_FASTAPI' && this.config.lastPingStatus === 'connected') {
      try {
        const url = `${this.config.baseUrl.replace(/\/+$/, '')}/recommend`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shortfallResult, mineId }),
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        console.warn('FastAPI /recommend failed, falling back to local engine:', err);
      }
    }

    return SimulationEngine.generateContextualRecommendations(shortfallResult, mineId);
  }

  /**
   * Deep multi-source geological and environmental analysis.
   * Calls POST /analyze if live.
   */
  public async analyzeMultiSource(payload: any): Promise<any> {
    if (this.config.mode === 'LIVE_FASTAPI' && this.config.lastPingStatus === 'connected') {
      try {
        const url = `${this.config.baseUrl.replace(/\/+$/, '')}/analyze`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          return await response.json();
        }
      } catch (e) {
        console.warn('FastAPI /analyze error:', e);
      }
    }

    return {
      status: 'simulated_analysis_complete',
      correlationIndex: 0.74,
      surfaceSoilMoistureImpactScore: 6.8,
      recommendedBoreholeDepthM: 450,
      note: 'Simulated multi-source analysis executed in demo mode.',
    };
  }
}

export const apiService = new ApiService();
