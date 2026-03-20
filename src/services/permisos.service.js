const model = require("../models/permisos.model");

exports.listar = () => model.getAll();

exports.obtener = (id) => model.getById(id);

exports.crear = (data) => model.create(data);

exports.actualizar = (id, data) => model.update(id, data);

exports.eliminar = (id) => model.remove(id);