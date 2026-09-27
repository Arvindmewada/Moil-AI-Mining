# MOIL AI Mining — Manganese Reserve & Production Intelligence

> **Enterprise Decision Support Suite for Manganese Ore India Limited (MOIL)**  
> AI-powered manganese reserve potential estimation, satellite-derived environmental tracking, and production shortfall prediction using geological, operational, and multi-spectral remote sensing covariates.

---

## 📌 Executive Summary & Scientific Integrity Notice

**Industrial Challenge:** Predicting manganese ore reserve continuity, grade fluctuations, and operational production shortfalls across underground and opencast leases in the Central India Manganese Belt (Madhya Pradesh & Maharashtra).

### 🔬 Scientific Integrity & UNFC/JORC Boundary
- **Underground Reserves:** Manganese deposits in the Sausar Metasedimentary Group (Balaghat, Dongri Buzurg, Gumgaon, Mansar, Ukwa, etc.) occur between subcrop down to >450m depth. **Satellite optical (Sentinel-2) and radar (Sentinel-1) sensors do not penetrate underground strata** to confirm ore reserves or chemical grade.
- **Role of Remote Sensing:** Multi-spectral indices (Sentinel-2 NDVI, NASA IMERG precipitation, Sentinel-1 radar backscatter soil moisture, Landsat LST) are strictly utilized for **surface environmental feasibility**, including:
  1. Opencast pit inundation and sump pump surge calculations.
  2. Haul road traction degradation from saturated surface soils.
  3. Monsoon season hoist skip downtime risk.
  4. Environmental lease boundary buffer monitoring.
- **Statutory Reserve Classifications:** Proved (UNFC 111) and Probable (UNFC 122) reserves are based exclusively on dense diamond core borehole assays and underground stope survey records. Unverified deep projections are transparently categorized as **Illustrative Inferred Potential (UNFC 333)**.

---

## 🏗️ System Architecture

```
+--------------------------------------------------------------------------------------------------+
|                                  MOIL ENTERPRISE CLIENT TIER                                     |
|  [ React 19 + TypeScript SPA Dashboard ] <---> [ Interactive 2.5D Strata SVG & Bottleneck Radar ] |
|  - Standalone Local Physics Simulation Engine (Deterministic Fallback)                           |
|  - Configurable REST Adapter (/health, /predict/reserve, /predict/production, /recommend)        |
+-------------------------------------------------+------------------------------------------------+
                                                  | (mTLS / REST JSON)
                                                  v
+--------------------------------------------------------------------------------------------------+
|                                   FASTAPI ASYNC INFERENCE TIER                                   |
|  [ Uvicorn / Gunicorn Multi-Worker Container ]                                                   |
|  - Rate Limiter & Pydantic V2 Contract Validation                                                |
|  - Ingestion Pipeline: Sentinel-1/2 Earth Engine Hub & IMERG GPM Hydrology Service               |
+------------------------+------------------------------------------------+------------------------+
                         |                                                |
                         v                                                v
+------------------------------------+        +----------------------------------------------------+
|          ML ENGINE TIER            |        |              SPATIO-TEMPORAL DATA TIER             |
| - 3D Ordinary Kriging Interpolator |        | - PostgreSQL 16 + PostGIS Spatial Vector Database  |
| - LightGBM / XGBoost Shortfall     |        | - MinIO / S3 Object Store (Raw GeoTIFF & Cores)    |
| - MILP Grade Blending Optimizer    |        | - Redis Cluster (Telemetry Cache & In-Memory State)|
+------------------------------------+        +----------------------------------------------------+
```

---

## ⚡ Quickstart & Local Execution

### 1. Frontend Execution (React + Vite)
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# Dashboard opens at http://localhost:3000
```

### 2. FastAPI Backend Execution (Python 3.10+)
```bash
# 1. Navigate to backend directory or create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install FastAPI and scientific stack
pip install fastapi uvicorn pydantic scikit-learn numpy scipy pandas

