# AGENTS.md

## What this is

**TalentPulse** — a French-language HR SaaS that predicts employee turnover with a RandomForest model and exposes talent/analytics/prediction features.

Monorepo with two real applications:

- `backend/` — FastAPI (Python 3.12) + SQLAlchemy + scikit-learn
- `frontend/` — Next.js 14 (App Router) + TypeScript + Tailwind CSS + Chart.js

Git remote: `https://github.com/titoune33/TalentPulse.git`.

> **Read `frontend/DESIGN.md` before touching any UI.** It is the design system:
> institutional light register, warm paper neutrals, a single cobalt accent, self-hosted
> type scale. The marketing page and the app must keep looking like the same product.

## Structure du projet

Le projet est isolé dans ce dossier (`TalentPulse/`) qui constitue un dépôt Git autonome.
- `backend/` — l'API FastAPI
- `frontend/` — l'application Next.js
- `scripts/` — utilitaires ponctuels (migration Baserow)
- `INSTRUCTIONS_INSTALLATION.txt` — guide d'installation autonome (livrable de vente)
- Fichiers de configuration racine : `render.yaml`, `netlify.toml`, `.github/workflows/`, `README.md`

## Commands

### Backend (`cd backend`)

```bash
# setup + run (SQLite by default — zero config)
uv venv --python 3.12 .venv
uv pip install -r requirements.txt
.venv/bin/python -m uvicorn main:app --reload   # or: python main.py
```

> Use `python -m uvicorn`, not `.venv/bin/uvicorn`: the venv's console scripts carry an
> absolute shebang that breaks as soon as the folder moves.

- Serves on `http://localhost:8000` (override with `PORT`)
- Swagger docs: `http://localhost:8000/api/docs`
- Health: `http://localhost:8000/api/health`

```bash
.venv/bin/python -m pytest          # 69 tests, isolated temporary DB
```

### Frontend (`cd frontend`)

```bash
npm install
npm run dev       # http://localhost:3000 (use `-- -p 3100` if taken)
npm run build     # static export → frontend/out/
npm run lint      # next lint (eslint + eslint-config-next)
npx tsc --noEmit  # type check
npm run test:e2e  # Playwright, 26 browser tests (requires `npm run build` first)
```

## Architecture & data flow

```
frontend (Next.js, static export, client-only)
  hooks/useTalents.ts, usePredictions.ts
        │  axios  (lib/api.ts — attaches JWT, auto-redirects on 401)
        ▼
backend (FastAPI)  /api/auth  /api/talents  /api/predictions  /api/billing
  routes/*  →  services/*  →  models/* (SQLAlchemy)
        │
        ▼
  SQLite (local) or PostgreSQL (DATABASE_URL in prod)
```

- **Backend layering**: `routes/` (HTTP) → `services/` (business logic, module-level singletons
  like `talent_service`, `prediction_service`, `auth_service`) → `models/` (SQLAlchemy) and
  `schemas/` (Pydantic request/response). Controllers are thin; logic lives in services.
- **The service and route APIs are one contract.** Every service method a route calls must exist —
  a name typo used to 500 five endpoints at once. `tests/` now locks this down; run it after any
  rename.
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
- **Signup**: `POST /api/auth/register` takes only `{name, email, password}`, always creates the
  **workspace owner (`admin`)**, and returns a full `TokenResponse` so the frontend can drop the
  user straight on the dashboard. The role is never read from the request body — that would let
  anyone mint an admin. Creating an account with a *specific* role is
  `POST /api/auth/users` (admin only).
- **Authorization**: `require_role(...)` / `require_any_role([...])` from `services/auth_service.py`.
  Talent and prediction routes are `admin` + `hr_manager`; user administration is `admin` only.
  Admins bypass the role check.

## Prediction / ML flow

- Model is a `RandomForestClassifier` trained **automatically on first boot** on synthetic data
  (`prediction_service._synthetic_dataset`), then pickled to `backend/data/ml/` (`turnover_model.pkl`,
  `scaler.pkl`). `backend/data/` is gitignored.
