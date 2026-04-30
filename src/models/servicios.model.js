const db = require('../config/db');

let schemaReady;

function asegurarEsquema() {
    if (!schemaReady) {
        schemaReady = (async () => {
            await db.query(`
                ALTER TABLE servicios
                MODIFY COLUMN estado VARCHAR(20) NOT NULL DEFAULT 'disponible'
            `);

            await db.query(`
                UPDATE servicios
                SET estado = CASE
                    WHEN estado IN ('disponible', 'no_disponible', 'inactivo') THEN estado
                    WHEN estado IN ('0', '1') THEN 'disponible'
                    ELSE 'disponible'
                END
            `);
        })();
    }

    return schemaReady;
}

const ServiciosModel = {
    listar: async () => {
        await asegurarEsquema();
        return db.query(
            'SELECT id, nombre, descripcion, precio, estado, created_at FROM servicios ORDER BY id DESC'
        ).then(([rows]) => rows);
    },

    obtenerPorId: async (id) => {
        await asegurarEsquema();
        return db.query(
            'SELECT id, nombre, descripcion, precio, estado, created_at FROM servicios WHERE id = ?',
            [id]
        ).then(([rows]) => rows[0]);
    },

    crear: async ({ nombre, descripcion, precio, estado }) => {
        await asegurarEsquema();
        return db.query(
            'INSERT INTO servicios (nombre, descripcion, precio, estado) VALUES (?, ?, ?, ?)',
            [nombre, descripcion, precio, estado]
        ).then(([result]) => result);
    },

    actualizar: async (id, { nombre, descripcion, precio, estado }) => {
        await asegurarEsquema();
        return db.query(
            'UPDATE servicios SET nombre = ?, descripcion = ?, precio = ?, estado = ? WHERE id = ?',
            [nombre, descripcion, precio, estado, id]
        ).then(([result]) => result);
    },

    eliminar: async (id) => {
        await asegurarEsquema();
        return db.query('DELETE FROM servicios WHERE id = ?', [id])
            .then(([result]) => result);
    },

    cambiarEstado: async (id, estado) => {
        await asegurarEsquema();
        return db.query('UPDATE servicios SET estado = ? WHERE id = ?', [estado, id])
            .then(([result]) => result);
    }
};

module.exports = ServiciosModel;
