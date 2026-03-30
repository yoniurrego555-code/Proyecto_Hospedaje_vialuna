const model = require("../models/reservas.model");

// 🔹 Listar
exports.listar = () => {
  return model.obtener();
};

// 🔹 Obtener por ID
exports.obtener = (id) => {
  return model.obtenerPorId(id);
};

// 🔹 Crear
exports.crear = (data) => {
  console.log("SERVICE RECIBE:", data); // 👈 DEBUG
  return model.crear(data);
};

// 🔹 Actualizar
exports.actualizar = (id, data) => {
  return model.actualizar(id, data);
};

// 🔹 Eliminar
exports.eliminar = (id) => {
  return model.eliminar(id);
};