
const UsuariosService = require('../services/usuarios.service');

const UsuariosController = {
    crear: (req, res) => {
        const data = req.body;
        UsuariosService.registrar(data)
            .then(result => {
                res.json({ ok: true, mensaje: 'Usuario creado', id: result.insertId });
            })
            .catch(err => {
                res.status(400).json({ ok: false, error: err.toString() });
            });
    },

    login: (req, res) => {
        const { email, password } = req.body;
        UsuariosService.login(email, password)
            .then(result => res.json({ ok: true, ...result }))
            .catch(err => res.status(400).json({ ok: false, error: err.toString() }));
    },

    listar: (req, res) => {
        UsuariosService.listar()
            .then(users => res.json({ ok: true, users }))
            .catch(err => res.status(500).json({ ok: false, error: err.toString() }));
    },

    obtenerPorId: (req, res) => {
        const id = req.params.id;
        UsuariosService.obtenerPorId(id)
            .then(user => {
                if (!user) return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });
                res.json({ ok: true, user });
            })
            .catch(err => res.status(500).json({ ok: false, error: err.toString() }));
    }
};

module.exports = UsuariosController;