# RAPPORT DE PROJET

## Application GestUniv
### Gestion des Heures des Enseignants du Supérieur

**Mai 2026**

---

## Table des matières

1. Contexte et Problématique
2. Objectifs du Projet
3. Méthodologie
4. Architecture Technique
5. Modélisation de la Base de Données
6. Réalisation Technique
7. Workflow de Validation des Attributions et Heures
8. Sécurité et Authentification
9. Déploiement
10. Résultats Obtenus
11. Difficultés Rencontrées et Solutions
12. Perspectives d'Évolution
13. Conclusion
14. Annexes

---

## 1. Contexte et Problématique

Les établissements d'enseignement supérieur font face à un défi majeur dans la gestion administrative des ressources humaines enseignantes. La gestion des heures effectuées par les enseignants est une tâche critique qui conditionne directement la rémunération du personnel et la conformité réglementaire des établissements.

Avant la mise en place de GestUniv, la plupart des établissements géraient ces processus via des feuilles de calcul Excel ou des registres manuels. Cette approche engendrait de nombreux problèmes :

- **Erreurs de calcul fréquentes** dans le décompte des heures et les équivalences
- **Manque de traçabilité** des modifications et validations
- **Retards dans les paiements** dus à des processus manuels
- **Difficulté de suivi global** sur plusieurs départements et filières
- **Absence d'historique fiable** sur plusieurs années académiques
- **Aucun contrôle des attributions** : les enseignants n'avaient pas de visibilité ni de droit de regard sur les matières qui leur étaient attribuées

La multiplication des intervenants (enseignants permanents, vacataires, différents départements et filières) complexifiait davantage la gestion, rendant les contrôles croisés laborieux et sources d'erreurs.

---

## 2. Objectifs du Projet

### 2.1 Objectif Principal

Développer une application web full-stack permettant d'automatiser et de sécuriser la gestion des heures des enseignants du supérieur, depuis l'attribution des matières jusqu'à la génération des états de paiement.

### 2.2 Objectifs Spécifiques

- Centraliser la gestion des enseignants, matières et heures effectuées dans une base de données relationnelle
- Automatiser le calcul des heures équivalentes et des heures complémentaires
- Implémenter un **workflow de validation à deux niveaux** : acceptation par l'enseignant puis validation par le RH
- Générer automatiquement les états de paiement en FCFA
- Assurer la traçabilité complète des actions via un journal d'audit
- Sécuriser les accès par rôle (administrateur, RH, enseignant)
- Maintenir un historique multi-années académiques
- Offrir un espace personnel à chaque enseignant pour consulter ses données et répondre aux attributions

---

## 3. Méthodologie

### 3.1 Approche de Développement

Le projet a été développé selon une approche itérative et incrémentale. Nous avons commencé par définir le schéma de base de données, puis développé l'API backend, et enfin construit l'interface utilisateur React par modules fonctionnels.

### 3.2 Phases du Projet

| Phase | Intitulé | Description |
|-------|----------|-------------|
| 1 | Analyse et conception | Lecture du cahier des charges, modélisation de la base de données (9 tables, 2 vues), définition de l'architecture |
| 2 | Développement Backend | Mise en place de l'API REST avec Node.js/Express, authentification JWT, middleware de logging |
| 3 | Développement Frontend | Création des interfaces React avec gestion des rôles, pages Dashboard, Enseignants, Heures, Paiement |
| 4 | Workflow d'attribution | Implémentation du système d'acceptation/refus des attributions par les enseignants et validation RH |
| 5 | Tests et corrections | Tests fonctionnels, correction des bugs, optimisation du chargement des données |
| 6 | Déploiement | Déploiement sur Render (backend + frontend), configuration de la base de données distante |
| 7 | Documentation | Rédaction de la documentation technique, du guide utilisateur et du rapport |

---

## 4. Architecture Technique

### 4.1 Architecture Globale

L'application suit une architecture **RESTful** avec séparation claire entre frontend et backend :

```
┌─────────────────────┐     HTTP/JSON      ┌──────────────────────┐     SQL      ┌───────────────┐
│   Frontend React    │ ◄───────────────► │  Backend Node.js     │ ◄──────────► │  MySQL/MariaDB │
│   (Render Static)   │                    │  Express (Render)    │              │  (Railway)     │
└─────────────────────┘                    └──────────────────────┘              └───────────────┘
```

