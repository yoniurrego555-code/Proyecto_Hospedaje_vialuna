const db = require("../config/db");

// 🔹 Obtener todas las reservas
const obtener = () => {
  return db.query("SELECT * FROM reservas")
    .then(([rows]) => rows);
};

// 🔹 Obtener por ID
const obtenerPorId = (id) => {
return db.query(
    "SELECT * FROM reservas WHERE id_reserva = ?",
    [id]
)
.then(([rows]) => rows[0]);
};

// 🔹 Crear reserva (🔥 IMPORTANTE)
const crear = (data) => {
return db.query(
    `INSERT INTO reservas 
    (id_cliente, nr_documento, fecha_reserva, fecha_inicio, fecha_fin, id_estado_reserva, metodo_pago)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
    data.id_cliente,
    data.nr_documento,
    data.fecha_reserva,
    data.fecha_inicio,
    data.fecha_fin,
    data.id_estado_reserva,
    data.metodo_pago
    ]
)
.then(([result]) => result);
};

// 🔹 Actualizar reserva
const actualizar = (id, data) => {
return db.query(
    `UPDATE reservas SET 
    id_cliente = ?,
    nr_documento = ?,
    fecha_reserva = ?,
    fecha_inicio = ?,
    fecha_fin = ?,
    id_estado_reserva = ?,
    metodo_pago = ?
    WHERE id_reserva = ?`,
    [
    data.id_cliente,
    data.nr_documento,
    data.fecha_reserva,
    data.fecha_inicio,
    data.fecha_fin,
    data.id_estado_reserva,
    data.metodo_pago,
    id
    ]
)
.then(([result]) => result);
};

// 🔹 Eliminar reserva
const eliminar = (id) => {
return db.query(
    "DELETE FROM reservas WHERE id_reserva = ?",
    [id]
)
.then(([result]) => result);
};

module.exports = {
obtener,
obtenerPorId,
crear,
actualizar,
eliminar
};