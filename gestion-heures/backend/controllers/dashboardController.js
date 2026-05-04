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
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
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