# TalentPulse 🚀

**SaaS RH intelligent : prédiction de turnover par machine learning, gestion des talents et analytics.**

TalentPulse aide les équipes RH à **anticiper les départs** de leurs collaborateurs grâce à un modèle de machine learning qui analyse la performance, l'engagement, la satisfaction, l'expérience et le salaire de chaque talent.

![Stack](https://img.shields.io/badge/Next.js%2014-TypeScript-blue) ![Stack](https://img.shields.io/badge/FastAPI-Python-purple) ![Stack](https://img.shields.io/badge/ML-RandomForest-green) ![Stack](https://img.shields.io/badge/DB-PostgreSQL-336791)

---

## ✨ Fonctionnalités

- 🔮 **Prédiction de turnover** : modèle RandomForest entraîné automatiquement (ou pré-entraîné), score de risque 0–100 % pour chaque collaborateur
- 📊 **Dashboard** : vue d'ensemble des risques, top talents à risque, répartition par niveau
- 👥 **Gestion des talents** : CRUD complet, recherche, filtres par département
- 📈 **Analytics** : tendance du risque sur 13 semaines, indicateurs d'équipe, risque par département
- 📄 **Rapports exécutifs** : génération et export d'un rapport de risque prêt à présenter
- 🔐 **Authentification JWT** : inscription, connexion, profil, changement de mot de passe
- 💳 **Billing** : page d'abonnement (3 plans)

## 🛠 Stack technique

| Couche | Technologie |
|---|---|
| **Frontend** | Next.js 14 (App Router) + TypeScript + Tailwind CSS + Chart.js |
| **Backend** | FastAPI (Python 3.12) + SQLAlchemy |
| **ML** | scikit-learn (RandomForestClassifier) |
| **Base de données** | PostgreSQL (prod) · SQLite (dev, zéro config) |
| **Auth** | JWT (python-jose) + bcrypt |
| **Déploiement** | Render (backend + frontend) ou Netlify (frontend) + Render/Railway (backend) |

## 📁 Structure du projet

```
TalentPulse/
├── backend/                  # API FastAPI
│   ├── main.py               # Point d'entrée (lifespan : création des tables + seed)
│   ├── database.py           # SQLAlchemy (Postgres/SQLite auto)
│   ├── models/               # Modèles SQLAlchemy (User, Talent, Prediction)
│   ├── schemas/              # Schémas Pydantic
│   ├── routes/               # auth.py, talents.py, predictions.py
│   ├── services/             # auth, talents, prediction (ML), seed (démo)
│   ├── data/ml/              # Modèle entraîné (généré au premier démarrage)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                 # Next.js (export statique)
│   ├── app/                  # Landing, auth/, app/ (dashboard, talents, …)
│   ├── components/           # UI (Sidebar, Topbar, Chart, TalentTable, Modal…)
│   ├── lib/                  # api.ts, auth.tsx, types, format
│   ├── hooks/                # useTalents, usePredictions
│   ├── netlify.toml
│   └── package.json
└── render.yaml               # Blueprint Render (déploiement one-click)
```

## 🚀 Démo

Un compte démo est créé automatiquement au premier démarrage du backend :

| Champ | Valeur |
|---|---|
| **Email** | `demo@talentpulse.app` |
| **Mot de passe** | `demo1234` |

La base est pré-remplie avec 14 talents réalistes et 13 semaines d'historique de prédictions (182 entrées), pour des graphiques et rapports immédiatement exploitables.

## 🏃‍♂️ Setup local

### Prérequis

- Node.js 18+ et npm
- Python 3.12+ (ou `uv`)
- PostgreSQL **optionnel** (SQLite est utilisé par défaut en local)

### 1. Backend

```bash
cd backend

# Option A — avec uv (recommandé)
uv venv --python 3.12 .venv
uv pip install -r requirements.txt
.venv/bin/uvicorn main:app --reload

# Option B — avec venv classique
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Le backend démarre sur **http://localhost:8000** :
- Docs Swagger : http://localhost:8000/api/docs
- Health check : http://localhost:8000/api/health

> Le modèle ML est entraîné automatiquement au premier démarrage et sauvegardé dans `backend/data/ml/`. La base est seedée avec les données de démo si elle est vide.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend démarre sur **http://localhost:3000** (utilisez `-- -p 3100` si le port est pris).

Configurez l'URL du backend si nécessaire dans `frontend/.env` :

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### 3. Production (build statique)

```bash
cd frontend
npm run build   # génère le dossier out/
```

## 🔌 API Endpoints

### Authentification
| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/token` | Connexion (form: username/password) → JWT |
| POST | `/api/auth/refresh` | Rafraîchir le token |
| GET | `/api/auth/me` | Profil du user connecté |
| PUT | `/api/auth/me` | Modifier le profil |
| POST | `/api/auth/change-password` | Changer le mot de passe |

### Talents (Bearer token requis)
| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/talents/` | Liste (filtres status/department, pagination) |
| POST | `/api/talents/` | Créer |
| GET | `/api/talents/search?q=` | Rechercher |
| GET | `/api/talents/at-risk?min_risk=` | Talents à risque |
| GET | `/api/talents/stats` | Statistiques |
| GET/PUT/DELETE | `/api/talents/{id}` | Détail / modification / suppression |

### Prédictions (Bearer token requis)
| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/api/predictions/talents/{id}` | Lancer une prédiction |
| GET | `/api/predictions/talents/{id}` | Historique d'un talent |
| GET | `/api/predictions/recent` | Prédictions récentes |
| GET | `/api/predictions/high-risk` | Prédictions à haut risque |
| GET | `/api/predictions/stats` | Statistiques |

## 🤖 Machine Learning

Le modèle est un **RandomForestClassifier** (`scikit-learn`) entraîné sur un jeu de données synthétique au premier démarrage, puis sauvegardé dans `backend/data/ml/`.

**Features utilisées :**
1. `performance_score` (0–1)
2. `engagement_score` (0–1)
3. `satisfaction_score` (0–1)
4. `experience_years` (années)
5. `salary` (normalisé sur 100 k€)

**Sortie :** score de risque 0–1, avec recommandation automatique (stable / risque faible / modéré / élevé) et niveau de confiance.

Pour ré-entraîner avec vos données : `prediction_service.train_model(X, y)`.

## ☁️ Déploiement

### Option 1 — Render (recommandé, tout-en-un)

Un **blueprint `render.yaml`** est fourni. Il crée automatiquement :
1. La base PostgreSQL `talentpulse-db`
2. L'API FastAPI `talentpulse-backend` (Docker)
3. Le frontend statique `talentpulse-frontend` (Next.js export)

**Procédure :**
1. Poussez ce repo sur GitHub
2. Sur [render.com](https://render.com) → **New → Blueprint**
3. Sélectionnez le repo, validez : Render lit `render.yaml` et provisionne tout
4. Une fois déployé, le frontend est disponible sur `https://talentpulse-frontend.onrender.com`

> ⚠️ **Plan gratuit** : les services s'endorment après ~15 min d'inactivité (premier chargement plus lent au réveil) et la base gratuite expire après 30 jours.

### Option 2 — Netlify (frontend) + Render (backend)

**Backend (Render) :**
1. Créez une Web Service depuis le repo, ou déployez via le blueprint puis supprimez le service frontend
2. Ajoutez les variables d'env : `DATABASE_URL` (PostgreSQL), `SECRET_KEY`, `CORS_ORIGIN`

**Frontend (Netlify) :**
1. Importez le repo sur [netlify.com](https://netlify.com)
2. Les réglages sont déjà dans `frontend/netlify.toml` :
   - Build : `npm install && npm run build`
   - Publish : `out`
3. Définissez `NEXT_PUBLIC_BACKEND_URL` vers votre backend Render

### Variables d'environnement

**Backend (`backend/.env`)**
```env
DATABASE_URL=postgresql://user:password@host:5432/talentpulse
SECRET_KEY=change-me-to-a-long-random-string
CORS_ORIGIN=http://localhost:3000,https://votre-frontend.netlify.app
PORT=8000
```

**Frontend (`frontend/.env`)**
```env
NEXT_PUBLIC_BACKEND_URL=https://votre-backend.onrender.com
```

## 🧪 Tests rapides

```bash
# Backend
curl http://localhost:8000/api/health

# Login démo
curl -X POST http://localhost:8000/api/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=demo@talentpulse.app&password=demo1234"
```

## 📄 Licence

MIT

---

**Made with ❤️ for HR professionals**

*TalentPulse — Transformez votre gestion des talents*
