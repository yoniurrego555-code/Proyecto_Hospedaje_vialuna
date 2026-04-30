const express = require('express');
const router = express.Router();
const UsuariosController = require('../controllers/usuarios_crud.controller');

router.get('/', UsuariosController.listar);
router.get('/:id', UsuariosController.obtenerPorId);
router.post('/', UsuariosController.crear);
router.post('/login', UsuariosController.login);
router.put('/:id', UsuariosController.actualizar);
router.delete('/:id', UsuariosController.eliminar);
router.patch('/:id/rol', UsuariosController.cambiarRol);

module.exports = router;
