const router = require('express').Router();
const ctrl   = require('../controllers/authController');
const { verifierToken, autoriser } = require('../middleware/auth');

router.post('/login',    ctrl.login);
router.post('/register', verifierToken, autoriser('admin'), ctrl.creerUtilisateur);
router.get('/profil',    verifierToken, ctrl.profil);

module.exports = router;