import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

export const ScientificCaveatBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl px-4 py-2.5 text-xs text-amber-200/90 shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold text-amber-300">
            MOIL Scientific Integrity & Geological Caveat:
          </span>
          <span className="hidden md:inline text-amber-200/80">
            Satellite data (NDVI, soil moisture, precipitation) supports surface hydrology and pit logistics, but cannot independently confirm underground reserves.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 px-2 py-0.5 rounded bg-amber-900/40 hover:bg-amber-900/60 transition"
        >
          <span>{isExpanded ? 'Collapse' : 'Protocol Details'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-amber-800/50 space-y-2 text-[11px] leading-relaxed text-amber-100/80">
          <p>
            • <strong>Underground Reserve vs. Surface Covariates:</strong> Manganese deposits in the Sausar Group
            (Balaghat, Dongri Buzurg, Mansar) occur at depths from subcrop down to &gt;450m RL. Optical (Sentinel-2) and radar
            (Sentinel-1) sensors penetrate only millimeters into surface soils.
          </p>
          <p>
            • <strong>Role of Remote Sensing in MOIL Mining:</strong> Satellite covariates are deployed exclusively for:
            (1) opencast pit flooding vulnerability, (2) haulage ramp traction risk via radar soil moisture saturation,
            (3) monsoon rainfall impact on skip hoisting and dewatering demand, and (4) surface environmental lease monitoring.
          </p>
          <p>
            • <strong>Statutory Compliance (UNFC / JORC):</strong> All tonnage classifications labeled as &quot;Proved&quot; or &quot;Probable&quot; require physical core drilling assays and surveyed stope voids. AI estimations generated herein are marked as <em>Illustrative Potential</em>.
          </p>
        </div>
      )}
    </div>
  );
};
