const db = require("../config/db");

// LISTAR
const obtener = async () => {
    const [rows] = await db.query("SELECT * FROM detallereservaservicio");
    return rows;
};

// OBTENER POR ID
const obtenerPorId = async (id) => {
    const [rows] = await db.query(
        "SELECT * FROM detallereservaservicio WHERE IDDetalle = ?",
        [id]
    );
    return rows[0];
};

// CREAR
const crear = async (data) => {
    const [result] = await db.query(
        "INSERT INTO detallereservaservicio SET ?",
        data
    );
    return result;
};

// ACTUALIZAR
const actualizar = async (id, data) => {
    const [result] = await db.query(
        "UPDATE detallereservaservicio SET ? WHERE IDDetalle = ?",
        [data, id]
    );
    return result;
};

// ELIMINAR
const eliminar = async (id) => {
    const [result] = await db.query(
        "DELETE FROM detallereservaservicio WHERE IDDetalle = ?",
        [id]
    );
    return result;
};

module.exports = { obtener, obtenerPorId, crear, actualizar, eliminar };