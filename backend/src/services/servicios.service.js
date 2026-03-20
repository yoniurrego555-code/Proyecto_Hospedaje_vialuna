const model = require("../models/servicios.model");

exports.listar = () => model.getAll();

exports.obtener = (id) => model.getById(id); // 🔥 aquí estaba el error

exports.crear = (data) => model.create(data);

exports.actualizar = (id, data) => model.update(id, data);

exports.eliminar = (id) => model.remove(id);