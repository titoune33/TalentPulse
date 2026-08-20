# TalentPulse 🚀

> **SaaS RH intelligent** — Anticipez les départs de talents grâce à l'IA.

TalentPulse aide les équipes RH à **prédire le turnover** avant qu'il ne se produise. En analysant performance, engagement, satisfaction et salaire, notre modèle ML score chaque collaborateur de 0 à 100 %.

[![Demo](https://img.shields.io/badge/D%C3%A9mo-Live-6366f1)](https://talentpulse.app)
[![Render](https://img.shields.io/badge/Deploy-Rendere8d04c)](https://render.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 🎯 Problème

Les RH perdent en moyenne **6 mois** à identifier les talents à risque. Les outils existants sont des dashboards passifs — ils montrent ce qui s'est déjà passé, pas ce qui va arriver.

## ✨ Solution

TalentPulse transforme des données RH brutes en **alertes actionnables** :

| Fonctionnalité | Description |
|---|---|
| 🔮 **Prédiction de turnover** | Score de risque 0–100 % par collaborateur, mis à jour automatiquement |
| 📊 **Dashboard exécutif** | Vue d'ensemble des risques, top talents à risque, tendances |
| 👥 **Gestion des talents** | CRUD complet, recherche, filtres par département |
| 📈 **Analytics temps réel** | Tendance du risque sur 13 semaines, risque par département |
| 📄 **Rapports exportables** | Rapport PDF prêt à présenter en comité de direction |
| 🔐 **Auth JWT** | Inscription, connexion, gestion de profil |
| 💳 **Abonnement Stripe** | 3 plans (Free / Pro / Enterprise) |

## 🛠 Stack

| Couche | Tech |
|---|---|
| Frontend | Next.js 14 · TypeScript · Tailwind CSS · Chart.js |
| Backend | FastAPI · Python 3.12 · SQLAlchemy |
| ML | scikit-learn (RandomForest) |
| DB | PostgreSQL (Render) · SQLite (local) |
| Auth | JWT (HS256) · bcrypt |
| Billing | Stripe |
| Déploiement | Render (blueprint one-click) |

## 🚀 Démarrage rapide

```bash
# 1. Cloner
git clone https://github.com/titoune33/TalentPulse.git
cd TalentPulse

# 2. Backend
cd backend
uv venv --python 3.12 .venv
uv pip install -r requirements.txt
cp .env.example .env   # ajuster si besoin
.venv/bin/uvicorn main:app --reload

# 3. Frontend
cd ../frontend
npm install
cp .env.example .env
npm run dev

# 4. Ouvrir http://localhost:3000
#    Login démo: demo@talentpulse.app / demo1234
```

## 📸 Aperçu

*(screenshot à ajouter — dashboard avec graphiques de risque, tableau des talents, page prédiction)*

## 📄 API

- **Swagger** : `http://localhost:8000/api/docs`
- **ReDoc** : `http://localhost:8000/api/redoc`
- **Health** : `GET /api/health`

## 🌐 Déploiement

Voir [`render.yaml`](./render.yaml) pour le blueprint Render (Postgres + backend + frontend statique en un clic).

## 🤝 Contribuer

1. Fork + branch (`feat/mon-truc`)
2. Commit selon [Conventional Commits](https://www.conventionalcommits.org/)
3. PR avec description du changement

## 📜 Licence

MIT — voir [LICENSE](./LICENSE)

---

**Fait avec ❤️ pour les équipes RH qui veulent agir avant qu'il ne soit trop tard.**
