# GestUniv — Gestion des heures universitaires

Application web de gestion des heures d’enseignement (saisie, validation, statistiques, rapports comptables, exports) avec gestion des rôles.

## Stack

- **Frontend**: React, React Router, TailwindCSS, Recharts, Axios, jsPDF, xlsx
- **Backend**: Node.js, Express, JWT
- **Base de données**: MySQL (mysql2)

## Structure du dépôt

- `frontend/` — application React
- `gestion-heures/backend/` — API Express

## Rôles

- **admin**: gestion utilisateurs, paramètres, logs, supervision
- **rh**: enseignants, matières, attributions, heures, rapports
- **enseignant**: accès à `Mon espace` (heures + exports)

## Prérequis

- Node.js (LTS recommandé)
- MySQL / MariaDB

## Configuration backend

Créer un fichier `.env` dans `gestion-heures/backend/`.

Variables attendues:

- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`
- `JWT_EXPIRE` (ex: `7d`)

## Démarrage en local

### 1) Backend

Dans `gestion-heures/backend`:

```bash
npm install
npm run dev
```

L’API démarre par défaut sur `http://localhost:5000`.

### 2) Frontend

Dans `frontend`:

```bash
npm install
npm start
```

Le frontend démarre sur `http://localhost:3000`.

> Note: le frontend appelle l’API via `frontend/src/services/api.js` (baseURL actuellement configurée sur `http://localhost:5000/api`).

## Import de la base (données)

Un dump SQL est fourni dans le dépôt (ex: `gestuniv.sql`).

Importer dans MySQL:

```bash
mysql -u root -p gestuniv < gestuniv.sql
```

Sous Windows PowerShell (si la redirection `<` pose problème):

```powershell
Get-Content .\gestuniv.sql | mysql -u root -p gestuniv
```

## Fonctionnalités clés

- Saisie & validation des heures (statuts: `en_attente`, `validee`, `rejetee`)
- Calcul des **heures équivalentes** via coefficients CM/TD/TP
- Calcul des heures normales vs complémentaires (dépassement contrat)
- Dashboard (KPI + graphiques)
- Rapports: Paiement, Comptabilité, Rapport comptabilité (drill-down)
- Exports **Excel** (`xlsx`) et **PDF** (`jsPDF`) avec en-tête/pied de page
- Logs d’actions (admin)

## Déploiement (recommandation)

- **Backend**: Render (Web Service)
  - Root Directory: `gestion-heures/backend`
  - Build: `npm install`
  - Start: `npm start`
  - Variables d’environnement: mêmes variables que `.env`
- **Frontend**: Netlify (Static)
  - Base directory: `frontend`
  - Build: `npm run build`
  - Publish: `build`
  - Variable: `REACT_APP_API_URL=https://<ton-backend>/api` (si tu adaptes `api.js` pour utiliser cette variable)

## Licence

Projet académique / démonstration.
