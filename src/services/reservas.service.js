const db = require('../config/db');
const bcrypt = require('bcrypt');
const ReservasModel = require('../models/reservas.model');
const DetalleReservasModel = require('../models/detalle_reservas.model');
const HabitacionesModel = require('../models/habitaciones.model');
const PaquetesModel = require('../models/paquetes.model');
const ServiciosModel = require('../models/servicios.model');
const UsuariosModel = require('../models/usuarios_crud.model');

const ESTADOS_RESERVA = ['pendiente', 'confirmada', 'cancelada'];

function normalizarReserva(data = {}) {
    const nombre_cliente = String(data.nombre_cliente || '').trim();
    const email = String(data.email || '').trim();
    const telefono = String(data.telefono || '').trim();
    const fecha_entrada = String(data.fecha_entrada || '').trim();
    const fecha_salida = String(data.fecha_salida || '').trim();
    const estado = String(data.estado || 'pendiente').trim().toLowerCase();

    if (!nombre_cliente) throw new Error('El nombre del cliente es obligatorio');
    if (!email) throw new Error('El correo es obligatorio');
    if (!telefono) throw new Error('El telefono es obligatorio');
    if (!fecha_entrada) throw new Error('La fecha de entrada es obligatoria');
    if (!fecha_salida) throw new Error('La fecha de salida es obligatoria');
    if (fecha_salida < fecha_entrada) throw new Error('La fecha de salida no puede ser menor que la fecha de entrada');
    if (!ESTADOS_RESERVA.includes(estado)) throw new Error(`El estado debe ser uno de: ${ESTADOS_RESERVA.join(', ')}`);

    return {
        nombre_cliente,
        email,
        telefono,
        fecha_entrada,
        fecha_salida,
        estado
    };
}

function normalizarItems(items = [], tipo) {
    return (Array.isArray(items) ? items : [])
        .map((item) => ({
            item_id: Number(item.id || item.item_id),
            cantidad: Math.max(1, Number(item.cantidad || 1)),
            tipo_item: tipo
        }))
        .filter((item) => Number.isInteger(item.item_id) && item.item_id > 0);
}

async function construirDetalles(payload, opciones = {}) {
    const detalles = [];
    const habitacionesPermitidas = opciones.habitacionesPermitidas || [];

    for (const item of normalizarItems(payload.habitaciones, 'habitacion')) {
        const habitacion = await HabitacionesModel.obtenerPorId(item.item_id);
        if (!habitacion) throw new Error(`La habitacion ${item.item_id} no existe`);
        if (habitacion.estado === 'reservada' && !habitacionesPermitidas.includes(habitacion.id)) {
            throw new Error(`La habitacion ${habitacion.nombre} ya esta reservada`);
        }

        detalles.push({
            tipo_item: 'habitacion',
            item_id: habitacion.id,
            nombre_item: habitacion.nombre,
            precio: Number(habitacion.precio),
            cantidad: 1,
            subtotal: Number(habitacion.precio),
            nombre_cliente: payload.nombre_cliente,
            email: payload.email,
            telefono: payload.telefono
        });
    }

    for (const item of normalizarItems(payload.paquetes, 'paquete')) {
        const paquete = await PaquetesModel.obtenerPorId(item.item_id);
        if (!paquete) throw new Error(`El paquete ${item.item_id} no existe`);
        if (paquete.estado === 'inactivo') throw new Error(`El paquete ${paquete.nombre} esta inactivo`);

        detalles.push({
            tipo_item: 'paquete',
            item_id: paquete.id,
            nombre_item: paquete.nombre,
            precio: Number(paquete.precio),
            cantidad: item.cantidad,
            subtotal: Number(paquete.precio) * item.cantidad,
            nombre_cliente: payload.nombre_cliente,
            email: payload.email,
            telefono: payload.telefono
        });
    }

    for (const item of normalizarItems(payload.servicios, 'servicio')) {
        const servicio = await ServiciosModel.obtenerPorId(item.item_id);
        if (!servicio) throw new Error(`El servicio ${item.item_id} no existe`);
        if (servicio.estado === 'inactivo') throw new Error(`El servicio ${servicio.nombre} esta inactivo`);

        detalles.push({
            tipo_item: 'servicio',
            item_id: servicio.id,
            nombre_item: servicio.nombre,
            precio: Number(servicio.precio),
            cantidad: item.cantidad,
            subtotal: Number(servicio.precio) * item.cantidad,
            nombre_cliente: payload.nombre_cliente,
            email: payload.email,
            telefono: payload.telefono
        });
    }

    if (!detalles.length) {
        throw new Error('Debes seleccionar al menos una habitacion, paquete o servicio');
    }

    return detalles;
}

