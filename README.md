# 🚆 Which Train First — Indian Railway Head-to-Head Comparison Platform

> **Inspired by "Where Is My Train" — Don't just track trains. Predict which train will reach the destination first.**

[![GitHub Repo](https://img.shields.io/badge/github-which--train--first-blue.svg)](https://github.com/Zakeer-official/which-train-first)
[![Backend Tests](https://img.shields.io/badge/tests-10%20passed-brightgreen.svg)]()
[![FastAPI](https://img.shields.io/badge/backend-FastAPI%201.0-009688.svg)]()
[![Next.js](https://img.shields.io/badge/frontend-Next.js%2014-black.svg)]()
[![TypeScript](https://img.shields.io/badge/typescript-strict-blue.svg)]()

---

## Overview

*"Where Is My Train"* famously revolutionized answering the single question: *"Where is my train right now?"*

**"Which Train First"** takes railway passenger intelligence to the next level by answering the ultimate comparison question:
> **"Between these two trains heading to my destination, which one will actually arrive first?"**

When passengers, family members, or rail fans track multiple trains towards a shared junction or terminus (such as Mahbubabad, New Delhi, Vijayawada, or Howrah), they usually flip between different tracking screens and manually calculate arrival differences.

**Which Train First** brings simultaneous dual-train tracking into a unified dashboard with physics-based ETA estimation, live telemetry, and instant lead-change detection.

---

## Key Features

- **Side-by-Side Dual Telemetry:** Desktop side-by-side and mobile-optimized stacked views showing real-time speeds, remaining route distances, and current reported stations.
- **Multi-Level Prediction Hierarchy:**
  - **Level 1 (Live Telemetry):** GPS coordinates & live cruising speed.
  - **Level 2 (Sequence Engine):** Track sequence distance calculation incorporating intermediate halt durations.
  - **Level 3 (Timetable Blend):** Official timetable blended with latest observed departure delay.
  - **Level 4 (Stale Warning):** Transparent warnings when data freshness exceeds thresholds.
- **Dynamic Common Destination Validation:** Automatically scans routes of both trains to identify common upcoming stations.
- **Lead-Change Tracking:** Captures and logs every change of lead with timestamps and margin evolution.
- **Live Auto-Refresh & SSE:** Server-Sent Events stream with client-side countdown timer and pause/resume controls.
- **One-Click Sharing:** WhatsApp prefilled sharing and clipboard copy for public race sessions.

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom dark navy railway theme
- **Icons:** Lucide React
- **Charts:** Recharts
- **Maps:** Leaflet & OpenStreetMap

### Backend
- **Framework:** Python 3.12 + FastAPI
- **Validation:** Pydantic V2 + Pydantic Settings
- **ORM & Database:** SQLAlchemy (async) with SQLite for local development and PostgreSQL support for production
- **Testing:** Pytest & pytest-asyncio
- **HTTP Client:** HTTPX

---

## Architecture

```
train-race/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app & lifespan configuration
│   │   ├── config.py            # Environment settings
│   │   ├── database.py          # Async SQLAlchemy engine
│   │   ├── models/              # Train, Station, RaceSession, Snapshots
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── providers/           # Base provider, RapidAPI, Demo provider
│   │   ├── engine/              # ETACalculator & TrainComparisonEngine
│   │   ├── api/                 # Trains, Stations, Races, Health endpoints
│   │   └── services/            # Cache service & Race service
│   ├── tests/                   # 10 automated unit and integration tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router (Landing, Create, Race, About)
│   │   ├── components/          # TrainCard, RaceLeaderBanner, ProgressTracker, Map
│   │   └── lib/                 # API client & TypeScript interfaces
│   └── package.json
├── docker-compose.yml
├── PROJECT_STATUS.md
└── README.md
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Clone & Setup Repository
```bash
git clone https://github.com/your-username/train-race.git
cd train-race
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt greenlet
```

Run tests:
```bash
$env:PYTHONPATH = "."
pytest -v
```

Start backend API:
```bash
uvicorn app.main:app --reload --port 8000
```
API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Docker Deployment

Run both backend and frontend via Docker Compose:
```bash
docker-compose up --build
```

---

## Environment Variables

Copy `.env.example` to `.env`:
```ini
ENVIRONMENT=development
DATABASE_URL=sqlite+aiosqlite:///./train_race.db
RAILWAY_API_PROVIDER=demo # or "rapidapi"
RAPIDAPI_KEY=your_key_here
REFRESH_INTERVAL_SECONDS=15
```

---

## Data Disclosure & Disclaimer

Train Race is an independent analytical application. For official reservation and ticketing, refer to [IRCTC](https://www.irctc.co.in).
