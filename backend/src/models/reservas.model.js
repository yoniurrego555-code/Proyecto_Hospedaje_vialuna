const db = require("../config/db");

const obtener = async () => {
    const [rows] = await db.query("SELECT * FROM reservas");
    return rows;
};

const obtenerPorId = async (id) => {
    const [rows] = await db.query(
        "SELECT * FROM reservas WHERE IDReserva = ?",
        [id]
    );
    return rows[0];
};

const crear = async (data) => {
    const [result] = await db.query(
        "INSERT INTO reservas SET ?",
        data
    );
    return result;
};

const actualizar = async (id, data) => {
    const [result] = await db.query(
        "UPDATE reservas SET ? WHERE IDReserva = ?",
        [data, id]
    );
    return result;
};

const eliminar = async (id) => {
    const [result] = await db.query(
        "DELETE FROM reservas WHERE IDReserva = ?",
        [id]
    );
    return result;
};

module.exports = { obtener, obtenerPorId, crear, actualizar, eliminar };

