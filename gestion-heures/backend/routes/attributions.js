const router = require('express').Router();
const pool   = require('../config/db');
const { verifierToken, autoriser } = require('../middleware/auth');

// GET /api/attributions?annee_id=X
// Retourne toutes les attributions (avec statut) — filtre optionnel par enseignant_id pour le prof
router.get('/', verifierToken, async (req, res) => {
  const { annee_id, enseignant_id } = req.query;
  try {
    const params = [annee_id];
    let whereExtra = '';
    if (enseignant_id) {
      whereExtra = ' AND a.enseignant_id = ?';
      params.push(enseignant_id);
    }
    const [rows] = await pool.execute(`
      SELECT a.id, a.semestre, a.statut, a.motif_refus,
             e.id AS enseignant_id,
             CONCAT(e.nom,' ',e.prenom) AS enseignant,
             m.intitule AS matiere, m.niveau, m.filiere
      FROM attributions a
      JOIN enseignants e ON e.id = a.enseignant_id
      JOIN matieres m    ON m.id = a.matiere_id
      WHERE a.annee_id = ?${whereExtra}
      ORDER BY e.nom, m.intitule`, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
});

// POST /api/attributions — créer une attribution (RH/Admin seulement)
router.post('/', verifierToken, autoriser('admin','rh'), async (req, res) => {
  const { enseignant_id, matiere_id, annee_id, semestre } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO attributions (enseignant_id, matiere_id, annee_id, semestre, statut) VALUES (?,?,?,?,?)',
      [enseignant_id, matiere_id, annee_id, semestre, 'en_attente_prof']
    );
    res.status(201).json({ message: 'Attribution créée.', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ message: 'Cette attribution existe déjà.' });
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
});

// PATCH /api/attributions/:id/repondre — L'enseignant accepte ou refuse son attribution
// Body: { decision: 'accepter' | 'refuser', motif_refus?: string }
router.patch('/:id/repondre', verifierToken, autoriser('enseignant','admin','rh'), async (req, res) => {
  const { decision, motif_refus } = req.body;
  const { id } = req.params;

  if (!['accepter', 'refuser'].includes(decision)) {
    return res.status(400).json({ message: "La décision doit être 'accepter' ou 'refuser'." });
  }

  try {
    // Vérifier que l'attribution existe et est en attente du prof
    const [rows] = await pool.execute('SELECT * FROM attributions WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Attribution non trouvée.' });

    const attribution = rows[0];

    // Si c'est un enseignant, vérifier qu'il est bien l'enseignant concerné
    if (req.utilisateur.role === 'enseignant') {
      if (String(attribution.enseignant_id) !== String(req.utilisateur.enseignant_id)) {
        return res.status(403).json({ message: 'Vous ne pouvez répondre qu\'à vos propres attributions.' });
      }
    }

    if (attribution.statut !== 'en_attente_prof') {
      return res.status(400).json({ message: `Cette attribution a déjà été traitée (statut: ${attribution.statut}).` });
    }

    const nouveauStatut = decision === 'accepter' ? 'acceptee_prof' : 'refusee_prof';
    const motif = decision === 'refuser' ? (motif_refus || null) : null;

    await pool.execute(
      'UPDATE attributions SET statut = ?, motif_refus = ? WHERE id = ?',
      [nouveauStatut, motif, id]
    );

    const msg = decision === 'accepter' ? 'Attribution acceptée.' : 'Attribution refusée.';
    res.json({ message: msg, statut: nouveauStatut });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
});

// PATCH /api/attributions/:id/valider-rh — Le RH valide une attribution acceptée par le prof
router.patch('/:id/valider-rh', verifierToken, autoriser('admin','rh'), async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute('SELECT * FROM attributions WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Attribution non trouvée.' });

    const attribution = rows[0];
    if (attribution.statut !== 'acceptee_prof') {
      return res.status(400).json({
        message: `L'attribution doit être acceptée par le professeur avant la validation RH (statut actuel: ${attribution.statut}).`
      });
    }

    await pool.execute(
      'UPDATE attributions SET statut = ? WHERE id = ?',
      ['validee_rh', id]
    );
    res.json({ message: 'Attribution validée par le RH.', statut: 'validee_rh' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
});

// DELETE /api/attributions/:id — Supprimer (admin seulement)
router.delete('/:id', verifierToken, autoriser('admin'), async (req, res) => {
  try {
    await pool.execute('DELETE FROM attributions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Attribution supprimée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
});

module.exports = router;