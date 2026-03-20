const db = require("../config/db");

// LISTAR
async function getAll() {
    const [rows] = await db.query("SELECT * FROM clientes");
    return rows;
}

// BUSCAR POR ID
async function getById(id) {
    const [rows] = await db.query(
        "SELECT * FROM clientes WHERE NroDocumento = ?", [id]
    );
    return rows[0];
}

// CREAR
async function create(cliente) {
    const { NroDocumento, Nombre, Apellido, Direccion, Email, Telefono, Estado, IDRol } = cliente;

    const [result] = await db.query(
        "INSERT INTO clientes SET ?", 
        { NroDocumento, Nombre, Apellido, Direccion, Email, Telefono, Estado, IDRol }
    );

    return result;
}

// ACTUALIZAR
async function update(id, cliente) {
    const [result] = await db.query(
        "UPDATE clientes SET ? WHERE NroDocumento = ?", 
        [cliente, id]
    );
    return result;
}

// ELIMINAR
async function remove(id) {
    const [result] = await db.query(
        "DELETE FROM clientes WHERE NroDocumento = ?", [id]
    );
    return result;
}

module.exports = { getAll, getById, create, update, remove };