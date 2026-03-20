const db = require("../config/db");

async function getAll() {
    const [rows] = await db.query("SELECT * FROM permisos");
    return rows;
}

async function getById(id) {
    const [rows] = await db.query(
        "SELECT * FROM permisos WHERE IDPermiso = ?", [id]
    );
    return rows[0];
}

async function create(data) {
    const [result] = await db.query("INSERT INTO permisos SET ?", data);
    return result;
}

async function update(id, data) {
    const [result] = await db.query(
        "UPDATE permisos SET ? WHERE IDPermiso = ?", [data, id]
    );
    return result;
}

async function remove(id) {
    const [result] = await db.query(
        "DELETE FROM permisos WHERE IDPermiso = ?", [id]
    );
    return result;
}

module.exports = { getAll, getById, create, update, remove };