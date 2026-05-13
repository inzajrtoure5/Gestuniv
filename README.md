# GestUniv — Gestion des heures enseignants

## Accès en Ligne (site déployé)

**URL : https://gestuniv-frontend.onrender.com**

Les comptes de test sont dans le fichier `idtest` à la racine du projet.

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@gestuniv.ci | Admin@123 |
| RH | rh@gestuniv.ci | Admin@123 |
| Enseignant | inza5@gmail.com | 1234567 |
| Enseignant | AYIKPAJEAN@gmail.com | 1234567 |

---

## Installation en Local

### Prérequis

- **Node.js** v18+ (https://nodejs.org)
- **XAMPP** avec MySQL/MariaDB (https://www.apachefriends.org)

> **Note :** Les dépendances (node_modules) sont déjà incluses. Pas besoin de `npm install`.

### 1. Importer la base de données

1. Lancer **XAMPP** → démarrer **Apache** et **MySQL**
2. Ouvrir **phpMyAdmin** : http://localhost/phpmyadmin
3. Créer une base de données nommée `gestion_heures`
4. Cliquer sur la base `gestion_heures` → **Importer** → choisir `gestuniv.sql` → **Exécuter**

### 2. Lancer le serveur backend

```bash
cd gestion-heures/backend
node serverlocal.js
```

Le serveur démarre sur http://localhost:5000

> Si votre MySQL a un mot de passe, modifiez `DB_PASSWORD` dans `.env.local`

### 3. Lancer le frontend

```bash
cd frontend
npm start
```

Le frontend démarre sur http://localhost:3000

Se connecter avec les comptes listés ci-dessus ou dans le fichier `idtest`.

---

## Fonctionnalités principales

- Gestion des enseignants, matières et attributions
- **Workflow d'attribution** : le RH attribue → l'enseignant accepte/refuse → le RH valide
- Saisie et validation des heures effectuées (CM, TD, TP)
- Calcul automatique des heures équivalentes et complémentaires
- États de paiement en FCFA
- Tableau de bord avec statistiques
- Rapport comptabilité détaillé
- Export PDF et Excel
- Journal d'audit complet
- Gestion des utilisateurs et rôles (admin, rh, enseignant)

---

## Documentation

- `idtest` — Comptes de test (email + mot de passe pour chaque rôle)
- `README.md` — Ce fichier (installation + accès)
- `rapport_projet_gestuniv.md` — Rapport de projet complet
- Documents Word : rapport, documentation technique, guide utilisateur
