const router = require('express').Router();
const ctrl   = require('../controllers/dashboardController');
const { verifierToken, autoriser } = require('../middleware/auth');

router.get('/stats',         verifierToken, autoriser('admin','rh'), ctrl.getStats);
router.get('/etat-paiement', verifierToken, autoriser('admin','rh'), ctrl.getEtatPaiement);

module.exports = router;