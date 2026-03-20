const model = require("../models/detallereservaservicio.model");

exports.listar = async () => await model.obtener();
exports.obtener = async (id) => await model.obtenerPorId(id);
exports.crear = async (data) => await model.crear(data);
exports.actualizar = async (id, data) => await model.actualizar(id, data);
exports.eliminar = async (id) => await model.eliminar(id);