// src/models/estadosreserva.model.js
const db = require('../config/db');

const EstadosReserva = {
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM estadosreserva");
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query("SELECT * FROM estadosreserva WHERE IDEstadoReserva = ?", [id]);
    return rows[0];
  },

  create: async (data) => {
    const { NombreEstado } = data;
    const [result] = await db.query(
      "INSERT INTO estadosreserva (NombreEstado) VALUES (?)",
      [NombreEstado]
    );
    return { id: result.insertId, NombreEstado };
  },

  update: async (id, data) => {
    const { NombreEstado } = data;
    const [result] = await db.query(
      "UPDATE estadosreserva SET NombreEstado = ? WHERE IDEstadoReserva = ?",
      [NombreEstado, id]
    );
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.query(
      "DELETE FROM estadosreserva WHERE IDEstadoReserva = ?",
      [id]
    );
    return result.affectedRows;
  }
};

module.exports = EstadosReserva;