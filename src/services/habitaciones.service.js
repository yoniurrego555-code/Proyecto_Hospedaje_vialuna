const HabitacionesModel = require('../models/habitaciones.model');

const ESTADOS_VALIDOS = ['disponible', 'ocupada', 'reservada', 'mantenimiento', 'inactivo'];

function normalizarHabitacion(data = {}) {
    const nombre = String(data.nombre || '').trim();
    const descripcion = String(data.descripcion || '').trim();
    const precio = Number(data.precio);
    const capacidad = Number(data.capacidad);
    const estado = String(data.estado || 'disponible').trim().toLowerCase();

    if (!nombre) {
        throw new Error('El nombre es obligatorio');
    }

    if (Number.isNaN(precio) || precio <= 0) {
        throw new Error('El precio debe ser un numero mayor a 0');
    }

    if (!Number.isInteger(capacidad) || capacidad <= 0) {
        throw new Error('La capacidad debe ser un numero entero mayor a 0');
    }

    if (!ESTADOS_VALIDOS.includes(estado)) {
        throw new Error(`El estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
    }

    return {
        nombre,
        descripcion,
        precio,
        capacidad,
        estado
    };
}

const HabitacionesService = {
    crearHabitacion: (data) => {
        try {
            const payload = normalizarHabitacion(data);
            return HabitacionesModel.crear(payload);
        } catch (error) {
            return Promise.reject(error.message);
        }
    },

    obtenerHabitaciones: () => HabitacionesModel.listar(),

    obtenerHabitacion: (id) => {
        return HabitacionesModel.obtenerPorId(id)
            .then((habitacion) => {
                if (!habitacion) return Promise.reject('Habitacion no existe');
                return habitacion;
            });
    },

    actualizarHabitacion: (id, data) => {
        let payload;

        try {
            payload = normalizarHabitacion(data);
        } catch (error) {
            return Promise.reject(error.message);
        }

        return HabitacionesModel.obtenerPorId(id)
            .then((habitacion) => {
                if (!habitacion) return Promise.reject('Habitacion no existe');
                return HabitacionesModel.actualizar(id, payload);
            });
    },

    eliminarHabitacion: (id) => {
        return HabitacionesModel.obtenerPorId(id)
            .then((habitacion) => {
                if (!habitacion) return Promise.reject('Habitacion no existe');
                return HabitacionesModel.eliminar(id);
            });
    },

    reservarHabitacion: (id) => {
        return HabitacionesModel.obtenerPorId(id)
            .then((habitacion) => {
                if (!habitacion) return Promise.reject('Habitacion no existe');
                if (habitacion.estado === 'reservada') return Promise.reject('Habitacion ya reservada');
                return HabitacionesModel.reservar(id);
            });
    }
};

module.exports = HabitacionesService;
