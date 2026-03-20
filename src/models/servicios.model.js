const db = require("../config/db");

async function getAll() {
    const [rows] = await db.query("SELECT * FROM servicios");
    return rows;
}

async function getById(id) {
    const [rows] = await db.query(
        "SELECT * FROM servicios WHERE IDServicio = ?", [id]
    );
    return rows[0];
}

async function create(data) {
    const [result] = await db.query(
        "INSERT INTO servicios SET ?", data
    );
    return result;
}

async function update(id, data) {
    const [result] = await db.query(
        "UPDATE servicios SET ? WHERE IDServicio = ?", [data, id]
    );
    return result;
}

async function remove(id) {
    const [result] = await db.query(
        "DELETE FROM servicios WHERE IDServicio = ?", [id]
    );
    return result;
}

module.exports = { getAll, getById, create, update, remove };