import React, { useState } from 'react';
import { RiskAlert, AIRecommendation, MineLease } from '../../types';
import { ScientificCaveatBanner } from '../common/ScientificCaveatBanner';
import {
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Filter,
  Check,
  FileDown,
  Layers,
  Wrench,
  CloudRain,
  Send,
  Copy,
} from 'lucide-react';

interface RiskRecommendationsViewProps {
  selectedMine: MineLease;
  alerts: RiskAlert[];
  recommendations: AIRecommendation[];
  onToggleResolveAlert: (id: string) => void;
}

export const RiskRecommendationsView: React.FC<RiskRecommendationsViewProps> = ({
  selectedMine,
  alerts,
  recommendations,
  onToggleResolveAlert,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [exportedNotice, setExportedNotice] = useState(false);
  const [dispatchedRecId, setDispatchedRecId] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const categories = ['All', 'Operational', 'Environmental', 'Geotechnical', 'Grade Compliance'];
  const severities = ['All', 'Critical', 'High', 'Moderate'];

  const filteredAlerts = alerts.filter((a) => {
    if (selectedCategory !== 'All' && a.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (selectedSeverity !== 'All' && a.severity.toLowerCase() !== selectedSeverity.toLowerCase()) {
      return false;
    }
    return true;
  });

  const toggleStep = (key: string) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const showNotification = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3000);
  };

  const handleDispatchRec = (rec: AIRecommendation) => {
    setDispatchedRecId(rec.id);
    showNotification(`Dispatch order transmitted to ${selectedMine.name} underground shift supervisor for: "${rec.title}"`);
    setTimeout(() => setDispatchedRecId(null), 4000);
  };

  const handleExportActionPlan = () => {
    const textContent = `
========================================================================
MOIL AI MINING — MINE OPERATIONAL ACTION PLAN & DISPATCH ADVISORY
Manganese Ore India Limited • Operational AI Synthesis
Lease: ${selectedMine.name} (${selectedMine.state})
Generated At: ${new Date().toLocaleString()}
========================================================================

1. ACTIVE RISK ALERTS (${filteredAlerts.length} Identified):
${filteredAlerts
  .map(
    (a, i) => `
[${i + 1}] ${a.title.toUpperCase()}
   Severity: ${a.severity} | Category: ${a.category} | Status: ${a.resolved ? 'RESOLVED' : 'ACTIVE'}
   Trigger: ${a.triggerCondition}
   Action: ${a.recommendedAction}
   Estimated Impact: ${a.estimatedImpact}
`
  )
  .join('\n')}

2. PRESCRIPTIVE AI RECOMMENDATIONS (${recommendations.length} Active):
${recommendations
  .map(
    (r, i) => `
[RECOMMENDATION ${i + 1}] ${r.title}
   Category: ${r.category} | Urgency: ${r.urgency} | AI Confidence: ${r.confidencePercent}%
   Expected Gain: ${r.expectedGain}
   Model Origin: ${r.algorithmOrigin}
   Action Steps:
${r.actionSteps.map((s) => `     - [ ] ${s}`).join('\n')}
   Justification: ${r.justification}
`
  )
  .join('\n')}

========================================================================
Scientific Caveat: Remote sensing metrics support surface environmental and
dewatering planning only. Subsurface reserves require core assay confirmation.
========================================================================
`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MOIL_Action_Plan_${selectedMine.id}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportedNotice(true);
    showNotification('Action Plan exported as operational dispatch file!');
    setTimeout(() => setExportedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <ScientificCaveatBanner />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Risk Diagnostics &amp; Prescriptive Action Engine
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              DGMS &amp; Operational Synthesis
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Active real-time anomaly detection, geotechnical hazard tracking, and prescriptive mitigations for {selectedMine.name}
          </p>
        </div>

        {/* Export & Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportActionPlan}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-zinc-950 rounded-lg text-xs font-bold transition shadow-md cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Export Action Plan (.TXT)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Alerts, Right Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filterable Alerts */}
        <div className="lg:col-span-6 bg-zinc-950/90 border border-zinc-800 rounded-xl p-4 shadow-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                Risk Anomalies ({filteredAlerts.length})
              </span>
            </div>

            {/* Severity Quick Filters */}
            <div className="flex items-center gap-1">
              {severities.map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                    selectedSeverity === sev
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Alerts List */}
          <div className="space-y-3 overflow-y-auto max-h-[580px] pr-1">
            {filteredAlerts.length === 0 ? (
              <div className="p-8 text-center bg-zinc-900/50 rounded-xl border border-zinc-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <span className="text-xs text-zinc-300 font-medium">
                  Zero active risk anomalies in selected filter!
                </span>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`bg-zinc-900/70 border rounded-xl p-3.5 transition ${
                    alert.resolved
                      ? 'border-zinc-800/80 opacity-60'
                      : alert.severity === 'Critical'
                      ? 'border-rose-700/80 shadow-rose-950/20 shadow-md'
                      : alert.severity === 'High'
                      ? 'border-amber-700/80'
                      : 'border-zinc-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          onToggleResolveAlert(alert.id);
                          showNotification(
                            alert.resolved
                              ? `Reactivated alert: ${alert.title}`
                              : `Marked resolved: ${alert.title}`
                          );
                        }}
                        className={`w-5 h-5 rounded flex items-center justify-center border transition cursor-pointer ${
                          alert.resolved
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-zinc-600 hover:border-zinc-400 bg-zinc-900'
                        }`}
                        title={alert.resolved ? 'Click to reactivate' : 'Click to mark resolved'}
                      >
                        {alert.resolved && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div>
                        <div
                          className={`text-xs font-bold ${
                            alert.resolved ? 'line-through text-zinc-500' : 'text-zinc-100'
                          }`}
                        >
                          {alert.title}
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {alert.category} • {alert.detectedAt}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                        alert.severity === 'Critical'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : alert.severity === 'High'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed my-2">{alert.description}</p>

                  <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-lg p-2.5 text-[11px] space-y-1">
                    <div className="flex items-start gap-1.5">
                      <span className="text-zinc-400 font-semibold shrink-0">Trigger:</span>
                      <span className="font-mono text-zinc-300">{alert.triggerCondition}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-semibold shrink-0">Action:</span>
                      <span className="text-zinc-200">{alert.recommendedAction}</span>
                    </div>
                    <div className="flex items-start gap-1.5 pt-1 border-t border-zinc-800 font-mono text-[10px]">
                      <span className="text-amber-400 font-semibold shrink-0">Impact:</span>
                      <span className="text-amber-300">{alert.estimatedImpact}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Prescriptive AI Recommendations */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              Prescriptive AI Action Engine ({recommendations.length})
            </span>
            <span className="text-[10px] font-mono text-violet-400">Optimization Solver</span>
          </div>

          <div className="space-y-4">
            {recommendations.map((rec) => {
              const isDispatched = dispatchedRecId === rec.id;
              return (
                <div
                  key={rec.id}
                  className="bg-zinc-950/90 border border-zinc-800 hover:border-violet-800/70 transition rounded-xl p-5 shadow-lg space-y-3"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                        <span>{rec.title}</span>
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-zinc-400">
                        <span>{rec.category}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">{rec.expectedGain}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                        rec.urgency === 'Immediate'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : rec.urgency === 'Next Shift'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-violet-950 text-violet-300 border border-violet-800'
                      }`}
                    >
                      {rec.urgency}
                    </span>
                  </div>

                  {/* Algorithmic Justification */}
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 leading-relaxed">
                    <span className="font-semibold text-violet-300">Model Rationale: </span>
                    {rec.justification}
                  </div>

                  {/* Step-by-Step Action Items */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Execution Checklist (Click items to toggle completion):
                    </span>
                    {rec.actionSteps.map((step, sIdx) => {
                      const stepKey = `${rec.id}-step-${sIdx}`;
                      const isChecked = !!checkedSteps[stepKey];
                      return (
                        <div
                          key={sIdx}
                          onClick={() => toggleStep(stepKey)}
                          className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition text-xs select-none ${
                            isChecked
                              ? 'bg-emerald-950/30 text-zinc-400 line-through'
                              : 'bg-zinc-900/50 hover:bg-zinc-900 text-zinc-200'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center border shrink-0 ${
                              isChecked
                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                : 'border-zinc-700 bg-zinc-800'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                          <span className="leading-snug">{step}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Interactive Dispatch Button & Footer Metadata */}
                  <div className="flex flex-wrap items-center justify-between pt-3 border-t border-zinc-800/80 gap-2">
                    <div className="text-[10px] font-mono text-zinc-500">
                      <span>Engine: {rec.algorithmOrigin} • </span>
                      <span className="text-violet-400 font-semibold">
                        Confidence: {rec.confidencePercent}%
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDispatchRec(rec)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        isDispatched
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-violet-600 hover:bg-violet-500 text-white'
                      }`}
                    >
                      {isDispatched ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Dispatched to Mine Floor</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Dispatch Advisory</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Action Feedback Toast */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-violet-500/80 text-violet-200 text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 max-w-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionToast}</span>
        </div>
      )}
    </div>
  );
};
