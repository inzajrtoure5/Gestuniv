const router = require('express').Router();
const ctrl   = require('../controllers/authController');
const { verifierToken, autoriser } = require('../middleware/auth');
const pool   = require('../config/db');

router.post('/login',    ctrl.login);
router.post('/register', verifierToken, autoriser('admin'), ctrl.creerUtilisateur);
router.get('/profil',    verifierToken, ctrl.profil);
router.get('/utilisateurs', verifierToken, autoriser('admin'), async (req, res) => {
  const [rows] = await pool.execute('SELECT id, nom, prenom, email, role, actif, created_at FROM utilisateurs ORDER BY nom');
  res.json(rows);
});

module.exports = router;