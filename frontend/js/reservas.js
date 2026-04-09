console.log("📦 reservas.js cargado");

// 🔐 Validar usuario
const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) window.location.href = "../public/login.html";

// ==========================
// 🔹 CARGAR HABITACIONES
// ==========================
function cargarHabitaciones() {
  fetch("http://localhost:3000/api/habitacion")
    .then(res => {
      if (!res.ok) throw new Error("No se pudieron cargar las habitaciones");
      return res.json();
    })
    .then(data => {
      let html = "";
      data.forEach(h => {
        html += `
          <div class="card">
            <h3>${h.NombreHabitacion}</h3>
            <p>${h.Descripcion}</p>
            <strong>$${h.Costo}</strong>
            <button onclick="seleccionarHabitacion(${h.IDHabitacion}, '${h.NombreHabitacion}', '${h.Descripcion}', ${h.Costo})">
              Seleccionar
            </button>
          </div>
        `;
      });
      document.getElementById("listaHabitaciones").innerHTML = html;
    })
    .catch(err => console.error("Error habitaciones:", err));
}

// ==========================
// 🔹 SELECCIONAR HABITACIÓN
// ==========================
window.seleccionarHabitacion = function(id, nombre, descripcion, costo) {
  document.getElementById("idHabitacion").value = id;
  document.getElementById("habitacionSeleccionada").value = nombre;
  document.getElementById("descripcionHabitacion").innerText = descripcion;
  document.getElementById("costoHabitacion").value = costo;

  calcularTotal();
};

// ==========================
// 🔹 CARGAR PAQUETES
// ==========================
function cargarPaquetes() {
  fetch("http://localhost:3000/api/paquetes")
    .then(res => {
      if (!res.ok) throw new Error("No se pudieron cargar los paquetes");
      return res.json();
    })
    .then(data => {
      const select = document.getElementById("paquetes");
      select.innerHTML = `<option value="">Sin paquete</option>`;
      data.forEach(p => {
        select.innerHTML += `
          <option 
            value="${p.IDPaquete}" 
            data-precio="${p.Precio}" 
            data-desc="${p.Descripcion}">
            ${p.NombrePaquete} - $${p.Precio}
          </option>
        `;
      });
    })
    .catch(err => console.error("Error paquetes:", err));
}

// ==========================
// 🔹 CARGAR SERVICIOS
// ==========================
function cargarServicios() {
  fetch("http://localhost:3000/api/servicios")
    .then(res => {
      if (!res.ok) throw new Error("No se pudieron cargar los servicios");
      return res.json();
    })
    .then(data => {
      let html = "";
      data.forEach(s => {
        html += `
          <div class="servicio-item" data-id="${s.IDServicio}">
            ${s.NombreServicio} <br>
            <small>$${s.Costo}</small>
          </div>
        `;
      });
      document.getElementById("serviciosContainer").innerHTML = html;

      document.querySelectorAll(".servicio-item").forEach(item => {
        item.addEventListener("click", () => {
          const container = document.getElementById("serviciosContainer");
          if (container.classList.contains("bloqueado")) return;
          item.classList.toggle("active");
          calcularTotal();
        });
      });
    })
    .catch(err => console.error("Error servicios:", err));
}

// ==========================
// 🔹 EVENTO PAQUETE
// ==========================
document.getElementById("paquetes").addEventListener("change", function() {
  const paqueteId = this.value;
  const container = document.getElementById("serviciosContainer");

  const selected = this.options[this.selectedIndex];
  const desc = selected.dataset.desc || "";
  document.getElementById("descripcionPaquete").innerText = desc;

  if (!paqueteId) {
    container.classList.remove("bloqueado");
    document.querySelectorAll(".servicio-item").forEach(el => el.classList.remove("active"));
    calcularTotal();
    return;
  }

  fetch(`http://localhost:3000/api/paquetes/${paqueteId}`)
    .then(res => {
      if (!res.ok) throw new Error("Error paquete");
      return res.json();
    })
    .then(paquete => {
      document.querySelectorAll(".servicio-item").forEach(el => {
        el.classList.remove("active");
        if (paquete.servicios && paquete.servicios.length) {
          paquete.servicios.forEach(s => {
            if (el.dataset.id == s.IDServicio) el.classList.add("active");
          });
        }
      });
      container.classList.add("bloqueado");
      calcularTotal();
    })
    .catch(err => console.error("Error paquete:", err));
});