### 4.2 Stack Technologique

| Couche | Technologie | Version | Rôle |
|--------|-------------|---------|------|
| Frontend | React.js | 18+ | Interface utilisateur SPA |
| CSS | Tailwind CSS | 3.x | Système de design utilitaire |
| Routing | React Router | 6.x | Navigation côté client |
| HTTP Client | Axios | 1.x | Appels API avec intercepteurs JWT |
| Backend | Node.js | 18+ | Environnement d'exécution serveur |
| Framework | Express.js | 4.x | Framework HTTP REST |
| Auth | JWT + bcrypt | — | Authentification et hachage |
| Base de données | MySQL / MariaDB | 8.x / 10.4 | Stockage relationnel |
| ORM/Driver | mysql2/promise | 3.x | Connexion async à MySQL |
| Export | jsPDF, SheetJS | — | Génération PDF et Excel |
| Hébergement | Render + Railway | — | Déploiement cloud |

### 4.3 Structure du Projet

```
GESTUNIV_CL/
├── frontend/                    # Application React
│   ├── public/                  # Fichiers statiques
│   │   ├── index.html           # Point d'entrée HTML
│   │   └── _redirects           # Configuration SPA Render
│   ├── src/
│   │   ├── components/          # Composants réutilisables
│   │   │   ├── AppLayout.js     # Layout principal (sidebar + header)
│   │   │   ├── PrivateRoute.js  # Protection des routes par rôle
│   │   │   └── Navbar.js        # Barre de navigation
│   │   ├── context/
│   │   │   └── AuthContext.js   # Contexte d'authentification React
│   │   ├── pages/               # Pages de l'application
│   │   │   ├── Login.js         # Page de connexion
│   │   │   ├── Dashboard.js     # Tableau de bord (admin/RH)
│   │   │   ├── Enseignants.js   # Gestion des enseignants
│   │   │   ├── Matieres.js      # Gestion des matières
│   │   │   ├── Attributions.js  # Attributions + validation RH
│   │   │   ├── Heures.js        # Saisie des heures
│   │   │   ├── Paiement.js      # États de paiement
│   │   │   ├── Comptabilite.js  # Module comptabilité
│   │   │   ├── MonEspace.js     # Espace enseignant personnel
│   │   │   ├── Utilisateurs.js  # Gestion des comptes (admin)
│   │   │   ├── Parametres.js    # Paramètres (coefficients)
│   │   │   └── LogsActions.js   # Journal d'audit
│   │   └── services/
│   │       └── api.js           # Configuration Axios + intercepteurs
│   └── tailwind.config.js       # Configuration Tailwind CSS
├── gestion-heures/
│   └── backend/                 # API Node.js/Express
│       ├── config/
│       │   └── db.js            # Pool de connexion MySQL
│       ├── controllers/         # Logique métier
│       │   ├── authController.js
│       │   ├── dashboardController.js
│       │   └── enseignantController.js
│       ├── middleware/
│       │   ├── auth.js          # Vérification JWT + autorisation rôles
│       │   └── logger.js        # Logging des actions en BDD
│       ├── routes/              # Définition des routes API
│       │   ├── auth.js
│       │   ├── attributions.js  # CRUD + acceptation/refus/validation
│       │   ├── enseignants.js
│       │   ├── heures.js
│       │   ├── matieres.js
│       │   ├── dashboard.js
│       │   ├── parametres.js
│       │   └── logs.js
│       ├── server.js            # Serveur production (Render)
│       ├── serverlocal.js       # Serveur local (XAMPP)
│       ├── .env                 # Variables production
│       └── .env.local           # Variables locales
├── gestuniv.sql                 # Base de données complète
└── README.md                    # Guide d'installation
```

---

## 5. Modélisation de la Base de Données

### 5.1 Schéma Relationnel

La base de données comprend **9 tables** et **2 vues** :

