const service = require("../services/reservas.service");
const db = require("../config/db");

// ==========================
// 🔹 LISTAR
// ==========================
exports.listar = (req, res) => {
  service.listar()
    .then(data => res.json(data))
    .catch(err => {
      console.error("❌ Error al listar:", err);
      res.status(500).json({ error: err.message });
    });
};

// ==========================
// 🔹 OBTENER POR ID
// ==========================
exports.obtener = (req, res) => {
  service.obtener(req.params.id)
    .then(data => res.json(data))
    .catch(err => {
      console.error("❌ Error al obtener:", err);
      res.status(500).json({ error: err.message });
    });
};

// ==========================
// 🔹 CREAR RESERVA
// ==========================
exports.crear = (req, res) => {

  console.log("📥 BODY RECIBIDO:", req.body);

  const { paquetes, servicios, ...reservaData } = req.body;

  // 🔥 VALIDACIONES
  if (!reservaData.id_habitacion) {
    return res.status(400).json({ error: "Falta habitación" });
  }

  if (!reservaData.fecha_inicio || !reservaData.fecha_fin) {
    return res.status(400).json({ error: "Fechas obligatorias" });
  }

  let habitacion;
  let idReserva;
  let subtotal = 0;
  let totalServicios = 0;
  let total = 0;

  // ==========================
  // 🔹 FLUJO
  // ==========================
  db.query(
    "SELECT * FROM habitacion WHERE IDHabitacion = ?",
    [reservaData.id_habitacion]
  )
    .then(([habitacionDB]) => {

      if (habitacionDB.length === 0) {
        throw new Error("Habitación no encontrada");
      }

      habitacion = habitacionDB[0];

      const inicio = new Date(reservaData.fecha_inicio);
      const fin = new Date(reservaData.fecha_fin);

      const dias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));

      if (dias <= 0) {
        throw new Error("Fechas inválidas");
      }

      subtotal = dias * habitacion.Costo;

      // 🔹 SERVICIOS
      if (servicios && servicios.length > 0) {

        const serviciosIds = servicios.map(s => parseInt(s));

        return db.query(
          `SELECT Costo FROM servicios 
           WHERE IDServicio IN (${serviciosIds.map(() => '?').join(',')})`,
          serviciosIds
        );
      }

      return [ [] ];
    })

    .then(([serviciosDB]) => {

      if (serviciosDB.length > 0) {
        totalServicios = serviciosDB.reduce(
          (acc, s) => acc + parseFloat(s.Costo), 0
        );
      }

      total = subtotal + totalServicios;

      reservaData.subtotal = subtotal;
      reservaData.total = total;

      // 🔥 IMPORTANTE: asegurar id_habitacion
      reservaData.id_habitacion = parseInt(reservaData.id_habitacion);

      return service.crear(reservaData);
    })

    .then(result => {

      idReserva = result.insertId;

      // 🔹 GUARDAR PAQUETES
      if (paquetes && paquetes.length > 0) {
        return Promise.all(
          paquetes.map(p =>
            db.query(
              `INSERT INTO detalledereservapaquetes 
               (id_reserva, IDPaquete, cantidad, sub_total) 
               VALUES (?, ?, 1, 0)`,
              [idReserva, p]
            )
          )
        );
      }

      return Promise.resolve();
    })

    .then(() => {

      // 🔹 GUARDAR SERVICIOS
      if (servicios && servicios.length > 0) {
        return Promise.all(
          servicios.map(s =>
            db.query(
              `INSERT INTO detallereservaservicio 
               (IDReserva, IDServicio, Cantidad, Precio) 
               VALUES (?, ?, 1, 0)`,
              [idReserva, s]
            )
          )
        );
      }

      return Promise.resolve();
    })

    .then(() => {

      res.json({
        mensaje: "Reserva creada correctamente ✅",
        idReserva,
        subtotal,
        total
      });

    })

    .catch(err => {
      console.error("❌ ERROR EN CREAR:", err);
      res.status(500).json({ error: err.message });
    });
};

// ==========================
// 🔹 ACTUALIZAR
// ==========================
exports.actualizar = (req, res) => {
  service.actualizar(req.params.id, req.body)
    .then(() => res.json({ mensaje: "Actualizado correctamente ✅" }))
    .catch(err => {
      console.error("❌ Error al actualizar:", err);
      res.status(500).json({ error: err.message });
    });
};

// ==========================
// 🔹 CANCELAR
// ==========================
exports.eliminar = (req, res) => {

  const idReserva = req.params.id;
  const idUsuario = req.headers["idusuario"] || req.body.idUsuario;

  if (!idUsuario) {
    return res.status(401).json({
      mensaje: "Usuario no identificado"
    });
  }

  service.eliminar(idReserva, idUsuario)
    .then(result => {

      if (result.affectedRows === 0) {
        return res.status(403).json({
          mensaje: "No puedes cancelar esta reserva"
        });
      }

      res.json({ mensaje: "Reserva cancelada correctamente ✅" });
    })
    .catch(err => {
      console.error("❌ Error al cancelar:", err);
      res.status(500).json({ error: err.message });
    });
};