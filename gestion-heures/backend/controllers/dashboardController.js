const pool = require('../config/db');

exports.getStats = async (req, res) => {
  const { annee_id } = req.query;
  try {
    const [totalEns]   = await pool.execute('SELECT COUNT(*) AS total FROM enseignants WHERE actif=1');
    const [totalHeure] = await pool.execute(`
      SELECT SUM(h.duree) AS total FROM heures_effectuees h
      JOIN attributions a ON a.id = h.attribution_id
      WHERE a.annee_id = ? AND h.statut_validation = 'validee'`, [annee_id]);
    const [parDept] = await pool.execute(`
      SELECT d.nom, SUM(h.duree) AS total_heures
      FROM heures_effectuees h
      JOIN attributions a ON a.id = h.attribution_id
      JOIN enseignants e ON e.id = a.enseignant_id
      JOIN departements d ON d.id = e.departement_id
      WHERE a.annee_id = ? AND h.statut_validation = 'validee'
      GROUP BY d.id ORDER BY total_heures DESC`, [annee_id]);
    const [enDepassement] = await pool.execute(
      'SELECT * FROM vue_heures_enseignant WHERE annee_id = ? AND heures_complementaires > 0', [annee_id]);
    const [enAttente] = await pool.execute(`
      SELECT COUNT(*) AS total FROM heures_effectuees h
      JOIN attributions a ON a.id = h.attribution_id
      WHERE a.annee_id = ? AND h.statut_validation = 'en_attente'`, [annee_id]);
    res.json({
      total_enseignants:       totalEns[0].total,
      total_heures:            totalHeure[0].total || 0,
      heures_par_dept:         parDept,
      enseignants_depassement: enDepassement,
      heures_en_attente:       enAttente[0].total,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message, code: err.code, sqlMessage: err.sqlMessage });
  }
};

exports.getEtatPaiement = async (req, res) => {
  const { annee_id } = req.query;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM vue_paiement_enseignant WHERE annee_id = ?', [annee_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
};

