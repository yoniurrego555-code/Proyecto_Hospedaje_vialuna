const db = require('../config/db');

const UsuariosModel = {

    crear: (data) => {
        return db.query(
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
            [data.nombre, data.email, data.password, 'cliente']
        ).then(result => result[0]);
    },

    obtenerPorEmail: (email) => {
        return db.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        ).then(result => result[0][0]);
    }

};

module.exports = UsuariosModel;