// ==========================
// 🔹 CALCULAR TOTAL
// ==========================
function calcularTotal() {
  const costoHabitacion = parseFloat(document.getElementById("costoHabitacion").value || 0);
  const inicio = document.getElementById("fechaInicio").value;
  const fin = document.getElementById("fechaFin").value;
  if (!inicio || !fin) return;

  const dias = (new Date(fin) - new Date(inicio)) / (1000 * 60 * 60 * 24);
  if (dias <= 0) return;

  let subtotal = dias * costoHabitacion;

  const paqueteSelect = document.getElementById("paquetes");
  const paquetePrecio = parseFloat(paqueteSelect.options[paqueteSelect.selectedIndex]?.dataset.precio || 0);

  let serviciosPrecio = Array.from(document.querySelectorAll(".servicio-item.active"))
    .reduce((sum, el) => sum + parseFloat(el.querySelector("small").innerText.replace("$", "")), 0);

  const total = subtotal + paquetePrecio + serviciosPrecio;

  document.getElementById("subtotal").innerText = `$${subtotal}`;
  document.getElementById("total").innerText = `$${total}`;
}

document.getElementById("fechaInicio").addEventListener("change", calcularTotal);
document.getElementById("fechaFin").addEventListener("change", calcularTotal);

// ==========================
// 🔹 CREAR RESERVA
// ==========================
document.getElementById("reservaForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const paquetes = document.getElementById("paquetes").value
    ? [parseInt(document.getElementById("paquetes").value)]
    : [];

  const servicios = Array.from(document.querySelectorAll(".servicio-item.active"))
    .map(el => parseInt(el.dataset.id));

  const data = {
    id_cliente: parseInt(usuario.NroDocumento), // ⚠️ revisar si es ID real
    nr_documento: document.getElementById("documento").value,
    fecha_reserva: new Date().toISOString().split("T")[0],
    fecha_inicio: document.getElementById("fechaInicio").value,
    fecha_fin: document.getElementById("fechaFin").value,
    id_estado_reserva: 1,
    id_metodo_pago: parseInt(document.getElementById("metodoPago").value),
    id_habitacion: parseInt(document.getElementById("idHabitacion").value),
    paquetes,
    servicios
  };

  if (!data.id_habitacion) return alert("Selecciona una habitación 🏨");
  if (!data.fecha_inicio || !data.fecha_fin) return alert("Selecciona fechas");

  fetch("http://localhost:3000/api/reservas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(res => res.json().then(body => {
      if (!res.ok) throw new Error(body.error || "Error al crear reserva");
      return body;
    }))
    .then(() => {
      alert("Reserva creada ✅");

      document.getElementById("reservaForm").reset();
      document.getElementById("habitacionSeleccionada").value = "";
      document.getElementById("descripcionHabitacion").innerText = "";
      document.getElementById("descripcionPaquete").innerText = "";
      document.getElementById("subtotal").innerText = "$0";
      document.getElementById("total").innerText = "$0";
      document.getElementById("serviciosContainer").classList.remove("bloqueado");
      document.querySelectorAll(".servicio-item").forEach(el => el.classList.remove("active"));

      listarReservas();
    })
    .catch(err => {
      console.error("❌ Error reserva:", err.message);
      alert(err.message);
    });
});

// ==========================
// 🔹 LISTAR RESERVAS
// ==========================
window.listarReservas = function() {
  fetch("http://localhost:3000/api/reservas")
    .then(res => res.json())
    .then(data => {
      let html = "";
      data.forEach(r => {
        html += `
          <div class="card">
            <p><strong>Reserva #${r.id_reserva}</strong></p>
            <p>Cliente: ${r.id_cliente}</p>
            <p>Habitación: <strong>${r.NombreHabitacion || "N/A"}</strong></p>
            <p>${r.fecha_inicio} - ${r.fecha_fin}</p>
            <p><strong>Total: $${r.total}</strong></p>
            <p style="color: ${r.id_estado_reserva == 2 ? 'red' : 'green'}">
              Estado: ${r.id_estado_reserva == 2 ? 'Cancelada' : 'Activa'}
            </p>
            ${
              r.id_estado_reserva != 2
                ? `<button onclick="cancelarReserva(${r.id_reserva})">Cancelar</button>`
                : `<span style="color:red;">Reserva cancelada</span>`
            }
          </div>
        `;
      });
      document.getElementById("listaReservas").innerHTML = html;
    })
    .catch(err => console.error("Error listando reservas:", err));
};

// ==========================
// 🔹 CANCELAR RESERVA
// ==========================
window.cancelarReserva = function(id) {
  if (!confirm("¿Quieres cancelar esta reserva?")) return;

  fetch(`http://localhost:3000/api/reservas/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "idusuario": usuario.NroDocumento
    }
  })
    .then(res => res.json())
    .then(data => {
      alert(data.mensaje);
      listarReservas();
    })
    .catch(err => console.error("Error cancelando:", err));
};

// ==========================
// 🔹 INICIALIZAR
// ==========================
cargarHabitaciones();
cargarPaquetes();
cargarServicios();
listarReservas();