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

Architecture retenue : **frontend sur Vercel**, **API + base PostgreSQL sur Render**.

### Frontend — Vercel (en ligne, auto-déployé)

| | |
|---|---|
| **URL de production** | https://talentpulse-inky.vercel.app |
| **Projet** | `talentpulse` (équipe `titouwajds-projects`) |
| **Déploiement** | automatique à chaque `git push` sur `main` |

Le dépôt est un monorepo : la racine ne contient pas de `package.json`. Le `vercel.json`
de la racine décrit donc explicitement le build (`cd frontend && npm run build`,
sortie `frontend/out`) et active `cleanUrls`, indispensable pour que `/auth/login`
serve `auth/login.html` au lieu d'une 404.

Variable d'environnement requise (Production) :

```
NEXT_PUBLIC_BACKEND_URL = https://talentpulse-backend.onrender.com
```

> ⚠️ Cette valeur est **figée au build**. Changer d'API impose de redéployer le frontend.

### Backend — Render (blueprint, un clic)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/titoune33/TalentPulse)

Le lien ouvre le blueprint `render.yaml`, qui crée :

- `talentpulse-db` — PostgreSQL managé
- `talentpulse-backend` — l'API FastAPI (`rootDir: backend`)

Tout est pré-rempli, y compris `CORS_ORIGIN` et `FRONTEND_URL` avec l'URL Vercel.
Il n'y a **rien à saisir**.

> [!warning] Pièges déjà résolus dans le blueprint, ne pas les réintroduire
> - **`gunicorn` doit utiliser `uvicorn.workers.UvicornWorker`.** FastAPI est une application
>   ASGI ; le worker `sync` par défaut lève
>   `TypeError: FastAPI.__call__() missing 1 required positional argument: 'send'` et
>   **tous les endpoints répondent 500**. C'est vérifiable en local :
>   `python -m gunicorn main:app --bind 127.0.0.1:8101` → 500, avec `--worker-class
>   uvicorn.workers.UvicornWorker` → 200.
> - **Un seul worker** : le modèle ML s'entraîne et s'écrit sur disque au démarrage ;
>   deux workers se marcheraient dessus au premier boot.
> - **`PYTHON_VERSION=3.12`** est épinglé : le code utilise la syntaxe `X | None` (PEP 604).

Plan gratuit Render : l'API s'endort après 15 min d'inactivité (premier appel ~30 s) et la
base gratuite **expire au bout de 30 jours**. Pour une démonstration client, passez la base
en `starter`.

### Autres cibles

- `netlify.toml`, `frontend/netlify.toml` — builds Netlify du frontend
- `backend/Dockerfile` — image `python:3.12-slim` (utilisable sur Railway, Fly.io, un VPS…)
- `frontend/Dockerfile` — export statique servi par nginx
- `backend/vercel.json` — API en fonction serverless Vercel (nécessite une base externe)

---

## Licence

MIT — voir [`LICENSE`](./LICENSE).
