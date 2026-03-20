const db = require("../config/db");

async function getAll() {
    const [rows] = await db.query("SELECT * FROM paquetes");
    return rows;
}

async function getById(id) {
    const [rows] = await db.query(
        "SELECT * FROM paquetes WHERE IDPaquete = ?", [id]
    );
    return rows[0];
}

async function create(data) {
    const [result] = await db.query(
        "INSERT INTO paquetes SET ?", data
    );
    return result;
}

async function update(id, data) {
    const [result] = await db.query(
        "UPDATE paquetes SET ? WHERE IDPaquete = ?", [data, id]
    );
    return result;
}

async function remove(id) {
    const [result] = await db.query(
        "DELETE FROM paquetes WHERE IDPaquete = ?", [id]
    );
    return result;
}

module.exports = { getAll, getById, create, update, remove };