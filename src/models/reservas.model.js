const db = require('../config/db');

const SELECT_BASE = `
    SELECT
        r.id,
        r.usuario_id,
        u.nombre AS nombre_cliente,
        u.email,
        COALESCE(dr.telefono, '') AS telefono,
        r.fecha_inicio AS fecha_entrada,
        r.fecha_fin AS fecha_salida,
        r.estado,
        r.total,
        r.created_at
    FROM reservas r
    LEFT JOIN usuarios u ON u.id = r.usuario_id
    LEFT JOIN (
        SELECT reserva_id, MAX(telefono) AS telefono
        FROM detalle_reserva
        GROUP BY reserva_id
    ) dr ON dr.reserva_id = r.id
`;

const ReservasModel = {
    listar: (connection = db) => {
        return connection.query(`${SELECT_BASE} ORDER BY r.id DESC`)
            .then(([rows]) => rows);
    },

    obtenerPorId: (id, connection = db) => {
        return connection.query(`${SELECT_BASE} WHERE r.id = ?`, [id])
            .then(([rows]) => rows[0]);
    },

    crear: (data, connection = db) => {
        return connection.query(
            `INSERT INTO reservas
            (usuario_id, fecha_inicio, fecha_fin, estado, total)
            VALUES (?, ?, ?, ?, ?)`,
            [
                data.usuario_id,
                data.fecha_entrada,
                data.fecha_salida,
                data.estado,
                data.total
            ]
        ).then(([result]) => result);
    },

    actualizar: (id, data, connection = db) => {
        return connection.query(
            `UPDATE reservas
            SET usuario_id = ?, fecha_inicio = ?, fecha_fin = ?, estado = ?, total = ?
            WHERE id = ?`,
            [
                data.usuario_id,
                data.fecha_entrada,
                data.fecha_salida,
                data.estado,
                data.total,
                id
            ]
        ).then(([result]) => result);
    },

    eliminar: (id, connection = db) => {
        return connection.query('DELETE FROM reservas WHERE id = ?', [id])
            .then(([result]) => result);
    }
};

module.exports = ReservasModel;
