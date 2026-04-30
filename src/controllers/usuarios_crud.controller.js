const UsuariosService = require('../services/usuarios_crud.service');

const UsuariosCrudController = {
    crear: (req, res) => {
        UsuariosService.registrar(req.body)
            .then((result) => res.status(201).json({
                ok: true,
                mensaje: 'Usuario creado correctamente',
                data: { id: result.insertId }
            }))
            .catch((err) => res.status(400).json({ ok: false, mensaje: err.toString() }));
    },

    login: (req, res) => {
        const { email, password } = req.body;
        UsuariosService.login(email, password)
            .then((result) => res.json({ ok: true, ...result }))
            .catch((err) => res.json({ ok: false, mensaje: err.toString() }));
    },

    listar: (req, res) => {
        UsuariosService.listar()
            .then((data) => res.json({ ok: true, data }))
            .catch((err) => res.status(500).json({ ok: false, mensaje: err.toString() }));
    },

    obtenerPorId: (req, res) => {
        UsuariosService.obtenerPorId(req.params.id)
            .then((data) => res.json({ ok: true, data }))
            .catch((err) => res.status(404).json({ ok: false, mensaje: err.toString() }));
    },

    actualizar: (req, res) => {
        UsuariosService.actualizar(req.params.id, req.body)
            .then(() => res.json({ ok: true, mensaje: 'Usuario actualizado correctamente' }))
            .catch((err) => res.status(400).json({ ok: false, mensaje: err.toString() }));
    },

    eliminar: (req, res) => {
        UsuariosService.eliminar(req.params.id)
            .then(() => res.json({ ok: true, mensaje: 'Usuario eliminado correctamente' }))
            .catch((err) => res.status(400).json({ ok: false, mensaje: err.toString() }));
    },

    cambiarRol: (req, res) => {
        UsuariosService.cambiarRol(req.params.id, req.body.rol)
            .then(() => res.json({ ok: true, mensaje: 'Rol actualizado correctamente' }))
            .catch((err) => res.status(400).json({ ok: false, mensaje: err.toString() }));
    }
};

module.exports = UsuariosCrudController;
