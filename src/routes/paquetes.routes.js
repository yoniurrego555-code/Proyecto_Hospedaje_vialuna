const express = require('express');
const router = express.Router();
const paquetesController = require('../controllers/paquetes.controller');

router.get('/', paquetesController.listar);
router.get('/:id', paquetesController.obtenerPorId);
router.post('/', paquetesController.crear);
router.put('/:id', paquetesController.actualizar);
router.delete('/:id', paquetesController.eliminar);
router.patch('/:id/estado', paquetesController.cambiarEstado);

module.exports = router;
