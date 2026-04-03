const db = require("../config/db");

const obtener = () => {
  return db.query("SELECT * FROM paquetes")
    .then(([rows]) => rows);
};

const obtenerPorId = (id) => {
  return db.query(
    "SELECT * FROM paquetes WHERE IDPaquete = ?",
    [id]
  )
  .then(([rows]) => rows[0]);
};

const crear = (data) => {
  return db.query(
    `INSERT INTO paquetes 
    (NombrePaquete, ImagenPaquete, Descripcion, IDHabitacion, IDServicio, Precio, Estado)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.NombrePaquete,
      data.ImagenPaquete,
      data.Descripcion,
      data.IDHabitacion,
      data.IDServicio,
      data.Precio,
      data.Estado
    ]
  )
  .then(([result]) => result);
};

const actualizar = (id, data) => {
  return db.query(
    `UPDATE paquetes SET 
    NombrePaquete = ?, ImagenPaquete = ?, Descripcion = ?, IDHabitacion = ?, IDServicio = ?, Precio = ?, Estado = ?
    WHERE IDPaquete = ?`,
    [
      data.NombrePaquete,
      data.ImagenPaquete,
      data.Descripcion,
      data.IDHabitacion,
      data.IDServicio,
      data.Precio,
      data.Estado,
      id
    ]
  )
  .then(([result]) => result);
};

const eliminar = (id) => {
  return db.query(
    "DELETE FROM paquetes WHERE IDPaquete = ?",
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