const db = require('../config/db');

const UsuariosCrudModel = {
    crear: (data) => {
        return db.query(
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
            [data.nombre, data.email, data.password, data.rol]
        ).then(([result]) => result);
    },

    listar: () => {
        return db.query(
            'SELECT id, nombre, email, rol, created_at FROM usuarios ORDER BY id DESC'
        ).then(([rows]) => rows);
    },

    obtenerPorId: (id) => {
        return db.query(
            'SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = ?',
            [id]
        ).then(([rows]) => rows[0]);
    },

    obtenerPorEmailConPassword: (email) => {
        return db.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        ).then(([rows]) => rows[0]);
    },

    existePorEmail: (email, excludeId = null) => {
        const sql = excludeId
            ? 'SELECT id FROM usuarios WHERE email = ? AND id <> ? LIMIT 1'
            : 'SELECT id FROM usuarios WHERE email = ? LIMIT 1';
        const params = excludeId ? [email, excludeId] : [email];

        return db.query(sql, params).then(([rows]) => rows[0]);
    },

    actualizar: (id, data) => {
        const fields = ['nombre = ?', 'email = ?', 'rol = ?'];
        const values = [data.nombre, data.email, data.rol];

        if (data.password) {
            fields.push('password = ?');
            values.push(data.password);
        }

        values.push(id);

        return db.query(
            `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`,
            values
        ).then(([result]) => result);
    },

    eliminar: (id) => {
        return db.query('DELETE FROM usuarios WHERE id = ?', [id])
            .then(([result]) => result);
    },

    cambiarRol: (id, rol) => {
        return db.query('UPDATE usuarios SET rol = ? WHERE id = ?', [rol, id])
            .then(([result]) => result);
    }
};

module.exports = UsuariosCrudModel;
