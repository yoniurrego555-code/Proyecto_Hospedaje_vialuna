// src/routes/estadosreserva.routes.js
const express = require('express');
const router = express.Router();
const EstadosReservaController = require('../controllers/estadosreserva.controller');

// Rutas CRUD
router.get('/', EstadosReservaController.getAll);         // Listar todos
router.get('/:id', EstadosReservaController.getById);     // Obtener por ID
router.post('/', EstadosReservaController.create);        // Crear
router.put('/:id', EstadosReservaController.update);      // Actualizar
router.delete('/:id', EstadosReservaController.delete);   // Eliminar

module.exports = router;