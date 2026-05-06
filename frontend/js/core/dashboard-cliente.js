import {
  clienteBelongsToSession,
  getClientes,
  getHabitaciones,
  getPaquetes,
  getReservationOwnershipFilters,
  getReservas,
  getServicios,
  getSession,
  reservationBelongsToSession
} from "./api.js";
import { getAppUrl, logout } from "./authGuard.js";

const refs = {
  userName: document.getElementById("userName"),
  logoutBtn: document.getElementById("logoutBtn"),
  profileSummary: document.getElementById("profileSummary"),
  metricReservations: document.getElementById("metricReservations"),
  metricActive: document.getElementById("metricActive"),
  metricRooms: document.getElementById("metricRooms"),
  metricPackages: document.getElementById("metricPackages"),
  metricServices: document.getElementById("metricServices"),
  metricTotal: document.getElementById("metricTotal"),
  recentReservations: document.getElementById("recentReservations"),
  roomsGrid: document.getElementById("roomsGrid"),
  packagesGrid: document.getElementById("packagesGrid"),
  servicesGrid: document.getElementById("servicesGrid")
};

const session = getSession();

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("es-CO");
}

function fullName(person) {
  return person?.nombre || `${person?.Nombre || ""} ${person?.Apellido || ""}`.trim();
}

function statusName(reserva) {
  return String(reserva?.estado?.nombre || "Sin estado");
}

function roomImage(imageName) {
  if (!imageName) {
    return getAppUrl("assets/images/rooms/suite-ejecutiva.svg");
  }

  if (String(imageName).startsWith("http")) {
    return imageName;
  }

  return getAppUrl(`assets/images/rooms/${String(imageName).replace(/^(\.\.\/)+assets\/images\/rooms\//, "")}`);
}

function renderProfile(cliente) {
  refs.profileSummary.innerHTML = `
    <article class="profile-summary__item"><span>Nombre</span><strong>${fullName(cliente) || "Cliente"}</strong></article>
    <article class="profile-summary__item"><span>Documento</span><strong>${cliente?.NroDocumento || "Sin documento"}</strong></article>
    <article class="profile-summary__item"><span>Correo</span><strong>${cliente?.Email || "Sin correo"}</strong></article>
    <article class="profile-summary__item"><span>Telefono</span><strong>${cliente?.Telefono || "Sin telefono"}</strong></article>
  `;
}

function renderRecentReservations(reservas) {
  const recientes = reservas.slice(0, 4);

  if (!recientes.length) {
    refs.recentReservations.innerHTML = '<p class="empty-state">Aun no tienes reservas registradas.</p>';
    return;
  }

  refs.recentReservations.innerHTML = recientes.map((reserva) => `
    <article class="list-card">
      <div>
        <h4>Reserva #${reserva.id_reserva}</h4>
        <p>${reserva.habitacion?.nombre || "Habitacion sin asignar"} - ${reserva.fecha_inicio || "--"} al ${reserva.fecha_fin || "--"}</p>
      </div>
      <div class="list-card__meta">
        <span class="badge">${statusName(reserva)}</span>
        <strong>$${formatCurrency(reserva.total)}</strong>
      </div>
    </article>
  `).join("");
}

function renderRooms(habitaciones) {
  refs.roomsGrid.innerHTML = habitaciones
    .filter((habitacion) => Number(habitacion.Estado) === 1)
    .map((habitacion) => `
      <article class="selection-card">
        <div class="selection-card__media">
          <img src="${roomImage(habitacion.ImagenUrl)}" alt="${habitacion.NombreHabitacion}">
        </div>
        <div class="selection-card__header">
          <h3>${habitacion.NombreHabitacion}</h3>
          <div class="selection-card__price-block">
            <strong>$${formatCurrency(habitacion.Costo)}</strong>
            <span class="selection-card__inline-total">Disponible</span>
          </div>
        </div>
        <p>${habitacion.Descripcion || "Sin descripcion."}</p>
        <p class="selection-card__caption">Capacidad: ${habitacion.CapacidadMaximaPersonas || "No definida"} persona(s)</p>
      </article>
    `).join("");
}

