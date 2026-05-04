const pool = require('../config/db');
const { logAction } = require('../middleware/logger');

exports.listerHeures = async (req, res) => {
  const { annee_id, enseignant_id } = req.query;
  try {
    let query = `
      SELECT h.*, m.intitule AS matiere, e.nom, e.prenom, e.matricule,
             CONCAT(e.nom,' ',e.prenom) AS enseignant, aa.libelle AS annee
      FROM heures_effectuees h
      JOIN attributions a        ON a.id = h.attribution_id
      JOIN enseignants e         ON e.id = a.enseignant_id
      JOIN matieres m            ON m.id = a.matiere_id
      JOIN annees_academiques aa ON aa.id = a.annee_id
      WHERE 1=1`;
    const params = [];
    if (annee_id)      { query += ' AND a.annee_id = ?';      params.push(annee_id); }
    if (enseignant_id) { query += ' AND a.enseignant_id = ?'; params.push(enseignant_id); }
    query += ' ORDER BY h.date_cours DESC';
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
};

exports.saisirHeure = async (req, res) => {
  const { attribution_id, date_cours, type_heure, duree, salle, observations } = req.body;
  try {
    const [result] = await pool.execute(
      `INSERT INTO heures_effectuees (attribution_id, date_cours, type_heure, duree, salle, observations)
       VALUES (?,?,?,?,?,?)`,
      [attribution_id, date_cours, type_heure, duree, salle||null, observations||null]
    );
    await logAction(req.utilisateur.id, 'CREATE', 'heures_effectuees', result.insertId, null, req.body, req.ip);
    res.status(201).json({ message: 'Heure saisie.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
};

exports.validerHeure = async (req, res) => {
  const { statut } = req.body;
  try {
    await pool.execute(
      `UPDATE heures_effectuees SET statut_validation=?, valide_par=?, valide_le=NOW() WHERE id=?`,
      [statut, req.utilisateur.id, req.params.id]
    );
    await logAction(req.utilisateur.id, 'VALIDER', 'heures_effectuees', req.params.id, null, { statut }, req.ip);
    res.json({ message: `Heure ${statut}.` });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
};

exports.supprimerHeure = async (req, res) => {
  try {
    await pool.execute('DELETE FROM heures_effectuees WHERE id = ?', [req.params.id]);
    await logAction(req.utilisateur.id, 'DELETE', 'heures_effectuees', req.params.id, null, null, req.ip);
    res.json({ message: 'Heure supprimée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
};

exports.listerAttributions = async (req, res) => {
  const { enseignant_id, annee_id } = req.query;
  try {
    const [rows] = await pool.execute(`
      SELECT a.id, a.semestre, m.intitule AS matiere, m.niveau, m.filiere
      FROM attributions a
      JOIN matieres m ON m.id = a.matiere_id
      WHERE a.enseignant_id = ? AND a.annee_id = ?`,
      [enseignant_id, annee_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
};