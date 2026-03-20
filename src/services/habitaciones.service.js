const model = require("../models/habitaciones.model");

exports.listar = () => model.getAll();        // ✔ corregido
exports.crear = (data) => model.create(data);
exports.actualizar = (id, data) => model.update(id, data);
exports.eliminar = (id) => model.remove(id);