| Table | Description | Champs clés |
|-------|-------------|-------------|
| `annees_academiques` | Années académiques avec période active | libelle, date_debut, date_fin, active |
| `departements` | Départements de l'établissement | nom, code |
| `enseignants` | Données des enseignants | nom, prenom, matricule, grade, statut, taux horaires, heures contractuelles |
| `matieres` | Matières par année et département | intitule, filiere, niveau, volumes prévus (CM/TD/TP) |
| `attributions` | Lien enseignant-matière avec **statut de validation** | enseignant_id, matiere_id, semestre, **statut**, **motif_refus** |
| `heures_effectuees` | Heures réellement effectuées | attribution_id, date, type, durée, statut_validation |
| `utilisateurs` | Comptes utilisateur avec rôles | email, mot_de_passe (hashé), role (admin/rh/enseignant) |
| `parametres_equivalence` | Coefficients d'équivalence par année | coeff_cm, coeff_td, coeff_tp |
| `logs_actions` | Journal d'audit complet | utilisateur_id, action, table_cible, anciennes/nouvelles valeurs, IP |

### 5.2 Vues SQL

- **`vue_heures_enseignant`** : Calcule dynamiquement les totaux CM/TD/TP, heures équivalentes et complémentaires par enseignant et année
- **`vue_paiement_enseignant`** : Calcule les montants de paiement (heures normales et complémentaires) en utilisant les taux horaires individuels

### 5.3 Statuts des Attributions (nouveau)

La table `attributions` intègre un workflow de validation à 4 états :

| Statut | Description |
|--------|-------------|
| `en_attente_prof` | Attribution créée, en attente de la réponse de l'enseignant |
| `acceptee_prof` | L'enseignant a accepté l'attribution |
| `refusee_prof` | L'enseignant a refusé (avec motif optionnel) |
| `validee_rh` | Le RH a validé définitivement l'attribution |

---

## 6. Réalisation Technique

### 6.1 API REST — Routes Principales

| Méthode | Route | Rôle | Accès |
|---------|-------|------|-------|
| POST | `/api/auth/login` | Connexion | Public |
| GET | `/api/auth/profil` | Profil utilisateur | Authentifié |
| GET/POST/PUT/DELETE | `/api/enseignants` | CRUD enseignants | Admin, RH |
| GET/POST | `/api/matieres` | CRUD matières | Admin, RH |
| GET/POST | `/api/attributions` | CRUD attributions | Admin, RH |
| PATCH | `/api/attributions/:id/repondre` | Accepter/refuser attribution | Enseignant |
| PATCH | `/api/attributions/:id/valider-rh` | Validation RH | Admin, RH |
| GET/POST | `/api/heures` | Saisie des heures | Admin, RH |
| PATCH | `/api/heures/:id/valider` | Validation des heures | Admin, RH |
| GET | `/api/dashboard/stats` | Statistiques globales | Admin, RH |
| GET | `/api/dashboard/comptabilite` | Données comptabilité | Admin, RH |

### 6.2 Fonctionnalités Implémentées

1. **Authentification sécurisée** avec JWT et hachage bcrypt des mots de passe
2. **Gestion CRUD complète** des enseignants, matières et attributions
3. **Workflow d'attribution à deux niveaux** : acceptation par l'enseignant puis validation RH
4. **Saisie des heures** avec statut de validation (en attente, validée, rejetée)
5. **Calcul automatique** des équivalences horaires et heures complémentaires via vues SQL
6. **Tableau de bord** avec statistiques par département, type d'heure et année
7. **États de paiement** détaillés en FCFA avec distinction heures normales/complémentaires
8. **Espace personnel enseignant** : consultation des stats, acceptation/refus des attributions
9. **Journal d'audit** complet (logs_actions) avec IP et horodatage
10. **Gestion multi-années** académiques avec conservation de l'historique
11. **Export PDF et Excel** des récapitulatifs individuels
12. **Interface responsive** adaptée aux différents rôles utilisateurs
13. **Module comptabilité** avec rapport détaillé par enseignant

### 6.3 Points Techniques Remarquables

**Calcul des équivalences horaires** : La vue SQL `vue_heures_enseignant` calcule dynamiquement les heures équivalentes selon les coefficients paramétrables (CM×1.5, TD×1.0, TP×0.75 par défaut). Cette approche déporte le calcul côté base de données, garantissant cohérence et performance.

