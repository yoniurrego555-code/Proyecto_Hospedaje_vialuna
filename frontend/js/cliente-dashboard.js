import {
  cancelarReserva,
  clearSession,
  getHabitaciones,
  getReservas,
  getSession,
  isClientSession,
  saveSession,
  updateCliente
} from "./api.js";

const LOGIN_URL = "../public/login.html";
const RESERVAS_URL = "./reservas.html";
const ADMIN_DASHBOARD_URL = "../index.html";
const ADMIN_ACCESS_MESSAGE_KEY = "vialuna_admin_access_message";
const ESTADO_CANCELADA = 2;

const session = getSession();

if (!session) {
  window.location.href = LOGIN_URL;
}

if (!isClientSession(session)) {
  window.location.href = ADMIN_DASHBOARD_URL;
}

const refs = {
  clientUserName: document.getElementById("clientUserName"),
  welcomeTitle: document.getElementById("welcomeTitle"),
  feedback: document.getElementById("clientDashboardFeedback"),
  activeReservationsCount: document.getElementById("activeReservationsCount"),
  nextReservationLabel: document.getElementById("nextReservationLabel"),
  totalSpentLabel: document.getElementById("totalSpentLabel"),
  clientReservationsList: document.getElementById("clientReservationsList"),
  clientRoomsGrid: document.getElementById("clientRoomsGrid"),
  clientProfileForm: document.getElementById("clientProfileForm"),
  perfilDocumento: document.getElementById("perfilDocumento"),
  perfilTelefono: document.getElementById("perfilTelefono"),
  perfilNombre: document.getElementById("perfilNombre"),
  perfilApellido: document.getElementById("perfilApellido"),
  perfilDireccion: document.getElementById("perfilDireccion"),
  perfilEmail: document.getElementById("perfilEmail"),
  logoutBtn: document.getElementById("logoutBtn")
};

const state = {
  habitaciones: [],
  reservas: [],
  cliente: { ...session }
};

function setFeedback(message = "", type = "") {
  refs.feedback.textContent = message;
  refs.feedback.className = `feedback ${type}`.trim();
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("es-CO");
}

function getClientReservations() {
  return state.reservas.filter(
    (reserva) => String(reserva.cliente?.nroDocumento || reserva.id_cliente) === String(state.cliente?.NroDocumento)
  );
}

function getActiveReservations() {
  return getClientReservations().filter((reserva) => Number(reserva.estado?.id) !== ESTADO_CANCELADA);
}

function getNextReservation() {
  return [...getActiveReservations()]
    .filter((reserva) => reserva.fecha_inicio)
    .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))[0] || null;
}

function renderSummary() {
  const activeReservations = getActiveReservations();
  const nextReservation = getNextReservation();
  const totalSpent = getClientReservations().reduce((acc, reserva) => acc + Number(reserva.total || 0), 0);

  refs.activeReservationsCount.textContent = String(activeReservations.length);
  refs.nextReservationLabel.textContent = nextReservation ? nextReservation.fecha_inicio : "Sin fecha";
  refs.totalSpentLabel.textContent = `$${formatCurrency(totalSpent)}`;
}

