-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : lun. 04 mai 2026 à 02:47
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `gestion_heures`
--

-- --------------------------------------------------------

--
-- Structure de la table `annees_academiques`
--

CREATE TABLE `annees_academiques` (
  `id` int(10) UNSIGNED NOT NULL,
  `libelle` varchar(20) NOT NULL,
  `date_debut` date NOT NULL,
  `date_fin` date NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `annees_academiques`
--

INSERT INTO `annees_academiques` (`id`, `libelle`, `date_debut`, `date_fin`, `active`, `created_at`) VALUES
(1, '2024-2025', '2024-10-01', '2025-07-31', 0, '2026-05-03 19:04:46'),
(2, '2025-2026', '2025-10-01', '2026-07-31', 1, '2026-05-03 19:04:46');

-- --------------------------------------------------------

--
-- Structure de la table `attributions`
--

CREATE TABLE `attributions` (
  `id` int(10) UNSIGNED NOT NULL,
  `enseignant_id` int(10) UNSIGNED NOT NULL,
  `matiere_id` int(10) UNSIGNED NOT NULL,
  `annee_id` int(10) UNSIGNED NOT NULL,
  `semestre` enum('S1','S2','Annuel') NOT NULL DEFAULT 'Annuel',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `departements`
--

CREATE TABLE `departements` (
  `id` int(10) UNSIGNED NOT NULL,
  `nom` varchar(100) NOT NULL,
  `code` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `departements`
--

INSERT INTO `departements` (`id`, `nom`, `code`, `created_at`) VALUES
(1, 'Informatique', 'INFO', '2026-05-03 19:04:46'),
(2, 'Mathématiques', 'MATH', '2026-05-03 19:04:46'),
(3, 'Physique', 'PHY', '2026-05-03 19:04:46'),
(4, 'Gestion', 'GEST', '2026-05-03 19:04:46'),
(5, 'Lettres Modernes', 'LM', '2026-05-03 19:04:46');

-- --------------------------------------------------------

--
-- Structure de la table `enseignants`
--

CREATE TABLE `enseignants` (
  `id` int(10) UNSIGNED NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `matricule` varchar(50) NOT NULL,
  `grade` enum('Assistant','Maître-Assistant','Professeur','Autre') NOT NULL DEFAULT 'Assistant',
  `statut` enum('Permanent','Vacataire') NOT NULL DEFAULT 'Permanent',
  `departement_id` int(10) UNSIGNED NOT NULL,
  `taux_horaire_cm` decimal(10,2) NOT NULL DEFAULT 0.00,
  `taux_horaire_td` decimal(10,2) NOT NULL DEFAULT 0.00,
  `taux_horaire_tp` decimal(10,2) NOT NULL DEFAULT 0.00,
  `heures_contractuelles` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `actif` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `enseignants`
--

INSERT INTO `enseignants` (`id`, `nom`, `prenom`, `matricule`, `grade`, `statut`, `departement_id`, `taux_horaire_cm`, `taux_horaire_td`, `taux_horaire_tp`, `heures_contractuelles`, `actif`, `created_at`, `updated_at`) VALUES
(1, 'TOURE', 'INZA', '16024093Y', 'Professeur', 'Permanent', 1, 5000.00, 2500.00, 2500.00, 50, 1, '2026-05-04 00:29:02', '2026-05-04 00:29:02');

-- --------------------------------------------------------

--
-- Structure de la table `heures_effectuees`
--

CREATE TABLE `heures_effectuees` (
  `id` int(10) UNSIGNED NOT NULL,
  `attribution_id` int(10) UNSIGNED NOT NULL,
  `date_cours` date NOT NULL,
  `type_heure` enum('CM','TD','TP') NOT NULL,
  `duree` decimal(4,2) NOT NULL,
  `salle` varchar(50) DEFAULT NULL,
  `observations` text DEFAULT NULL,
  `statut_validation` enum('en_attente','validee','rejetee') NOT NULL DEFAULT 'en_attente',
  `valide_par` int(10) UNSIGNED DEFAULT NULL,
  `valide_le` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `logs_actions`
--

CREATE TABLE `logs_actions` (
  `id` int(10) UNSIGNED NOT NULL,
  `utilisateur_id` int(10) UNSIGNED DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_cible` varchar(100) DEFAULT NULL,
  `enregistrement_id` int(10) UNSIGNED DEFAULT NULL,
  `anciennes_valeurs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`anciennes_valeurs`)),
  `nouvelles_valeurs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`nouvelles_valeurs`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `logs_actions`
--

INSERT INTO `logs_actions` (`id`, `utilisateur_id`, `action`, `table_cible`, `enregistrement_id`, `anciennes_valeurs`, `nouvelles_valeurs`, `ip_address`, `created_at`) VALUES
(1, 3, 'LOGIN', 'utilisateurs', 3, 'null', 'null', '::1', '2026-05-04 00:26:34'),
(2, 3, 'CREATE', 'enseignants', 1, 'null', '{\"nom\":\"TOURE\",\"prenom\":\"INZA\",\"matricule\":\"16024093Y\",\"grade\":\"Professeur\",\"statut\":\"Permanent\",\"departement_id\":\"1\",\"taux_horaire_cm\":\"5000\",\"taux_horaire_td\":\"2500\",\"taux_horaire_tp\":\"2500\",\"heures_contractuelles\":\"50\"}', '::1', '2026-05-04 00:29:02');

-- --------------------------------------------------------

--
-- Structure de la table `matieres`
--

CREATE TABLE `matieres` (
  `id` int(10) UNSIGNED NOT NULL,
  `intitule` varchar(150) NOT NULL,
  `filiere` varchar(100) NOT NULL,
  `niveau` enum('L1','L2','L3','M1','M2') NOT NULL,
  `volume_cm_prevu` decimal(6,2) NOT NULL DEFAULT 0.00,
  `volume_td_prevu` decimal(6,2) NOT NULL DEFAULT 0.00,
  `volume_tp_prevu` decimal(6,2) NOT NULL DEFAULT 0.00,
  `departement_id` int(10) UNSIGNED NOT NULL,
  `annee_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `matieres`
--

INSERT INTO `matieres` (`id`, `intitule`, `filiere`, `niveau`, `volume_cm_prevu`, `volume_td_prevu`, `volume_tp_prevu`, `departement_id`, `annee_id`, `created_at`) VALUES
(1, 'INFORMATIQUE', 'RESEAU', 'L1', 50.00, 10.00, 5.00, 1, 2, '2026-05-04 00:29:40');

-- --------------------------------------------------------

--
-- Structure de la table `parametres_equivalence`
--

CREATE TABLE `parametres_equivalence` (
  `id` int(10) UNSIGNED NOT NULL,
  `annee_id` int(10) UNSIGNED NOT NULL,
  `coeff_cm` decimal(4,2) NOT NULL DEFAULT 1.50,
  `coeff_td` decimal(4,2) NOT NULL DEFAULT 1.00,
  `coeff_tp` decimal(4,2) NOT NULL DEFAULT 0.75,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `parametres_equivalence`
--

INSERT INTO `parametres_equivalence` (`id`, `annee_id`, `coeff_cm`, `coeff_td`, `coeff_tp`, `updated_at`) VALUES
(1, 1, 1.50, 1.00, 0.75, '2026-05-03 19:04:46'),
(2, 2, 1.50, 1.00, 0.75, '2026-05-03 19:04:46');

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `id` int(10) UNSIGNED NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `role` enum('admin','rh','enseignant') NOT NULL DEFAULT 'enseignant',
  `enseignant_id` int(10) UNSIGNED DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `enseignant_id`, `actif`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'Système', 'admin@etablissement.ci', '$HASH_A_GENERER', 'admin', NULL, 1, '2026-05-03 19:04:46', '2026-05-03 19:04:46'),
(2, 'RH', 'Service', 'rh@etablissement.ci', '$HASH_A_GENERER', 'rh', NULL, 1, '2026-05-03 19:04:46', '2026-05-03 19:04:46'),
(3, 'Admin', 'Système', 'admin@gestuniv.ci', '$2a$10$F6/E90/hXnRBCs8ZSTeEJOiqMFbg/plD3Z5Z2pV0HVBFFGCZPT.Jm', 'admin', NULL, 1, '2026-05-03 21:46:59', '2026-05-03 21:46:59'),
(4, 'Service', 'RH', 'rh@gestuniv.ci', '$2a$10$F6/E90/hXnRBCs8ZSTeEJOiqMFbg/plD3Z5Z2pV0HVBFFGCZPT.Jm', 'rh', NULL, 1, '2026-05-03 21:46:59', '2026-05-03 21:46:59');

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_heures_enseignant`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `vue_heures_enseignant` (
`enseignant_id` int(10) unsigned
,`enseignant` varchar(201)
,`grade` enum('Assistant','Maître-Assistant','Professeur','Autre')
,`statut` enum('Permanent','Vacataire')
,`departement` varchar(100)
,`annee` varchar(20)
,`annee_id` int(10) unsigned
,`total_cm` decimal(26,2)
,`total_td` decimal(26,2)
,`total_tp` decimal(26,2)
,`total_heures` decimal(26,2)
,`heures_equivalentes` decimal(30,4)
,`heures_contractuelles` int(10) unsigned
,`heures_complementaires` decimal(31,4)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_paiement_enseignant`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `vue_paiement_enseignant` (
`enseignant_id` int(10) unsigned
,`enseignant` varchar(201)
,`grade` enum('Assistant','Maître-Assistant','Professeur','Autre')
,`statut` enum('Permanent','Vacataire')
,`departement` varchar(100)
,`annee` varchar(20)
,`annee_id` int(10) unsigned
,`total_cm` decimal(26,2)
,`total_td` decimal(26,2)
,`total_tp` decimal(26,2)
,`total_heures` decimal(26,2)
,`heures_equivalentes` decimal(30,4)
,`heures_contractuelles` int(10) unsigned
,`heures_complementaires` decimal(31,4)
,`montant_heures_normales` decimal(44,7)
,`montant_heures_complementaires` decimal(45,7)
);

-- --------------------------------------------------------

--
-- Structure de la vue `vue_heures_enseignant`
--
DROP TABLE IF EXISTS `vue_heures_enseignant`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_heures_enseignant`  AS SELECT `e`.`id` AS `enseignant_id`, concat(`e`.`nom`,' ',`e`.`prenom`) AS `enseignant`, `e`.`grade` AS `grade`, `e`.`statut` AS `statut`, `d`.`nom` AS `departement`, `aa`.`libelle` AS `annee`, `aa`.`id` AS `annee_id`, sum(case when `h`.`type_heure` = 'CM' then `h`.`duree` else 0 end) AS `total_cm`, sum(case when `h`.`type_heure` = 'TD' then `h`.`duree` else 0 end) AS `total_td`, sum(case when `h`.`type_heure` = 'TP' then `h`.`duree` else 0 end) AS `total_tp`, sum(`h`.`duree`) AS `total_heures`, sum(case `h`.`type_heure` when 'CM' then `h`.`duree` * `pe`.`coeff_cm` when 'TD' then `h`.`duree` * `pe`.`coeff_td` when 'TP' then `h`.`duree` * `pe`.`coeff_tp` else `h`.`duree` end) AS `heures_equivalentes`, `e`.`heures_contractuelles` AS `heures_contractuelles`, greatest(0,sum(case `h`.`type_heure` when 'CM' then `h`.`duree` * `pe`.`coeff_cm` when 'TD' then `h`.`duree` * `pe`.`coeff_td` when 'TP' then `h`.`duree` * `pe`.`coeff_tp` else `h`.`duree` end) - `e`.`heures_contractuelles`) AS `heures_complementaires` FROM (((((`enseignants` `e` join `departements` `d` on(`d`.`id` = `e`.`departement_id`)) join `attributions` `a` on(`a`.`enseignant_id` = `e`.`id`)) join `annees_academiques` `aa` on(`aa`.`id` = `a`.`annee_id`)) join `heures_effectuees` `h` on(`h`.`attribution_id` = `a`.`id` and `h`.`statut_validation` = 'validee')) join `parametres_equivalence` `pe` on(`pe`.`annee_id` = `aa`.`id`)) GROUP BY `e`.`id`, `aa`.`id` ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_paiement_enseignant`
--
DROP TABLE IF EXISTS `vue_paiement_enseignant`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_paiement_enseignant`  AS SELECT `vhe`.`enseignant_id` AS `enseignant_id`, `vhe`.`enseignant` AS `enseignant`, `vhe`.`grade` AS `grade`, `vhe`.`statut` AS `statut`, `vhe`.`departement` AS `departement`, `vhe`.`annee` AS `annee`, `vhe`.`annee_id` AS `annee_id`, `vhe`.`total_cm` AS `total_cm`, `vhe`.`total_td` AS `total_td`, `vhe`.`total_tp` AS `total_tp`, `vhe`.`total_heures` AS `total_heures`, `vhe`.`heures_equivalentes` AS `heures_equivalentes`, `vhe`.`heures_contractuelles` AS `heures_contractuelles`, `vhe`.`heures_complementaires` AS `heures_complementaires`, least(`vhe`.`heures_equivalentes`,`vhe`.`heures_contractuelles`) * (`e`.`taux_horaire_cm` * 0.4 + `e`.`taux_horaire_td` * 0.4 + `e`.`taux_horaire_tp` * 0.2) AS `montant_heures_normales`, `vhe`.`heures_complementaires`* (`e`.`taux_horaire_cm` * 0.4 + `e`.`taux_horaire_td` * 0.4 + `e`.`taux_horaire_tp` * 0.2) AS `montant_heures_complementaires` FROM (`vue_heures_enseignant` `vhe` join `enseignants` `e` on(`e`.`id` = `vhe`.`enseignant_id`)) ;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `annees_academiques`
--
ALTER TABLE `annees_academiques`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `attributions`
--
ALTER TABLE `attributions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_attribution` (`enseignant_id`,`matiere_id`,`annee_id`),
  ADD KEY `fk_attr_mat` (`matiere_id`),
  ADD KEY `idx_attr_annee` (`annee_id`);

--
-- Index pour la table `departements`
--
ALTER TABLE `departements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Index pour la table `enseignants`
--
ALTER TABLE `enseignants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `matricule` (`matricule`),
  ADD KEY `idx_ens_dept` (`departement_id`);

--
-- Index pour la table `heures_effectuees`
--
ALTER TABLE `heures_effectuees`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_heure_attr` (`attribution_id`),
  ADD KEY `fk_heure_valid` (`valide_par`),
  ADD KEY `idx_heure_date` (`date_cours`),
  ADD KEY `idx_heure_type` (`type_heure`),
  ADD KEY `idx_heure_statut` (`statut_validation`);

--
-- Index pour la table `logs_actions`
--
ALTER TABLE `logs_actions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_log_user` (`utilisateur_id`),
  ADD KEY `idx_log_created` (`created_at`);

--
-- Index pour la table `matieres`
--
ALTER TABLE `matieres`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_mat_dept` (`departement_id`),
  ADD KEY `fk_mat_annee` (`annee_id`);

--
-- Index pour la table `parametres_equivalence`
--
ALTER TABLE `parametres_equivalence`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `annee_id` (`annee_id`);

--
-- Index pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_user_ens` (`enseignant_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `annees_academiques`
--
ALTER TABLE `annees_academiques`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `attributions`
--
ALTER TABLE `attributions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `departements`
--
ALTER TABLE `departements`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `enseignants`
--
ALTER TABLE `enseignants`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `heures_effectuees`
--
ALTER TABLE `heures_effectuees`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `logs_actions`
--
ALTER TABLE `logs_actions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `matieres`
--
ALTER TABLE `matieres`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `parametres_equivalence`
--
ALTER TABLE `parametres_equivalence`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `attributions`
--
ALTER TABLE `attributions`
  ADD CONSTRAINT `fk_attr_annee` FOREIGN KEY (`annee_id`) REFERENCES `annees_academiques` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_attr_ens` FOREIGN KEY (`enseignant_id`) REFERENCES `enseignants` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_attr_mat` FOREIGN KEY (`matiere_id`) REFERENCES `matieres` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `enseignants`
--
ALTER TABLE `enseignants`
  ADD CONSTRAINT `fk_ens_dept` FOREIGN KEY (`departement_id`) REFERENCES `departements` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `heures_effectuees`
--
ALTER TABLE `heures_effectuees`
  ADD CONSTRAINT `fk_heure_attr` FOREIGN KEY (`attribution_id`) REFERENCES `attributions` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_heure_valid` FOREIGN KEY (`valide_par`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `logs_actions`
--
ALTER TABLE `logs_actions`
  ADD CONSTRAINT `fk_log_user` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `matieres`
--
ALTER TABLE `matieres`
  ADD CONSTRAINT `fk_mat_annee` FOREIGN KEY (`annee_id`) REFERENCES `annees_academiques` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_mat_dept` FOREIGN KEY (`departement_id`) REFERENCES `departements` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `parametres_equivalence`
--
ALTER TABLE `parametres_equivalence`
  ADD CONSTRAINT `fk_param_annee` FOREIGN KEY (`annee_id`) REFERENCES `annees_academiques` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD CONSTRAINT `fk_user_ens` FOREIGN KEY (`enseignant_id`) REFERENCES `enseignants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
