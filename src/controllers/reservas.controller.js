const ReservasService = require('../services/reservas.service');

const ReservasController = {
    listar: (req, res) => {
        ReservasService.listarReservas()
            .then((data) => res.json({ ok: true, data }))
            .catch((err) => res.status(500).json({ ok: false, mensaje: err.toString() }));
    },

    obtenerPorId: (req, res) => {
        ReservasService.obtenerReserva(req.params.id)
            .then((data) => res.json({ ok: true, data }))
            .catch((err) => res.status(404).json({ ok: false, mensaje: err.toString() }));
    },

    crear: (req, res) => {
        ReservasService.crearReserva({
            ...req.body,
            usuario_id: req.usuario && req.usuario.id,
            email: req.usuario && req.usuario.email ? req.usuario.email : req.body.email
        })
            .then((data) => res.status(201).json({ ok: true, mensaje: 'Reserva creada correctamente', data }))
            .catch((err) => res.status(400).json({ ok: false, mensaje: err.toString() }));
    },

    actualizar: (req, res) => {
        ReservasService.actualizarReserva(req.params.id, {
            ...req.body,
            usuario_id: req.usuario && req.usuario.id,
            email: req.usuario && req.usuario.email ? req.usuario.email : req.body.email
        })
            .then((data) => res.json({ ok: true, mensaje: 'Reserva actualizada correctamente', data }))
            .catch((err) => res.status(400).json({ ok: false, mensaje: err.toString() }));
    },

    eliminar: (req, res) => {
        ReservasService.eliminarReserva(req.params.id)
            .then(() => res.json({ ok: true, mensaje: 'Reserva eliminada correctamente' }))
            .catch((err) => res.status(400).json({ ok: false, mensaje: err.toString() }));
    }
};

module.exports = ReservasController;
