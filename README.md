# TalentPulse 🚀

**SaaS pour les DRH** : Prédiction de turnover, réseau collaboratif, et automatisation RH.

## 📌 Description

TalentPulse est une plateforme tout-en-un pour les **Directeurs des Ressources Humaines (DRH)**.

- **Prédiction de turnover** : Utilise le machine learning (RandomForest) pour identifier les employés à risque
- **Réseau collaboratif** : Facilite la communication et le partage d'informations entre équipes RH
- **Automatisation RH** : Automatise les tâches répétitives (onboarding, évaluations, etc.)
- **Intégration Baserow** : Remplace Airtable pour une gestion des données plus flexible

## 🛠 Stack Technique

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + Prisma ORM
- **Backend**: FastAPI (Python) + SQLAlchemy + scikit-learn
- **Base de données**: Supabase (PostgreSQL) ou Baserow
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
│   │   ├── (pages)/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── employees/
│   │   │   │   └── page.tsx
│   │   │   ├── predictions/
│   │   │   │   └── page.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   └── Button.tsx
│   ├── prisma/
│   │   └── schema.prisma
│   ├── netlify.toml
│   ├── next.config.js
│   ├── package.json
│   └── tsconfig.json
└── backend/
    ├── models/
    │   ├── __init__.py
    │   ├── user.py
    │   ├── talent.py
    │   └── prediction.py
    ├── routes/
    │   ├── __init__.py
    │   ├── auth.py
    │   ├── talents.py
    │   └── predictions.py
    ├── schemas/
    │   ├── __init__.py
    │   ├── user.py
    │   ├── talent.py
    │   └── prediction.py
    ├── services/
    │   ├── __init__.py
    │   ├── auth_service.py
    │   ├── talent_service.py
    │   ├── prediction_service.py
    │   ├── baserow_service.py
    │   └── airtable.py (déprécié)
    ├── database.py
    ├── main.py
    ├── requirements.txt
    └── .env.example
```

## 🎯 Fonctionnalités

- ✅ Authentification JWT
- ✅ Gestion des talents (CRUD)
- ✅ Recherche et filtrage
- ✅ Prédiction de turnover avec ML (RandomForest)
- ✅ Statistiques et analytics
- ✅ Intégration Baserow (remplace Airtable)
- ✅ API REST complète
- ✅ Documentation Swagger (FastAPI)

## 📦 Déploiement sur Netlify

### Prérequis
1. Un compte Netlify
2. Un compte Railway pour le backend
3. Une base de données Supabase ou Baserow

### Étapes

#### Frontend (Netlify)
1. Poussez votre code sur GitHub
2. Connectez votre repo GitHub à Netlify
3. Netlify détectera automatiquement le fichier `netlify.toml`
4. Déployez !

**Configuration requise** :
- `NEXT_PUBLIC_BACKEND_URL`: URL de votre backend (ex: `https://talentpulse-backend.up.railway.app`)

#### Backend (Railway)
1. Créez un nouveau projet Railway
2. Ajoutez un service Python
3. Configurez les variables d'environnement (voir `.env.example`)
4. Déployez

**Variables d'environnement requises** :
```env
PORT=8000
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-super-secret-key-here-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGIN=https://talentpulse.netlify.app
BASEROW_API_KEY=your-baserow-api-key
BASEROW_DATABASE_ID=your-database-id
```

## 🔧 Configuration Locale

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
2. Exécutez les migrations SQLAlchemy (à venir)

## 📡 API Endpoints

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

## 🔄 Migration de Airtable à Baserow

Le projet utilise désormais **Baserow** au lieu d'Airtable. Pour migrer :

1. Créez un compte Baserow et une base de données
2. Créez les tables nécessaires (Users, Employees, etc.)
3. Configurez les variables d'environnement dans `.env` :
   ```env
   BASEROW_BASE_URL=https://api.baserow.io
   BASEROW_API_KEY=your-api-key
   BASEROW_DATABASE_ID=your-database-id
   BASEROW_USERS_TABLE_ID=your-users-table-id
   BASEROW_EMPLOYEES_TABLE_ID=your-employees-table-id
   ```
4. Utilisez le service `baserow_service.py` pour interagir avec Baserow

## 📊 Intégration avec Zapier

Vous pouvez connecter TalentPulse à Zapier pour automatiser des workflows :
- Envoyer un email quand un talent est à risque
- Créer une tâche dans Trello/Asana
- Notifier Slack/Teams

Exemple de workflow :
1. Déclencheur : Nouvelle prédiction à haut risque
2. Action : Envoyer un email via Gmail

## 🤝 Contribution

1. Fork le projet
2. Créez une branche (`git checkout -b feature/ma-fonctionnalité`)
3. Committez vos changements (`git commit -m "Ajout de ma fonctionnalité"`)
4. Poussez sur la branche (`git push origin feature/ma-fonctionnalité`)
5. Ouvrez une Pull Request

## 📜 Licence

MIT

---

**Made with ❤️ for HR professionals**

*TalentPulse - Transformez votre gestion des talents*
