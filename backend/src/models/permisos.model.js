const db = require("../config/db");

// 🔹 Obtener todos
const obtener = () => {
  return db.query("SELECT * FROM permisos")
    .then(([rows]) => rows);
};

// 🔹 Obtener por ID
const obtenerPorId = (id) => {
  return db.query(
    "SELECT * FROM permisos WHERE IDPermiso = ?",
    [id]
  )
  .then(([rows]) => rows[0]);
};

// 🔹 Crear
const crear = (data) => {
  return db.query(
    `INSERT INTO permisos (NombrePermisos, EstadoPermisos, Descripcion, IsActive)
     VALUES (?, ?, ?, ?)`,
    [
      data.NombrePermisos,
      data.EstadoPermisos,
      data.Descripcion,
      data.IsActive
    ]
  )
  .then(([result]) => result);
};

// 🔹 Actualizar
const actualizar = (id, data) => {
  return db.query(
    `UPDATE permisos SET 
     NombrePermisos = ?, EstadoPermisos = ?, Descripcion = ?, IsActive = ?
     WHERE IDPermiso = ?`,
    [
      data.NombrePermisos,
      data.EstadoPermisos,
      data.Descripcion,
      data.IsActive,
      id
    ]
  )
  .then(([result]) => result);
};

// 🔹 Eliminar
const eliminar = (id) => {
  return db.query(
    "DELETE FROM permisos WHERE IDPermiso = ?",
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