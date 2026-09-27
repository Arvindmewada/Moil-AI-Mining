import React, { useState } from 'react';
import {
  Info,
  Server,
  Terminal,
  Shield,
  RefreshCw,
  GitBranch,
  Copy,
  Check,
  FileCode,
  Layers,
  Database,
  Lock,
  Workflow,
  Cpu,
  Activity,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { ScientificCaveatBanner } from '../common/ScientificCaveatBanner';

export const AboutAndDeploymentView: React.FC = () => {
  const [activeDocTab, setActiveDocTab] = useState<
    'overview' | 'api' | 'docker' | 'security' | 'dr' | 'cicd' | 'troubleshoot'
  >('overview');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <ScientificCaveatBanner />

      {/* Hero Header */}
      <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800">
                MOIL LIMITED • CENTRAL INDIA MANGANESE BELT
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                Enterprise Mining Decision Support
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-100 tracking-tight">
              AI-Powered Manganese Reserve Estimation &amp; Production Shortfall Forecaster
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-3xl leading-relaxed">
              Industrial decision support suite integrating subsurface diamond core assays, 3D Kriging block models,
              and multi-spectral remote sensing (Sentinel-1/2, NASA IMERG) for operational de-risking and statutory compliance.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-zinc-800 text-xs font-semibold">
        {[
          { id: 'overview', label: 'Architecture & System Rationale', icon: <Layers className="w-3.5 h-3.5" /> },
          { id: 'api', label: 'FastAPI Integration Spec', icon: <Server className="w-3.5 h-3.5" /> },
          { id: 'docker', label: 'Docker & Containerization', icon: <FileCode className="w-3.5 h-3.5" /> },
          { id: 'security', label: 'Security & Secrets Policy', icon: <Lock className="w-3.5 h-3.5" /> },
          { id: 'dr', label: 'Disaster Recovery (RTO/RPO)', icon: <Activity className="w-3.5 h-3.5" /> },
          { id: 'cicd', label: 'CI/CD Automated Release', icon: <Workflow className="w-3.5 h-3.5" /> },
          { id: 'troubleshoot', label: 'Troubleshooting & Runbook', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveDocTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition shrink-0 ${
              activeDocTab === tab.id
                ? 'bg-violet-950 text-violet-200 border border-violet-700 shadow-md font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Architecture & Rationale */}
      {activeDocTab === 'overview' && (
        <div className="space-y-6">
          {/* Scientific Rationale Card */}
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Scientific Boundaries &amp; UNFC / JORC Compliance Standards
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-300 leading-relaxed">
              <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800 space-y-2">
                <span className="font-bold text-amber-300 block text-xs uppercase tracking-wider">
                  ⚠️ Underground vs Remote Sensing Physics
                </span>
                <p>
                  Satellite optical (Sentinel-2 MSI) and synthetic aperture radar (Sentinel-1 C-Band) sensors cannot
                  penetrate rock strata beneath surface alluvium to detect underground manganese bodies (typically 80m to 450m depth
                  in the Sausar Group).
                </p>
                <p>
                  Therefore, in this application, satellite covariates (NDVI, soil moisture, precipitation) are strictly used for
                  <strong> surface operational feasibility</strong>: pit flooding vulnerability, haul road slurry conditions, and
                  pumping duty requirements.
                </p>
              </div>

              <div className="bg-zinc-900/70 p-4 rounded-xl border border-zinc-800 space-y-2">
                <span className="font-bold text-emerald-300 block text-xs uppercase tracking-wider">
                  ✅ Statutory Ore Verification Mechanism
                </span>
                <p>
                  Statutory reserves (UNFC Codes 111 Proved, 122 Probable) are determined exclusively through physical
                  borehole core drilling, chemical laboratory assay determinations (Mn %, Fe %, P %, SiO2 %), and surveyed
                  underground cross-cut openings.
                </p>
                <p>
                  Any algorithmic extrapolation beyond drilled grids is transparently marked as <em>Inferred Illustrative Potential (UNFC 333)</em>.
                </p>
              </div>
            </div>
          </div>

          {/* System Architecture Diagram (ASCII + SVG) */}
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-violet-400" />
              End-to-End System Architecture (MOIL AI Mining)
            </h2>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed">
              <pre>{`+--------------------------------------------------------------------------------------------------------+
|                                    MOIL ENTERPRISE CLIENT TIER                                         |
|  [ React 19 + TypeScript SPA Dashboard ]  <--->  [ Interactive 2.5D Strata SVG & Sensitivity Visualizer ]|
|  - Standalone Local Physics Simulation Engine (Deterministic Fallback)                                |
|  - Configurable REST Adapter (/health, /predict/reserve, /predict/production, /recommend)             |
+---------------------------------------------------+----------------------------------------------------+
                                                    | (mTLS / REST JSON)
                                                    v
+--------------------------------------------------------------------------------------------------------+
|                                     FASTAPI ASYNC INFERENCE TIER                                       |
|  [ Uvicorn / Gunicorn Multi-Worker Container ]                                                         |
|  - Rate Limiter & Pydantic V2 Contract Validation                                                     |
|  - Ingestion Pipeline: Sentinel-1/2 Earth Engine Hub & IMERG GPM Hydrology Service                    |
+--------------------------+------------------------------------------------+----------------------------+
                           |                                                |
                           v                                                v
+--------------------------------------+        +--------------------------------------------------------+
|           ML ENGINE TIER             |        |                 SPATIO-TEMPORAL DATA TIER              |
| - 3D Ordinary Kriging Interpolator   |        | - PostgreSQL 16 + PostGIS Spatial Vector Database      |
| - LightGBM / XGBoost Shortfall Model |        | - MinIO / S3 Object Store (Raw GeoTIFF & Drill Logs)   |
| - MILP Grade Blending Optimizer      |        | - Redis Cluster (Telemetry Cache & In-Memory State)   |
+--------------------------------------+        +--------------------------------------------------------+`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: FastAPI Spec */}
      {activeDocTab === 'api' && (
        <div className="space-y-6">
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <Server className="w-4 h-4 text-sky-400" />
                  FastAPI Production Endpoints Contract
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Specification used when connecting the dashboard to your live Python container
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `# FastAPI Server Implementation Template
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="MOIL AI Mining Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0", "engine": "XGBoost+Kriging", "gpu_active": True}

class ReserveRequest(BaseModel):
    strikeLengthM: float
    trueThicknessM: float
    dipAngleDeg: float
    depthExtentM: float
    bulkDensity: float
    inSituMnGrade: float

@app.post("/predict/reserve")
def predict_reserve(req: ReserveRequest):
    vol = req.strikeLengthM * req.trueThicknessM * (req.depthExtentM / 0.86)
    tonnage = (vol * req.bulkDensity) / 1e6
    return {
        "totalInSituTonnageMT": round(tonnage, 2),
        "recoverableTonnageMT": round(tonnage * 0.85, 2),
        "estimatedGradeMn": req.inSituMnGrade,
        "containedManganeseMetalMT": round(tonnage * 0.85 * (req.inSituMnGrade / 100), 2),
        "confidenceBand": {"p10": round(tonnage * 1.15, 2), "p50": round(tonnage * 0.85, 2), "p90": round(tonnage * 0.72, 2)},
        "economicValueEstimateCrINR": round(tonnage * 0.85 * 11200 / 100, 1)
    }
`,
                    'api-code'
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-semibold transition"
              >
                {copiedKey === 'api-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'api-code' ? 'Copied Python Code' : 'Copy FastAPI Code'}</span>
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-sky-400 font-bold">
                  <span>GET /health</span>
                  <span className="text-[10px] text-zinc-400">Response: 200 OK</span>
                </div>
                <pre className="text-zinc-300 overflow-x-auto text-[11px]">
{`{
  "status": "ok",
  "version": "1.0.0",
  "engine": "XGBoost + 3D Kriging",
  "models_loaded": ["shortfall_v2.lgb", "kriging_spatial_v1.pkl"],
  "gpu_active": true
}`}
                </pre>
              </div>

              <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>POST /predict/reserve</span>
                  <span className="text-[10px] text-zinc-400">Payload &amp; Response</span>
                </div>
                <pre className="text-zinc-300 overflow-x-auto text-[11px]">
{`// Request Payload:
{
  "strikeLengthM": 1400.0,
  "trueThicknessM": 12.5,
  "dipAngleDeg": 65.0,
  "depthExtentM": 380.0,
  "bulkDensity": 3.85,
  "inSituMnGrade": 43.5,
  "miningRecoveryFactor": 0.85,
  "geologicalLossFactor": 0.08
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Docker */}
      {activeDocTab === 'docker' && (
        <div className="space-y-6">
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              Multi-Stage Production Dockerfile &amp; Compose
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
                  <span className="font-semibold text-zinc-200">1. Production Multi-Stage Dockerfile</span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `# Multi-Stage Production Dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine-slim
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`,
                        'dockerfile'
                      )
                    }
                    className="flex items-center gap-1 text-[11px] text-zinc-300 hover:text-white"
                  >
                    {copiedKey === 'dockerfile' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy Dockerfile</span>
                  </button>
                </div>

                <pre className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed">
{`# Multi-stage production container for MOIL AI Mining Frontend
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline
COPY . .
RUN npm run build

FROM nginx:1.27-alpine-slim
COPY --from=builder /app/dist /usr/share/nginx/html
# Security: Run non-root user
USER 1001
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8080/ || exit 1
CMD ["nginx", "-g", "daemon off;"]`}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
                  <span className="font-semibold text-zinc-200">2. docker-compose.yml (Frontend + FastAPI + PostGIS)</span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `version: '3.8'
services:
  dashboard:
    build: .
    ports:
      - "3000:8080"
    environment:
      - VITE_FASTAPI_URL=http://fastapi-backend:8000
    depends_on:
      - fastapi-backend

  fastapi-backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://moil_admin:secure_pass@db:5432/moil_mining
    depends_on:
      - db

  db:
    image: postgis/postgis:16-3.4-alpine
    environment:
      - POSTGRES_DB=moil_mining
      - POSTGRES_USER=moil_admin
      - POSTGRES_PASSWORD=secure_pass
    volumes:
      - postgis_data:/var/lib/postgresql/data

volumes:
  postgis_data:
`,
                        'compose'
                      )
                    }
                    className="flex items-center gap-1 text-[11px] text-zinc-300 hover:text-white"
                  >
                    {copiedKey === 'compose' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy docker-compose.yml</span>
                  </button>
                </div>

                <pre className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed">
{`version: '3.8'
services:
  moil-ui:
    build: .
    ports:
      - "3000:8080"
    restart: unless-stopped
    depends_on:
      - fastapi-backend

  fastapi-backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - WORKERS=4
      - MODEL_REGISTRY_PATH=/models
    volumes:
      - ./models:/models:ro`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security */}
      {activeDocTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              Security Architecture &amp; Secrets Management
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 space-y-2">
                <span className="font-bold text-amber-400 uppercase text-[11px] block">
                  1. Zero Secrets in Client Bundle
                </span>
                <p className="text-zinc-300 leading-relaxed">
                  The React client never stores database credentials or private master keys. All external telemetry and
                  satellite tokens are managed inside protected backend proxy layers.
                </p>
                <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800 font-mono text-[10px] text-zinc-400">
                  Vault Agent Injector mounts tokens into /vault/secrets in memory tmpfs only.
                </div>
              </div>

              <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800 space-y-2">
                <span className="font-bold text-sky-400 uppercase text-[11px] block">
                  2. Network Policies &amp; Micro-segmentation
                </span>
                <p className="text-zinc-300 leading-relaxed">
                  Strict Kubernetes Calico NetworkPolicies isolate the PostGIS database. Only pods labeled
                  <code className="text-emerald-400 bg-zinc-950 px-1 py-0.5 rounded ml-1">app: fastapi-backend</code>
                  can establish TCP 5432 ingress.
                </p>
                <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800 font-mono text-[10px] text-zinc-400">
                  Default Deny All Ingress + Egess egress rules enforce zero lateral traversal.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Disaster Recovery */}
      {activeDocTab === 'dr' && (
        <div className="space-y-6">
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              Business Continuity &amp; Disaster Recovery Protocols
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs font-mono">
              <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                <span className="text-zinc-400 text-[10px] block uppercase">Target RPO</span>
                <span className="text-xl font-bold text-emerald-400">&lt; 5 Minutes</span>
                <span className="text-[10px] text-zinc-500 block mt-1">Continuous WAL archiving</span>
              </div>

              <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                <span className="text-zinc-400 text-[10px] block uppercase">Target RTO</span>
                <span className="text-xl font-bold text-sky-400">&lt; 15 Minutes</span>
                <span className="text-[10px] text-zinc-500 block mt-1">Automated Patroni Failover</span>
              </div>

              <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                <span className="text-zinc-400 text-[10px] block uppercase">Backup Retention</span>
                <span className="text-xl font-bold text-violet-400">7 Years (Immutable)</span>
                <span className="text-[10px] text-zinc-500 block mt-1">S3 WORM compliance</span>
              </div>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-xs space-y-2 text-zinc-300">
              <span className="font-bold text-zinc-100 block">Automated Failover Topology:</span>
              <p>
                1. <strong>Primary Failure:</strong> Patroni and etcd trigger leader lease timeout in 10 seconds.
              </p>
              <p>
                2. <strong>Standby Promotion:</strong> Secondary replica in secondary cloud zone assumes write master.
              </p>
              <p>
                3. <strong>Client Resilience:</strong> The dashboard automatically degrades to local deterministic simulation
                without throwing unhandled runtime exceptions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: CI/CD */}
      {activeDocTab === 'cicd' && (
        <div className="space-y-6">
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Workflow className="w-4 h-4 text-violet-400" />
              Automated GitOps CI/CD Release Pipeline
            </h2>

            <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-xl text-xs font-mono text-zinc-300 space-y-3">
              <div className="flex items-center gap-2 text-violet-300 font-bold">
                <GitBranch className="w-4 h-4" />
                <span>GitHub Actions Release Stages:</span>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-zinc-300">
                <li>
                  <strong className="text-zinc-100">Lint &amp; Typecheck:</strong> <code>npm run lint</code> &amp; <code>tsc --noEmit</code>
                </li>
                <li>
                  <strong className="text-zinc-100">Container Build:</strong> Multi-arch build with Buildx cache
                </li>
                <li>
                  <strong className="text-zinc-100">Security CVE Scan:</strong> Trivy scan fails pipeline if Critical/High CVEs exist
                </li>
                <li>
                  <strong className="text-zinc-100">Cryptographic Signing:</strong> Cosign signs container images using Sigstore OIDC
                </li>
                <li>
                  <strong className="text-zinc-100">Canary Deployment:</strong> ArgoCD initiates 10% canary traffic rollout for 1 hour
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Troubleshooting */}
      {activeDocTab === 'troubleshoot' && (
        <div className="space-y-6">
          <div className="bg-zinc-950/90 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Troubleshooting Matrix &amp; Operational Runbook
            </h2>

            <div className="space-y-3 text-xs">
              <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-xl space-y-1">
                <span className="font-bold text-rose-400">Issue: FastAPI Backend Shows &quot;Disconnected&quot; in Top Bar</span>
                <p className="text-zinc-300">
                  • Verify Uvicorn is running: <code>ps aux | grep uvicorn</code>
                </p>
                <p className="text-zinc-300">
                  • Ensure CORS middleware is enabled with <code>allow_origins=[&quot;*&quot;]</code> on your FastAPI server.
                </p>
                <p className="text-zinc-300">
                  • The dashboard safely stays in DEMO MODE so you can explore all features seamlessly without interruption.
                </p>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-xl space-y-1">
                <span className="font-bold text-amber-400">Issue: Calculations Differ from Statutory Audit</span>
                <p className="text-zinc-300">
                  • Ensure geological loss factor and bulk density (default 3.85 t/m³) reflect current face channel samples.
                </p>
                <p className="text-zinc-300">
                  • Check that UNFC 111 vs 333 tags are respected during financial provisioning.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
