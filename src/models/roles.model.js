const db = require("../config/db");

// 🔹 LISTAR
async function getAll() {
    const [rows] = await db.query("SELECT * FROM roles");
    return rows;
}

// 🔹 OBTENER POR ID
async function getById(id) {
    const [rows] = await db.query(
        "SELECT * FROM roles WHERE IDRol = ?", [id]
    );
    return rows[0];
}

// 🔹 CREAR
async function create(data) {
    const [result] = await db.query(
        `INSERT INTO roles (Nombre, Descripcion, Estado)
        VALUES (?, ?, ?)`,
        [data.Nombre, data.Descripcion, data.Estado]
    );
    return result;
}

// 🔹 ACTUALIZAR
async function update(id, data) {
    const [result] = await db.query(
        `UPDATE roles 
        SET Nombre = ?, Descripcion = ?, Estado = ?
        WHERE IDRol = ?`,
        [data.Nombre, data.Descripcion, data.Estado, id]
    );
    return result;
}

// 🔹 ELIMINAR
async function remove(id) {
    const [result] = await db.query(
        "DELETE FROM roles WHERE IDRol = ?", [id]
    );
    return result;
}

module.exports = { getAll, getById, create, update, remove };