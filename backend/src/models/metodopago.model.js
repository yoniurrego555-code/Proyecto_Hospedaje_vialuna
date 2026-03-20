const db = require("../config/db");

async function getAll() {
    const [rows] = await db.query("SELECT * FROM metodopago");
    return rows;
}

async function getById(id) {
    const [rows] = await db.query(
        "SELECT * FROM metodopago WHERE ID idMetodoPago = ?", [id]
    );
    return rows[0];
}

async function create(data) {
    const [result] = await db.query(
        "INSERT INTO metodopago SET ?", data
    );
    return result;
}

async function update(id, data) {
    const [result] = await db.query(
        "UPDATE metodopago SET ? WHERE ID idMetodoPago = ?", [data, id]
    );
    return result;
}

async function remove(id) {
    const [result] = await db.query(
        "DELETE FROM metodopago WHERE ID idMetodoPago = ?", [id]
    );
    return result;
}

module.exports = { getAll, getById, create, update, remove };