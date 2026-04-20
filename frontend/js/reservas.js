import {
  actualizarReserva,
  cancelarReserva,
  clearSession,
  crearReserva,
  getClientes,
  getEstadosReserva,
  getHabitaciones,
  getMetodosPago,
  getPaquetes,
  getReservas,
  getServicios,
  getSession,
  isAdminSession
} from "./api.js";

const LOGIN_URL = "../public/login.html";
const ESTADO_CANCELADA = 2;
const ADMIN_ACCESS_MESSAGE_KEY = "vialuna_admin_access_message";
const TODAY = new Date().toISOString().split("T")[0];
const usuario = getSession();
const isAdmin = isAdminSession(usuario);

if (!usuario) {
  window.location.href = LOGIN_URL;
}

const params = new URLSearchParams(window.location.search);

const state = {
  clientes: [],
  habitaciones: [],
  paquetes: [],
  servicios: [],
  metodosPago: [],
  estados: [],
  reservas: [],
  selectedClientId: String(usuario?.NroDocumento || ""),
  habitacionSeleccionada: null,
  paquetesSeleccionados: [],
  selectedServiceIds: new Set(),
  editingReservationId: null
};

const refs = {
  userName: document.getElementById("userName"),
  logoutBtn: document.getElementById("logoutBtn"),
  feedback: document.getElementById("reservaFeedback"),
  formTitle: document.getElementById("formTitle"),
  submitBtn: document.getElementById("submitBtn"),
  resetBtn: document.getElementById("resetBtn"),
  clienteSelect: document.getElementById("cliente"),
  documentoInput: document.getElementById("documento"),
  clienteEmail: document.getElementById("clienteEmail"),
  clienteTelefono: document.getElementById("clienteTelefono"),
  cantidadHuespedes: document.getElementById("cantidadHuespedes"),
  fechaInicio: document.getElementById("fechaInicio"),
  fechaFin: document.getElementById("fechaFin"),
  horaEntrada: document.getElementById("horaEntrada"),
  horaSalida: document.getElementById("horaSalida"),
  metodoPago: document.getElementById("metodoPago"),
  estadoReserva: document.getElementById("estadoReserva"),
  habitacionesGrid: document.getElementById("habitacionesGrid"),
  habitacionDetalle: document.getElementById("habitacionDetalle"),
  paquetesGrid: document.getElementById("paquetesGrid"),
  paqueteDetalle: document.getElementById("paqueteDetalle"),
  serviciosGrid: document.getElementById("serviciosGrid"),
  servicioDetalle: document.getElementById("servicioDetalle"),
  totalReserva: document.getElementById("totalReserva"),
  cantidadHuespedesResumen: document.getElementById("cantidadHuespedesResumen"),
  cantidadNochesResumen: document.getElementById("cantidadNochesResumen"),
  totalHabitacionResumen: document.getElementById("totalHabitacionResumen"),
  detalleHabitacionResumen: document.getElementById("detalleHabitacionResumen"),
  totalPaquetesResumen: document.getElementById("totalPaquetesResumen"),
  totalServiciosResumen: document.getElementById("totalServiciosResumen"),
  clientsTable: document.getElementById("clientsTable"),
  reservasTable: document.getElementById("reservasTable")
};

function getVisibleClientes(clientes) {
  const activos = clientes.filter((cliente) => Number(cliente.Estado) === 1);

  if (isAdmin) {
    return activos;
  }

  return activos.filter((cliente) => String(cliente.NroDocumento) === String(usuario?.NroDocumento));
}

function getVisibleReservas(reservas) {
  if (isAdmin) {
    return reservas;
  }

  return reservas.filter(
    (reserva) => String(reserva.cliente?.nroDocumento || reserva.id_cliente) === String(usuario?.NroDocumento)
  );
}

function applyReservationsAccess() {
  document.querySelectorAll("[data-requires-admin]").forEach((link) => {
    link.hidden = !isAdmin;
  });

  if (!isAdmin) {
    const clientPanel = refs.clientsTable?.closest(".panel");

    if (clientPanel) {
      clientPanel.hidden = true;
    }

    refs.clienteSelect.disabled = true;
    refs.estadoReserva.disabled = true;
  }
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("es-CO");
}

