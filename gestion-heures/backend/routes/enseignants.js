const router = require('express').Router();
const ctrl   = require('../controllers/enseignantController');
const { verifierToken, autoriser } = require('../middleware/auth');

router.get('/',             verifierToken, ctrl.listerEnseignants);
router.get('/departements', verifierToken, ctrl.listerDepartements);
router.get('/:id',          verifierToken, ctrl.getEnseignant);
router.get('/:id/heures',   verifierToken, ctrl.getHeuresEnseignant);
router.post('/',            verifierToken, autoriser('admin','rh'), ctrl.creerEnseignant);
router.put('/:id',          verifierToken, autoriser('admin','rh'), ctrl.modifierEnseignant);
router.delete('/:id',       verifierToken, autoriser('admin'),      ctrl.supprimerEnseignant);

module.exports = router;