# TalentPulse

> **SaaS RH prédictif** — identifiez les risques de départ avant qu'ils ne se réalisent, et sachez quoi faire.

TalentPulse note chaque collaborateur de 0 à 100 % à partir de cinq signaux (performance,
engagement, satisfaction, ancienneté, rémunération) avec un classifieur **RandomForest**, puis
transforme ce score en plan d'action concret pour le manager.

Monorepo :

- `backend/` — FastAPI (Python 3.12) + SQLAlchemy + scikit-learn
- `frontend/` — Next.js 14 (App Router, export statique) + TypeScript + Tailwind + Chart.js

---

## État vérifié

| Contrôle | Commande | Résultat |
|---|---|---|
| Tests API | `cd backend && .venv/bin/python -m pytest` | **69 passed** |
| Types | `cd frontend && npx tsc --noEmit` | **0 erreur** |
| Lint | `cd frontend && npm run lint` | **0 erreur, 0 warning** |
| Build | `cd frontend && npm run build` | **12 pages exportées** |
| Parcours navigateur | `cd frontend && npm run test:e2e` | **26 passed** |

---

## Design

Registre **institutionnel clair** : papier chaud, encre presque noire, **un seul accent cobalt**,
typographie auto-hébergée. Le système complet est documenté dans
[`frontend/DESIGN.md`](./frontend/DESIGN.md) — c'est la référence à lire avant de toucher à l'UI.

- **Polices** : Inter (interface), Instrument Serif (accents éditoriaux), IBM Plex Mono (chiffres).
  Fichiers `.woff2` livrés dans `frontend/app/fonts/` — **aucun appel réseau au build ni au runtime**.
- **La page marketing montre le vrai produit** : les visuels sont des captures de l'application,
  pas des maquettes. Pour les régénérer :

  ```bash
  cd frontend
  npm run build
  node e2e/static-server.mjs &          # sert out/ sur :3000
  node scripts/capture-screenshots.mjs  # écrit public/product/*.png et public/og.png
  ```

- **Vidéo de démonstration** : `frontend/public/product/demo.mp4` (30 s, voix off française),
  produite avec HyperFrames. Sources reproductibles dans `videos/talentpulse-demo/`.

---

## Démarrage rapide

### 1. Backend

```bash
cd backend
uv venv --python 3.12 .venv
uv pip install -r requirements.txt
cp .env.example .env          # ajuster si besoin
.venv/bin/python -m uvicorn main:app --reload   # http://localhost:8000
```

- Swagger : `http://localhost:8000/api/docs`
- Santé : `http://localhost:8000/api/health`
- Au premier démarrage : création des tables, entraînement du modèle et **seed de démonstration**
  (14 collaborateurs, 182 prédictions sur 13 semaines).

