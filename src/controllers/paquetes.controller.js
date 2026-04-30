const PaquetesService = require('../services/paquetes.service');

const PaquetesController = {
    listar: (req, res) => {
        PaquetesService.listar()
            .then((data) => res.json({ ok: true, data }))
            .catch((err) => res.status(500).json({ ok: false, mensaje: err.toString() }));
    },

    obtenerPorId: (req, res) => {
        PaquetesService.obtenerPorId(req.params.id)
            .then((data) => res.json({ ok: true, data }))
            .catch((err) => res.status(404).json({ ok: false, mensaje: err.toString() }));
    },

    crear: (req, res) => {
        PaquetesService.crear(req.body)
            .then((result) => res.status(201).json({
                ok: true,
                mensaje: 'Paquete creado correctamente',
                data: { id: result.insertId }
            }))
            .catch((err) => res.status(400).json({ ok: false, mensaje: err.toString() }));
    },

    actualizar: (req, res) => {
        PaquetesService.actualizar(req.params.id, req.body)
            .then(() => res.json({ ok: true, mensaje: 'Paquete actualizado correctamente' }))
            .catch((err) => res.status(400).json({ ok: false, mensaje: err.toString() }));
    },

    eliminar: (req, res) => {
        PaquetesService.eliminar(req.params.id)
            .then(() => res.json({ ok: true, mensaje: 'Paquete eliminado correctamente' }))
            .catch((err) => res.status(400).json({ ok: false, mensaje: err.toString() }));
    },

    cambiarEstado: (req, res) => {
        PaquetesService.cambiarEstado(req.params.id, req.body.estado)
            .then(() => res.json({ ok: true, mensaje: 'Estado actualizado correctamente' }))
            .catch((err) => res.status(400).json({ ok: false, mensaje: err.toString() }));
    }
};

module.exports = PaquetesController;
