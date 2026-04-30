const express = require('express');
const router = express.Router();
const UsuariosController = require('../controllers/usuarios_crud.controller');

router.get('/', UsuariosController.listar);
router.get('/:id', UsuariosController.obtenerPorId);
router.post('/', UsuariosController.crear);

// Login simple
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    UsuariosModel.obtenerPorEmail(email)
        .then(user => {
            if (!user || user.password !== password) {
                return res.status(400).json({ ok: false, mensaje: 'Credenciales inválidas' });
            }

            res.json({ ok: true, usuario: user });
        })
        .catch(err => res.status(500).json({ ok: false, mensaje: err.message }));
});

module.exports = router;