**Système d'acceptation/refus des attributions** : Quand le RH attribue une matière à un enseignant, celui-ci doit d'abord accepter ou refuser dans son espace personnel. En cas de refus, un motif peut être fourni. Le RH ne peut valider définitivement que les attributions acceptées par l'enseignant.

**Intercepteur API intelligent** : L'intercepteur Axios différencie les erreurs 401 (token expiré → déconnexion) des erreurs 403 (rôle insuffisant → redirection appropriée), évitant les déconnexions intempestives.

**Chargement optimisé** : Les pages démarrent en état de chargement (`loading: true`) pour éviter l'affichage temporaire de "Aucune donnée" avant que les données ne soient récupérées du serveur.

---

## 7. Workflow de Validation des Attributions et Heures

### 7.1 Flux Complet

```
1. Le RH/Admin crée une attribution (enseignant + matière)
   └──► Statut : "en_attente_prof"

2. L'enseignant voit l'attribution dans "Mon Espace"
   ├──► Accepte  ──► Statut : "acceptee_prof"
   └──► Refuse (+ motif optionnel) ──► Statut : "refusee_prof"

3. Le RH valide les attributions acceptées
   └──► Statut : "validee_rh"

4. Le RH saisit les heures effectuées sur les attributions validées
   └──► Statut heure : "en_attente"

5. Le RH valide les heures effectuées
   └──► Statut heure : "validee" ──► Comptabilisée dans les paiements
```

### 7.2 Règles Métier

- Un enseignant ne peut répondre qu'à ses propres attributions
- Une attribution déjà traitée ne peut plus être modifiée par l'enseignant
- Le RH ne peut valider que les attributions acceptées par l'enseignant
- Seules les heures avec statut "validee" sont comptabilisées dans les calculs de paiement

---

## 8. Sécurité et Authentification

### 8.1 Mécanismes de Sécurité

| Mécanisme | Implémentation |
|-----------|----------------|
| Authentification | JWT (JSON Web Token) avec expiration configurable |
| Mots de passe | Hachage bcrypt avec salt (10 rounds) |
| Autorisation | Middleware `autoriser()` vérifiant le rôle utilisateur |
| Validation | Vérification côté serveur de tous les inputs |
| Traçabilité | Logging de toutes les actions avec IP et horodatage |
| Protection XSS | React échappe automatiquement les sorties |
| CORS | Configuration Cross-Origin pour séparer frontend et backend |

### 8.2 Rôles et Permissions

| Fonctionnalité | Admin | RH | Enseignant |
|----------------|-------|----|------------|
| Dashboard | ✅ | ✅ | ❌ |
| Gestion enseignants | ✅ | ✅ | ❌ |
| Gestion matières | ✅ | ✅ | ❌ |
| Gestion attributions | ✅ | ✅ | ❌ |
| Accepter/refuser attribution | ❌ | ❌ | ✅ |
| Validation RH attributions | ✅ | ✅ | ❌ |
| Saisie heures | ✅ | ✅ | ❌ |
| Validation heures | ✅ | ✅ | ❌ |
| Paiement/Comptabilité | ✅ | ✅ | ❌ |
| Mon espace personnel | ❌ | ❌ | ✅ |
| Gestion utilisateurs | ✅ | ❌ | ❌ |
| Paramètres | ✅ | ❌ | ❌ |
| Logs d'audit | ✅ | ❌ | ❌ |

---

## 9. Déploiement

### 9.1 Architecture de Déploiement

| Composant | Service | URL |
|-----------|---------|-----|
| Frontend | Render Static Site | gestuniv.onrender.com |
| Backend API | Render Web Service | gestuniv-backend.onrender.com |
| Base de données | Railway MySQL | viaduct.proxy.rlwy.net |

### 9.2 Déploiement Local (pour tests)

Prérequis : Node.js 18+, XAMPP (MySQL/MariaDB)

1. Importer `gestuniv.sql` dans phpMyAdmin (base `gestion_heures`)
2. Lancer le backend : `node serverlocal.js` dans `gestion-heures/backend/`
3. Lancer le frontend : `npm start` dans `frontend/`

