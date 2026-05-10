-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : dim. 10 mai 2026 à 02:21
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
-- Base de données : `gestuniv`
--

-- --------------------------------------------------------

--
-- Structure de la table `academicyear`
--

CREATE TABLE `academicyear` (
  `id` varchar(191) NOT NULL,
  `label` varchar(191) NOT NULL,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `academicyear`
--

INSERT INTO `academicyear` (`id`, `label`, `startDate`, `endDate`, `isActive`, `createdAt`, `updatedAt`) VALUES
('cmoq1p7f70001x1kbyxflydqd', '2025-2026', '2025-09-01 00:00:00.000', '2026-07-31 00:00:00.000', 1, '2026-05-03 17:29:22.387', '2026-05-03 17:29:22.387');

-- --------------------------------------------------------

--
-- Structure de la table `auditlog`
--

CREATE TABLE `auditlog` (
  `id` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `userId` varchar(191) DEFAULT NULL,
  `action` varchar(191) NOT NULL,
  `entity` varchar(191) NOT NULL,
  `entityId` varchar(191) DEFAULT NULL,
  `before` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`before`)),
  `after` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`after`)),
  `ip` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `coursesession`
--

CREATE TABLE `coursesession` (
  `id` varchar(191) NOT NULL,
  `date` datetime(3) NOT NULL,
  `type` enum('CM','TD','TP','ADMINISTRATIVE') NOT NULL,
  `durationHours` decimal(10,2) NOT NULL,
  `room` varchar(191) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `academicYearId` varchar(191) NOT NULL,
  `teacherId` varchar(191) NOT NULL,
  `subjectId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `coursesession`
--

INSERT INTO `coursesession` (`id`, `date`, `type`, `durationHours`, `room`, `notes`, `createdAt`, `updatedAt`, `academicYearId`, `teacherId`, `subjectId`) VALUES
('cmoq1tobh000fx1kb778qd704', '2025-10-10 00:00:00.000', 'CM', 2.00, 'A1', 'Intro', '2026-05-03 17:32:50.909', '2026-05-03 17:32:50.909', 'cmoq1p7f70001x1kbyxflydqd', 'cmoq1rrr90005x1kbyq0feymx', 'cmoq1tjui000cx1kbjuzut0u9'),
('cmoq1tobx000hx1kb8s7xrwfd', '2025-10-12 00:00:00.000', 'TD', 3.00, 'B2', 'Exercices', '2026-05-03 17:32:50.926', '2026-05-03 17:32:50.926', 'cmoq1p7f70001x1kbyxflydqd', 'cmoq1rrry0007x1kbrhx418a9', 'cmoq1tjuy000dx1kb93p7wwlf');

-- --------------------------------------------------------

--
-- Structure de la table `department`
--

CREATE TABLE `department` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `department`
--

INSERT INTO `department` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
('cmoq1pdou0002x1kbbw665xoq', 'Informatique', '2026-05-03 17:29:30.511', '2026-05-03 17:29:30.511'),
('cmoq1pdpa0003x1kb6gs8pfdv', 'Math�matiques', '2026-05-03 17:29:30.526', '2026-05-03 17:29:30.526');

-- --------------------------------------------------------

--
-- Structure de la table `equivalencerule`
--

CREATE TABLE `equivalencerule` (
  `id` varchar(191) NOT NULL,
  `academicYearId` varchar(191) NOT NULL,
  `fromType` enum('CM','TD','TP','ADMINISTRATIVE') NOT NULL,
  `toType` enum('CM','TD','TP','ADMINISTRATIVE') NOT NULL,
  `factor` decimal(10,4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `hourrate`
--

CREATE TABLE `hourrate` (
  `id` varchar(191) NOT NULL,
  `academicYearId` varchar(191) NOT NULL,
  `hourType` enum('CM','TD','TP','ADMINISTRATIVE') NOT NULL,
  `rate` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `subject`
--

CREATE TABLE `subject` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `field` varchar(191) NOT NULL,
  `level` varchar(191) NOT NULL,
  `plannedHours` decimal(10,2) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `subject`
--

INSERT INTO `subject` (`id`, `title`, `field`, `level`, `plannedHours`, `createdAt`, `updatedAt`) VALUES
('cmoq1tjui000cx1kbjuzut0u9', 'Algorithmique', 'Informatique', 'L1', 60.00, '2026-05-03 17:32:45.114', '2026-05-03 17:32:45.114'),
('cmoq1tjuy000dx1kb93p7wwlf', 'Analyse 1', 'Math�matiques', 'L1', 45.00, '2026-05-03 17:32:45.131', '2026-05-03 17:32:45.131');

-- --------------------------------------------------------

--
-- Structure de la table `teacher`
--

CREATE TABLE `teacher` (
  `id` varchar(191) NOT NULL,
  `firstName` varchar(191) NOT NULL,
  `lastName` varchar(191) NOT NULL,
  `grade` enum('ASSISTANT','MAITRE_ASSISTANT','PROFESSEUR','AUTRES') NOT NULL,
  `status` enum('PERMANENT','VACATAIRE') NOT NULL,
  `hourlyRate` decimal(10,2) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `departmentId` varchar(191) NOT NULL,
  `userId` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `teacher`
--

INSERT INTO `teacher` (`id`, `firstName`, `lastName`, `grade`, `status`, `hourlyRate`, `createdAt`, `updatedAt`, `departmentId`, `userId`) VALUES
('cmoq1rrr90005x1kbyq0feymx', 'Amine', 'Bensaid', 'MAITRE_ASSISTANT', 'PERMANENT', 5000.00, '2026-05-03 17:31:22.050', '2026-05-03 18:09:12.507', 'cmoq1pdou0002x1kbbw665xoq', NULL),
('cmoq1rrry0007x1kbrhx418a9', 'Sara', 'Kaci', 'PROFESSEUR', 'VACATAIRE', 5000.00, '2026-05-03 17:31:22.079', '2026-05-03 18:09:12.551', 'cmoq1pdpa0003x1kb6gs8pfdv', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `teacherworkload`
--

CREATE TABLE `teacherworkload` (
  `id` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `academicYearId` varchar(191) NOT NULL,
  `teacherId` varchar(191) NOT NULL,
  `contractualHours` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `teacherworkload`
--

INSERT INTO `teacherworkload` (`id`, `createdAt`, `updatedAt`, `academicYearId`, `teacherId`, `contractualHours`) VALUES
('cmoq1rwut0009x1kbj7efxbou', '2026-05-03 17:31:28.662', '2026-05-03 17:31:28.662', 'cmoq1p7f70001x1kbyxflydqd', 'cmoq1rrr90005x1kbyq0feymx', 192.00),
('cmoq1rwve000bx1kbre8y9s1z', '2026-05-03 17:31:28.682', '2026-05-03 17:31:28.682', 'cmoq1p7f70001x1kbyxflydqd', 'cmoq1rrry0007x1kbrhx418a9', 96.00);

-- --------------------------------------------------------

--
-- Structure de la table `user`
--

CREATE TABLE `user` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `passwordHash` varchar(191) NOT NULL,
  `role` enum('ADMIN','RH','ENSEIGNANT') NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`id`, `email`, `passwordHash`, `role`, `createdAt`, `updatedAt`) VALUES
('cmopsvarb0000s1mvdd5ba0qr', 'admin@local.com', '$2a$10$VgNzKtu3xzyL36Sq8L0sVuyI4w5Sa7ECcOvEQYR8TyLoCTDVA1cRu', 'ADMIN', '2026-05-03 13:22:10.103', '2026-05-03 13:22:10.103');

-- --------------------------------------------------------

--
-- Structure de la table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('78b7f06d-e9db-4719-b0c9-d6a9633e34dc', 'c2d25c1ad74a8c3ca6cd0916d93c8740b054b2c467b6dd1ea8084129469ed46c', '2026-05-03 13:33:45.894', '20260503133345_workload', NULL, NULL, '2026-05-03 13:33:45.762', 1),
('b8269d7a-29f3-4897-a362-9d307f472e2b', '2d8155617f1f4ef1f5f6c6b0d37773b1f400772d8932ed0082be1203e81c820b', '2026-05-03 12:45:15.954', '20260503124459_init', NULL, NULL, '2026-05-03 12:45:01.818', 1);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `academicyear`
--
ALTER TABLE `academicyear`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `AcademicYear_label_key` (`label`);

--
-- Index pour la table `auditlog`
--
ALTER TABLE `auditlog`
  ADD PRIMARY KEY (`id`),
  ADD KEY `AuditLog_userId_fkey` (`userId`);

--
-- Index pour la table `coursesession`
--
ALTER TABLE `coursesession`
  ADD PRIMARY KEY (`id`),
  ADD KEY `CourseSession_teacherId_date_idx` (`teacherId`,`date`),
  ADD KEY `CourseSession_subjectId_date_idx` (`subjectId`,`date`),
  ADD KEY `CourseSession_academicYearId_fkey` (`academicYearId`);

--
-- Index pour la table `department`
--
ALTER TABLE `department`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Department_name_key` (`name`);

--
-- Index pour la table `equivalencerule`
--
ALTER TABLE `equivalencerule`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `EquivalenceRule_academicYearId_fromType_toType_key` (`academicYearId`,`fromType`,`toType`);

--
-- Index pour la table `hourrate`
--
ALTER TABLE `hourrate`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `HourRate_academicYearId_hourType_key` (`academicYearId`,`hourType`);

--
-- Index pour la table `subject`
--
ALTER TABLE `subject`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Subject_field_idx` (`field`),
  ADD KEY `Subject_level_idx` (`level`);

--
-- Index pour la table `teacher`
--
ALTER TABLE `teacher`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Teacher_userId_key` (`userId`),
  ADD KEY `Teacher_departmentId_fkey` (`departmentId`);

--
-- Index pour la table `teacherworkload`
--
ALTER TABLE `teacherworkload`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `TeacherWorkload_academicYearId_teacherId_key` (`academicYearId`,`teacherId`),
  ADD KEY `TeacherWorkload_teacherId_fkey` (`teacherId`);

--
-- Index pour la table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`);

--
-- Index pour la table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `auditlog`
--
ALTER TABLE `auditlog`
  ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `coursesession`
--
ALTER TABLE `coursesession`
  ADD CONSTRAINT `CourseSession_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academicyear` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `CourseSession_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subject` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `CourseSession_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `teacher` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `equivalencerule`
--
ALTER TABLE `equivalencerule`
  ADD CONSTRAINT `EquivalenceRule_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academicyear` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `hourrate`
--
ALTER TABLE `hourrate`
  ADD CONSTRAINT `HourRate_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academicyear` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `teacher`
--
ALTER TABLE `teacher`
  ADD CONSTRAINT `Teacher_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `department` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Teacher_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `teacherworkload`
--
ALTER TABLE `teacherworkload`
  ADD CONSTRAINT `TeacherWorkload_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academicyear` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `TeacherWorkload_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `teacher` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
