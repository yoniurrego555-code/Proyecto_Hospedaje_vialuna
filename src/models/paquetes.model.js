const db = require('../config/db');

const PaquetesModel = {
    listar: (connection = db) => {
        return connection.query(
            'SELECT id, nombre, descripcion, precio, estado, created_at FROM paquetes ORDER BY id DESC'
        ).then(([rows]) => rows);
    },

    listarConRelaciones: async (connection = db) => {
        const paquetes = await PaquetesModel.listar(connection);

        if (!paquetes.length) {
            return [];
        }

        const paqueteIds = paquetes.map((item) => item.id);
        const placeholders = paqueteIds.map(() => '?').join(', ');

        const [habitaciones] = await connection.query(
            `SELECT ph.paquete_id, ph.cantidad, h.id, h.nombre, h.precio, h.estado
             FROM paquete_habitaciones ph
             INNER JOIN habitaciones h ON h.id = ph.habitacion_id
             WHERE ph.paquete_id IN (${placeholders})
             ORDER BY h.nombre ASC`,
            paqueteIds
        );

        const [servicios] = await connection.query(
            `SELECT ps.paquete_id, ps.cantidad, s.id, s.nombre, s.precio, s.estado
             FROM paquete_servicios ps
             INNER JOIN servicios s ON s.id = ps.servicio_id
             WHERE ps.paquete_id IN (${placeholders})
             ORDER BY s.nombre ASC`,
            paqueteIds
        );

        return paquetes.map((paquete) => ({
            ...paquete,
            habitaciones: habitaciones
                .filter((item) => item.paquete_id === paquete.id)
                .map(({ paquete_id, ...rest }) => rest),
            servicios: servicios
                .filter((item) => item.paquete_id === paquete.id)
                .map(({ paquete_id, ...rest }) => rest)
        }));
    },

    obtenerPorId: async (id, connection = db) => {
        const [rows] = await connection.query(
            'SELECT id, nombre, descripcion, precio, estado, created_at FROM paquetes WHERE id = ?',
            [id]
        );

        const paquete = rows[0];

        if (!paquete) {
            return null;
        }

        const [habitaciones] = await connection.query(
            `SELECT ph.cantidad, h.id, h.nombre, h.precio, h.estado
             FROM paquete_habitaciones ph
             INNER JOIN habitaciones h ON h.id = ph.habitacion_id
             WHERE ph.paquete_id = ?
             ORDER BY h.nombre ASC`,
            [id]
        );

        const [servicios] = await connection.query(
            `SELECT ps.cantidad, s.id, s.nombre, s.precio, s.estado
             FROM paquete_servicios ps
             INNER JOIN servicios s ON s.id = ps.servicio_id
             WHERE ps.paquete_id = ?
             ORDER BY s.nombre ASC`,
            [id]
        );

        return {
            ...paquete,
            habitaciones,
            servicios
        };
    },

    crear: ({ nombre, descripcion, precio, estado }, connection = db) => {
        return connection.query(
            'INSERT INTO paquetes (nombre, descripcion, precio, estado) VALUES (?, ?, ?, ?)',
            [nombre, descripcion, precio, estado]
        ).then(([result]) => result);
    },

    actualizar: (id, { nombre, descripcion, precio, estado }, connection = db) => {
        return connection.query(
            'UPDATE paquetes SET nombre = ?, descripcion = ?, precio = ?, estado = ? WHERE id = ?',
            [nombre, descripcion, precio, estado, id]
        ).then(([result]) => result);
    },

    eliminar: (id, connection = db) => {
        return connection.query('DELETE FROM paquetes WHERE id = ?', [id])
            .then(([result]) => result);
    },

    cambiarEstado: (id, estado, connection = db) => {
        return connection.query('UPDATE paquetes SET estado = ? WHERE id = ?', [estado, id])
            .then(([result]) => result);
    },

    limpiarRelaciones: async (paqueteId, connection = db) => {
        await connection.query('DELETE FROM paquete_habitaciones WHERE paquete_id = ?', [paqueteId]);
        await connection.query('DELETE FROM paquete_servicios WHERE paquete_id = ?', [paqueteId]);
    },

    guardarHabitaciones: async (paqueteId, habitaciones = [], connection = db) => {
        if (!habitaciones.length) {
            return;
        }

        const values = habitaciones.map((item) => [
            paqueteId,
            Number(item.id || item),
            Math.max(1, Number(item.cantidad || 1))
        ]);
        await connection.query(
            `INSERT INTO paquete_habitaciones (paquete_id, habitacion_id, cantidad) VALUES ?
             ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad)`,
            [values]
        );
    },

    guardarServicios: async (paqueteId, servicios = [], connection = db) => {
        if (!servicios.length) {
            return;
        }

        const values = servicios.map((item) => [
            paqueteId,
            Number(item.id || item),
            Math.max(1, Number(item.cantidad || 1))
        ]);
        await connection.query(
            `INSERT INTO paquete_servicios (paquete_id, servicio_id, cantidad) VALUES ?
             ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad)`,
            [values]
        );
    },

    obtenerIdsRelacionados: async (paqueteId, connection = db) => {
        const [habitaciones] = await connection.query(
            'SELECT habitacion_id FROM paquete_habitaciones WHERE paquete_id = ?',
            [paqueteId]
        );
        const [servicios] = await connection.query(
            'SELECT servicio_id FROM paquete_servicios WHERE paquete_id = ?',
            [paqueteId]
        );

        return {
            habitaciones: habitaciones.map((item) => item.habitacion_id),
            servicios: servicios.map((item) => item.servicio_id)
        };
    },

    asegurarTablasRelacion: async (connection = db) => {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS paquete_habitaciones (
                paquete_id INT NOT NULL,
                habitacion_id INT NOT NULL,
                cantidad INT NOT NULL DEFAULT 1,
                PRIMARY KEY (paquete_id, habitacion_id),
                CONSTRAINT fk_paquete_habitaciones_paquete FOREIGN KEY (paquete_id) REFERENCES paquetes(id) ON DELETE CASCADE,
                CONSTRAINT fk_paquete_habitaciones_habitacion FOREIGN KEY (habitacion_id) REFERENCES habitaciones(id) ON DELETE CASCADE
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS paquete_servicios (
                paquete_id INT NOT NULL,
                servicio_id INT NOT NULL,
                cantidad INT NOT NULL DEFAULT 1,
                PRIMARY KEY (paquete_id, servicio_id),
                CONSTRAINT fk_paquete_servicios_paquete FOREIGN KEY (paquete_id) REFERENCES paquetes(id) ON DELETE CASCADE,
                CONSTRAINT fk_paquete_servicios_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE CASCADE
            )
        `);

        await connection.query('ALTER TABLE paquete_habitaciones ADD COLUMN IF NOT EXISTS cantidad INT NOT NULL DEFAULT 1');
        await connection.query('ALTER TABLE paquete_servicios ADD COLUMN IF NOT EXISTS cantidad INT NOT NULL DEFAULT 1');
    }
};

module.exports = PaquetesModel;
