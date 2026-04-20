import {
  clearSession,
  getClientes,
  getHabitaciones,
  getPaquetes,
  getReservas,
  getServicios,
  getSession,
  isAdminSession,
  isClientSession
} from "./api.js";

const LOGIN_URL = "public/login.html";
const CLIENT_DASHBOARD_URL = "pages/cliente-dashboard.html";
const ADMIN_ACCESS_MESSAGE_KEY = "vialuna_admin_access_message";

const usuario = getSession();
const isAdmin = isAdminSession(usuario);
const isClient = isClientSession(usuario);

if (!usuario) {
  window.location.href = LOGIN_URL;
}

if (isClient) {
  window.sessionStorage.setItem(
    ADMIN_ACCESS_MESSAGE_KEY,
    "No tienes permisos para acceder al panel administrativo."
  );
  window.location.href = CLIENT_DASHBOARD_URL;
}

const usuarioNombre = document.getElementById("usuarioNombre");
const resumenReservas = document.getElementById("resumenReservas");
const resumenClientes = document.getElementById("resumenClientes");
const resumenHabitaciones = document.getElementById("resumenHabitaciones");
const resumenActivas = document.getElementById("resumenActivas");
const resumenPaquetes = document.getElementById("resumenPaquetes");
const resumenServicios = document.getElementById("resumenServicios");
const reservasRecientes = document.getElementById("reservasRecientes");
const logoutBtn = document.getElementById("logoutBtn");

function applyDashboardAccess() {
  document.querySelectorAll("[data-requires-admin]").forEach((link) => {
    link.hidden = !isAdmin;
  });
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("es-CO");
}

function renderReservasRecientes(reservas) {
  const recientes = reservas.slice(0, 5);

  if (!recientes.length) {
    reservasRecientes.innerHTML = '<p class="empty-state">No hay reservas registradas todavia.</p>';
    return;
  }

  reservasRecientes.innerHTML = recientes
    .map(
      (reserva) => `
        <article class="list-card">
          <div>
            <h4>Reserva #${reserva.id_reserva}</h4>
            <p>${reserva.cliente?.nombreCompleto || "Cliente sin nombre"} - ${reserva.habitacion?.nombre || "Sin habitacion"}</p>
          </div>
          <div class="list-card__meta">
            <span class="badge">${reserva.estado?.nombre || "Sin estado"}</span>
            <strong>$${formatCurrency(reserva.total)}</strong>
          </div>
        </article>
      `
    )
    .join("");
}

async function init() {
  usuarioNombre.textContent = `${usuario.Nombre || ""} ${usuario.Apellido || ""}`.trim();
  applyDashboardAccess();

  try {
    const [clientes, habitaciones, reservas, paquetes, servicios] = await Promise.all([
      getClientes(),
      getHabitaciones(),
      getReservas(),
      getPaquetes(),
      getServicios()
    ]);

    const clientesActivos = clientes.filter((cliente) => Number(cliente.Estado) === 1);
    const activas = reservas.filter((reserva) => reserva.estado?.id === 1).length;
    const paquetesDisponibles = paquetes.filter((paquete) => Number(paquete.Estado) === 1).length;
    const serviciosActivos = servicios.filter((servicio) => Number(servicio.Estado) === 1).length;

    resumenReservas.textContent = String(reservas.length);
    resumenClientes.textContent = String(clientesActivos.length);
    resumenHabitaciones.textContent = String(habitaciones.length);
    resumenActivas.textContent = String(activas);
    resumenPaquetes.textContent = String(paquetesDisponibles);
    resumenServicios.textContent = String(serviciosActivos);
    renderReservasRecientes(reservas);
  } catch (error) {
    console.error("Error cargando dashboard:", error);
    reservasRecientes.innerHTML = '<p class="empty-state">No fue posible cargar el dashboard.</p>';
  }
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    clearSession();
    window.location.href = LOGIN_URL;
  });
}

init();
