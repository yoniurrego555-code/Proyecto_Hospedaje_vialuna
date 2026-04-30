const db = require('../config/db');

let schemaReady;

function asegurarEsquema() {
    if (!schemaReady) {
        schemaReady = (async () => {
            await db.query(`
                ALTER TABLE habitaciones
                MODIFY COLUMN estado VARCHAR(20) NOT NULL DEFAULT 'disponible'
            `);

            await db.query(`
                UPDATE habitaciones
                SET estado = CASE
                    WHEN estado IN ('disponible', 'reservada', 'ocupada', 'mantenimiento', 'inactivo') THEN estado
                    WHEN estado IN ('0', '1') THEN 'disponible'
                    ELSE 'disponible'
                END
            `);
        })();
    }

    return schemaReady;
}

const HabitacionesModel = {

    listar: async () => {
        await asegurarEsquema();
        return db.query('SELECT id, nombre, descripcion, precio, capacidad, estado, created_at FROM habitaciones')
            .then(([rows]) => rows);
    },

    obtenerPorId: async (id) => {
        await asegurarEsquema();
        return db.query('SELECT id, nombre, descripcion, precio, capacidad, estado, created_at FROM habitaciones WHERE id = ?', [id])
            .then(([rows]) => rows[0]);
    },

    crear: async (data) => {
        await asegurarEsquema();
        const sql = 'INSERT INTO habitaciones (nombre, descripcion, precio, capacidad, estado) VALUES (?, ?, ?, ?, ?)';
        const params = [data.nombre, data.descripcion, data.precio, data.capacidad || 1, data.estado || 'disponible'];
        return db.query(sql, params).then(([result]) => result);
    },

    actualizar: async (id, data) => {
        await asegurarEsquema();
        const sql = 'UPDATE habitaciones SET nombre = ?, descripcion = ?, precio = ?, capacidad = ?, estado = ? WHERE id = ?';
        const params = [data.nombre, data.descripcion, data.precio, data.capacidad || 1, data.estado || 'disponible', id];
        return db.query(sql, params).then(([result]) => result);
    },

    eliminar: async (id) => {
        await asegurarEsquema();
        return db.query('DELETE FROM habitaciones WHERE id = ?', [id])
            .then(([result]) => result);
    },

    reservar: async (id) => {
        await asegurarEsquema();
        return db.query('UPDATE habitaciones SET estado = ? WHERE id = ?', ['reservada', id])
            .then(([result]) => result);
    }

};

module.exports = HabitacionesModel;
