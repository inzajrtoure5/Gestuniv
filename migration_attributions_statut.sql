-- Migration : Ajout du statut d'acceptation professeur sur les attributions
-- À exécuter UNE SEULE FOIS dans la base de données gestion_heures

ALTER TABLE `attributions`
  ADD COLUMN `statut` ENUM('en_attente_prof','acceptee_prof','refusee_prof','validee_rh')
    NOT NULL DEFAULT 'en_attente_prof'
    COMMENT 'Statut de l attribution du point de vue du prof et du RH',
  ADD COLUMN `motif_refus` TEXT DEFAULT NULL
    COMMENT 'Motif de refus si le prof refuse l attribution';

-- Mettre toutes les attributions existantes comme "acceptées" par défaut
-- (puisqu'elles existaient avant ce système)
UPDATE `attributions` SET `statut` = 'validee_rh' WHERE 1=1;
