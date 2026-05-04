const router = require('express').Router();
const ctrl   = require('../controllers/matiereController');
const { verifierToken, autoriser } = require('../middleware/auth');

router.get('/annees',  verifierToken, ctrl.listerAnnees);
router.get('/',        verifierToken, ctrl.listerMatieres);
router.post('/',       verifierToken, autoriser('admin','rh'), ctrl.creerMatiere);
router.put('/:id',     verifierToken, autoriser('admin','rh'), ctrl.modifierMatiere);
router.delete('/:id',  verifierToken, autoriser('admin'),      ctrl.supprimerMatiere);

module.exports = router;