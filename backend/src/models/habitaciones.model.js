const db = require("../config/db");

async function getAll() {
    const [rows] = await db.query("SELECT * FROM habitacion"); // ✔ corregido
    return rows;
}

async function create(data) {
    const [result] = await db.query("INSERT INTO habitacion SET ?", data);
    return result;
}

async function update(id, data) {
    const [result] = await db.query(
        "UPDATE habitacion SET ? WHERE IDHabitacion = ?", 
        [data, id]
    );
    return result;
}

async function remove(id) {
    const [result] = await db.query(
        "DELETE FROM habitacion WHERE IDHabitacion = ?", [id]
    );
    return result;
}

module.exports = { getAll, create, update, remove };