- **Naming gotcha**: artifacts live under `data/ml/` deliberately to avoid colliding with the
  `backend/models/` Python package. Don't rename either directory.
- 5 features (order matters): `performance_score`, `engagement_score`, `satisfaction_score`,
  `experience_years`, `salary / 100_000` (clamped to 5.0).
- `POST /api/predictions/talents/{id}` calls `prediction_service.create_prediction(db, talent_id)`
  — that method takes a **talent id**, while the lower-level `predict_turnover(talent)` takes a
  **Talent object**. Don't mix them up. It inserts a `Prediction` row **and** syncs
  `talent.turnover_risk` + `talent.status` (`AT_RISK` when risk ≥ 0.7, else `ACTIVE`).
- Risk thresholds are shared backend/frontend: **≥ 0.7 high, ≥ 0.4 moderate, else low**.
- Scores are **0–1 everywhere in the API**. The UI formats them with `pct()` and, for satisfaction
  and engagement, converts to `/10` (`score * 10`). A raw 0–1 value shown as "/10" is a bug that
  already shipped once — see `RetentionCopilotDrawer`.
- `POST /api/predictions/train` (admin) retrains on real data: only `status = turnover` rows count
  as positives, `status = active` as negatives; with too few labelled rows it falls back to the
  synthetic reference set and says so in the response.
- If model inference fails, `predict_turnover` falls back to a heuristic `1 - avg(scores)`.
- **Read-side API**: `/predictions/recent` returns the raw recent history (every row) and is what
  the analytics trend chart consumes; `/predictions/stats` and `/predictions/high-risk` use
  `get_latest_per_talent` so a talent is never counted twice. Keeping those two semantics separate
  matters — merging them silently collapses the 13-week chart into a single point.

## Billing

- `GET /api/billing/plans` is public and returns the catalogue with the Stripe price ids.
- `POST /api/billing/create-checkout-session` validates the requested `price_id` against a
  **server-side allow-list** built from `STRIPE_PRICE_ID_*`. Never forward a client-supplied price
  to Stripe.
- `POST /api/billing/webhook` is the **only** place a paid plan becomes active; it refuses to run
  without `STRIPE_WEBHOOK_SECRET`.
- With no `STRIPE_SECRET_KEY`, the app runs in **demo mode**: subscribing sets
  `subscription_status = "pro"` locally and returns `{demo: true, url: null}`.

## Tests

- `backend/tests/` — pytest + `fastapi.testclient`. `conftest.py` points `DATABASE_URL` and
  `MODEL_DIR` at a temp directory **before importing the app**, so the suite never touches
  `talentpulse.db` or the trained artifacts. Fixtures: `client` (session-scoped, seeded),
  `admin_headers`, `hr_headers`, `employee_headers`, `new_talent`.
- The suite shares one database, so tests must create their own resources (use `unique_email()`)
  rather than asserting on global counts. `test_last_admin_cannot_be_demoted` normalises the admin
  population first — keep that pattern if you add signup tests.
- `frontend/e2e/` — Playwright against the **built** static export served by
  `e2e/static-server.mjs` (it maps `/dashboard` → `dashboard.html`, like a real host). The config
  can start the backend too. `trackPageErrors()` fails a test on any browser console error, which
  is how the unregistered-Chart.js-controller crash was caught.
- Test emails must use a real TLD (`.com`): `email-validator` rejects reserved suffixes such as
  `.test`, so those payloads fail validation before reaching the code under test.

## Gotchas

- **Chart.js controllers must stay registered** in `components/Chart.tsx`
  (`LineController`, `BarController`, `DoughnutController`). `ArcElement` alone is not enough:
  Chart.js tree-shakes controllers out, throws `"doughnut" is not a registered controller` at
  runtime, and React unmounts the whole page with a client-side exception.
- **Orphaned backend services (do NOT wire them in or "fix" their imports unless asked):**
  - `services/airtable.py` and `services/airtable_service.py` — two classes both named
    `AirtableService`; neither is imported by any route.
  - `services/baserow_service.py` — references Baserow via `httpx`; unused.
  - `services/cv_analysis.py` — imports `transformers`, which is **not** in `requirements.txt`
    (will crash on import). Unused.
  - `pyairtable` (used by `airtable.py`) is also **not** in `requirements.txt`.
  - Only the SQLAlchemy services are actually used. `services/__init__.py` confirms this.
