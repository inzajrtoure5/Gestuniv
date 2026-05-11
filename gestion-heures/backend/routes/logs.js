const router = require('express').Router();
const pool = require('../config/db');
const { verifierToken, autoriser } = require('../middleware/auth');

router.get('/', verifierToken, autoriser('admin'), async (req, res) => {
  const parsedLimit = parseInt(req.query.limit || '100', 10);
  const parsedOffset = parseInt(req.query.offset || '0', 10);

  const limit = Math.min(Number.isFinite(parsedLimit) ? parsedLimit : 100, 500);
  const offset = Math.max(Number.isFinite(parsedOffset) ? parsedOffset : 0, 0);

  try {
    const [rows] = await pool.execute(
      `SELECT l.id, l.utilisateur_id, CONCAT(u.nom,' ',u.prenom) AS utilisateur, u.email, u.role,
              l.action, l.table_cible, l.enregistrement_id, l.anciennes_valeurs, l.nouvelles_valeurs,
              l.ip_address, l.created_at
       FROM logs_actions l
       LEFT JOIN utilisateurs u ON u.id = l.utilisateur_id
       ORDER BY l.created_at DESC
       LIMIT ${Number(limit)} OFFSET ${Number(offset)}`
    );

    const [totalRows] = await pool.execute('SELECT COUNT(*) AS total FROM logs_actions');

    res.json({ rows, total: totalRows[0]?.total || 0, limit, offset });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
});

module.exports = router;
