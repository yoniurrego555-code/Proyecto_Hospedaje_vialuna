const express = require('express');
const router = express.Router();
const DetalleReservasModel = require('../models/detalle_reservas.model');

router.get('/:reserva_id', (req, res) => {
    DetalleReservasModel.listarPorReserva(req.params.reserva_id)
        .then((data) => res.json({ ok: true, data }))
        .catch((err) => res.status(500).json({ ok: false, mensaje: err.message }));
});

module.exports = router;
