const db = require("../config/db");

const obtener = async () => {
    const [rows] = await db.query("SELECT * FROM detalledereservapaquetes");
    return rows;
};

const obtenerPorId = async (id) => {
    const [rows] = await db.query(
        "SELECT * FROM detalledereservapaquetes WHERE IDDetalle = ?",
        [id]
    );
    return rows[0];
};

const crear = async (data) => {
    const [result] = await db.query(
        "INSERT INTO detalledereservapaquetes SET ?",
        data
    );
    return result;
};

const actualizar = async (id, data) => {
    const [result] = await db.query(
        "UPDATE detalledereservapaquetes SET ? WHERE IDDetalle = ?",
        [data, id]
    );
    return result;
};

const eliminar = async (id) => {
    const [result] = await db.query(
        "DELETE FROM detalledereservapaquetes WHERE IDDetalle = ?",
        [id]
    );
    return result;
};

module.exports = { obtener, obtenerPorId, crear, actualizar, eliminar };