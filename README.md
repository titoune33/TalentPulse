# TalentPulse 🚀

**SaaS pour les DRH** : Prédiction de turnover, réseau collaboratif, et automatisation RH.

## 📌 Description

TalentPulse est une plateforme tout-en-un pour les **Directeurs des Ressources Humaines (DRH)**.

- **Prédiction de turnover** : Utilise le machine learning pour identifier les employés à risque
- **Réseau collaboratif** : Facilite la communication et le partage d'informations entre équipes RH
- **Automatisation RH** : Automatise les tâches répétitives (onboarding, évaluations, etc.)

## 🛠 Stack Technique

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + Prisma ORM
- **Backend**: FastAPI (Python) + SQLAlchemy + scikit-learn
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: NextAuth.js + JWT
- **IA**: scikit-learn + RandomForest pour la prédiction de turnover
- **Déploiement**: Netlify (Frontend) + Railway (Backend)

## 🚀 Déploiement

- **Frontend**: [https://talentpulse.netlify.app](https://talentpulse.netlify.app)
- **Backend**: [https://talentpulse-backend.up.railway.app](https://talentpulse-backend.up.railway.app)

## 📁 Structure du Projet

```
TalentPulse/
├── frontend/
│   ├── app/
│   │   └── (pages)/
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── components/
│   │   └── Button.tsx
│   ├── lib/
│   │   └── utils.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── .gitignore
└── backend/
    ├── models/
    │   ├── __init__.py
    │   ├── user.py
    │   ├── talent.py
    │   └── prediction.py
    ├── schemas/
    │   ├── __init__.py
    │   ├── user.py
    │   ├── talent.py
    │   └── prediction.py
    ├── services/
    │   ├── __init__.py
    │   ├── auth_service.py
    │   ├── talent_service.py
    │   └── prediction_service.py
    ├── routes/
    │   ├── __init__.py
    │   ├── auth.py
    │   ├── talents.py
    │   └── predictions.py
    ├── main.py
    ├── database.py
    ├── requirements.txt
    └── .env.example
```

## 🏃‍♂️ Setup Local

### Prérequis

- Node.js 18+ (pour le frontend)
- Python 3.10+ (pour le backend)
- PostgreSQL (ou Supabase)
- Git

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend sera disponible sur `http://localhost:3000`

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

pip install -r requirements.txt
uvicorn main:app --reload
```

Le backend sera disponible sur `http://localhost:8000`

### Base de données

1. Créez une base PostgreSQL (local ou sur Supabase)
2. Copiez la `DATABASE_URL` dans le fichier `.env`
3. Exécutez les migrations Alembic (à venir)

## 🔧 Configuration

### Variables d'environnement

#### Frontend (`frontend/.env`)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/talentpulse?schema=public
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key
STRIPE_SECRET_KEY=sk_test_your-secret-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

#### Backend (`backend/.env`)

```env
PORT=8000
DATABASE_URL=postgresql://postgres:password@localhost:5432/talentpulse
SECRET_KEY=your-super-secret-key-here-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGIN=http://localhost:3000
```

## 🎯 API Endpoints

### Authentification

- `POST /api/auth/register` - Inscription
- `POST /api/auth/token` - Connexion (JWT)
- `POST /api/auth/refresh` - Rafraîchir le token

### Talents

- `GET /api/talents/` - Lister tous les talents
- `GET /api/talents/{id}` - Obtenir un talent
- `POST /api/talents/` - Créer un talent
- `PUT /api/talents/{id}` - Mettre à jour un talent
- `DELETE /api/talents/{id}` - Supprimer un talent
- `GET /api/talents/search?q=query` - Rechercher des talents
- `GET /api/talents/at-risk` - Talents à risque
- `GET /api/talents/stats` - Statistiques

### Prédictions

- `POST /api/predictions/talents/{id}` - Prédire le turnover
- `GET /api/predictions/talents/{id}` - Historique des prédictions
- `GET /api/predictions/recent` - Prédictions récentes
- `GET /api/predictions/high-risk` - Prédictions à haut risque
- `GET /api/predictions/stats` - Statistiques des prédictions

## 🤖 Machine Learning

Le modèle de prédiction de turnover utilise :
- **Algorithme**: RandomForestClassifier
- **Features**: 
  - `performance_score`
  - `engagement_score`
  - `satisfaction_score`
  - `experience_years`
  - `salary` (normalisé)
- **Target**: Probabilité de turnover

Le modèle est sauvegardé dans `backend/models/turnover_model.pkl`

## 📊 Fonctionnalités

- ✅ Authentification JWT
- ✅ Gestion des talents (CRUD)
- ✅ Recherche et filtrage
- ✅ Prédiction de turnover avec ML
- ✅ Statistiques et analytics
- ✅ Intégration Stripe (paiements)
- ✅ Intégration NextAuth (OAuth)
- ✅ API REST complète
- ✅ Documentation Swagger (FastAPI)

## 🚀 Déploiement

### Frontend (Netlify)

```bash
npm run build
netlify deploy --prod
```

### Backend (Railway)

```bash
railway init
railway add
railway deploy
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche (`git checkout -b feature/ma-fonctionnalité`)
3. Committez vos changements (`git commit -m "Ajout de ma fonctionnalité"`)
4. Poussez sur la branche (`git push origin feature/ma-fonctionnalité`)
5. Ouvrez une Pull Request

## 📄 Licence

MIT

---

**Made with ❤️ for HR professionals**

*TalentPulse - Transformez votre gestion des talents*
