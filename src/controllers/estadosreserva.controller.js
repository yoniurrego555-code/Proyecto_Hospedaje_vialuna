// src/controllers/estadosreserva.controller.js
const EstadosReserva = require('../models/estadosreserva.model');

const EstadosReservaController = {
  getAll: async (req, res) => {
    try {
      const estados = await EstadosReserva.getAll();
      res.json(estados);
    } catch (err) {
      res.status(500).json({ mensaje: 'Error al obtener estados', error: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const id = req.params.id;
      const estado = await EstadosReserva.getById(id);
      if (!estado) {
        return res.status(404).json({ mensaje: 'Estado no encontrado' });
      }
      res.json(estado);
    } catch (err) {
      res.status(500).json({ mensaje: 'Error al obtener estado', error: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const data = req.body;
      const nuevoEstado = await EstadosReserva.create(data);
      res.status(201).json(nuevoEstado);
    } catch (err) {
      res.status(500).json({ mensaje: 'Error al crear estado', error: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const id = req.params.id;
      const data = req.body;
      const affectedRows = await EstadosReserva.update(id, data);
      if (affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Estado no encontrado' });
      }
      res.json({ mensaje: 'Estado actualizado correctamente' });
    } catch (err) {
      res.status(500).json({ mensaje: 'Error al actualizar estado', error: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      const id = req.params.id;
      const affectedRows = await EstadosReserva.delete(id);
      if (affectedRows === 0) {
        return res.status(404).json({ mensaje: 'Estado no encontrado' });
      }
      res.json({ mensaje: 'Estado eliminado correctamente' });
    } catch (err) {
      res.status(500).json({ mensaje: 'Error al eliminar estado', error: err.message });
    }
  }
};

module.exports = EstadosReservaController;