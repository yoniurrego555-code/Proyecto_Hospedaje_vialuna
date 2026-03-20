const db = require("../config/db");

async function getAll() {
    const [rows] = await db.query("SELECT * FROM usuarios");
    return rows;
}

async function create(data) {
    const [result] = await db.query("INSERT INTO usuarios SET ?", data);
    return result;
}

async function update(id, data) {
    const [result] = await db.query(
        "UPDATE usuarios SET ? WHERE IDUsuario = ?", 
        [data, id]
    );
    return result;
}

async function remove(id) {
    const [result] = await db.query(
        "DELETE FROM usuarios WHERE IDUsuario = ?", [id]
    );
    return result;
}

module.exports = { getAll, create, update, remove };