> `uv` n'est pas obligatoire : `python3.12 -m venv .venv && .venv/bin/pip install -r requirements.txt`
> fonctionne à l'identique.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env          # NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
npm run dev                   # http://localhost:3000
```

### 3. Compte de démonstration

```
demo@talentpulse.app / demo1234     (rôle admin, données pré-chargées)
```

---

## Ce qui fonctionne réellement

| Domaine | Détail |
|---|---|
| 🔐 Authentification | Inscription self-serve (le compte créé est propriétaire du workspace), JWT HS256, bcrypt, changement de mot de passe, rôles `admin` / `hr_manager` / `employee` |
| 👥 Talents | CRUD complet, recherche plein texte, filtres par département, pagination |
| 🔮 Prédictions | Score RandomForest par collaborateur, historique, statistiques de cohorte, liste des risques élevés, réentraînement du modèle |
| 📊 Dashboard | KPI exécutifs, répartition des risques, top 5 des profils prioritaires, estimation financière |
| 📈 Analytics | Tendance du risque sur 13 semaines, risque par département, moyennes performance / engagement / satisfaction |
| 🧭 Plan de rétention | Diagnostic, guide d'entretien 1-to-1, simulateur de contre-mesure (revalorisation, objectif de satisfaction), export texte |
| 📄 Rapports | Rapport exécutif imprimable, export CSV de tout le registre, envoi à la direction via le client mail |
| 💳 Facturation | Stripe Checkout optionnel, webhook d'activation, mode démo sans clé Stripe, tarifs validés côté serveur |

### Le score de risque

- Modèle : `RandomForestClassifier` (scikit-learn), 5 features dans cet ordre —
  `performance_score`, `engagement_score`, `satisfaction_score`, `experience_years`,
  `salary / 100 000` (borné à 5).
- Les scores sont des probabilités **0–1** dans l'API ; l'interface les affiche en pourcentage et,
  pour la satisfaction et l'engagement, sur une échelle `/10`.
- Seuils partagés backend/frontend : **≥ 0,70 risque élevé**, **≥ 0,40 modéré**, sinon faible.
- Le modèle est entraîné au premier démarrage sur un jeu de données de référence, puis persisté
  dans `backend/data/ml/`. `POST /api/predictions/train` (admin) le réentraîne sur vos données :
  seuls les départs **confirmés** (`status = turnover`) servent d'exemples positifs.

### Facturation Stripe

Sans `STRIPE_SECRET_KEY`, l'application reste en **mode démo** : cliquer sur un plan débloque
localement le plan Pro, ce qui permet de présenter tout le produit.

En mode live :

1. Renseigner `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` et les `STRIPE_PRICE_ID_*`.
2. Déclarer le webhook `POST {BACKEND_URL}/api/billing/webhook`
   (événements : `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`, `customer.subscription.paused`).
3. Le plan n'est activé **que** par le webhook. Les prix envoyés par le client sont validés
   contre la liste blanche serveur, donc un client ne peut pas choisir un tarif arbitraire.

---

## Tests

### API — pytest

```bash
cd backend
.venv/bin/python -m pytest            # 69 tests
.venv/bin/python -m pytest -v         # détail
```

La suite tourne sur une base SQLite temporaire et un dossier de modèles jetable : elle ne touche
jamais `backend/talentpulse.db`. Elle couvre l'authentification et les rôles, le CRUD talents, le
moteur de prédiction, la cohérence des statistiques de cohorte, la facturation et les cas d'erreur.

### Parcours navigateur — Playwright

```bash
cd frontend
npm run build          # les tests servent out/ : le vrai artefact
npm run test:e2e       # 26 tests
```

Le serveur de test sert l'export statique et démarre le backend si nécessaire
(`E2E_BACKEND_CMD` permet de changer la commande). Les tests couvrent l'inscription, la connexion,
le dashboard, le CRUD talents, les prédictions, les analytics, les rapports et la facturation — et
échouent si la console du navigateur produit la moindre erreur.

---

## API

| Méthode | Route | Rôle requis |
|---|---|---|
| `POST` | `/api/auth/register` | — |
| `POST` | `/api/auth/token` | — |
| `GET/PUT` | `/api/auth/me` | authentifié |
| `POST` | `/api/auth/me/password` | authentifié |
| `GET` | `/api/auth/users` | admin |
| `POST` | `/api/auth/users` | admin |
| `PUT` | `/api/auth/users/{id}/role` · `/activate` | admin |
| `GET` | `/api/talents/` · `/search` · `/at-risk` · `/stats` · `/{id}` | admin, hr_manager |
| `POST/PUT/DELETE` | `/api/talents/` · `/{id}` | admin, hr_manager |
| `GET` | `/api/predictions/` · `/recent` · `/stats` · `/high-risk` · `/talents/{id}` · `/{id}` | admin, hr_manager |
| `POST` | `/api/predictions/talents/{id}` | admin, hr_manager |
| `POST` | `/api/predictions/train` | admin |
| `GET` | `/api/billing/plans` | — |
| `GET` | `/api/billing/plan` | authentifié |
| `POST` | `/api/billing/create-checkout-session` | authentifié |
| `POST` | `/api/billing/webhook` | signature Stripe |

---

## Déploiement

- `render.yaml` — blueprint Render (Postgres + backend + frontend statique)
- `netlify.toml`, `frontend/netlify.toml` — builds Netlify du frontend
- `backend/Dockerfile` — image `python:3.12-slim`
- `frontend/Dockerfile` — export statique servi par nginx

⚠️ `NEXT_PUBLIC_BACKEND_URL` est figé **au build** : changer d'API impose de reconstruire le
frontend. Pensez aussi à ajouter l'origine du frontend dans `CORS_ORIGIN` côté backend.

---

## Licence

MIT — voir [`LICENSE`](./LICENSE).
