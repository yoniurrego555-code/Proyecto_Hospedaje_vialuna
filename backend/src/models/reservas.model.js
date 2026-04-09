const db = require("../config/db");

// 🔹 Obtener todas las reservas (con habitación)
const obtener = () => {
  return db.query(`
    SELECT r.*, h.NombreHabitacion
    FROM reservas r
    LEFT JOIN habitacion h 
    ON r.id_habitacion = h.IDHabitacion
  `)
  .then(([rows]) => rows)
  .catch(err => {
    console.error("❌ Error al obtener reservas:", err);
    throw err;
  });
};

// 🔹 Obtener por ID
const obtenerPorId = (id) => {
  return db.query(`
    SELECT r.*, h.NombreHabitacion
    FROM reservas r
    LEFT JOIN habitacion h 
    ON r.id_habitacion = h.IDHabitacion
    WHERE r.id_reserva = ?
  `, [id])
  .then(([rows]) => rows[0])
  .catch(err => {
    console.error("❌ Error al obtener reserva:", err);
    throw err;
  });
};

// 🔹 Crear reserva
const crear = (data) => {
  return db.query(`
    INSERT INTO reservas (
      id_cliente,
      nr_documento,
      fecha_reserva,
      fecha_inicio,
      fecha_fin,
      id_estado_reserva,
      id_metodo_pago,
      id_habitacion,
      subtotal,
      total
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.id_cliente,
    data.nr_documento,
    data.fecha_reserva,
    data.fecha_inicio,
    data.fecha_fin,
    data.id_estado_reserva,
    data.id_metodo_pago,
    data.id_habitacion, // ✅ correcto
    data.subtotal,
    data.total
  ])
  .then(([result]) => result)
  .catch(err => {
    console.error("❌ Error al crear reserva:", err);
    throw err;
  });
};

// 🔹 Actualizar reserva (🔥 CORREGIDO)
const actualizar = (id, data) => {
  return db.query(`
    UPDATE reservas SET 
      id_cliente = ?,
      nr_documento = ?,
      fecha_reserva = ?,
      fecha_inicio = ?,
      fecha_fin = ?,
      id_estado_reserva = ?,
      id_metodo_pago = ?,
      id_habitacion = ?,   -- ✅ CORREGIDO
      subtotal = ?,
      total = ?
    WHERE id_reserva = ?
  `, [
    data.id_cliente,
    data.nr_documento,
    data.fecha_reserva,
    data.fecha_inicio,
    data.fecha_fin,
    data.id_estado_reserva,
    data.id_metodo_pago,
    data.id_habitacion, // ✅ CORREGIDO
    data.subtotal,
    data.total,
    id
  ])
  .then(([result]) => result)
  .catch(err => {
    console.error("❌ Error al actualizar reserva:", err);
    throw err;
  });
};

// 🔹 Cancelar reserva
const eliminar = (id, idUsuario) => {
  return db.query(`
    UPDATE reservas 
    SET id_estado_reserva = 2 
    WHERE id_reserva = ? AND id_cliente = ?
  `, [id, idUsuario])
  .then(([result]) => result)
  .catch(err => {
    console.error("❌ Error al cancelar reserva:", err);
    throw err;
  });
};

module.exports = {
  obtener,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};