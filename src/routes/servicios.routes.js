const express = require('express');
const router = express.Router();
const ServiciosController = require('../controllers/servicios.controller');

router.get('/', ServiciosController.listar);
router.get('/:id', ServiciosController.obtenerPorId);
router.post('/', ServiciosController.crear);
router.put('/:id', ServiciosController.actualizar);
router.delete('/:id', ServiciosController.eliminar);
router.patch('/:id/estado', ServiciosController.cambiarEstado);

module.exports = router;
