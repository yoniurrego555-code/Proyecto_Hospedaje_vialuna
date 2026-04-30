const UsuariosModel = require('../models/usuarios.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secretKey = 'TU_SECRETO_SUPER_SEGURO';

const UsuariosService = {
    registrar: (data) => {
        return bcrypt.hash(data.password, 10)
            .then(hash => {
                data.password = hash;
                return UsuariosModel.crear(data);
            });
    },

    login: (email, password) => {
        return UsuariosModel.obtenerPorEmail(email)
            .then(user => {
                if (!user) return Promise.reject('Usuario no encontrado');

                return bcrypt.compare(password, user.password)
                    .then(match => {
                        if (!match) return Promise.reject('Contraseña incorrecta');

                        // Crear token
                        const token = jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn: '1h' });
                        return { token, user: { id: user.id, nombre: user.nombre, email: user.email } };
                    });
            });
    },

    listar: () => {
        return UsuariosModel.listar();
    },

    obtenerPorId: (id) => {
        return UsuariosModel.obtenerPorId(id);
    }
};

module.exports = UsuariosService;