- **Route ordering**: static routes (`/search`, `/at-risk`, `/stats` in `talents.py`; `/recent`,
  `/stats`, `/high-risk`, `/train` in `predictions.py`) are deliberately declared before the
  `/{id}` routes so FastAPI doesn't shadow them. Keep that ordering.
- **Email uniqueness is enforced twice**: unique column + an explicit 400 in the service.
- **`Talent` enum columns** use `Enum(... values_callable=...)` to store values as strings.
- **Timestamps**: use `timeutils.utcnow()` (naive UTC). `datetime.utcnow()` is deprecated in 3.12
  and the SQLite driver stores naive wall-clock values anyway.
- **Pydantic v2**: schemas use `model_config = ConfigDict(from_attributes=True)`, not `class Config`.
- Local SQLite DB file is `backend/talentpulse.db` (gitignored). Set `DATABASE_URL` to use Postgres.
- `bcrypt` is pinned to `4.0.1`: `bcrypt >= 4.1` removed `__about__`, which `passlib 1.7.4` probes
  and then dumps a full traceback into the logs on every hash.

## Conventions & style

- **UI and user-facing strings are French** (error messages, recommendations, labels, dates
  formatted via `Intl.DateTimeFormat("fr-FR")`). Backend error `detail` strings are French too —
  keep them consistent when adding endpoints.
- Frontend path alias: `@/*` → `frontend/*` (`tsconfig.json`).
- **Design system**: `frontend/DESIGN.md` is the source of truth. Reusable classes live in
  `app/globals.css` (`@layer components`): `container-page`, `section`, `eyebrow`, `hairline`,
  `btn-*`, `input`, `label`, `card`, `panel`, `badge-*`, `figure`, `frame`.
- **Tokens** (`tailwind.config.ts`): warm neutrals (`paper`, `surface`, `sunken`, `line`),
  `ink` / `ink-2` / `ink-3` / `ink-4` for text, a single `accent` cobalt scale (also aliased as
  `primary` for legacy markup), deep semantics (`danger`, `warn`, `ok`) and `graphite-*` for the
  dark bands. **Never reintroduce the default Tailwind palettes** (`slate-*`, `indigo-*`, `rose-*`,
  `emerald-*`, `amber-*`, `blue-*`, `violet-*`): they are what made the product look generic.
- **Typography is self-hosted** in `app/fonts/` and wired through `app/fonts.ts`: Inter (`font-sans`),
  Instrument Serif (`font-display`, editorial accents only), IBM Plex Mono (`font-mono`, figures and
  micro labels). Do not switch to `next/font/google` — that would make the build depend on network.
- **Screenshots of the real product** power the landing page. Regenerate them with:
  ```bash
  cd frontend && npm run build
  node e2e/static-server.mjs &            # serves out/ on :3000
  node scripts/capture-screenshots.mjs    # writes public/product/*.png + public/og.png
  ```
  Marketing pages must show these captures, never an invented mockup.
- Components live flat in `frontend/components/`. Shared formatting helpers in
  `frontend/lib/format.ts` (`pct`, `eur`, `dateFR`, `riskLabel`, …) — use them rather than inlining.
- Backend services are plain classes exposing a module-level singleton
  (`prediction_service = PredictionService()`); routes import the singleton, not the class.
- **Every feature advertised on the landing page must exist.** The page used to promise CSV import,
  email alerts and PDF Comex reports that were never built. If you add a claim, add the feature or
  drop the claim.

## Environment variables

- `backend/.env` (see `backend/.env.example`): `DATABASE_URL`, `SECRET_KEY`,
  `ACCESS_TOKEN_EXPIRE_MINUTES` (default 1440), `CORS_ORIGIN` (comma-separated — the frontend
  origin MUST be listed), `PORT`, `DEMO_EMAIL`/`DEMO_PASSWORD`, `STRIPE_*`, `FRONTEND_URL`.
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
