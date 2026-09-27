import React, { useState, useEffect } from 'react';
import { X, Server, CheckCircle2, AlertCircle, RefreshCw, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';
import { apiService } from '../../services/apiService';
import { BackendConfig } from '../../types';

interface BackendSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendSettingsModal: React.FC<BackendSettingsModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<BackendConfig>(apiService.getConfig());
  const [urlInput, setUrlInput] = useState(config.baseUrl);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{
    success?: boolean;
    message?: string;
    details?: any;
  } | null>(null);

  useEffect(() => {
    const unsub = apiService.subscribe((c) => {
      setConfig(c);
      setUrlInput(c.baseUrl);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleSaveUrl = () => {
    apiService.updateConfig({ baseUrl: urlInput.trim() });
    handlePing();
  };

  const handlePing = async () => {
    setIsPinging(true);
    setPingResult(null);
    try {
      const res = await apiService.checkHealth();
      setPingResult({
        success: res.connected,
        message: res.statusText,
        details: res.details,
      });
    } catch (e: any) {
      setPingResult({
        success: false,
        message: e.message || 'Connection failed',
      });
    } finally {
      setIsPinging(false);
    }
  };

  const handleToggleMode = (mode: 'DEMO_MODE' | 'LIVE_FASTAPI') => {
    apiService.updateConfig({ mode });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-950/60 border border-sky-800/80 text-sky-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">FastAPI Backend Connector</h2>
              <p className="text-xs text-zinc-400">
                Configure external AI inference endpoints or maintain standalone demo mode
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
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Mode Switcher */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-2">
              Execution Runtime Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleToggleMode('DEMO_MODE')}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                  config.mode === 'DEMO_MODE'
                    ? 'bg-violet-950/40 border-violet-600 text-zinc-100 ring-1 ring-violet-500'
                    : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-violet-300">DEMO MODE (Simulated)</span>
                  {config.mode === 'DEMO_MODE' && <CheckCircle2 className="w-4 h-4 text-violet-400" />}
                </div>
                <p className="text-xs text-zinc-400">
                  Runs local deterministic physics and geological Kriging simulation. Zero external dependencies.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleToggleMode('LIVE_FASTAPI')}
                className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                  config.mode === 'LIVE_FASTAPI'
                    ? 'bg-emerald-950/40 border-emerald-600 text-zinc-100 ring-1 ring-emerald-500'
                    : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-300">LIVE FASTAPI BACKEND</span>
                  {config.mode === 'LIVE_FASTAPI' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-xs text-zinc-400">
                  Sends prediction payloads to your running Python FastAPI container (XGBoost/LightGBM models).
                </p>
              </button>
            </div>
          </div>

          {/* Endpoint Input & Ping */}
          <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-4 space-y-3">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
              FastAPI Server Base URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="http://localhost:8000"
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={handleSaveUrl}
                disabled={isPinging}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                <span>Test GET /health</span>
              </button>
            </div>

            {/* Ping Feedback */}
            {pingResult && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                  pingResult.success
                    ? 'bg-emerald-950/50 border-emerald-800 text-emerald-200'
                    : 'bg-rose-950/50 border-rose-800 text-rose-200'
                }`}
              >
                {pingResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-semibold">{pingResult.message}</div>
                  {pingResult.details && (
                    <pre className="text-[10px] font-mono bg-zinc-900/80 p-2 rounded border border-zinc-700 overflow-x-auto text-zinc-300">
                      {JSON.stringify(pingResult.details, null, 2)}
                    </pre>
                  )}
                  {!pingResult.success && (
                    <p className="text-[11px] text-zinc-400">
                      The dashboard will safely stay in DEMO MODE so you can explore all features seamlessly without error.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Configured Endpoints Contract */}
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              MOIL Mining API Contract Specifications
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 flex justify-between items-center">
                <span className="text-sky-400 font-bold">GET /health</span>
                <span className="text-zinc-500 text-[10px]">Liveness &amp; GPU Status</span>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 flex justify-between items-center">
                <span className="text-emerald-400 font-bold">POST /predict/reserve</span>
                <span className="text-zinc-500 text-[10px]">Tonnage &amp; UNFC Tiers</span>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 flex justify-between items-center">
                <span className="text-amber-400 font-bold">POST /predict/production</span>
                <span className="text-zinc-500 text-[10px]">Shortfall &amp; Downtime</span>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 flex justify-between items-center">
                <span className="text-purple-400 font-bold">POST /recommend</span>
                <span className="text-zinc-500 text-[10px]">Prescriptive Mitigation</span>
              </div>
            </div>
          </div>

          {/* Command to run local FastAPI */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                <span>Command to start your local backend:</span>
              </span>
              <span className="text-[10px] text-zinc-500">Python 3.10+ / FastAPI</span>
            </div>
            <pre className="text-xs font-mono text-emerald-400 bg-zinc-900/90 p-2.5 rounded border border-zinc-800 select-all overflow-x-auto">
              uvicorn main:app --host 0.0.0.0 --port 8000 --reload
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Simulated fallback always active</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
