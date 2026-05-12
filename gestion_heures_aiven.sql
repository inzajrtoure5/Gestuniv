SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `annees_academiques` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `libelle` varchar(20) NOT NULL,
  `date_debut` date NOT NULL,
  `date_fin` date NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `departements` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `code` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `enseignants` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `matricule` (`matricule`),
  KEY `idx_ens_dept` (`departement_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `role` enum('admin','rh','enseignant') NOT NULL DEFAULT 'enseignant',
  `enseignant_id` int(10) UNSIGNED DEFAULT NULL,
  `actif` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_user_ens` (`enseignant_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `matieres` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `intitule` varchar(150) NOT NULL,
  `filiere` varchar(100) NOT NULL,
  `niveau` enum('L1','L2','L3','M1','M2') NOT NULL,
  `volume_cm_prevu` decimal(6,2) NOT NULL DEFAULT 0.00,
  `volume_td_prevu` decimal(6,2) NOT NULL DEFAULT 0.00,
  `volume_tp_prevu` decimal(6,2) NOT NULL DEFAULT 0.00,
  `departement_id` int(10) UNSIGNED NOT NULL,
  `annee_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_mat_dept` (`departement_id`),
  KEY `fk_mat_annee` (`annee_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `attributions` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `enseignant_id` int(10) UNSIGNED NOT NULL,
  `matiere_id` int(10) UNSIGNED NOT NULL,
  `annee_id` int(10) UNSIGNED NOT NULL,
  `semestre` enum('S1','S2','Annuel') NOT NULL DEFAULT 'Annuel',
  `statut` enum('en_attente_prof','acceptee_prof','refusee_prof','validee_rh') NOT NULL DEFAULT 'en_attente_prof',
  `motif_refus` TEXT DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_attribution` (`enseignant_id`,`matiere_id`,`annee_id`),
  KEY `fk_attr_mat` (`matiere_id`),
  KEY `idx_attr_annee` (`annee_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `heures_effectuees` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_heure_attr` (`attribution_id`),
  KEY `fk_heure_valid` (`valide_par`),
  KEY `idx_heure_date` (`date_cours`),
  KEY `idx_heure_type` (`type_heure`),
  KEY `idx_heure_statut` (`statut_validation`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `parametres_equivalence` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `annee_id` int(10) UNSIGNED NOT NULL,
  `coeff_cm` decimal(4,2) NOT NULL DEFAULT 1.50,
  `coeff_td` decimal(4,2) NOT NULL DEFAULT 1.00,
  `coeff_tp` decimal(4,2) NOT NULL DEFAULT 0.75,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `annee_id` (`annee_id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `logs_actions` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `utilisateur_id` int(10) UNSIGNED DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_cible` varchar(100) DEFAULT NULL,
  `enregistrement_id` int(10) UNSIGNED DEFAULT NULL,
  `anciennes_valeurs` longtext DEFAULT NULL,
  `nouvelles_valeurs` longtext DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_log_user` (`utilisateur_id`),
  KEY `idx_log_created` (`created_at`)
) ENGINE=InnoDB;

-- Contraintes
ALTER TABLE `enseignants` ADD CONSTRAINT `fk_ens_dept` FOREIGN KEY (`departement_id`) REFERENCES `departements` (`id`) ON UPDATE CASCADE;
ALTER TABLE `utilisateurs` ADD CONSTRAINT `fk_user_ens` FOREIGN KEY (`enseignant_id`) REFERENCES `enseignants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `matieres` ADD CONSTRAINT `fk_mat_annee` FOREIGN KEY (`annee_id`) REFERENCES `annees_academiques` (`id`) ON UPDATE CASCADE;
ALTER TABLE `matieres` ADD CONSTRAINT `fk_mat_dept` FOREIGN KEY (`departement_id`) REFERENCES `departements` (`id`) ON UPDATE CASCADE;
ALTER TABLE `attributions` ADD CONSTRAINT `fk_attr_annee` FOREIGN KEY (`annee_id`) REFERENCES `annees_academiques` (`id`) ON UPDATE CASCADE;
ALTER TABLE `attributions` ADD CONSTRAINT `fk_attr_ens` FOREIGN KEY (`enseignant_id`) REFERENCES `enseignants` (`id`) ON UPDATE CASCADE;
ALTER TABLE `attributions` ADD CONSTRAINT `fk_attr_mat` FOREIGN KEY (`matiere_id`) REFERENCES `matieres` (`id`) ON UPDATE CASCADE;
ALTER TABLE `heures_effectuees` ADD CONSTRAINT `fk_heure_attr` FOREIGN KEY (`attribution_id`) REFERENCES `attributions` (`id`) ON UPDATE CASCADE;
ALTER TABLE `heures_effectuees` ADD CONSTRAINT `fk_heure_valid` FOREIGN KEY (`valide_par`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `logs_actions` ADD CONSTRAINT `fk_log_user` FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL;
ALTER TABLE `parametres_equivalence` ADD CONSTRAINT `fk_param_annee` FOREIGN KEY (`annee_id`) REFERENCES `annees_academiques` (`id`) ON UPDATE CASCADE;

-- Vues
CREATE OR REPLACE VIEW vue_heures_enseignant AS
SELECT e.id AS enseignant_id, CONCAT(e.nom,' ',e.prenom) AS enseignant, e.grade, e.statut,
  d.nom AS departement, aa.libelle AS annee, aa.id AS annee_id,
  SUM(CASE WHEN h.type_heure='CM' THEN h.duree ELSE 0 END) AS total_cm,
  SUM(CASE WHEN h.type_heure='TD' THEN h.duree ELSE 0 END) AS total_td,
  SUM(CASE WHEN h.type_heure='TP' THEN h.duree ELSE 0 END) AS total_tp,
  SUM(h.duree) AS total_heures,
  SUM(CASE h.type_heure WHEN 'CM' THEN h.duree*pe.coeff_cm WHEN 'TD' THEN h.duree*pe.coeff_td WHEN 'TP' THEN h.duree*pe.coeff_tp ELSE h.duree END) AS heures_equivalentes,
  e.heures_contractuelles,
  GREATEST(0, SUM(CASE h.type_heure WHEN 'CM' THEN h.duree*pe.coeff_cm WHEN 'TD' THEN h.duree*pe.coeff_td WHEN 'TP' THEN h.duree*pe.coeff_tp ELSE h.duree END) - e.heures_contractuelles) AS heures_complementaires
FROM enseignants e
JOIN departements d ON d.id=e.departement_id
JOIN attributions a ON a.enseignant_id=e.id
JOIN annees_academiques aa ON aa.id=a.annee_id
JOIN heures_effectuees h ON h.attribution_id=a.id AND h.statut_validation='validee'
JOIN parametres_equivalence pe ON pe.annee_id=aa.id
GROUP BY e.id, aa.id;

CREATE OR REPLACE VIEW vue_paiement_enseignant AS
SELECT vhe.*, 
  LEAST(vhe.heures_equivalentes, vhe.heures_contractuelles) * (e.taux_horaire_cm*0.4 + e.taux_horaire_td*0.4 + e.taux_horaire_tp*0.2) AS montant_heures_normales,
  vhe.heures_complementaires * (e.taux_horaire_cm*0.4 + e.taux_horaire_td*0.4 + e.taux_horaire_tp*0.2) AS montant_heures_complementaires
FROM vue_heures_enseignant vhe
JOIN enseignants e ON e.id=vhe.enseignant_id;

-- Données de base
INSERT INTO annees_academiques (id, libelle, date_debut, date_fin, active) VALUES
(1,'2024-2025','2024-10-01','2025-07-31',0),
(2,'2025-2026','2025-10-01','2026-07-31',1);

INSERT INTO departements (id, nom, code) VALUES
(1,'Informatique','INFO'),(2,'Mathématiques','MATH'),
(3,'Physique','PHY'),(4,'Gestion','GEST'),(5,'Lettres Modernes','LM');

INSERT INTO parametres_equivalence (id, annee_id, coeff_cm, coeff_td, coeff_tp) VALUES
(1,1,1.50,1.00,0.75),(2,2,1.50,1.00,0.75);

-- Compte admin (mot de passe: Admin@123)
INSERT INTO utilisateurs (id, nom, prenom, email, mot_de_passe, role) VALUES
(3,'Admin','Système','admin@gestuniv.ci','$2a$10$F6/E90/hXnRBCs8ZSTeEJOiqMFbg/plD3Z5Z2pV0HVBFFGCZPT.Jm','admin'),
(4,'Service','RH','rh@gestuniv.ci','$2a$10$F6/E90/hXnRBCs8ZSTeEJOiqMFbg/plD3Z5Z2pV0HVBFFGCZPT.Jm','rh');

SET FOREIGN_KEY_CHECKS = 1;