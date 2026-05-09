const router = require('express').Router();
const pool = require('../config/db');
const { verifierToken, autoriser } = require('../middleware/auth');
const { logAction } = require('../middleware/logger');

router.get('/annees', verifierToken, autoriser('admin'), async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM annees_academiques ORDER BY date_debut DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
});

router.put('/annees/:id/activer', verifierToken, autoriser('admin'), async (req, res) => {
  const id = req.params.id;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [ancienActive] = await conn.execute('SELECT id FROM annees_academiques WHERE active = 1 LIMIT 1');
    await conn.execute('UPDATE annees_academiques SET active = 0');
    const [result] = await conn.execute('UPDATE annees_academiques SET active = 1 WHERE id = ?', [id]);
    await conn.commit();

    await logAction(
      req.utilisateur.id,
      'SET_ACTIVE_ANNEE',
      'annees_academiques',
      id,
      { ancien_active_id: ancienActive[0]?.id || null },
      { active_id: Number(id) },
      req.ip
    );

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Année non trouvée.' });
    res.json({ message: 'Année académique activée.' });
  } catch (err) {
    try { await conn.rollback(); } catch {}
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  } finally {
    conn.release();
  }
});

router.get('/equivalences', verifierToken, autoriser('admin','rh'), async (req, res) => {
  const { annee_id } = req.query;
  if (!annee_id) return res.status(400).json({ message: 'annee_id requis.' });
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM parametres_equivalence WHERE annee_id = ? LIMIT 1',
      [annee_id]
    );
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
});

router.put('/equivalences', verifierToken, autoriser('admin'), async (req, res) => {
  const { annee_id, coeff_cm, coeff_td, coeff_tp } = req.body;
  if (!annee_id) return res.status(400).json({ message: 'annee_id requis.' });
  try {
    const [ancien] = await pool.execute(
      'SELECT * FROM parametres_equivalence WHERE annee_id = ? LIMIT 1',
      [annee_id]
    );

    if (ancien.length === 0) {
      await pool.execute(
        'INSERT INTO parametres_equivalence (annee_id, coeff_cm, coeff_td, coeff_tp) VALUES (?,?,?,?)',
        [annee_id, coeff_cm, coeff_td, coeff_tp]
      );
      await logAction(req.utilisateur.id, 'CREATE', 'parametres_equivalence', null, null, req.body, req.ip);
      return res.json({ message: 'Paramètres enregistrés.' });
    }

    await pool.execute(
      'UPDATE parametres_equivalence SET coeff_cm=?, coeff_td=?, coeff_tp=? WHERE annee_id=?',
      [coeff_cm, coeff_td, coeff_tp, annee_id]
    );
    await logAction(req.utilisateur.id, 'UPDATE', 'parametres_equivalence', ancien[0].id, ancien[0], req.body, req.ip);
    res.json({ message: 'Paramètres mis à jour.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
});

module.exports = router;
