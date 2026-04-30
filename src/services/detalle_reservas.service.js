const DetalleReservasModel = require('../models/detalle_reservas.model');

module.exports = {

    agregarDetalle: (data) => {
        if (!data.reserva_id) return Promise.reject('Reserva obligatoria');
        return DetalleReservasModel.crear(data);
    },

    obtenerDetalles: (reserva_id) => {
        return DetalleReservasModel.listarPorReserva(reserva_id)
            .then(detalles => {
                if (!detalles.length) return Promise.reject('No hay detalles para esta reserva');
                return detalles;
            });
    },

    eliminarDetalles: (reserva_id) => {
        return DetalleReservasModel.eliminarPorReserva(reserva_id);
    }

};