const express = require('express');
const router = express.Router();
const HabitacionesController = require('../controllers/habitaciones.controller');

// CRUD
router.get('/', HabitacionesController.listar);
router.get('/:id', HabitacionesController.obtenerPorId);
router.post('/', HabitacionesController.crear);
router.put('/:id', HabitacionesController.actualizar);
router.delete('/:id', HabitacionesController.eliminar);

// Reservar
router.post('/:id/reservar', HabitacionesController.reservar);
router.post('/reservar/:id', HabitacionesController.reservar);

module.exports = router;
  
