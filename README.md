# GestUniv — Gestion des heures enseignants

## Prérequis

- **Node.js** v18+ (https://nodejs.org)
- **XAMPP** avec MySQL/MariaDB (https://www.apachefriends.org)

> **Note :** Les dépendances (node_modules) sont déjà incluses dans le dossier. Vous n'avez pas besoin de faire `npm install`.

## Installation en local (étape par étape)

### 1. Importer la base de données

1. Lancer **XAMPP** → démarrer **Apache** et **MySQL**
2. Ouvrir **phpMyAdmin** : http://localhost/phpmyadmin
3. Créer une nouvelle base de données nommée `gestion_heures`
4. Cliquer sur la base `gestion_heures` → **Importer** → choisir le fichier `gestuniv.sql` → **Exécuter**

### 2. Lancer le serveur backend

Ouvrir un terminal dans le dossier du projet :

```bash
cd gestion-heures/backend
node serverlocal.js
```

Le serveur démarre sur http://localhost:5000

> Si votre MySQL a un mot de passe, modifiez `DB_PASSWORD` dans le fichier `.env.local` du dossier `gestion-heures/backend`.

### 3. Lancer le frontend

Ouvrir un **autre terminal** :

```bash
cd frontend
npm start
```

Le frontend démarre sur http://localhost:3000

---

## Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@gestuniv.ci | Admin@123 |
| RH | rh@gestuniv.ci | Admin@123 |
| Enseignant | inza5@gmail.com | 1234567 |
| Enseignant | AYIKPAJEAN@gmail.com | 1234567 |

---

## Fonctionnalités principales

### Gestion des attributions

Le système d'attribution de matières suit un workflow de validation :

1. **Le RH/Admin crée une attribution** → statut : "En attente prof"
2. **Le professeur accepte ou refuse** depuis son espace ("Mon espace") → statut : "Acceptée par prof" ou "Refusée par prof" (avec motif optionnel)
3. **Le RH valide** l'attribution acceptée → statut : "Validée RH"

### Autres fonctionnalités

- Gestion des enseignants (CRUD)
- Gestion des matières par année académique
- Saisie et validation des heures effectuées
- Calcul automatique des heures équivalentes (coefficients CM/TD/TP)
- Calcul des heures complémentaires
- Tableau de bord avec statistiques
- Rapport de comptabilité détaillé
- Export PDF et Excel
- Gestion des utilisateurs et rôles
- Logs d'actions

---

## Structure du projet

```
GESTUNIV_CL/
├── frontend/                # Application React (interface utilisateur)
│   ├── src/
│   │   ├── components/      # Composants réutilisables (AppLayout, Navbar, PrivateRoute)
│   │   ├── context/         # Contexte d'authentification
│   │   ├── pages/           # Pages de l'application
│   │   └── services/        # Configuration API (axios)
│   └── public/
├── gestion-heures/
│   └── backend/             # API Node.js/Express
│       ├── config/          # Configuration base de données
│       ├── controllers/     # Logique métier
│       ├── middleware/       # Authentification JWT, logs
│       ├── routes/          # Routes API
│       ├── scripts/         # Scripts de migration
│       ├── server.js        # Serveur production (Railway)
│       └── serverlocal.js   # Serveur local (XAMPP)
├── gestuniv.sql             # Base de données complète (à importer dans phpMyAdmin)
└── README.md
```