exports.getStatsMensuelles = async (req, res) => {
  const { annee_id } = req.query;
  if (!annee_id) return res.status(400).json({ message: 'annee_id requis.' });
  try {
    const [rows] = await pool.execute(
      `SELECT DATE_FORMAT(h.date_cours, '%Y-%m') AS mois, SUM(h.duree) AS total_heures
       FROM heures_effectuees h
       JOIN attributions a ON a.id = h.attribution_id
       WHERE a.annee_id = ? AND h.statut_validation = 'validee'
       GROUP BY DATE_FORMAT(h.date_cours, '%Y-%m')
       ORDER BY mois`,
      [annee_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
};

exports.getRepartitionFiliere = async (req, res) => {
  const { annee_id } = req.query;
  if (!annee_id) return res.status(400).json({ message: 'annee_id requis.' });
  try {
    const [rows] = await pool.execute(
      `SELECT m.filiere, SUM(h.duree) AS total_heures
       FROM heures_effectuees h
       JOIN attributions a ON a.id = h.attribution_id
       JOIN matieres m ON m.id = a.matiere_id
       WHERE a.annee_id = ? AND h.statut_validation = 'validee'
       GROUP BY m.filiere
       ORDER BY total_heures DESC`,
      [annee_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
};

exports.getRepartitionTypeHeures = async (req, res) => {
  const { annee_id } = req.query;
  if (!annee_id) return res.status(400).json({ message: 'annee_id requis.' });
  try {
    const [rows] = await pool.execute(
      `SELECT h.type_heure, SUM(h.duree) AS total_heures
       FROM heures_effectuees h
       JOIN attributions a ON a.id = h.attribution_id
       WHERE a.annee_id = ? AND h.statut_validation = 'validee'
       GROUP BY h.type_heure
       ORDER BY FIELD(h.type_heure, 'CM','TD','TP')`,
      [annee_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
};

exports.getTopEnseignants = async (req, res) => {
  const { annee_id, metric } = req.query;
  if (!annee_id) return res.status(400).json({ message: 'annee_id requis.' });

  const allowedMetrics = new Set(['heures_equivalentes', 'heures_complementaires', 'total_heures']);
  const safeMetric = allowedMetrics.has(metric) ? metric : 'heures_equivalentes';

  try {
    const [rows] = await pool.execute(
      `SELECT enseignant_id, enseignant, departement, total_heures, heures_equivalentes, heures_complementaires
       FROM vue_heures_enseignant
       WHERE annee_id = ?
       ORDER BY ${safeMetric} DESC
       LIMIT 10`,
      [annee_id]
    );
    res.json({ metric: safeMetric, top: rows });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
};

exports.getStatutsMensuels = async (req, res) => {
  const { annee_id } = req.query;
  if (!annee_id) return res.status(400).json({ message: 'annee_id requis.' });
  try {
    const [rows] = await pool.execute(
      `SELECT
         DATE_FORMAT(h.date_cours, '%Y-%m') AS mois,
         SUM(CASE WHEN h.statut_validation = 'validee' THEN 1 ELSE 0 END) AS validees,
         SUM(CASE WHEN h.statut_validation = 'en_attente' THEN 1 ELSE 0 END) AS en_attente,
         SUM(CASE WHEN h.statut_validation = 'rejetee' THEN 1 ELSE 0 END) AS rejetees
       FROM heures_effectuees h
       JOIN attributions a ON a.id = h.attribution_id
       WHERE a.annee_id = ?
       GROUP BY DATE_FORMAT(h.date_cours, '%Y-%m')
       ORDER BY mois`,
      [annee_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
};

exports.getRapportComptabilite = async (req, res) => {
  const { annee_id, departement_id, filiere, niveau } = req.query;
  if (!annee_id) return res.status(400).json({ message: 'annee_id requis.' });

  try {
    const where = ['a.annee_id = ?', "h.statut_validation = 'validee'"];
    const params = [annee_id];

    if (departement_id) {
      where.push('m.departement_id = ?');
      params.push(departement_id);
    }
    if (filiere) {
      where.push('m.filiere = ?');
      params.push(filiere);
    }
    if (niveau) {
      where.push('m.niveau = ?');
      params.push(niveau);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [lignes] = await pool.execute(
      `SELECT
         e.id AS enseignant_id,
         CONCAT(e.nom, ' ', e.prenom) AS enseignant,
         e.matricule,
         e.grade,
         e.statut,
         d.nom AS departement,
         SUM(h.duree) AS total_heures,
         SUM(
           CASE h.type_heure
             WHEN 'CM' THEN h.duree * pe.coeff_cm
             WHEN 'TD' THEN h.duree * pe.coeff_td
             WHEN 'TP' THEN h.duree * pe.coeff_tp
             ELSE h.duree
           END
         ) AS heures_equivalentes,
         e.heures_contractuelles AS heures_contractuelles,
         GREATEST(
           0,
           SUM(
             CASE h.type_heure
               WHEN 'CM' THEN h.duree * pe.coeff_cm
               WHEN 'TD' THEN h.duree * pe.coeff_td
               WHEN 'TP' THEN h.duree * pe.coeff_tp
               ELSE h.duree
             END
           ) - e.heures_contractuelles
         ) AS heures_complementaires,
         LEAST(
           SUM(
             CASE h.type_heure
               WHEN 'CM' THEN h.duree * pe.coeff_cm
               WHEN 'TD' THEN h.duree * pe.coeff_td
               WHEN 'TP' THEN h.duree * pe.coeff_tp
               ELSE h.duree
             END
           ),
           e.heures_contractuelles
         ) * (e.taux_horaire_cm * 0.4 + e.taux_horaire_td * 0.4 + e.taux_horaire_tp * 0.2) AS montant_heures_normales,
         GREATEST(
           0,
           SUM(
             CASE h.type_heure
               WHEN 'CM' THEN h.duree * pe.coeff_cm
               WHEN 'TD' THEN h.duree * pe.coeff_td
               WHEN 'TP' THEN h.duree * pe.coeff_tp
               ELSE h.duree
             END
           ) - e.heures_contractuelles
         ) * (e.taux_horaire_cm * 0.4 + e.taux_horaire_td * 0.4 + e.taux_horaire_tp * 0.2) AS montant_heures_complementaires
       FROM heures_effectuees h
       JOIN attributions a ON a.id = h.attribution_id
       JOIN enseignants e ON e.id = a.enseignant_id
       JOIN departements d ON d.id = e.departement_id
       JOIN matieres m ON m.id = a.matiere_id
       JOIN parametres_equivalence pe ON pe.annee_id = a.annee_id
       ${whereSql}
       GROUP BY e.id
       ORDER BY d.nom, enseignant`,
      params
    );

    const [mensuel] = await pool.execute(
      `SELECT
         DATE_FORMAT(h.date_cours, '%Y-%m') AS mois,
         SUM(
           CASE h.type_heure
             WHEN 'CM' THEN h.duree * pe.coeff_cm
             WHEN 'TD' THEN h.duree * pe.coeff_td
             WHEN 'TP' THEN h.duree * pe.coeff_tp
             ELSE h.duree
           END
         ) AS heures_equivalentes,
         SUM(
           (
             CASE h.type_heure
               WHEN 'CM' THEN h.duree * pe.coeff_cm
               WHEN 'TD' THEN h.duree * pe.coeff_td
               WHEN 'TP' THEN h.duree * pe.coeff_tp
               ELSE h.duree
             END
           ) * (e.taux_horaire_cm * 0.4 + e.taux_horaire_td * 0.4 + e.taux_horaire_tp * 0.2)
         ) AS montant_estime
       FROM heures_effectuees h
       JOIN attributions a ON a.id = h.attribution_id
       JOIN enseignants e ON e.id = a.enseignant_id
       JOIN matieres m ON m.id = a.matiere_id
       JOIN parametres_equivalence pe ON pe.annee_id = a.annee_id
       ${whereSql}
       GROUP BY DATE_FORMAT(h.date_cours, '%Y-%m')
       ORDER BY mois`,
      params
    );

    const totaux = lignes.reduce(
      (acc, l) => {
        acc.total_normal += Number(l.montant_heures_normales || 0);
        acc.total_complementaire += Number(l.montant_heures_complementaires || 0);
        acc.total_general +=
          Number(l.montant_heures_normales || 0) + Number(l.montant_heures_complementaires || 0);
        return acc;
      },
      { total_normal: 0, total_complementaire: 0, total_general: 0 }
    );

    res.json({ lignes, totaux, mensuel });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message, code: err.code, sqlMessage: err.sqlMessage });
  }
};

exports.getRapportComptabiliteDetails = async (req, res) => {
  const { annee_id, enseignant_id, departement_id, filiere, niveau } = req.query;
  if (!annee_id) return res.status(400).json({ message: 'annee_id requis.' });
  if (!enseignant_id) return res.status(400).json({ message: 'enseignant_id requis.' });

  try {
    const where = [
      'a.annee_id = ?',
      "h.statut_validation = 'validee'",
      'e.id = ?',
    ];
    const params = [annee_id, enseignant_id];

    if (departement_id) {
      where.push('m.departement_id = ?');
      params.push(departement_id);
    }
    if (filiere) {
      where.push('m.filiere = ?');
      params.push(filiere);
    }
    if (niveau) {
      where.push('m.niveau = ?');
      params.push(niveau);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.execute(
      `SELECT
         h.id,
         h.date_cours,
         h.type_heure,
         h.duree,
         h.salle,
         CONCAT(e.nom, ' ', e.prenom) AS enseignant,
         e.matricule,
         d.nom AS departement,
         m.intitule AS matiere,
         m.filiere,
         m.niveau,
         (
           CASE h.type_heure
             WHEN 'CM' THEN h.duree * pe.coeff_cm
             WHEN 'TD' THEN h.duree * pe.coeff_td
             WHEN 'TP' THEN h.duree * pe.coeff_tp
             ELSE h.duree
           END
         ) AS heures_equivalentes,
         (
           (CASE h.type_heure
             WHEN 'CM' THEN h.duree * pe.coeff_cm
             WHEN 'TD' THEN h.duree * pe.coeff_td
             WHEN 'TP' THEN h.duree * pe.coeff_tp
             ELSE h.duree
           END) * (e.taux_horaire_cm * 0.4 + e.taux_horaire_td * 0.4 + e.taux_horaire_tp * 0.2)
         ) AS montant_estime
       FROM heures_effectuees h
       JOIN attributions a ON a.id = h.attribution_id
       JOIN enseignants e ON e.id = a.enseignant_id
       JOIN departements d ON d.id = e.departement_id
       JOIN matieres m ON m.id = a.matiere_id
       JOIN parametres_equivalence pe ON pe.annee_id = a.annee_id
       ${whereSql}
       ORDER BY h.date_cours ASC, m.intitule ASC, FIELD(h.type_heure, 'CM', 'TD', 'TP') ASC`,
      params
    );

    const totaux = rows.reduce(
      (acc, r) => {
        acc.total_heures += Number(r.duree || 0);
        acc.heures_equivalentes += Number(r.heures_equivalentes || 0);
        acc.montant_estime += Number(r.montant_estime || 0);
        return acc;
      },
      { total_heures: 0, heures_equivalentes: 0, montant_estime: 0 }
    );

    res.json({ rows, totaux });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message, code: err.code, sqlMessage: err.sqlMessage });
  }
};

exports.getEtatComptabilite = async (req, res) => {
  const { annee_id } = req.query;
  if (!annee_id) return res.status(400).json({ message: 'annee_id requis.' });
  try {
    let rows;
    let totaux;

    try {
      const [viewRows] = await pool.execute(
        `SELECT vpe.*, e.matricule, d.nom AS departement
         FROM vue_paiement_enseignant vpe
         JOIN enseignants e ON e.id = vpe.enseignant_id
         JOIN departements d ON d.id = e.departement_id
         WHERE vpe.annee_id = ?
         ORDER BY d.nom, vpe.enseignant`,
        [annee_id]
      );
      rows = viewRows;

      const [viewTotaux] = await pool.execute(
        `SELECT 
           SUM(montant_heures_normales) AS total_normal,
           SUM(montant_heures_complementaires) AS total_complementaire,
           SUM(montant_heures_normales + montant_heures_complementaires) AS total_general
         FROM vue_paiement_enseignant WHERE annee_id = ?`,
        [annee_id]
      );
      totaux = viewTotaux;
    } catch (err) {
      // Fallback: certains imports MySQL/MariaDB ne créent pas les VIEW (DEFINER),
      // on recalcule alors l'état comptabilité sans dépendre des vues.
      const fallbackable = [
        'ER_NO_SUCH_TABLE',
        'ER_BAD_TABLE_ERROR',
        'ER_VIEW_INVALID',
        'ER_SP_DOES_NOT_EXIST',
        'ER_NO_SUCH_USER',
        'ER_ACCESS_DENIED_ERROR',
      ].includes(err.code);
      if (!fallbackable) throw err;

      const [calcRows] = await pool.execute(
        `SELECT
           e.id AS enseignant_id,
           CONCAT(e.nom, ' ', e.prenom) AS enseignant,
           e.matricule,
           e.grade,
           e.statut,
           d.nom AS departement,
           aa.id AS annee_id,
           aa.libelle AS annee,
           SUM(CASE WHEN h.type_heure = 'CM' THEN h.duree ELSE 0 END) AS total_cm,
           SUM(CASE WHEN h.type_heure = 'TD' THEN h.duree ELSE 0 END) AS total_td,
           SUM(CASE WHEN h.type_heure = 'TP' THEN h.duree ELSE 0 END) AS total_tp,
           SUM(h.duree) AS total_heures,
           SUM(
             CASE h.type_heure
               WHEN 'CM' THEN h.duree * pe.coeff_cm
               WHEN 'TD' THEN h.duree * pe.coeff_td
               WHEN 'TP' THEN h.duree * pe.coeff_tp
               ELSE h.duree
             END
           ) AS heures_equivalentes,
           e.heures_contractuelles AS heures_contractuelles,
           GREATEST(
             0,
             SUM(
               CASE h.type_heure
                 WHEN 'CM' THEN h.duree * pe.coeff_cm
                 WHEN 'TD' THEN h.duree * pe.coeff_td
                 WHEN 'TP' THEN h.duree * pe.coeff_tp
                 ELSE h.duree
               END
             ) - e.heures_contractuelles
           ) AS heures_complementaires,
           LEAST(
             SUM(
               CASE h.type_heure
                 WHEN 'CM' THEN h.duree * pe.coeff_cm
                 WHEN 'TD' THEN h.duree * pe.coeff_td
                 WHEN 'TP' THEN h.duree * pe.coeff_tp
                 ELSE h.duree
               END
             ),
             e.heures_contractuelles
           ) * (e.taux_horaire_cm * 0.4 + e.taux_horaire_td * 0.4 + e.taux_horaire_tp * 0.2) AS montant_heures_normales,
           GREATEST(
             0,
             SUM(
               CASE h.type_heure
                 WHEN 'CM' THEN h.duree * pe.coeff_cm
                 WHEN 'TD' THEN h.duree * pe.coeff_td
                 WHEN 'TP' THEN h.duree * pe.coeff_tp
                 ELSE h.duree
               END
             ) - e.heures_contractuelles
           ) * (e.taux_horaire_cm * 0.4 + e.taux_horaire_td * 0.4 + e.taux_horaire_tp * 0.2) AS montant_heures_complementaires
         FROM enseignants e
         JOIN departements d ON d.id = e.departement_id
         JOIN attributions a ON a.enseignant_id = e.id
         JOIN annees_academiques aa ON aa.id = a.annee_id
         JOIN heures_effectuees h ON h.attribution_id = a.id AND h.statut_validation = 'validee'
         JOIN parametres_equivalence pe ON pe.annee_id = aa.id
         WHERE aa.id = ?
         GROUP BY e.id, aa.id
         ORDER BY departement, enseignant`,
        [annee_id]
      );
      rows = calcRows;

      const [calcTotaux] = await pool.execute(
        `SELECT
           SUM(x.montant_heures_normales) AS total_normal,
           SUM(x.montant_heures_complementaires) AS total_complementaire,
           SUM(x.montant_heures_normales + x.montant_heures_complementaires) AS total_general
         FROM (
           SELECT
             LEAST(
               SUM(
                 CASE h.type_heure
                   WHEN 'CM' THEN h.duree * pe.coeff_cm
                   WHEN 'TD' THEN h.duree * pe.coeff_td
                   WHEN 'TP' THEN h.duree * pe.coeff_tp
                   ELSE h.duree
                 END
               ),
               e.heures_contractuelles
             ) * (e.taux_horaire_cm * 0.4 + e.taux_horaire_td * 0.4 + e.taux_horaire_tp * 0.2) AS montant_heures_normales,
             GREATEST(
               0,
               SUM(
                 CASE h.type_heure
                   WHEN 'CM' THEN h.duree * pe.coeff_cm
                   WHEN 'TD' THEN h.duree * pe.coeff_td
                   WHEN 'TP' THEN h.duree * pe.coeff_tp
                   ELSE h.duree
                 END
               ) - e.heures_contractuelles
             ) * (e.taux_horaire_cm * 0.4 + e.taux_horaire_td * 0.4 + e.taux_horaire_tp * 0.2) AS montant_heures_complementaires
           FROM enseignants e
           JOIN attributions a ON a.enseignant_id = e.id
           JOIN annees_academiques aa ON aa.id = a.annee_id
           JOIN heures_effectuees h ON h.attribution_id = a.id AND h.statut_validation = 'validee'
           JOIN parametres_equivalence pe ON pe.annee_id = aa.id
           WHERE aa.id = ?
           GROUP BY e.id, aa.id
         ) x`,
        [annee_id]
      );
      totaux = calcTotaux;
    }

    res.json({ lignes: rows || [], totaux: (totaux && totaux[0]) || {} });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
};