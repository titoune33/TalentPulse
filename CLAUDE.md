# TalentPulse — Claude Code Project Context

> **Source unique de vérité : [`AGENTS.md`](./AGENTS.md).**
> Ce fichier ne duplique plus les détails (stack, commandes, archétypes, pièges) : ils
> divergeaient et envoyaient les agents dans le mur. Lis `AGENTS.md`, puis reviens ici
> seulement pour l'essentiel en une ligne.

## En une ligne

SaaS RH français de prédiction du turnover : `backend/` FastAPI + scikit-learn,
`frontend/` Next.js 14 en export statique, SQLite en local / PostgreSQL en production.

## Les trois commandes qui comptent

```bash
cd backend  && .venv/bin/python -m uvicorn main:app --reload   # API sur :8000
cd frontend && npm run dev                                     # UI sur :3000
cd backend  && .venv/bin/python -m pytest                      # 69 tests
```

## Avant de livrer

```bash
cd frontend && npx tsc --noEmit && npm run lint && npm run build && npm run test:e2e
```
