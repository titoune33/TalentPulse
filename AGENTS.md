# AGENTS.md

## What this is

**TalentPulse** — a French-language HR SaaS that predicts employee turnover with a RandomForest model and exposes talent/analytics/prediction features.

Monorepo with two real applications:

- `backend/` — FastAPI (Python 3.12) + SQLAlchemy + scikit-learn
- `frontend/` — Next.js 14 (App Router) + TypeScript + Tailwind CSS + Chart.js

Git remote: `https://github.com/titoune33/TalentPulse.git`.

## Structure du projet

Le projet est isolé dans ce dossier (`TalentPulse/`) qui constitue un dépôt Git autonome.
- `backend/` — l'API FastAPI
- `frontend/` — l'application Next.js
- `scripts/` — utilitaires ponctuels (migration Baserow)
- Fichiers de configuration racine : `render.yaml`, `netlify.toml`, `.github/workflows/`, `README.md`

## Commands

### Backend (`cd backend`)

```bash
# setup + run (SQLite by default — zero config)
uv venv --python 3.12 .venv
uv pip install -r requirements.txt
.venv/bin/uvicorn main:app --reload        # or: python main.py
```

- Serves on `http://localhost:8000` (override with `PORT`)
- Swagger docs: `http://localhost:8000/api/docs`
- Health: `http://localhost:8000/api/health`
- No backend test suite, no linter/formatter configured (no ruff/mypy/flake8, no alembic).

### Frontend (`cd frontend`)

```bash
npm install
npm run dev       # http://localhost:3000 (use `-- -p 3100` if taken)
npm run build     # static export → frontend/out/
npm run lint      # next lint (eslint + eslint-config-next)
```

No frontend test suite either. There are **no tests anywhere in the repo**; the CI workflow
(`.github/workflows/test_workflow.yml`) is a placeholder that only echoes `"Test successful"`.

## Architecture & data flow

```
frontend (Next.js, static export, client-only)
  hooks/useTalents.ts, usePredictions.ts
        │  axios  (lib/api.ts — attaches JWT, auto-redirects on 401)
        ▼
backend (FastAPI)  /api/auth  /api/talents  /api/predictions
  routes/*  →  services/*  →  models/* (SQLAlchemy)
        │
        ▼
  SQLite (local) or PostgreSQL (DATABASE_URL in prod)
```

- **Backend layering**: `routes/` (HTTP) → `services/` (business logic, module-level singletons
  like `talent_service`, `prediction_service`, `auth_service`) → `models/` (SQLAlchemy) and
  `schemas/` (Pydantic request/response). Controllers are thin; logic lives in services.
- **Tables are created at startup** via `Base.metadata.create_all` in the FastAPI `lifespan`
  (`main.py`), then `seed_service.seed_if_empty` populates demo data. There is **no migration
  system** — schema changes require deleting the DB (or manual ALTERs) locally.
- **Frontend is a static export** (`output: 'export'` in `next.config.js`). Consequences:
  - No Next.js API routes, no server components, no SSR data fetching.
  - Every page is `"use client"`; auth is entirely client-side (localStorage + React context).
  - The only way to reach the backend is the shared axios instance in `lib/api.ts`.
- **Auth**: JWT (HS256, `python-jose`), bcrypt password hashing (`passlib`). Token is stored in
  `localStorage` under `tp_token` and the user object under `tp_user`. Login endpoint
  (`/api/auth/token`) uses `OAuth2PasswordRequestForm` — i.e. **form-encoded `username`/`password`,
  not JSON**. The frontend `login()` builds a `URLSearchParams` body for this reason.
