const model = require("../models/reservas.model");

exports.listar = () => model.obtener();
exports.obtener = (id) => model.obtenerPorId(id);
exports.crear = (data) => model.crear(data);
exports.actualizar = (id, data) => model.actualizar(id, data);
exports.eliminar = (id) => model.eliminar(id);
