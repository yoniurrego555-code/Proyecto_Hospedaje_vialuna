const service = require("../services/reservas.service");

// 🔹 Listar
exports.listar = (req, res) => {
  service.listar()
    .then(data => res.json(data))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Error al listar reservas" });
    });
};

// 🔹 Obtener por ID
exports.obtener = (req, res) => {
  service.obtener(req.params.id)
    .then(data => res.json(data))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Error al obtener reserva" });
    });
};

// 🔹 Crear (🔥 AQUÍ ESTÁ LA CLAVE)
exports.crear = (req, res) => {

  console.log("BODY RECIBIDO:", req.body); // 👈 DEBUG

  service.crear(req.body)
    .then(data => {
      res.json({
        mensaje: "Reserva creada correctamente",
        resultado: data
      });
    })
    .catch(err => {
      console.error("ERROR AL CREAR:", err);
      res.status(500).json({
        error: "Error al crear reserva",
        detalle: err
      });
    });
};

// 🔹 Actualizar
exports.actualizar = (req, res) => {
  service.actualizar(req.params.id, req.body)
    .then(() => res.json({ mensaje: "Actualizado" }))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Error al actualizar" });
    });
};

// 🔹 Eliminar
exports.eliminar = (req, res) => {
  service.eliminar(req.params.id)
    .then(() => res.json({ mensaje: "Eliminado" }))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Error al eliminar" });
    });
};