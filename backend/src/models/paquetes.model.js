const db = require("../config/db");

// 🔹 Obtener todos los paquetes
const obtener = () => {
  return db.query("SELECT * FROM paquetes")
    .then(([rows]) => rows);
};

// 🔹 Obtener por ID
const obtenerPorId = (id) => {
  return db.query(
    "SELECT * FROM paquetes WHERE IDPaquete = ?",
    [id]
  )
  .then(([rows]) => {
    const paquete = rows[0];
    if (!paquete) return null;

    return db.query(
      "SELECT IDServicio, NombreServicio, Costo FROM servicios WHERE IDServicio = ?",
      [paquete.IDServicio]
    )
    .then(([servicios]) => {
      return {
        ...paquete,
        servicios: servicios || []
      };
    });
  });
};

// 🔹 Crear
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
  ).then(([result]) => result);
};

// 🔹 Actualizar
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
  ).then(([result]) => result);
};

// 🔹 Eliminar
const eliminar = (id) => {
  return db.query(
    "DELETE FROM paquetes WHERE IDPaquete = ?",
    [id]
  ).then(([result]) => result);
};

// 🔥 EXPORTAR (ESTO ES LO QUE TE FALTABA)
module.exports = {
  obtener,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};