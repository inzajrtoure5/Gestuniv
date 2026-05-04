const pool = require('../config/db');

exports.listerMatieres = async (req, res) => {
  const { annee_id } = req.query;
  try {
    let query = `SELECT m.*, d.nom AS departement_nom, aa.libelle AS annee
                 FROM matieres m
                 JOIN departements d ON d.id = m.departement_id
                 JOIN annees_academiques aa ON aa.id = m.annee_id WHERE 1=1`;
    const params = [];
    if (annee_id) { query += ' AND m.annee_id = ?'; params.push(annee_id); }
    query += ' ORDER BY m.intitule';
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
};

exports.creerMatiere = async (req, res) => {
  const { intitule, filiere, niveau, volume_cm_prevu, volume_td_prevu, volume_tp_prevu, departement_id, annee_id } = req.body;
  try {
    const [result] = await pool.execute(
      `INSERT INTO matieres (intitule, filiere, niveau, volume_cm_prevu, volume_td_prevu, volume_tp_prevu, departement_id, annee_id)
       VALUES (?,?,?,?,?,?,?,?)`,
      [intitule, filiere, niveau, volume_cm_prevu||0, volume_td_prevu||0, volume_tp_prevu||0, departement_id, annee_id]
    );
    res.status(201).json({ message: 'Matière créée.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
};

exports.modifierMatiere = async (req, res) => {
  const { intitule, filiere, niveau, volume_cm_prevu, volume_td_prevu, volume_tp_prevu } = req.body;
  try {
    await pool.execute(
      'UPDATE matieres SET intitule=?, filiere=?, niveau=?, volume_cm_prevu=?, volume_td_prevu=?, volume_tp_prevu=? WHERE id=?',
      [intitule, filiere, niveau, volume_cm_prevu, volume_td_prevu, volume_tp_prevu, req.params.id]
    );
    res.json({ message: 'Matière mise à jour.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
};

exports.supprimerMatiere = async (req, res) => {
  try {
    await pool.execute('DELETE FROM matieres WHERE id = ?', [req.params.id]);
    res.json({ message: 'Matière supprimée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
};

exports.listerAnnees = async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM annees_academiques ORDER BY date_debut DESC');
  res.json(rows);
};