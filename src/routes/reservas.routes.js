const express = require('express');
const router = express.Router();
const ReservasController = require('../controllers/reservas.controller');
const auth = require('../middlewares/auth.Middleware');

router.get('/', ReservasController.listar);
router.get('/:id', ReservasController.obtenerPorId);
router.post('/', auth(), ReservasController.crear);
router.put('/:id', auth(), ReservasController.actualizar);
router.delete('/:id', auth(), ReservasController.eliminar);

module.exports = router;