# 3. Start the FastAPI server
uvicorn fastapi_server:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🔌 API Contract Specification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Returns backend liveness, model version, and GPU inference status |
| `POST` | `/predict/reserve` | Calculates geometric volume, in-situ/recoverable tonnage, and UNFC breakdown |
| `POST` | `/predict/production` | Computes monthly realization, shortfall deficit, and bottleneck sensitivity |
| `POST` | `/recommend` | Yields prescriptive mitigation workflows for haulage and grade blending |
| `POST` | `/analyze` | Multi-source spatial correlation between boreholes and surface indices |

### Sample Payload: `POST /predict/reserve`
```json
{
  "mineId": "balaghat",
  "strikeLengthM": 1600.0,
  "trueThicknessM": 12.0,
  "dipAngleDeg": 68.0,
  "depthExtentM": 420.0,
  "bulkDensity": 3.85,
  "inSituMnGrade": 43.5,
  "miningRecoveryFactor": 0.85,
  "geologicalLossFactor": 0.08,
  "satelliteNdvi": 0.42,
  "satelliteRainfallMm": 182.4,
  "surfaceAnomalyIndex": 6.2
}
```

---

## 🐳 Docker & Containerization

### Build & Run with Docker Compose
```bash
# Build and run complete multi-container stack
docker-compose up --build -d

# Check running services
docker-compose ps

# Stream logs
docker-compose logs -f
```

---

## 🔒 Security Best Practices & Secrets Management

1. **Zero Client Secrets:** No database credentials, API keys, or master tokens are embedded in frontend client bundles.
2. **HashiCorp Vault Integration:** Production credentials are dynamically mounted using Kubernetes Vault Sidecar Injectors into in-memory `/vault/secrets` tmpfs volumes.
3. **mTLS & Network Policies:** Strict Calico network policies enforce zero lateral movement. Only the `fastapi-backend` service can communicate with PostGIS port 5432.
4. **Least-Privilege RBAC:** Database users run with `SELECT, INSERT, UPDATE` on application tables only; DDL operations are disabled in runtime service accounts.

---

## 🔄 Disaster Recovery Protocols (RTO / RPO)

| Metric | Target SLA | Strategy |
|---|---|---|
| **RPO (Recovery Point Objective)** | **< 5 Minutes** | Continuous PostgreSQL Write-Ahead Log (WAL) archiving via WAL-G to geo-replicated S3 buckets. |
| **RTO (Recovery Time Objective)** | **< 15 Minutes** | Patroni multi-zone automated leader failover with zero manual intervention. |
| **Data Retention** | **7 Years** | Encrypted, WORM-compliant cold archives for statutory mineral inventory records. |

### Automated Failover Runbook:
1. **Primary Node Loss:** Heartbeat timeout triggers after 10 seconds.
2. **Leader Election:** Secondary replica in Zone B promotes itself to read/write primary.
3. **Client Degradation:** If network partition occurs, client dashboard continues operating in deterministic **DEMO MODE** without throwing fatal UI errors.

---

## 🚀 CI/CD Automated Release Pipeline

```
[Developer Git Push]
        │
        ▼
[GitHub Actions CI] ──> Step 1: Lint & TypeScript Verify (npm run lint)
        │
        ▼
Step 2: Automated Unit & Physics Regression Tests
        │
        ▼
Step 3: Docker Buildx Multi-Arch Container Image Build
        │
        ▼
Step 4: Trivy Container Vulnerability Scanning (Fails on CVE Critical/High)
        │
        ▼
Step 5: Cryptographic Image Signing with Sigstore Cosign
        │
        ▼
[ArgoCD GitOps] ─────> Canary Rollout (10% Traffic -> 100% after Prometheus SLO Check)
```

---

## 🛠️ Troubleshooting & Support

- **FastAPI Disconnected in Dashboard:** Click the "DEMO MODE / LIVE API" badge in the top right to verify the server URL and execute a live `GET /health` ping.
- **CORS Issues:** Ensure FastAPI has `CORSMiddleware` active with your client origin allowed.
- **Exporting Data:** Navigate to **Data Explorer** to download drillhole assays and shift logs in CSV or JSON format.
