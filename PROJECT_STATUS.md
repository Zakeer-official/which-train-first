# PROJECT STATUS: WHICH TRAIN FIRST

**Last Updated:** November 22, 2026
**Repository:** [`Zakeer-official/which-train-first`](https://github.com/Zakeer-official/which-train-first)
**Status:** COMPLETE & PRODUCTION-READY

---

## 1. COMPLETED PHASES & TASKS

### Phase 1: Workspace & API Architecture Research
- [x] Defined provider-independent `RailwayDataProvider` interface.
- [x] Researched Indian Railway NTES feeds and RapidAPI data contracts.
- [x] Formulated 4-level fallback hierarchy (Live Telemetry, Sequence Model, Timetable Blend, Stale Warning).

### Phase 2: Architecture & Database Schema
- [x] Built SQLAlchemy asynchronous database engine with SQLite local fallback and PostgreSQL production support.
- [x] Models implemented: `Train`, `TrainStop`, `Station`, `RaceSession`, `PredictionSnapshot`, `LeadChange`, `APIHealthLog`.
- [x] Pydantic schemas created for train metadata, race configurations, and comparison payloads.

### Phase 3: Railway Data Provider Adapters
- [x] `DemoRailwayDataProvider`: High-fidelity simulation adapter with authentic train numbers (12656, 12705, 12951, 12953), exact station schedules, GPS coordinates, cruising speeds, and dynamic telemetry progression.
- [x] `RapidAPIRailwayProvider`: Production adapter for RapidAPI Indian Railways feeds with retries, exponential backoff, timeouts, and rate limit handling.
- [x] `factory.py`: Automatic provider selection with graceful fallback.

### Phase 4: Head-to-Head Comparison Engine
- [x] `ETACalculator`: Computes timetable-derived ETA, physics & station-sequence estimated ETA, and uncertainty intervals.
- [x] `TrainComparisonEngine`:
  - Evaluates independent destination ETAs.
  - Calculates ETA gap: `|ETA_A - ETA_B|`.
  - Determines predicted leader based on earliest arrival (never by current distance alone).
  - Delay trend detection (RECOVERING, WORSENING, STEADY).
  - Lead change logging against previous prediction snapshots.

### Phase 5: FastAPI REST & Streaming Endpoints
- [x] `GET /api/trains/search`
- [x] `GET /api/trains/{train_number}`
- [x] `GET /api/trains/{train_number}/route`
- [x] `GET /api/trains/{train_number}/status`
- [x] `GET /api/stations/search`
- [x] `GET /api/stations/common` (Intersecting destination stations)
- [x] `POST /api/races` (Race session creation with route validation)
- [x] `GET /api/races/{race_id}` (Live dashboard comparison payload)
- [x] `GET /api/races` (Recent active races)
- [x] `GET /api/races/{race_id}/live` (Server-Sent Events streaming)
- [x] `GET /api/health` & `GET /api/health/providers`

### Phase 6: Frontend Application & UI/UX
- [x] Next.js 14 App Router with TypeScript and Tailwind CSS.
- [x] Premium dark navy railway intelligence theme (`#080C14`, `#0D1527`, `#00F0FF`, `#10B981`).
- [x] Screen A: Landing Page (`/`) with Hero, example comparison, features, and recent races.
- [x] Screen B: Create Race Page (`/create`) with live common station discovery and presets.
- [x] Screen C: Live Race Dashboard (`/race/[id]`) with prominent leader banner, dual train cards, linear track tracker, interactive Leaflet map, upcoming stations table, and Recharts telemetry trends.
- [x] Screen D: Historical trends & lead changes log.
- [x] Screen E: Sharing integration (WhatsApp one-click sharing, copy link).
- [x] Screen F: About & Data Sources (`/about`) disclosing methodology, health status, and disclaimers.

### Phase 7: Live Updates & Caching
- [x] Centralized caching service (`cache.py`) with TTL to prevent hammering external providers.
- [x] Auto-refresh countdown with pause/resume toggle on the frontend.
- [x] Server-Sent Events (SSE) support.

### Phase 8: Testing & Verification
- [x] 10 automated unit and integration tests written and executed with `pytest`:
  - `test_time_parsing_and_conversion` (Overnight journey handling)
  - `test_timetable_derived_eta`
  - `test_backend_estimated_eta`
  - `test_confidence_score_calculation`
  - `test_demo_provider_search_and_route`
  - `test_head_to_head_comparison_winner_selection`
  - `test_api_health`
  - `test_common_stations_api`
  - `test_create_and_retrieve_race`
  - `test_create_invalid_race_destination_fails`
- [x] Frontend compiled successfully with `npm run build` (0 TypeScript / lint errors).

### Phase 9: Deployment & DevOps
- [x] `docker-compose.yml` for containerized dual-service deployment.
- [x] `backend/Dockerfile` and `frontend/Dockerfile`.
- [x] `.env.example` with detailed environment variables.

---

## 2. EXACT EXECUTION COMMANDS

### Run Backend Locally
```bash
cd backend
# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
Backend API docs available at: `http://localhost:8000/docs`

### Run Frontend Locally
```bash
cd frontend
npm run dev
```
Frontend accessible at: `http://localhost:3000`

### Run Automated Backend Tests
```bash
cd backend
$env:PYTHONPATH = "."
.\venv\Scripts\pytest.exe -v
```

### Build Production Artifacts
```bash
# Backend
pip install -r backend/requirements.txt greenlet

# Frontend
cd frontend
npm run build
npm start
```

### Run with Docker Compose
```bash
docker-compose up --build
```

---

## 3. KNOWN LIMITATIONS & DISCLOSURES
1. **Dynamic Track Precedence:** Unplanned signal holds by railway traffic controllers for crossing priority cannot be predicted purely by timetable geometry.
2. **Unofficial Data Feeds:** Public third-party APIs may experience latency or rate limits; the system seamlessly falls back to Level 2/Level 3 calculation levels or the high-fidelity demo simulation feed.