function resolveRoomImage(imageName) {
  if (!imageName) {
    return "../assets/images/rooms/suite-ejecutiva.svg";
  }

  if (typeof imageName === "string" && (imageName.startsWith("http://") || imageName.startsWith("https://") || imageName.startsWith("../"))) {
    return imageName;
  }

  return `../assets/images/rooms/${imageName}`;
}

function setFeedback(message = "", type = "") {
  refs.feedback.textContent = message;
  refs.feedback.className = `feedback ${type}`.trim();
}

function getSelectedClient() {
  return state.clientes.find(
    (cliente) => String(cliente.NroDocumento) === String(state.selectedClientId)
  );
}

function getSelectedRoom() {
  return state.habitacionSeleccionada;
}

function getSelectedPackages() {
  return state.paquetesSeleccionados;
}

function getSelectedServices() {
  return state.servicios.filter((servicio) => state.selectedServiceIds.has(servicio.IDServicio));
}

function getGuestCount() {
  return Math.max(1, Number(refs.cantidadHuespedes?.value || 1));
}

function getStayNights() {
  const start = refs.fechaInicio.value;
  const end = refs.fechaFin.value;

  if (!start || !end) {
    return 0;
  }

  const nights = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 0;
}

function getRoomStayTotal(room = getSelectedRoom()) {
  if (!room) {
    return 0;
  }

  const nights = getStayNights();
  const roomPrice = Number(room.Costo || 0);

  if (!nights) {
    return roomPrice;
  }

  return nights * roomPrice;
}

function setSelectedRoomFromId(roomId = "") {
  state.habitacionSeleccionada =
    state.habitaciones.find((habitacion) => String(habitacion.IDHabitacion) === String(roomId)) || null;
}

function setSelectedPackagesFromIds(packageIds = []) {
  state.paquetesSeleccionados = packageIds
    .map((packageId) => state.paquetes.find((paquete) => String(paquete.IDPaquete) === String(packageId)))
    .filter(Boolean);
}

function paqueteEstaSeleccionado(packageId) {
  return state.paquetesSeleccionados.some((paquete) => Number(paquete.IDPaquete) === Number(packageId));
}

function validarCompatibilidadPaquete(paquete, room = getSelectedRoom()) {
  if (!paquete?.IDHabitacion || !room) {
    return { compatible: true, message: "" };
  }

  if (String(paquete.IDHabitacion) !== String(room.IDHabitacion)) {
    return {
      compatible: false,
      message: `${paquete.NombrePaquete} solo es compatible con la habitacion ${paquete.HabitacionIncluidaNombre || `#${paquete.IDHabitacion}`}.`
    };
  }

  return { compatible: true, message: "" };
}

function seleccionarHabitacion(roomId) {
  const room = state.habitaciones.find(
    (habitacion) => String(habitacion.IDHabitacion) === String(roomId)
  );

  if (!room) {
    return;
  }

  const guestCount = getGuestCount();

  if (guestCount > Number(room.CapacidadMaximaPersonas || 1)) {
    setFeedback(
      `La habitacion ${room.NombreHabitacion} admite maximo ${room.CapacidadMaximaPersonas || 1} huesped(es)`,
      "error"
    );
    return;
  }

  const incompatiblePackage = getSelectedPackages().find(
    (paquete) => !validarCompatibilidadPaquete(paquete, room).compatible
  );

  if (incompatiblePackage) {
    setFeedback(validarCompatibilidadPaquete(incompatiblePackage, room).message, "error");
    return;
  }

  state.habitacionSeleccionada = room;
  setFeedback("", "");
}

function agregarPaquete(packageId) {
  const paquete = state.paquetes.find((item) => Number(item.IDPaquete) === Number(packageId));

  if (!paquete) {
    return;
  }

  if (paqueteEstaSeleccionado(packageId)) {
    state.paquetesSeleccionados = state.paquetesSeleccionados.filter(
      (item) => Number(item.IDPaquete) !== Number(packageId)
    );
    setFeedback("", "");
    return;
  }

  const compatibility = validarCompatibilidadPaquete(paquete);

  if (!compatibility.compatible) {
    setFeedback(compatibility.message, "error");
    return;
  }

  state.paquetesSeleccionados = [...state.paquetesSeleccionados, paquete];
  setFeedback("", "");
}