function renderPackages(paquetes) {
  refs.packagesGrid.innerHTML = paquetes
    .filter((paquete) => Number(paquete.Estado) === 1)
    .map((paquete) => `
      <article class="selection-card">
        <div class="selection-card__header">
          <h3>${paquete.NombrePaquete}</h3>
          <div class="selection-card__price-block">
            <strong>$${formatCurrency(paquete.Precio)}</strong>
            <span class="selection-card__inline-total">Activo</span>
          </div>
        </div>
        <p>${paquete.Descripcion || "Sin descripcion."}</p>
        <p class="muted-text">Habitacion: ${paquete.HabitacionIncluidaNombre || "No asignada"}</p>
      </article>
    `).join("");
}

function renderServices(servicios) {
  refs.servicesGrid.innerHTML = servicios
    .filter((servicio) => Number(servicio.Estado) === 1)
    .map((servicio) => `
      <article class="selection-card">
        <div class="selection-card__header">
          <h3>${servicio.NombreServicio}</h3>
          <div class="selection-card__price-block">
            <strong>$${formatCurrency(servicio.Costo)}</strong>
            <span class="selection-card__inline-total">Activo</span>
          </div>
        </div>
        <p>${servicio.Descripcion || "Sin descripcion."}</p>
        <p class="muted-text">Duracion: ${servicio.Duracion || "No definida"}</p>
      </article>
    `).join("");
}

async function initClienteDashboard() {
  refs.userName.textContent = fullName(session) || "Cliente";
  refs.logoutBtn.addEventListener("click", logout);

  try {
    const [clientes, habitaciones, paquetes, servicios, rawReservas] = await Promise.all([
      getClientes(),
      getHabitaciones(),
      getPaquetes(),
      getServicios(),
      getReservas(getReservationOwnershipFilters(session))
    ]);

    const cliente = clientes.find((item) => Number(item.Estado) === 1 && clienteBelongsToSession(item, session)) || null;
    const reservas = rawReservas.filter((reserva) => reservationBelongsToSession(reserva, session));

    renderProfile(cliente);
    renderRecentReservations(reservas);
    renderRooms(habitaciones);
    renderPackages(paquetes);
    renderServices(servicios);

    refs.metricReservations.textContent = String(reservas.length);
    refs.metricActive.textContent = String(reservas.filter((reserva) => statusName(reserva).toLowerCase().includes("activ")).length);
    refs.metricRooms.textContent = String(habitaciones.filter((habitacion) => Number(habitacion.Estado) === 1).length);
    refs.metricPackages.textContent = String(paquetes.filter((paquete) => Number(paquete.Estado) === 1).length);
    refs.metricServices.textContent = String(servicios.filter((servicio) => Number(servicio.Estado) === 1).length);
    refs.metricTotal.textContent = `$${formatCurrency(reservas.reduce((sum, reserva) => sum + Number(reserva.total || 0), 0))}`;
  } catch (error) {
    console.error("Error cargando dashboard cliente:", error);
    refs.profileSummary.innerHTML = '<p class="empty-state">No fue posible cargar tu perfil.</p>';
    refs.recentReservations.innerHTML = '<p class="empty-state">No fue posible cargar tus reservas.</p>';
    refs.roomsGrid.innerHTML = '<p class="empty-state">No fue posible cargar las habitaciones.</p>';
    refs.packagesGrid.innerHTML = '<p class="empty-state">No fue posible cargar los paquetes.</p>';
    refs.servicesGrid.innerHTML = '<p class="empty-state">No fue posible cargar los servicios.</p>';
  }
}

document.addEventListener("DOMContentLoaded", initClienteDashboard);
