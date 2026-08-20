# TalentPulse — Claude Code Project Context

## Stack

- **Backend**: FastAPI + SQLAlchemy + scikit-learn (Python 3.12)
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Chart.js
- **DB**: SQLite (local) / PostgreSQL (prod via Render)
- **Auth**: JWT (HS256, python-jose) + bcrypt
- **Billing**: Stripe
- **Deployment**: Render (blueprint in `render.yaml`)

## Commands

### Backend (`cd backend`)

```bash
uv venv --python 3.12 .venv
uv pip install -r requirements.txt
.venv/bin/uvicorn main:app --reload    # http://localhost:8000
.venv/bin/uvicorn main:app             # prod (gunicorn in render.yaml)
```

- Swagger: `http://localhost:8000/api/docs`
- Health: `http://localhost:8000/api/health`
- Demo login: `demo@talentpulse.app` / `demo1234`

### Frontend (`cd frontend`)

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # static export → frontend/out/
npm run lint
```

## Architecture

```
frontend (Next.js static export, client-only)
  hooks/useTalents.ts, usePredictions.ts
        │  axios  (lib/api.ts — JWT auto-attach, 401 redirect)
        ▼
backend (FastAPI)  /api/auth  /api/talents  /api/predictions  /api/billing
  routes/*  →  services/*  →  models/* (SQLAlchemy)  →  SQLite/Postgres
```

- Services are module-level singletons (`prediction_service`, `talent_service`, etc.)
- Tables created at startup via `Base.metadata.create_all` in lifespan
- No migration system — schema changes require manual ALTER or DB reset
- Frontend is fully static (`output: 'export'`) — no SSR, no API routes

## Prediction flow

- RandomForestClassifier trained on boot from synthetic data → `backend/data/ml/*.pkl`
- 5 features: `performance_score`, `engagement_score`, `satisfaction_score`, `experience_years`, `salary/100k`
- `POST /api/predictions/talents/{id}` → inserts prediction + syncs `talent.turnover_risk` + status
- Thresholds: ≥0.7 high, ≥0.4 moderate, else low
- Fallback: `1 - avg(scores)` on inference failure

## Conventions

- **All user-facing strings in French** (error messages, labels, recommendations)
- Frontend path alias: `@/*` → `frontend/*` (tsconfig.json)
- Use shared Tailwind components from `app/globals.css` (`card`, `btn`, `badge`, etc.)
- Format helpers in `frontend/lib/format.ts` (`pct`, `eur`, `dateFR`, `riskLabel`)
- Components flat in `frontend/components/`

## Gotchas

- **Unused services** (don't wire these in unless asked): `services/airtable.py`, `services/baserow_service.py`, `services/cv_analysis.py`
- **Route ordering**: static routes before `/{id}` in `routes/talents.py` — don't reorder
- **Registering an employee creates a Talent row** automatically (see `routes/auth.py`)
- `data/` is gitignored — ML models live there locally only

## Environment

- `backend/.env` from `backend/.env.example`
- `frontend/.env` from `frontend/.env.example`
- `NEXT_PUBLIC_BACKEND_URL` is baked at build time for static export

## Repo notes

- Git root is home directory — only touch `backend/`, `frontend/`, `render.yaml`, `.github/`, `README.md`, `.gitignore`
- No root `package.json` or `pyproject.toml` — run commands from inside subdirs
- No test suite anywhere — CI workflow is a placeholder
