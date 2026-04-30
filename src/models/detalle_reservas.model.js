const db = require('../config/db');

const DetalleReservasModel = {
    crear: (data, connection = db) => {
        return connection.query(
            `INSERT INTO detalle_reserva
            (reserva_id, habitacion_id, paquete_id, servicio_id, precio, cantidad, nombre, email, telefono)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.reserva_id,
                data.tipo_item === 'habitacion' ? data.item_id : null,
                data.tipo_item === 'paquete' ? data.item_id : null,
                data.tipo_item === 'servicio' ? data.item_id : null,
                data.precio,
                data.cantidad,
                data.nombre_cliente,
                data.email,
                data.telefono
            ]
        ).then(([result]) => result);
    },

    crearVarios: (detalles, connection = db) => {
        if (!detalles.length) {
            return Promise.resolve();
        }

        return Promise.all(detalles.map((detalle) => DetalleReservasModel.crear(detalle, connection)));
    },

    listarPorReserva: (reservaId, connection = db) => {
        return connection.query(
            `SELECT
                dr.id,
                dr.reserva_id,
                CASE
                    WHEN dr.habitacion_id IS NOT NULL THEN 'habitacion'
                    WHEN dr.paquete_id IS NOT NULL THEN 'paquete'
                    WHEN dr.servicio_id IS NOT NULL THEN 'servicio'
                END AS tipo_item,
                COALESCE(dr.habitacion_id, dr.paquete_id, dr.servicio_id) AS item_id,
                COALESCE(h.nombre, p.nombre, s.nombre) AS nombre_item,
                dr.precio,
                dr.cantidad,
                (dr.precio * dr.cantidad) AS subtotal,
                dr.nombre,
                dr.email,
                dr.telefono
             FROM detalle_reserva dr
             LEFT JOIN habitaciones h ON h.id = dr.habitacion_id
             LEFT JOIN paquetes p ON p.id = dr.paquete_id
             LEFT JOIN servicios s ON s.id = dr.servicio_id
             WHERE dr.reserva_id = ?
             ORDER BY dr.id ASC`,
            [reservaId]
        ).then(([rows]) => rows);
    },

    listarPorReservas: (reservaIds, connection = db) => {
        if (!reservaIds.length) {
            return Promise.resolve([]);
        }

        const placeholders = reservaIds.map(() => '?').join(', ');
        return connection.query(
            `SELECT
                dr.id,
                dr.reserva_id,
                CASE
                    WHEN dr.habitacion_id IS NOT NULL THEN 'habitacion'
                    WHEN dr.paquete_id IS NOT NULL THEN 'paquete'
                    WHEN dr.servicio_id IS NOT NULL THEN 'servicio'
                END AS tipo_item,
                COALESCE(dr.habitacion_id, dr.paquete_id, dr.servicio_id) AS item_id,
                COALESCE(h.nombre, p.nombre, s.nombre) AS nombre_item,
                dr.precio,
                dr.cantidad,
                (dr.precio * dr.cantidad) AS subtotal,
                dr.nombre,
                dr.email,
                dr.telefono
             FROM detalle_reserva dr
             LEFT JOIN habitaciones h ON h.id = dr.habitacion_id
             LEFT JOIN paquetes p ON p.id = dr.paquete_id
             LEFT JOIN servicios s ON s.id = dr.servicio_id
             WHERE dr.reserva_id IN (${placeholders})
             ORDER BY dr.id ASC`,
            reservaIds
        ).then(([rows]) => rows);
    },

    eliminarPorReserva: (reservaId, connection = db) => {
        return connection.query('DELETE FROM detalle_reserva WHERE reserva_id = ?', [reservaId])
            .then(([result]) => result);
    }
};

module.exports = DetalleReservasModel;
