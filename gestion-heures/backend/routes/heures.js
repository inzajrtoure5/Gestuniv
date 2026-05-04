const router = require('express').Router();
const ctrl   = require('../controllers/heureController');
const { verifierToken, autoriser } = require('../middleware/auth');

router.get('/',              verifierToken, ctrl.listerHeures);
router.get('/attributions',  verifierToken, ctrl.listerAttributions);
router.post('/',             verifierToken, autoriser('admin','rh'), ctrl.saisirHeure);
router.put('/:id/valider',   verifierToken, autoriser('admin','rh'), ctrl.validerHeure);
router.delete('/:id',        verifierToken, autoriser('admin','rh'), ctrl.supprimerHeure);

module.exports = router;