async function resolverUsuario(payload) {
    if (payload.usuario_id) {
        const porId = await UsuariosModel.obtenerPorId(payload.usuario_id);
        if (porId) {
            return porId;
        }
    }

    const existente = await UsuariosModel.obtenerPorEmailConPassword(payload.email);

    if (existente) {
        return existente;
    }

    const creado = await UsuariosModel.crear({
        nombre: payload.nombre_cliente,
        email: payload.email,
        password: await bcrypt.hash('temporal123', 10),
        rol: 'usuario'
    });

    return UsuariosModel.obtenerPorId(creado.insertId);
}

async function actualizarEstadoHabitaciones(detallesAnteriores, detallesNuevos, connection) {
    const anteriores = detallesAnteriores.filter((item) => item.tipo_item === 'habitacion').map((item) => item.item_id);
    const nuevas = detallesNuevos.filter((item) => item.tipo_item === 'habitacion').map((item) => item.item_id);

    const liberar = anteriores.filter((id) => !nuevas.includes(id));
    const reservar = nuevas.filter((id) => !anteriores.includes(id));

    for (const id of liberar) {
        await connection.query('UPDATE habitaciones SET estado = ? WHERE id = ?', ['disponible', id]);
    }

    for (const id of reservar) {
        await connection.query('UPDATE habitaciones SET estado = ? WHERE id = ?', ['reservada', id]);
    }
}

async function mapearReservasConDetalles(reservas, connection = db) {
    if (!reservas.length) {
        return [];
    }

    const detalles = await DetalleReservasModel.listarPorReservas(reservas.map((reserva) => reserva.id), connection);
    const detallesValidos = detalles.filter((detalle) => detalle.tipo_item && detalle.item_id);

    return reservas.map((reserva) => ({
        ...reserva,
        detalles: detallesValidos.filter((detalle) => detalle.reserva_id === reserva.id)
    }));
}

const ReservasService = {
    listarReservas: async () => {
        const reservas = await ReservasModel.listar();
        return mapearReservasConDetalles(reservas);
    },

    obtenerReserva: async (id) => {
        const reserva = await ReservasModel.obtenerPorId(id);
        if (!reserva) {
            throw new Error('Reserva no existe');
        }

        const detalles = (await DetalleReservasModel.listarPorReserva(id))
            .filter((detalle) => detalle.tipo_item && detalle.item_id);
        return { ...reserva, detalles };
    },

    crearReserva: async (data) => {
        const reserva = normalizarReserva(data);
        const detalles = await construirDetalles(data);
        const usuario = await resolverUsuario(reserva);
        const total = detalles.reduce((sum, item) => sum + item.subtotal, 0);
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const result = await ReservasModel.crear({ ...reserva, usuario_id: usuario.id, total }, connection);
            const reservaId = result.insertId;

            await DetalleReservasModel.crearVarios(
                detalles.map((detalle) => ({ ...detalle, reserva_id: reservaId })),
                connection
            );

            await actualizarEstadoHabitaciones([], detalles, connection);
            await connection.commit();

            return ReservasService.obtenerReserva(reservaId);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    actualizarReserva: async (id, data) => {
        const reserva = normalizarReserva(data);
        const usuario = await resolverUsuario(reserva);
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const existente = await ReservasModel.obtenerPorId(id, connection);
            if (!existente) {
                throw new Error('Reserva no existe');
            }

            const detallesAnteriores = await DetalleReservasModel.listarPorReserva(id, connection);
            const habitacionesPermitidas = detallesAnteriores
                .filter((item) => item.tipo_item === 'habitacion')
                .map((item) => item.item_id);
            const detallesNuevos = await construirDetalles(data, { habitacionesPermitidas });
            const total = detallesNuevos.reduce((sum, item) => sum + item.subtotal, 0);

            await ReservasModel.actualizar(id, { ...reserva, usuario_id: usuario.id, total }, connection);
            await DetalleReservasModel.eliminarPorReserva(id, connection);
            await DetalleReservasModel.crearVarios(
                detallesNuevos.map((detalle) => ({ ...detalle, reserva_id: id })),
                connection
            );

            await actualizarEstadoHabitaciones(detallesAnteriores, detallesNuevos, connection);
            await connection.commit();

            return ReservasService.obtenerReserva(id);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    eliminarReserva: async (id) => {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const existente = await ReservasModel.obtenerPorId(id, connection);
            if (!existente) {
                throw new Error('Reserva no existe');
            }

            const detalles = await DetalleReservasModel.listarPorReserva(id, connection);
            await actualizarEstadoHabitaciones(detalles, [], connection);
            await DetalleReservasModel.eliminarPorReserva(id, connection);
            await ReservasModel.eliminar(id, connection);

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
};

module.exports = ReservasService;
