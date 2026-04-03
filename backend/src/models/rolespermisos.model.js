const db = require("../config/db");

// 🔹 Obtener todos
const obtener = () => {
  return db.query("SELECT * FROM rolespermisos")
    .then(([rows]) => rows);
};

// 🔹 Crear
const crear = (data) => {
  return db.query(
    `INSERT INTO rolespermisos (IDRol, IDPermiso)
     VALUES (?, ?)`,
    [
      data.IDRol,
      data.IDPermiso
    ]
  )
  .then(([result]) => result);
};

// 🔹 Eliminar
const eliminar = (id) => {
  return db.query(
    "DELETE FROM rolespermisos WHERE IDRolPermiso = ?",
    [id]
  )
  .then(([result]) => result);
};

module.exports = {
  obtener,
  crear,
  eliminar
};