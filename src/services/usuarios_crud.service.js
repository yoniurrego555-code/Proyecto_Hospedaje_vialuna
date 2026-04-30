const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsuariosModel = require('../models/usuarios_crud.model');

const secretKey = 'TU_SECRETO_SUPER_SEGURO';
const ROLES_VALIDOS = ['admin', 'usuario'];

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizarUsuario(data = {}, { requierePassword = true } = {}) {
    const nombre = String(data.nombre || '').trim();
    const email = String(data.email || '').trim().toLowerCase();
    const rol = String(data.rol || 'usuario').trim().toLowerCase();
    const password = data.password == null ? '' : String(data.password).trim();

    if (!nombre) {
        throw new Error('El nombre es obligatorio');
    }

    if (!email || !validarEmail(email)) {
        throw new Error('Debes ingresar un email valido');
    }

    if (!ROLES_VALIDOS.includes(rol)) {
        throw new Error(`El rol debe ser uno de: ${ROLES_VALIDOS.join(', ')}`);
    }

    if (requierePassword && password.length < 6) {
        throw new Error('La contrasena debe tener al menos 6 caracteres');
    }

    if (!requierePassword && password && password.length < 6) {
        throw new Error('La contrasena debe tener al menos 6 caracteres');
    }

    return { nombre, email, rol, password };
}

const UsuariosCrudService = {
    registrar: async (data) => {
        let payload;

        try {
            payload = normalizarUsuario(data, { requierePassword: true });
        } catch (error) {
            return Promise.reject(error.message);
        }

        const existe = await UsuariosModel.existePorEmail(payload.email);
        if (existe) {
            return Promise.reject('Ya existe un usuario con ese email');
        }

        payload.password = await bcrypt.hash(payload.password, 10);
        return UsuariosModel.crear(payload);
    },

    login: async (email, password) => {
        const user = await UsuariosModel.obtenerPorEmailConPassword(String(email || '').trim().toLowerCase());

        if (!user) {
            return Promise.reject('Usuario no encontrado');
        }

        const coincide = await bcrypt.compare(String(password || ''), user.password);
        if (!coincide) {
            return Promise.reject('Contrasena incorrecta');
        }

        const token = jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn: '1h' });

        return {
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            }
        };
    },

    listar: () => UsuariosModel.listar(),

    obtenerPorId: async (id) => {
        const usuario = await UsuariosModel.obtenerPorId(id);
        if (!usuario) {
            return Promise.reject('Usuario no encontrado');
        }

        return usuario;
    },

    actualizar: async (id, data) => {
        let payload;

        try {
            payload = normalizarUsuario(data, { requierePassword: false });
        } catch (error) {
            return Promise.reject(error.message);
        }

        const usuario = await UsuariosModel.obtenerPorId(id);
        if (!usuario) {
            return Promise.reject('Usuario no encontrado');
        }

        const emailEnUso = await UsuariosModel.existePorEmail(payload.email, id);
        if (emailEnUso) {
            return Promise.reject('Ya existe un usuario con ese email');
        }

        if (payload.password) {
            payload.password = await bcrypt.hash(payload.password, 10);
        } else {
            delete payload.password;
        }

        return UsuariosModel.actualizar(id, payload);
    },

    eliminar: async (id) => {
        const usuario = await UsuariosModel.obtenerPorId(id);
        if (!usuario) {
            return Promise.reject('Usuario no encontrado');
        }

        return UsuariosModel.eliminar(id);
    },

    cambiarRol: async (id, rol) => {
        const nuevoRol = String(rol || '').trim().toLowerCase();

        if (!ROLES_VALIDOS.includes(nuevoRol)) {
            return Promise.reject(`El rol debe ser uno de: ${ROLES_VALIDOS.join(', ')}`);
        }

        const usuario = await UsuariosModel.obtenerPorId(id);
        if (!usuario) {
            return Promise.reject('Usuario no encontrado');
        }

        return UsuariosModel.cambiarRol(id, nuevoRol);
    }
};

module.exports = UsuariosCrudService;