function renderReservations() {
  const reservations = getClientReservations();

  if (!reservations.length) {
    refs.clientReservationsList.innerHTML = '<p class="empty-state">Aun no tienes reservas registradas.</p>';
    return;
  }

  refs.clientReservationsList.innerHTML = reservations
    .map((reserva) => {
      const cancelada = Number(reserva.estado?.id) === ESTADO_CANCELADA;

      return `
        <article class="list-card client-reservation-card">
          <div class="client-reservation-card__header">
            <div>
              <h3>Reserva #${reserva.id_reserva}</h3>
              <p>${reserva.habitacion?.nombre || "Habitacion no disponible"}</p>
            </div>
            <span class="badge ${cancelada ? "badge-danger" : "badge-soft"}">${reserva.estado?.nombre || "Sin estado"}</span>
          </div>

          <div class="client-reservation-card__body">
            <p>Fechas: ${reserva.fecha_inicio} al ${reserva.fecha_fin}</p>
            <p>Total: $${formatCurrency(reserva.total)}</p>
            <p>Paquetes: ${reserva.paquetes.map((paquete) => paquete.nombre).join(", ") || "Sin paquetes"}</p>
            <p>Servicios: ${reserva.servicios.map((servicio) => servicio.nombre).join(", ") || "Sin servicios"}</p>
          </div>

          <div class="client-reservation-card__actions">
            <button type="button" class="btn-ghost" data-view-reservation="${reserva.id_reserva}">Ver</button>
            ${
              cancelada
                ? ""
                : `<button type="button" class="btn-danger" data-cancel-reservation="${reserva.id_reserva}">Cancelar</button>`
            }
          </div>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll("[data-view-reservation]").forEach((button) => {
    button.addEventListener("click", () => {
      const reservation = getClientReservations().find(
        (item) => Number(item.id_reserva) === Number(button.dataset.viewReservation)
      );

      if (!reservation) {
        return;
      }

      setFeedback(
        `Reserva #${reservation.id_reserva}: ${reservation.fecha_inicio} al ${reservation.fecha_fin} · ${reservation.habitacion?.nombre || "Sin habitacion"}`,
        "success"
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  document.querySelectorAll("[data-cancel-reservation]").forEach((button) => {
    button.addEventListener("click", async () => {
      const reservationId = Number(button.dataset.cancelReservation);
      const confirmed = window.confirm("Se cancelara la reserva seleccionada. Deseas continuar?");

      if (!confirmed) {
        return;
      }

      try {
        await cancelarReserva(reservationId);
        setFeedback("Reserva cancelada correctamente.", "success");
        await refreshData();
      } catch (error) {
        console.error("Error cancelando reserva:", error);
        setFeedback(error.message || "No fue posible cancelar la reserva.", "error");
      }
    });
  });
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

function renderRooms() {
  const availableRooms = state.habitaciones.filter((habitacion) => Number(habitacion.Estado) === 1);

  if (!availableRooms.length) {
    refs.clientRoomsGrid.innerHTML = '<p class="empty-state">No hay habitaciones disponibles por ahora.</p>';
    return;
  }

  refs.clientRoomsGrid.innerHTML = availableRooms
    .map(
      (habitacion) => `
        <article class="room-card">
          <div class="room-card__media">
            <img src="${resolveRoomImage(habitacion.ImagenUrl)}" alt="${habitacion.NombreHabitacion}">
          </div>
          <div class="room-card__top">
            <span class="badge badge-soft">Disponible</span>
            <div class="room-card__price-block">
              <strong>$${formatCurrency(habitacion.Costo)}</strong>
              <span class="room-card__caption">${Number(habitacion.CapacidadMaximaPersonas || 1)} persona(s)</span>
            </div>
          </div>
          <h3>${habitacion.NombreHabitacion}</h3>
          <p>${habitacion.Descripcion}</p>
          <button type="button" class="btn-primary client-room-cta" data-room-id="${habitacion.IDHabitacion}">
            Reservar
          </button>
        </article>
      `
    )
    .join("");

  document.querySelectorAll("[data-room-id]").forEach((button) => {
    button.addEventListener("click", () => {
      window.location.href = `${RESERVAS_URL}?habitacion=${button.dataset.roomId}`;
    });
  });
}

function populateProfile() {
  refs.clientUserName.textContent = `${state.cliente.Nombre || ""} ${state.cliente.Apellido || ""}`.trim() || "Cliente";
  refs.welcomeTitle.textContent = `Bienvenido, ${state.cliente.Nombre || "cliente"}`;
  refs.perfilDocumento.value = state.cliente.NroDocumento || "";
  refs.perfilTelefono.value = state.cliente.Telefono || "";
  refs.perfilNombre.value = state.cliente.Nombre || "";
  refs.perfilApellido.value = state.cliente.Apellido || "";
  refs.perfilDireccion.value = state.cliente.Direccion || "";
  refs.perfilEmail.value = state.cliente.Email || "";
}

function getProfilePayload() {
  return {
    Nombre: refs.perfilNombre.value.trim(),
    Apellido: refs.perfilApellido.value.trim(),
    Direccion: refs.perfilDireccion.value.trim(),
    Email: refs.perfilEmail.value.trim(),
    Telefono: refs.perfilTelefono.value.trim(),
    Estado: Number(state.cliente.Estado ?? 1),
    IDRol: Number(state.cliente.IDRol ?? 2)
  };
}

async function refreshData() {
  const [habitaciones, reservas] = await Promise.all([getHabitaciones(), getReservas()]);
  state.habitaciones = Array.isArray(habitaciones) ? habitaciones : [];
  state.reservas = Array.isArray(reservas) ? reservas : [];

  renderSummary();
  renderReservations();
  renderRooms();
}

refs.clientProfileForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFeedback("", "");

  try {
    const payload = getProfilePayload();

    if (!payload.Nombre || !payload.Apellido || !payload.Direccion || !payload.Email || !payload.Telefono) {
      throw new Error("Completa todos los campos del perfil.");
    }

    await updateCliente(state.cliente.NroDocumento, payload);
    state.cliente = {
      ...state.cliente,
      ...payload
    };
    saveSession(state.cliente);
    populateProfile();
    setFeedback("Perfil actualizado correctamente.", "success");
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    setFeedback(error.message || "No fue posible actualizar el perfil.", "error");
  }
});

refs.logoutBtn.addEventListener("click", () => {
  clearSession();
  window.location.href = LOGIN_URL;
});

async function init() {
  const accessMessage = window.sessionStorage.getItem(ADMIN_ACCESS_MESSAGE_KEY);

  if (accessMessage) {
    setFeedback(accessMessage, "error");
    window.sessionStorage.removeItem(ADMIN_ACCESS_MESSAGE_KEY);
  }

  populateProfile();

  try {
    await refreshData();
  } catch (error) {
    console.error("Error cargando dashboard cliente:", error);
    setFeedback("No fue posible cargar tu panel de cliente.", "error");
  }
}

init();
