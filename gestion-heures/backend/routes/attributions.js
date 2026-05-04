const router = require('express').Router();
const pool   = require('../config/db');
const { verifierToken, autoriser } = require('../middleware/auth');

router.get('/', verifierToken, async (req, res) => {
  const { annee_id } = req.query;
  try {
    const [rows] = await pool.execute(`
      SELECT a.id, a.semestre,
             CONCAT(e.nom,' ',e.prenom) AS enseignant,
             m.intitule AS matiere, m.niveau, m.filiere
      FROM attributions a
      JOIN enseignants e ON e.id = a.enseignant_id
      JOIN matieres m    ON m.id = a.matiere_id
      WHERE a.annee_id = ?
      ORDER BY e.nom, m.intitule`, [annee_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
});

router.post('/', verifierToken, autoriser('admin','rh'), async (req, res) => {
  const { enseignant_id, matiere_id, annee_id, semestre } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO attributions (enseignant_id, matiere_id, annee_id, semestre) VALUES (?,?,?,?)',
      [enseignant_id, matiere_id, annee_id, semestre]
    );
    res.status(201).json({ message: 'Attribution créée.', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ message: 'Cette attribution existe déjà.' });
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
});

router.delete('/:id', verifierToken, autoriser('admin'), async (req, res) => {
  try {
    await pool.execute('DELETE FROM attributions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Attribution supprimée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
});

module.exports = router;