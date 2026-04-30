const db = require('../config/db');
const PaquetesModel = require('../models/paquetes.model');
const HabitacionesModel = require('../models/habitaciones.model');
const ServiciosModel = require('../models/servicios.model');

const ESTADOS_VALIDOS = ['disponible', 'agotado', 'inactivo'];

function normalizarPaquete(data = {}) {
    const nombre = String(data.nombre || '').trim();
    const descripcion = String(data.descripcion || '').trim();
    const precio = Number(data.precio);
    const estado = String(data.estado || 'disponible').trim().toLowerCase();

    if (!nombre) {
        throw new Error('El nombre es obligatorio');
    }

    if (Number.isNaN(precio) || precio <= 0) {
        throw new Error('El precio debe ser un numero mayor a 0');
    }

    if (!ESTADOS_VALIDOS.includes(estado)) {
        throw new Error(`El estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
    }

    const normalizarRelacion = (items) => {
        const acumulado = new Map();

        (Array.isArray(items) ? items : []).forEach((item) => {
            const id = Number(item.id || item);
            const cantidad = Math.max(1, Number(item.cantidad || 1));

            if (!Number.isInteger(id) || id <= 0) {
                return;
            }

            const actual = acumulado.get(id) || 0;
            acumulado.set(id, actual + cantidad);
        });

        return Array.from(acumulado.entries()).map(([id, cantidad]) => ({ id, cantidad }));
    };

    const habitaciones = normalizarRelacion(data.habitaciones);
    const servicios = normalizarRelacion(data.servicios);

    if (habitaciones.length > 1) {
        throw new Error('Solo puedes asociar una habitacion por paquete');
    }

    return {
        nombre,
        descripcion,
        precio,
        estado,
        habitaciones,
        servicios
    };
}

async function validarRelaciones(payload) {
    for (const habitacionId of payload.habitaciones) {
        const habitacion = await HabitacionesModel.obtenerPorId(habitacionId.id);
        if (!habitacion) {
            throw new Error(`La habitacion ${habitacionId.id} no existe`);
        }
    }

    for (const servicioId of payload.servicios) {
        const servicio = await ServiciosModel.obtenerPorId(servicioId.id);
        if (!servicio) {
            throw new Error(`El servicio ${servicioId.id} no existe`);
        }
    }
}

const PaquetesService = {
    listar: async () => {
        await PaquetesModel.asegurarTablasRelacion();
        return PaquetesModel.listarConRelaciones();
    },

    obtenerPorId: (id) => {
        return PaquetesModel.asegurarTablasRelacion()
            .then(() => PaquetesModel.obtenerPorId(id))
            .then((paquete) => {
                if (!paquete) return Promise.reject('Paquete no existe');
                return paquete;
            });
    },

    crear: async (data) => {
        let payload;

        try {
            payload = normalizarPaquete(data);
            await validarRelaciones(payload);
        } catch (error) {
            return Promise.reject(error.message);
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();
            await PaquetesModel.asegurarTablasRelacion(connection);
            const result = await PaquetesModel.crear(payload, connection);
            await PaquetesModel.guardarHabitaciones(result.insertId, payload.habitaciones, connection);
            await PaquetesModel.guardarServicios(result.insertId, payload.servicios, connection);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    actualizar: async (id, data) => {
        let payload;

        try {
            payload = normalizarPaquete(data);
            await validarRelaciones(payload);
        } catch (error) {
            return Promise.reject(error.message);
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();
            await PaquetesModel.asegurarTablasRelacion(connection);
            const paquete = await PaquetesModel.obtenerPorId(id, connection);
            if (!paquete) {
                throw new Error('Paquete no existe');
            }

            await PaquetesModel.actualizar(id, payload, connection);
            await PaquetesModel.limpiarRelaciones(id, connection);
            await PaquetesModel.guardarHabitaciones(id, payload.habitaciones, connection);
            await PaquetesModel.guardarServicios(id, payload.servicios, connection);
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            return Promise.reject(error.message || error);
        } finally {
            connection.release();
        }
    },

    eliminar: (id) => {
        return PaquetesModel.asegurarTablasRelacion()
            .then(() => PaquetesModel.obtenerPorId(id))
            .then((paquete) => {
                if (!paquete) return Promise.reject('Paquete no existe');
                return PaquetesModel.eliminar(id);
            });
    },

    cambiarEstado: (id, estado) => {
        const nuevoEstado = String(estado || '').trim().toLowerCase();

        if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
            return Promise.reject(`El estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
        }

        return PaquetesModel.asegurarTablasRelacion()
            .then(() => PaquetesModel.obtenerPorId(id))
            .then((paquete) => {
                if (!paquete) return Promise.reject('Paquete no existe');
                return PaquetesModel.cambiarEstado(id, nuevoEstado);
            });
    }
};

module.exports = PaquetesService;
