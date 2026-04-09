const model = require("../models/reservas.model");

// ==========================
// 🔹 LISTAR
// ==========================
exports.listar = () => {
  return model.obtener()
    .then(data => data)
    .catch(err => {
      console.error("❌ Error en listar:", err);
      throw err;
    });
};

// ==========================
// 🔹 OBTENER POR ID
// ==========================
exports.obtener = (id) => {
  return model.obtenerPorId(id)
    .then(data => data)
    .catch(err => {
      console.error("❌ Error en obtener:", err);
      throw err;
    });
};

// ==========================
// 🔹 CREAR
// ==========================
exports.crear = (data) => {

  console.log("📥 DATA RECIBIDA:", data);

  // 🔥 VALIDACIONES
  if (!data.id_cliente) throw new Error("Falta id_cliente");
  if (!data.nr_documento) throw new Error("Falta nr_documento");
  if (!data.fecha_inicio) throw new Error("Falta fecha_inicio");
  if (!data.fecha_fin) throw new Error("Falta fecha_fin");
  if (!data.id_metodo_pago) throw new Error("Falta metodo de pago");
  if (!data.id_habitacion) throw new Error("Falta habitacion");

  // 🔥 NORMALIZAR TIPOS
  data.id_cliente = parseInt(data.id_cliente);
  data.id_metodo_pago = parseInt(data.id_metodo_pago);
  data.id_habitacion = parseInt(data.id_habitacion);

  // 🔥 VALIDAR NÚMEROS
  data.subtotal = parseFloat(data.subtotal) || 0;
  data.total = parseFloat(data.total) || 0;

  console.log("✅ DATA LIMPIA:", data);

  return model.crear(data)
    .then(result => result)
    .catch(err => {
      console.error("❌ ERROR MYSQL:", err);
      throw err;
    });
};

// ==========================
// 🔹 ACTUALIZAR
// ==========================
exports.actualizar = (id, data) => {

  // 🔥 asegurar consistencia también aquí
  if (data.id_habitacion) {
    data.id_habitacion = parseInt(data.id_habitacion);
  }

  if (data.subtotal) {
    data.subtotal = parseFloat(data.subtotal);
  }

  if (data.total) {
    data.total = parseFloat(data.total);
  }

  return model.actualizar(id, data)
    .then(result => result)
    .catch(err => {
      console.error("❌ Error en actualizar:", err);
      throw err;
    });
};

// ==========================
// 🔹 CANCELAR
// ==========================
exports.eliminar = (id, idUsuario) => {
  return model.eliminar(id, idUsuario)
    .then(result => result)
    .catch(err => {
      console.error("❌ Error en cancelar:", err);
      throw err;
    });
};