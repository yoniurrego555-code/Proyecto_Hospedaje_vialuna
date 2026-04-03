const db = require("../config/db");

// 🔹 Obtener todos
const obtener = () => {
  return db.query("SELECT * FROM roles")
    .then(([rows]) => rows);
};

// 🔹 Obtener por ID
const obtenerPorId = (id) => {
  return db.query(
    "SELECT * FROM roles WHERE IDRol = ?",
    [id]
  )
  .then(([rows]) => rows[0]);
};

// 🔹 Crear
const crear = (data) => {
  return db.query(
    `INSERT INTO roles (Nombre, Descripcion, Estado)
     VALUES (?, ?, ?)`,
    [
      data.Nombre,
      data.Descripcion,
      data.Estado
    ]
  )
  .then(([result]) => result);
};

// 🔹 Actualizar
const actualizar = (id, data) => {
  return db.query(
    `UPDATE roles SET 
     Nombre = ?, Descripcion = ?, Estado = ?
     WHERE IDRol = ?`,
    [
      data.Nombre,
      data.Descripcion,
      data.Estado,
      id
    ]
  )
  .then(([result]) => result);
};

// 🔹 Eliminar
const eliminar = (id) => {
  return db.query(
    "DELETE FROM roles WHERE IDRol = ?",
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