function calcularTotal() {
  const room = getSelectedRoom();
  const guestCount = getGuestCount();
  const nights = getStayNights();
  const totalHabitacion = room ? getRoomStayTotal(room) : 0;
  const totalPaquetes = getSelectedPackages().reduce(
    (acc, paquete) => acc + Number(paquete.Precio || 0),
    0
  );
  const totalServicios = getSelectedServices().reduce(
    (acc, servicio) => acc + Number(servicio.Costo || 0),
    0
  );
  const totalGeneral = totalHabitacion + totalPaquetes + totalServicios;

  let roomLabel = room
    ? `${room.NombreHabitacion} - $${formatCurrency(room.Costo)}`
    : "Sin habitacion seleccionada";

  if (room && nights > 0) {
    roomLabel = `${room.NombreHabitacion} - ${nights} noche(s) x $${formatCurrency(room.Costo)}`;
  }

  refs.cantidadHuespedesResumen.textContent = String(guestCount);
  refs.cantidadNochesResumen.textContent = String(nights);
  refs.totalHabitacionResumen.textContent = `$${formatCurrency(totalHabitacion)}`;
  refs.detalleHabitacionResumen.textContent = roomLabel;
  refs.totalPaquetesResumen.textContent = `$${formatCurrency(totalPaquetes)}`;
  refs.totalServiciosResumen.textContent = `$${formatCurrency(totalServicios)}`;
  refs.totalReserva.textContent = `$${formatCurrency(totalGeneral)}`;

  return {
    totalHabitacion,
    totalPaquetes,
    totalServicios,
    totalGeneral
  };
}

function calculateReservationTotal() {
  return calcularTotal().totalGeneral;
}

function updateClientSummary() {
  const cliente = getSelectedClient();

  refs.documentoInput.value = cliente?.NroDocumento || "";
  refs.clienteEmail.value = cliente?.Email || "";
  refs.clienteTelefono.value = cliente?.Telefono || "";
}

function syncDateLimits() {
  refs.fechaInicio.min = TODAY;
  refs.fechaFin.min = refs.fechaInicio.value || TODAY;

  if (refs.fechaInicio.value && refs.fechaInicio.value < TODAY) {
    refs.fechaInicio.value = TODAY;
  }

  if (refs.fechaFin.value && refs.fechaFin.value < refs.fechaFin.min) {
    refs.fechaFin.value = refs.fechaFin.min;
  }
}

function renderSelectionDetail(target, title, description, meta = []) {
  if (!target) {
    return;
  }

  const metaHtml = meta
    .filter(Boolean)
    .map((item) => `<span class="badge">${item}</span>`)
    .join("");

  target.innerHTML = description
    ? `
      <div class="detail-card__content">
        <strong>${title}</strong>
        <p>${description}</p>
        <div class="detail-card__meta">${metaHtml}</div>
      </div>
    `
    : '<p class="empty-state">Selecciona un elemento para ver su descripcion.</p>';
}

function renderClientOptions() {
  refs.clienteSelect.innerHTML = `
    <option value="">Selecciona un cliente</option>
    ${state.clientes
      .map(
        (cliente) => `
          <option value="${cliente.NroDocumento}">
            ${cliente.Nombre} ${cliente.Apellido} - ${cliente.NroDocumento}
          </option>
        `
      )
      .join("")}
  `;

  refs.clienteSelect.value = state.selectedClientId;
}

function renderClientsTable() {
  if (!state.clientes.length) {
    refs.clientsTable.innerHTML = `<p class="empty-state">${isAdmin ? "No hay clientes disponibles." : "Tu cuenta de cliente no esta disponible para reservar."}</p>`;
    return;
  }

  refs.clientsTable.innerHTML = `
    <div class="table-shell">
      <table class="data-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Documento</th>
            <th>Correo</th>
            <th>Telefono</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${state.clientes
            .map(
              (cliente) => `
                <tr>
                  <td>${cliente.Nombre} ${cliente.Apellido}</td>
                  <td>${cliente.NroDocumento}</td>
                  <td>${cliente.Email}</td>
                  <td>${cliente.Telefono}</td>
                  <td>
                    <button type="button" class="btn-ghost" data-select-client="${cliente.NroDocumento}">
                      Seleccionar
                    </button>
                  </td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  document.querySelectorAll("[data-select-client]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedClientId = button.dataset.selectClient;
      refs.clienteSelect.value = state.selectedClientId;
      updateClientSummary();
    });
  });
}

