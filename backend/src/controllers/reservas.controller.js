const service = require("../services/reservas.service");
const db = require("../config/db");

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

// 🔹 Crear (🔥 CON PROMESAS COMPLETO)
exports.crear = (req, res) => {

  console.log("📥 BODY RECIBIDO:", req.body);

  const { paquetes, servicios, ...reservaData } = req.body;

  // 🔹 1. Crear reserva
  service.crear(reservaData)
    .then(result => {

      const idReserva = result.insertId;
      console.log("🆔 ID RESERVA:", idReserva);

      // 🔹 2. Guardar paquetes
      let promesasPaquetes = [];

      if (paquetes && paquetes.length > 0) {
        promesasPaquetes = paquetes.map(p => {
          return db.query(
            `INSERT INTO detalledereservapaquetes 
            (id_reserva, IDPaquete, cantidad, sub_total) 
            VALUES (?, ?, 1, 0)`,
            [idReserva, p]
          );
        });
      }

      // 🔹 3. Guardar servicios
      let promesasServicios = [];

      if (servicios && servicios.length > 0) {
        promesasServicios = servicios.map(s => {
          return db.query(
            `INSERT INTO detallereservaservicio 
            (IDReserva, IDServicio, Cantidad, Precio, Estado) 
            VALUES (?, ?, 1, 0, 'activo')`,
            [idReserva, s]
          );
        });
      }

      // 🔥 4. Ejecutar TODO junto
      return Promise.all([
        ...promesasPaquetes,
        ...promesasServicios
      ])
      .then(() => {
        console.log("📦🛎️ Detalles guardados");

        res.json({
          mensaje: "Reserva completa creada ✅",
          idReserva: idReserva
        });
      });

    })
    .catch(err => {
      console.error("❌ ERROR:", err);
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