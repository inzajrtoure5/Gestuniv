const router = require('express').Router();
const ctrl   = require('../controllers/dashboardController');
const { verifierToken, autoriser } = require('../middleware/auth');

router.get('/stats',         verifierToken, autoriser('admin','rh'), ctrl.getStats);
router.get('/etat-paiement', verifierToken, autoriser('admin','rh'), ctrl.getEtatPaiement);
router.get('/mensuel',       verifierToken, autoriser('admin','rh'), ctrl.getStatsMensuelles);
router.get('/filiere',       verifierToken, autoriser('admin','rh'), ctrl.getRepartitionFiliere);
router.get('/types',         verifierToken, autoriser('admin','rh'), ctrl.getRepartitionTypeHeures);
router.get('/top-enseignants', verifierToken, autoriser('admin','rh'), ctrl.getTopEnseignants);
router.get('/statuts-mensuels', verifierToken, autoriser('admin','rh'), ctrl.getStatutsMensuels);
router.get('/comptabilite',  verifierToken, autoriser('admin','rh'), ctrl.getEtatComptabilite);
router.get('/rapport-comptabilite', verifierToken, autoriser('admin','rh'), ctrl.getRapportComptabilite);
router.get('/rapport-comptabilite/details', verifierToken, autoriser('admin','rh'), ctrl.getRapportComptabiliteDetails);

module.exports = router;