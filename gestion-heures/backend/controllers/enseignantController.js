const pool = require('../config/db');
const { logAction } = require('../middleware/logger');

// GET /api/enseignants
exports.listerEnseignants = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT e.*, d.nom AS departement_nom
      FROM enseignants e
      JOIN departements d ON d.id = e.departement_id
      WHERE e.actif = 1
      ORDER BY e.nom, e.prenom
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
};

// GET /api/enseignants/:id
exports.getEnseignant = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT e.*, d.nom AS departement_nom
      FROM enseignants e
      JOIN departements d ON d.id = e.departement_id
      WHERE e.id = ?`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Enseignant non trouvé.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
};

// POST /api/enseignants
exports.creerEnseignant = async (req, res) => {
  const { nom, prenom, matricule, grade, statut, departement_id,
          taux_horaire_cm, taux_horaire_td, taux_horaire_tp, heures_contractuelles } = req.body;
  try {
    const [result] = await pool.execute(
      `INSERT INTO enseignants (nom, prenom, matricule, grade, statut, departement_id,
        taux_horaire_cm, taux_horaire_td, taux_horaire_tp, heures_contractuelles)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [nom, prenom, matricule, grade, statut, departement_id,
       taux_horaire_cm||0, taux_horaire_td||0, taux_horaire_tp||0, heures_contractuelles||0]
    );
    await logAction(req.utilisateur.id, 'CREATE', 'enseignants', result.insertId, null, req.body, req.ip);
    res.status(201).json({ message: 'Enseignant créé.', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ message: 'Ce matricule existe déjà.' });
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
};

// PUT /api/enseignants/:id
exports.modifierEnseignant = async (req, res) => {
  const { nom, prenom, matricule, grade, statut, departement_id,
          taux_horaire_cm, taux_horaire_td, taux_horaire_tp, heures_contractuelles } = req.body;
  try {
    const [ancien] = await pool.execute('SELECT * FROM enseignants WHERE id = ?', [req.params.id]);
    if (ancien.length === 0) return res.status(404).json({ message: 'Enseignant non trouvé.' });
    await pool.execute(
      `UPDATE enseignants SET nom=?, prenom=?, matricule=?, grade=?, statut=?,
       departement_id=?, taux_horaire_cm=?, taux_horaire_td=?, taux_horaire_tp=?,
       heures_contractuelles=? WHERE id=?`,
      [nom, prenom, matricule, grade, statut, departement_id,
       taux_horaire_cm, taux_horaire_td, taux_horaire_tp, heures_contractuelles, req.params.id]
    );
    await logAction(req.utilisateur.id, 'UPDATE', 'enseignants', req.params.id, ancien[0], req.body, req.ip);
    res.json({ message: 'Enseignant mis à jour.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
};

// DELETE /api/enseignants/:id  (soft delete)
exports.supprimerEnseignant = async (req, res) => {
  try {
    await pool.execute('UPDATE enseignants SET actif = 0 WHERE id = ?', [req.params.id]);
    await logAction(req.utilisateur.id, 'DELETE', 'enseignants', req.params.id, null, null, req.ip);
    res.json({ message: 'Enseignant désactivé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
};

// GET /api/enseignants/:id/heures?annee_id=X
exports.getHeuresEnseignant = async (req, res) => {
  const { annee_id } = req.query;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM vue_heures_enseignant WHERE enseignant_id = ? AND annee_id = ?',
      [req.params.id, annee_id]
    );
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
};

// GET /api/departements
exports.listerDepartements = async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM departements ORDER BY nom');
  res.json(rows);
};