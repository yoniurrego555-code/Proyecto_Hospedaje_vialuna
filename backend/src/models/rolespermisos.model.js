const db = require("../config/db");

const obtener = async () => {
    const [rows] = await db.query("SELECT * FROM rolespermisos");
    return rows;
};

const obtenerPorId = async (id) => {
    const [rows] = await db.query(
        "SELECT * FROM rolespermisos WHERE ID = ?",
        [id]
    );
    return rows[0];
};

const crear = async (data) => {
    const [result] = await db.query(
        "INSERT INTO rolespermisos SET ?",
        data
    );
    return result;
};

const actualizar = async (id, data) => {
    const [result] = await db.query(
        "UPDATE rolespermisos SET ? WHERE ID = ?",
        [data, id]
    );
    return result;
};

const eliminar = async (id) => {
    const [result] = await db.query(
        "DELETE FROM rolespermisos WHERE ID = ?",
        [id]
    );
    return result;
};

module.exports = { obtener, obtenerPorId, crear, actualizar, eliminar };