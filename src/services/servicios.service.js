const ServiciosModel = require('../models/servicios.model');

const ESTADOS_VALIDOS = ['disponible', 'no_disponible', 'inactivo'];

function normalizarServicio(data = {}) {
    const nombre = String(data.nombre || '').trim();
    const descripcion = String(data.descripcion || '').trim();
    const precio = Number(data.precio);
    const estado = String(data.estado || 'disponible').trim().toLowerCase();

    if (!nombre) {
        throw new Error('El nombre es obligatorio');
    }

    if (Number.isNaN(precio) || precio < 0) {
        throw new Error('El precio debe ser un numero mayor o igual a 0');
    }

    if (!ESTADOS_VALIDOS.includes(estado)) {
        throw new Error(`El estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
    }

    return {
        nombre,
        descripcion,
        precio,
        estado
    };
}

const ServiciosService = {
    crearServicio: (data) => {
        try {
            const payload = normalizarServicio(data);
            return ServiciosModel.crear(payload);
        } catch (error) {
            return Promise.reject(error.message);
        }
    },

    obtenerServicios: () => ServiciosModel.listar(),

    obtenerServicio: (id) => {
        return ServiciosModel.obtenerPorId(id)
            .then((servicio) => {
                if (!servicio) return Promise.reject('Servicio no existe');
                return servicio;
            });
    },

    actualizarServicio: (id, data) => {
        let payload;

        try {
            payload = normalizarServicio(data);
        } catch (error) {
            return Promise.reject(error.message);
        }

        return ServiciosModel.obtenerPorId(id)
            .then((servicio) => {
                if (!servicio) return Promise.reject('Servicio no existe');
                return ServiciosModel.actualizar(id, payload);
            });
    },

    eliminarServicio: (id) => {
        return ServiciosModel.obtenerPorId(id)
            .then((servicio) => {
                if (!servicio) return Promise.reject('Servicio no existe');
                return ServiciosModel.eliminar(id);
            });
    },

    cambiarEstadoServicio: (id, estado) => {
        const nuevoEstado = String(estado || '').trim().toLowerCase();

        if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
            return Promise.reject(`El estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
        }

        return ServiciosModel.obtenerPorId(id)
            .then((servicio) => {
                if (!servicio) return Promise.reject('Servicio no existe');
                return ServiciosModel.cambiarEstado(id, nuevoEstado);
            });
    }
};

module.exports = ServiciosService;
