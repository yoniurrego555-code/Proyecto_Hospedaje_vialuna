const ServiciosService = require('../services/servicios.service');

const ServiciosController = {
    crear: (req, res) => {
        ServiciosService.crearServicio(req.body)
            .then((result) => res.status(201).json({
                ok: true,
                mensaje: 'Servicio creado correctamente',
                data: { id: result.insertId }
            }))
            .catch((err) => res.status(400).json({ ok: false, mensaje: err.toString() }));
    },

    listar: (req, res) => {
        ServiciosService.obtenerServicios()
            .then((data) => res.json({ ok: true, data }))
            .catch((err) => res.status(500).json({ ok: false, mensaje: err.toString() }));
    },

    obtenerPorId: (req, res) => {
        ServiciosService.obtenerServicio(req.params.id)
            .then((data) => res.json({ ok: true, data }))
            .catch((err) => res.status(404).json({ ok: false, mensaje: err.toString() }));
    },

    actualizar: (req, res) => {
        ServiciosService.actualizarServicio(req.params.id, req.body)
            .then(() => res.json({ ok: true, mensaje: 'Servicio actualizado correctamente' }))
            .catch((err) => res.status(400).json({ ok: false, mensaje: err.toString() }));
    },

    eliminar: (req, res) => {
        ServiciosService.eliminarServicio(req.params.id)
            .then(() => res.json({ ok: true, mensaje: 'Servicio eliminado correctamente' }))
            .catch((err) => res.status(400).json({ ok: false, mensaje: err.toString() }));
    },

    cambiarEstado: (req, res) => {
        ServiciosService.cambiarEstadoServicio(req.params.id, req.body.estado)
            .then(() => res.json({ ok: true, mensaje: 'Estado actualizado correctamente' }))
            .catch((err) => res.status(400).json({ ok: false, mensaje: err.toString() }));
    }
};

module.exports = ServiciosController;