- **Auth guards**: talent/prediction routes take `get_current_user` as a `Depends` (often named `_`
  to signal it's unused). There is no role-based authorization anywhere — any logged-in user can
  access everything.

## Prediction / ML flow

- Model is a `RandomForestClassifier` trained **automatically on first boot** on synthetic data
  (`prediction_service._synthetic_dataset`), then pickled to `backend/data/ml/` (`turnover_model.pkl`,
  `scaler.pkl`). `backend/data/` is gitignored.
- **Naming gotcha**: artifacts live under `data/ml/` deliberately to avoid colliding with the
  `backend/models/` Python package. Don't rename either directory.
- 5 features (order matters): `performance_score`, `engagement_score`, `satisfaction_score`,
  `experience_years`, `salary / 100_000` (clamped to 5.0).
- `POST /api/predictions/talents/{id}` does two things: inserts a `Prediction` row **and** syncs
  `talent.turnover_risk` + `talent.status` (set to `AT_RISK` when risk ≥ 0.7, else `ACTIVE`).
- Risk thresholds are consistent across backend and frontend: **≥ 0.7 high, ≥ 0.4 moderate,
  else low** (see `prediction_service._generate_recommendation` and `lib/format.ts` `riskLabel`).
- If model inference fails, `predict_turnover` falls back to a heuristic `1 - avg(scores)`.

## Gotchas

- **Orphaned backend services (do NOT wire them in or "fix" their imports unless asked):**
  - `services/airtable.py` and `services/airtable_service.py` — two classes both named
    `AirtableService`; neither is imported by any route.
  - `services/baserow_service.py` — references Baserow via `httpx`; unused.
  - `services/cv_analysis.py` — imports `transformers`, which is **not** in `requirements.txt`
    (will crash on import). Unused.
  - `pyairtable` (used by `airtable.py`) is also **not** in `requirements.txt`.
  - Only the SQLAlchemy services (`auth_service`, `talent_service`, `prediction_service`,
    `seed_service`) are actually used. `services/__init__.py` confirms this.
- **Route ordering**: in `routes/talents.py`, static routes (`/search`, `/at-risk`, `/stats`) are
  deliberately declared before `/{talent_id}` so FastAPI doesn't shadow them. Keep that ordering.
- **Email uniqueness is enforced twice**: `Talent.email` is `unique=True` in the model, and
  `talent_service.create_talent` also raises 400 on duplicate. `User.email` same.
- **Registering an `employee`-role user auto-creates a `Talent`** row from the name
  (`routes/auth.py` `register_user`).
- **`Talent` enum columns** use `Enum(... values_callable=...)` to store values as strings — the
  `TalentStatus` and `UserRole` enums subclass `str` and `enum.Enum`.
- Local SQLite DB file is `backend/talentpulse.db` (gitignored). Set `DATABASE_URL` to use Postgres.

## Conventions & style

- **UI and user-facing strings are French** (error messages, recommendations, labels, dates
  formatted via `Intl.DateTimeFormat("fr-FR")`). Backend error `detail` strings are French too.
- Frontend path alias: `@/*` → `frontend/*` (`tsconfig.json`). Import UI via `@/components/...`,
  `@/lib/...`, `@/hooks/...`.
- Reusable Tailwind component classes are defined in `app/globals.css` (`@layer components`):
  `container-page`, `btn`, `btn-primary`, `btn-secondary`, `btn-ghost`, `btn-danger`, `input`,
  `label`, `card`, `badge`. Use these instead of repeating Tailwind.
- Custom design tokens (in `tailwind.config.ts`): `primary` (indigo scale), `surface`, `ink`,
  shadows `card`/`lift`, animation `fadeUp`.
- Components live flat in `frontend/components/` (`Button`, `Field`, `Modal`, `Chart`,
  `Sidebar`, `Topbar`, `TalentTable`, `StatsCard`, `Spinner`, `Badge`, `EmptyState`).
- Shared formatting helpers in `frontend/lib/format.ts` (`pct`, `eur`, `dateFR`, `riskLabel`, …) —
  use them rather than inlining formatting.
- Backend services are plain classes exposing a module-level singleton instance
  (`prediction_service = PredictionService()`, etc.); routes import the singleton, not the class.

## Environment variables

- `backend/.env` (see `backend/.env.example`): `DATABASE_URL`, `SECRET_KEY`,
  `ACCESS_TOKEN_EXPIRE_MINUTES` (default 1440), `CORS_ORIGIN` (comma-separated), `PORT`,
  `DEMO_EMAIL`/`DEMO_PASSWORD`.
- `frontend/.env`: `NEXT_PUBLIC_BACKEND_URL` (default `http://localhost:8000`). This is baked in at
  build time for the static export, so changing it requires a rebuild.
- Demo account (seeded on first boot): `demo@talentpulse.app` / `demo1234` (admin role), with
  14 talents and 13 weeks × 14 = 182 seeded predictions.

## Deployment

- `render.yaml` — Render blueprint (Postgres + backend Docker service + static frontend).
- `netlify.toml` (root) and `frontend/netlify.toml` — Netlify builds for the frontend.
- `backend/vercel.json` / `backend/vercel.config.json` — serverless FastAPI on Vercel.
- `backend/Dockerfile` — `python:3.12-slim`, runs `uvicorn main:app` on `$PORT`.
- `frontend/Dockerfile` — multi-stage: `node:20` static export → `nginx:alpine` serving `out/`
  via `nginx.template.conf` (note `listen ${PORT}` substitution for Railway).

## 🧠 Second Cerveau Obsidian (`~/obsidian`)

L'utilisateur utilise Obsidian (`/Users/titouanwajda/obsidian`) comme son second cerveau central.
**Règle permanente pour l'agent :**
- Dès qu'un apprentissage important (RETEX), une décision d'architecture, une préférence utilisateur, un concept clé ou un projet émerge :
  1. Le consigner ou le mettre à jour dans le dossier approprié de `~/obsidian/`.
  2. Utiliser obligatoirement la syntaxe **Obsidian Flavored Markdown** : frontmatter YAML (`title`, `tags`, `aliases`, `date`), callouts (`> [!type]`), et surtout des **wikilinks (`[[Note]]`)** pour connecter le Graph View.
  3. Relier les notes entre elles pour enrichir la mémoire contextuelle globale.

## 📦 Vente & Livraison de Micro-SaaS
- Lors de la préparation d'un code source pour cession ou vente :
  1. Exclure systématiquement les dossiers volumineux et régénérables (`node_modules/`, `.next/`, `out/`, `.venv/`, `__pycache__/`, `*.pyc`).
  2. Inclure un fichier `INSTRUCTIONS_INSTALLATION.txt` autonome détaillant les prérequis et commandes exactes de démarrage local.
  3. Déposer l'archive prête à l'envoi sur `~/Desktop/` pour un accès immédiat.