function renderRooms() {
  refs.habitacionesGrid.innerHTML = state.habitaciones
    .filter((habitacion) => Number(habitacion.Estado) === 1)
    .map((habitacion) => {
      const selected = String(habitacion.IDHabitacion) === String(state.habitacionSeleccionada?.IDHabitacion || "");
      const totalHabitacion = selected ? getRoomStayTotal(habitacion) : Number(habitacion.Costo || 0);
      const guestCount = getGuestCount();
      const roomCapacity = Number(habitacion.CapacidadMaximaPersonas || 1);
      const roomFitsGuests = guestCount <= roomCapacity;

      return `
        <article class="selection-card ${selected ? "is-selected" : ""}">
          <div class="selection-card__media">
            <img src="${resolveRoomImage(habitacion.ImagenUrl)}" alt="${habitacion.NombreHabitacion}">
          </div>
          <div class="selection-card__header">
            <h3>${habitacion.NombreHabitacion}</h3>
            <div class="selection-card__price-block">
              <strong>$${formatCurrency(habitacion.Costo)}</strong>
              <span class="selection-card__inline-total">Total: $${formatCurrency(totalHabitacion)}</span>
            </div>
          </div>
          <p>${habitacion.Descripcion}</p>
          <p class="selection-card__caption">Capacidad: ${Number(habitacion.CapacidadMaximaPersonas || 1)} persona(s)</p>
          ${roomFitsGuests ? "" : `<p class="feedback error">No disponible para ${guestCount} huesped(es).</p>`}
          <button type="button" class="${selected ? "btn-secondary" : "btn-primary"}" data-room="${habitacion.IDHabitacion}">
            ${selected ? "Seleccionada" : "Seleccionar"}
          </button>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll("[data-room]").forEach((button) => {
    button.addEventListener("click", () => {
      seleccionarHabitacion(button.dataset.room);
      renderRooms();
      renderPackages();
      calculateReservationTotal();
    });

    button.addEventListener("mouseenter", () => {
      const room = state.habitaciones.find(
        (habitacion) => String(habitacion.IDHabitacion) === String(button.dataset.room)
      );

      renderSelectionDetail(
        refs.habitacionDetalle,
        room?.NombreHabitacion || "Habitacion",
        room?.Descripcion || "",
        [
          room?.Costo ? `$${formatCurrency(room.Costo)} por noche` : "",
          room?.CapacidadMaximaPersonas ? `${room.CapacidadMaximaPersonas} persona(s)` : "",
          Number(room?.Estado) === 1 ? "Disponible" : "No disponible"
        ]
      );
    });
  });

  const room = getSelectedRoom();
  renderSelectionDetail(
    refs.habitacionDetalle,
    room?.NombreHabitacion || "Habitacion",
    room?.Descripcion || "",
    [
      room?.Costo ? `$${formatCurrency(room.Costo)} por noche` : "",
      room?.CapacidadMaximaPersonas ? `${room.CapacidadMaximaPersonas} persona(s)` : "",
      Number(room?.Estado) === 1 ? "Disponible" : "No disponible"
    ]
  );
}

function renderPackages() {
  refs.paquetesGrid.innerHTML = state.paquetes
    .filter((paquete) => Number(paquete.Estado) === 1)
    .map((paquete) => {
      const selected = paqueteEstaSeleccionado(paquete.IDPaquete);
      const totalPaquete = selected ? Number(paquete.Precio || 0) : 0;
      const compatibility = validarCompatibilidadPaquete(paquete);
      const compatibilityNote =
        !compatibility.compatible && getSelectedRoom()
          ? `<p class="feedback error">${compatibility.message}</p>`
          : "";

      return `
        <article class="selection-card ${selected ? "is-selected" : ""}">
          <div class="selection-card__header">
            <h3>${paquete.NombrePaquete}</h3>
            <div class="selection-card__price-block">
              <strong>$${formatCurrency(paquete.Precio)}</strong>
              <span class="selection-card__inline-total">Total: $${formatCurrency(totalPaquete)}</span>
            </div>
          </div>
          <p>${paquete.Descripcion || "Paquete sin descripcion registrada."}</p>
          <p class="muted-text">Habitacion: ${paquete.HabitacionIncluidaNombre || "No asignada"}</p>
          <p class="selection-card__caption">Capacidad habitacion: ${Number(paquete.HabitacionIncluidaCapacidad || 0) || "No definida"}</p>
          <p class="muted-text">Servicio incluido: ${paquete.ServicioIncluidoNombre || "No definido"}</p>
          <p class="muted-text">${paquete.ServicioIncluidoDescripcion || "Sin descripcion adicional"}</p>
          ${compatibilityNote}
          <button type="button" class="${selected ? "btn-secondary" : "btn-primary"}" data-package="${paquete.IDPaquete}">
            ${selected ? "Quitar" : "Agregar"}
          </button>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll("[data-package]").forEach((button) => {
    button.addEventListener("click", () => {
      agregarPaquete(button.dataset.package);
      renderPackages();
      renderRooms();
      calculateReservationTotal();
    });

    button.addEventListener("mouseenter", () => {
      const paquete = state.paquetes.find(
        (item) => String(item.IDPaquete) === String(button.dataset.package)
      );

      renderSelectionDetail(
        refs.paqueteDetalle,
        paquete?.NombrePaquete || "Paquetes",
        paquete?.Descripcion || "Paquete sin descripcion registrada.",
        [
          paquete?.Precio ? `$${formatCurrency(paquete.Precio)}` : "",
          paquete?.HabitacionIncluidaNombre ? `Habitacion: ${paquete.HabitacionIncluidaNombre}` : "",
          paquete?.HabitacionIncluidaCapacidad ? `${paquete.HabitacionIncluidaCapacidad} persona(s)` : "",
          paquete?.ServicioIncluidoNombre || ""
        ]
      );
    });
  });

  const selectedPackages = getSelectedPackages();
  renderSelectionDetail(
    refs.paqueteDetalle,
    selectedPackages.length ? selectedPackages.map((item) => item.NombrePaquete).join(", ") : "Paquetes",
    selectedPackages.length
      ? selectedPackages
          .map((item) => `${item.NombrePaquete}: ${item.Descripcion || "Sin descripcion"}`)
          .join(" | ")
      : "",
    selectedPackages.flatMap((item) => [
      `$${formatCurrency(item.Precio)}`,
      item.HabitacionIncluidaNombre ? `Habitacion: ${item.HabitacionIncluidaNombre}` : ""
    ])
  );
}

function renderServices() {
  refs.serviciosGrid.innerHTML = state.servicios
    .filter((servicio) => Number(servicio.Estado) === 1)
    .map((servicio) => {
      const selected = state.selectedServiceIds.has(servicio.IDServicio);
      const totalServicio = selected ? Number(servicio.Costo || 0) : 0;

      return `
        <article class="selection-card ${selected ? "is-selected" : ""}">
          <div class="selection-card__header">
            <h3>${servicio.NombreServicio}</h3>
            <div class="selection-card__price-block">
              <strong>$${formatCurrency(servicio.Costo)}</strong>
              <span class="selection-card__inline-total">Total: $${formatCurrency(totalServicio)}</span>
            </div>
          </div>
          <p>${servicio.Descripcion}</p>
          <p class="muted-text">Duracion: ${servicio.Duracion || "No definida"}</p>
          <p class="muted-text">Capacidad maxima: ${servicio.CantidadMaximaPersonas}</p>
          <button type="button" class="${selected ? "btn-secondary" : "btn-primary"}" data-service="${servicio.IDServicio}">
            ${selected ? "Quitar" : "Agregar"}
          </button>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll("[data-service]").forEach((button) => {
    button.addEventListener("click", () => {
      const serviceId = Number(button.dataset.service);

      if (state.selectedServiceIds.has(serviceId)) {
        state.selectedServiceIds.delete(serviceId);
      } else {
        state.selectedServiceIds.add(serviceId);
      }

      renderServices();
      calculateReservationTotal();
    });

    button.addEventListener("mouseenter", () => {
      const servicio = state.servicios.find(
        (item) => String(item.IDServicio) === String(button.dataset.service)
      );

      renderSelectionDetail(
        refs.servicioDetalle,
        servicio?.NombreServicio || "Servicios",
        servicio?.Descripcion || "",
        [
          servicio?.Duracion || "",
          servicio?.CantidadMaximaPersonas ? `${servicio.CantidadMaximaPersonas} persona(s)` : "",
          servicio?.Costo ? `$${formatCurrency(servicio.Costo)}` : ""
        ]
      );
    });
  });

  const selectedServices = getSelectedServices();
  renderSelectionDetail(
    refs.servicioDetalle,
    selectedServices.length ? selectedServices.map((item) => item.NombreServicio).join(", ") : "Servicios",
    selectedServices.length
      ? selectedServices
          .map((item) => `${item.NombreServicio}: ${item.Descripcion || "Sin descripcion"}`)
          .join(" | ")
      : "",
    selectedServices.map((item) => `${item.Duracion || "Sin duracion"} · $${formatCurrency(item.Costo)}`)
  );
}

function renderMetodosPago() {
  refs.metodoPago.innerHTML = `
    <option value="">Selecciona un metodo</option>
    ${state.metodosPago
      .map(
        (metodo) => `
          <option value="${metodo.IdMetodoPago}">${metodo.NomMetodoPago}</option>
        `
      )
      .join("")}
  `;
}

function renderEstados() {
  refs.estadoReserva.innerHTML = state.estados
    .map(
      (estado) => `
        <option value="${estado.IdEstadoReserva}">${estado.NombreEstadoReserva}</option>
      `
    )
    .join("");
}

function renderReservasTable() {
  const reservasVisibles = getVisibleReservas(state.reservas);

  if (!reservasVisibles.length) {
    refs.reservasTable.innerHTML = `<p class="empty-state">${isAdmin ? "Aun no hay reservas registradas." : "Aun no tienes reservas registradas."}</p>`;
    return;
  }

  refs.reservasTable.innerHTML = `
    <div class="table-shell">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Habitacion</th>
            <th>Fechas</th>
            <th>Paquetes</th>
            <th>Servicios</th>
            <th>Metodo</th>
            <th>Estado</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${reservasVisibles
            .map((reserva) => {
              const cancelada = Number(reserva.estado?.id) === ESTADO_CANCELADA;

              return `
                <tr>
                  <td>#${reserva.id_reserva}</td>
                  <td>${reserva.cliente?.nombreCompleto || reserva.nr_documento}</td>
                  <td>${reserva.habitacion?.nombre || "Sin habitacion"}</td>
                  <td>
                    ${reserva.fecha_inicio} al ${reserva.fecha_fin}<br>
                    <span class="muted-text">Entrada: ${reserva.hora_entrada || "--:--"} · Salida: ${reserva.hora_salida || "--:--"}</span>
                  </td>
                  <td>${reserva.paquetes.map((paquete) => paquete.nombre).join(", ") || "Sin paquetes"}</td>
                  <td>${reserva.servicios.map((servicio) => servicio.nombre).join(", ") || "Sin servicios"}</td>
                  <td>${reserva.metodoPago?.nombre || "Sin metodo"}</td>
                  <td><span class="badge">${reserva.estado?.nombre || "Sin estado"}</span></td>
                  <td>$${formatCurrency(reserva.total)}</td>
                  <td class="table-actions">
                    <button type="button" class="btn-ghost" data-edit="${reserva.id_reserva}">Editar</button>
                    ${
                      cancelada
                        ? '<span class="muted-text">Cancelada</span>'
                        : `<button type="button" class="btn-danger" data-delete="${reserva.id_reserva}">Cancelar</button>`
                    }
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  document.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      startEditing(Number(button.dataset.edit));
    });
  });

  document.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      const reservationId = Number(button.dataset.delete);
      const confirmed = window.confirm("Se cancelara la reserva seleccionada. Deseas continuar?");

      if (!confirmed) {
        return;
      }

      try {
        await cancelarReserva(reservationId);
        setFeedback("Reserva cancelada correctamente", "success");
        await refreshReservas();
      } catch (error) {
        console.error("Error cancelando reserva:", error);
        setFeedback(error.message, "error");
      }
    });
  });
}

function resetForm() {
  state.editingReservationId = null;
  state.selectedClientId = String(usuario?.NroDocumento || "");
  state.paquetesSeleccionados = [];
  state.selectedServiceIds = new Set();
  setSelectedRoomFromId(params.get("habitacion") || "");

  refs.formTitle.textContent = "Nueva reserva";
  refs.submitBtn.textContent = "Guardar reserva";
  refs.clienteSelect.value = state.selectedClientId;
  refs.cantidadHuespedes.value = "1";
  refs.fechaInicio.value = "";
  refs.fechaFin.value = "";
  refs.horaEntrada.value = "";
  refs.horaSalida.value = "";
  refs.metodoPago.value = "";
  refs.estadoReserva.value = "1";
  refs.estadoReserva.disabled = !isAdmin;

  syncDateLimits();
  updateClientSummary();
  renderRooms();
  renderPackages();
  renderServices();
  calculateReservationTotal();
}

function startEditing(reservationId) {
  const reserva = state.reservas.find((item) => item.id_reserva === reservationId);

  if (!reserva) {
    return;
  }

  state.editingReservationId = reservationId;
  state.selectedClientId = String(reserva.cliente?.nroDocumento || reserva.id_cliente);
  setSelectedRoomFromId(String(reserva.habitacion?.id || ""));
  setSelectedPackagesFromIds(reserva.paquetes.map((paquete) => paquete.id));
  state.selectedServiceIds = new Set(reserva.servicios.map((servicio) => servicio.id));

  refs.formTitle.textContent = `Editar reserva #${reserva.id_reserva}`;
  refs.submitBtn.textContent = "Actualizar reserva";
  refs.clienteSelect.value = state.selectedClientId;
  refs.fechaInicio.value = reserva.fecha_inicio;
  refs.fechaFin.value = reserva.fecha_fin;
  refs.horaEntrada.value = reserva.hora_entrada || "";
  refs.horaSalida.value = reserva.hora_salida || "";
  refs.metodoPago.value = String(reserva.metodoPago?.id || "");
  refs.estadoReserva.value = String(reserva.estado?.id || 1);
  refs.estadoReserva.disabled = !isAdmin;

  updateClientSummary();
  renderRooms();
  renderPackages();
  renderServices();
  calculateReservationTotal();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getPayload() {
  return {
    id_cliente: Number(state.selectedClientId),
    nr_documento: refs.documentoInput.value.trim(),
    cantidad_huespedes: getGuestCount(),
    fecha_inicio: refs.fechaInicio.value,
    fecha_fin: refs.fechaFin.value,
    hora_entrada: refs.horaEntrada.value,
    hora_salida: refs.horaSalida.value,
    id_estado_reserva: Number(isAdmin ? refs.estadoReserva.value : 1),
    id_metodo_pago: Number(refs.metodoPago.value),
    id_habitacion: Number(state.habitacionSeleccionada?.IDHabitacion || 0),
    paquetes: state.paquetesSeleccionados.map((paquete) => Number(paquete.IDPaquete)),
    servicios: [...state.selectedServiceIds]
  };
}

async function refreshReservas() {
  state.reservas = getVisibleReservas(await getReservas());
  renderReservasTable();
}

async function init() {
  refs.userName.textContent = `${usuario.Nombre || ""} ${usuario.Apellido || ""}`.trim();
  applyReservationsAccess();

  const accessMessage = window.sessionStorage.getItem(ADMIN_ACCESS_MESSAGE_KEY);

  if (accessMessage) {
    setFeedback(accessMessage, "error");
    window.sessionStorage.removeItem(ADMIN_ACCESS_MESSAGE_KEY);
  }

  try {
    const [clientes, habitaciones, paquetes, servicios, metodosPago, estados, reservas] =
      await Promise.all([
        getClientes(),
        getHabitaciones(),
        getPaquetes(),
        getServicios(),
        getMetodosPago(),
        getEstadosReserva(),
        getReservas()
      ]);

    state.clientes = getVisibleClientes(clientes);
    state.habitaciones = habitaciones;
    state.paquetes = paquetes;
    state.servicios = servicios;
    state.metodosPago = metodosPago;
    state.estados = estados;
    state.reservas = getVisibleReservas(reservas);

    if (!state.clientes.some((cliente) => String(cliente.NroDocumento) === state.selectedClientId)) {
      state.selectedClientId = state.clientes[0] ? String(state.clientes[0].NroDocumento) : "";
    }

    setSelectedRoomFromId(params.get("habitacion") || "");
    renderClientOptions();
    renderClientsTable();
    renderMetodosPago();
    renderEstados();
    renderRooms();
    renderPackages();
    renderServices();
    renderReservasTable();
    updateClientSummary();

    refs.estadoReserva.value = "1";
    syncDateLimits();
    calculateReservationTotal();
  } catch (error) {
    console.error("Error inicializando modulo de reservas:", error);
    setFeedback("No fue posible cargar la informacion del modulo de reservas", "error");
  }
}

refs.clienteSelect.addEventListener("change", () => {
  state.selectedClientId = refs.clienteSelect.value;
  updateClientSummary();
});

refs.fechaInicio.addEventListener("change", () => {
  syncDateLimits();
  renderRooms();
  calculateReservationTotal();
});

refs.fechaFin.addEventListener("change", () => {
  syncDateLimits();
  renderRooms();
  calculateReservationTotal();
});

refs.cantidadHuespedes.addEventListener("input", () => {
  renderRooms();
  renderPackages();
  calculateReservationTotal();
});

refs.horaEntrada.addEventListener("change", () => setFeedback("", ""));
refs.horaSalida.addEventListener("change", () => setFeedback("", ""));
refs.resetBtn.addEventListener("click", resetForm);
refs.logoutBtn.addEventListener("click", () => {
  clearSession();
  window.location.href = LOGIN_URL;
});

document.getElementById("reservaForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  setFeedback("", "");

  try {
    const payload = getPayload();
    const room = getSelectedRoom();
    const guestCount = getGuestCount();
    const incompatiblePackage = getSelectedPackages().find(
      (paquete) => !validarCompatibilidadPaquete(paquete, room).compatible
    );

    if (!payload.id_cliente) {
      throw new Error("Selecciona un cliente");
    }

    if (!payload.id_habitacion) {
      throw new Error("Selecciona una habitacion");
    }

    if (!payload.id_metodo_pago) {
      throw new Error("Selecciona un metodo de pago");
    }

    if (!payload.fecha_inicio || !payload.fecha_fin) {
      throw new Error("Selecciona las fechas de la reserva");
    }

    if (!guestCount || guestCount < 1) {
      throw new Error("La cantidad de huespedes debe ser mayor a cero");
    }

    if (room && guestCount > Number(room.CapacidadMaximaPersonas || 1)) {
      throw new Error(`La habitacion seleccionada admite maximo ${room.CapacidadMaximaPersonas} huesped(es)`);
    }

    if (incompatiblePackage) {
      throw new Error(validarCompatibilidadPaquete(incompatiblePackage, room).message);
    }

    const invalidService = getSelectedServices().find(
      (servicio) =>
        Number(servicio.CantidadMaximaPersonas || 0) > 0 &&
        guestCount > Number(servicio.CantidadMaximaPersonas)
    );

    if (invalidService) {
      throw new Error(
        `${invalidService.NombreServicio} admite maximo ${invalidService.CantidadMaximaPersonas} huesped(es)`
      );
    }

    const total = calculateReservationTotal();

    if (!total) {
      throw new Error("Verifica las fechas seleccionadas");
    }

    if (state.editingReservationId) {
      await actualizarReserva(state.editingReservationId, payload);
      setFeedback("Reserva actualizada correctamente", "success");
    } else {
      await crearReserva(payload);
      setFeedback("Reserva creada correctamente", "success");
    }

    await refreshReservas();
    resetForm();
  } catch (error) {
    console.error("Error guardando reserva:", error);
    setFeedback(error.message, "error");
  }
});

init();

