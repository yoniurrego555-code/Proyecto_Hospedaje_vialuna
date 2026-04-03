const db = require("../config/db");

const obtener = () => {
  return db.query("SELECT * FROM habitacion")
    .then(([rows]) => rows);
};

const obtenerPorId = (id) => {
  return db.query(
    "SELECT * FROM habitacion WHERE IDHabitacion = ?",
    [id]
  )
  .then(([rows]) => rows[0]);
};

const crear = (data) => {
  return db.query(
    `INSERT INTO habitacion
    (NombreHabitacion, ImagenHabitacion, Descripcion, Costo, Estado)
    VALUES (?, ?, ?, ?, ?)`,
    [
      data.NombreHabitacion,
      data.ImagenHabitacion,
      data.Descripcion,
      data.Costo,
      data.Estado
    ]
  )
  .then(([result]) => result);
};

const actualizar = (id, data) => {
  return db.query(
    `UPDATE habitacion SET 
    NombreHabitacion = ?, ImagenHabitacion = ?, Descripcion = ?, Costo = ?, Estado = ?
    WHERE IDHabitacion = ?`,
    [
      data.NombreHabitacion,
      data.ImagenHabitacion,
      data.Descripcion,
      data.Costo,
      data.Estado,
      id
    ]
  )
  .then(([result]) => result);
};

const eliminar = (id) => {
  return db.query(
    "DELETE FROM habitacion WHERE IDHabitacion = ?",
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