### 9.3 Comptes de Test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@gestuniv.ci | Admin@123 |
| RH | rh@gestuniv.ci | Admin@123 |
| Enseignant | inza5@gmail.com | 1234567 |
| Enseignant | AYIKPAJEAN@gmail.com | 1234567 |

---

## 10. Résultats Obtenus

### 10.1 Application Fonctionnelle

L'application GestUniv est pleinement fonctionnelle et répond à l'ensemble des exigences du cahier des charges. Elle permet aux trois types d'utilisateurs d'accomplir leurs tâches respectives de manière fluide et sécurisée.

### 10.2 Gains par Rapport à l'Existant

| Critère | Avant (Excel) | Après (GestUniv) |
|---------|---------------|-------------------|
| Calcul des heures comp. | Manuel, source d'erreurs | Automatique et instantané |
| Traçabilité | Inexistante | Journal complet horodaté |
| Validation des heures | Inexistante | Workflow RH intégré |
| Acceptation attributions | Aucune consultation | Enseignant accepte/refuse |
| Accès multi-utilisateurs | Fichier partagé risqué | Accès sécurisé par rôle |
| Historique | Fichiers dispersés | Base de données centralisée |
| États de paiement | Calculs manuels | Générés automatiquement |
| Export données | Copier-coller | PDF et Excel en un clic |

---

## 11. Difficultés Rencontrées et Solutions

| Difficulté | Solution |
|------------|----------|
| Configuration de l'environnement Windows avec PowerShell | Adaptation des commandes pour la compatibilité |
| Connexion MySQL avec XAMPP | Vérification du mot de passe vide par défaut et configuration du .env |
| Chargement des variables JWT | Correction du chemin dotenv et ajout de valeurs de fallback |
| Déconnexion intempestive au rechargement | Correction de l'intercepteur API (401 seulement, pas 403) |
| Flash de police au rechargement (FOUT) | Police système inline dans index.html avant le CSS |
| Affichage "Aucune donnée" avant chargement | Initialisation de l'état loading à true |
| "Not Found" au rechargement sur Render | Configuration SPA rewrite (`/* → /index.html`) |
| Encodage SQL pour phpMyAdmin | Export via script Node.js en UTF-8 au lieu de mysqldump |

---

## 12. Perspectives d'Évolution

- Notifications par email lors de l'attribution, la validation ou du rejet d'heures
- Module de planification avec calendrier visuel des cours
- Tableau de bord avec graphiques interactifs (Recharts)
- Application mobile React Native pour la saisie terrain
- Système de backup automatique de la base de données
- Signature électronique des fiches de validation
- Import en masse des enseignants et matières via CSV

---

## 13. Conclusion

Le projet GestUniv a abouti à une application web complète, fonctionnelle et sécurisée répondant intégralement aux exigences du cahier des charges. L'utilisation d'une stack JavaScript homogène (React + Node.js + MySQL) a permis un développement cohérent et maintenable.

Le système de validation à deux niveaux (enseignant puis RH) apporte une couche de contrôle supplémentaire qui n'existait pas dans les processus manuels. L'enseignant a désormais un droit de regard et de réponse sur les matières qui lui sont attribuées, ce qui améliore la transparence et la communication au sein de l'établissement.

La solution apporte une valeur ajoutée significative par rapport aux outils existants en automatisant les calculs complexes, en sécurisant les accès, et en garantissant la traçabilité complète des opérations. Elle constitue une base solide sur laquelle des fonctionnalités supplémentaires pourront être développées selon les besoins évolutifs de l'établissement.

---

## 14. Annexes

### Annexe A — Technologies et Dépendances

**Backend :** express, cors, mysql2, jsonwebtoken, bcryptjs, dotenv
**Frontend :** react, react-router-dom, axios, tailwindcss, jspdf, xlsx

### Annexe B — Coefficients d'Équivalence par Défaut

| Type | Coefficient |
|------|-------------|
| CM (Cours Magistral) | 1.50 |
| TD (Travaux Dirigés) | 1.00 |
| TP (Travaux Pratiques) | 0.75 |

### Annexe C — Formules de Calcul

- **Heures équivalentes** = Σ (durée × coefficient du type)
- **Heures complémentaires** = MAX(0, heures_equivalentes - heures_contractuelles)
- **Montant** = heures × taux_horaire_moyen_pondéré
