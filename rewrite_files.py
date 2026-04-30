from pathlib import Path


FILES = {
    r"frontend/public/login.html": """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login | ViaLuna</title>
  <link rel="stylesheet" href="../css/app.css">
</head>
<body>
  <main class="auth-layout">
    <section class="auth-card">
      <div class="auth-card__header">
        <span class="badge">Acceso al sistema</span>
        <h2>Inicia sesion en ViaLuna</h2>
        <p>Usa el correo y el documento con el que fue registrado el cliente.</p>
      </div>

      <form id="loginForm" class="auth-form">
        <div class="field-group">
          <label for="email">Correo electronico</label>
          <input type="email" id="email" placeholder="cliente@correo.com" required>
        </div>

        <div class="field-group">
          <label for="documento">Numero de documento</label>
          <input type="text" id="documento" placeholder="Ingresa tu documento" required>
        </div>

        <p id="loginError" class="feedback" aria-live="polite"></p>

        <div class="form-actions">
          <button type="submit" class="btn-primary">Ingresar</button>
          <button type="button" class="btn-secondary" onclick="irRegistro()">Registrarme</button>
        </div>
      </form>
    </section>
  </main>

  <script type="module" src="../js/auth.main.js"></script>
</body>
</html>
""",
    r"frontend/pages/registro.html": """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registro | ViaLuna</title>
  <link rel="stylesheet" href="../css/app.css">
</head>
<body>
  <main class="auth-layout">
    <section class="auth-card auth-card--wide">
      <div class="auth-card__header">
        <span class="badge">Registro de clientes</span>
        <h2>Crea tu cuenta para reservar</h2>
        <p>Este formulario registra al cliente directamente en la base de datos del proyecto.</p>
      </div>

      <form id="registroForm" class="auth-form">
        <div class="form-grid">
          <div class="field-group">
            <label for="documento">Documento</label>
            <input type="text" id="documento" required>
          </div>

          <div class="field-group">
            <label for="telefono">Telefono</label>
            <input type="tel" id="telefono" required>
          </div>

          <div class="field-group">
            <label for="nombre">Nombre</label>
            <input type="text" id="nombre" required>
          </div>

          <div class="field-group">
            <label for="apellido">Apellido</label>
            <input type="text" id="apellido" required>
          </div>

          <div class="field-group full">
            <label for="direccion">Direccion</label>
            <input type="text" id="direccion" required>
          </div>

          <div class="field-group full">
            <label for="email">Correo electronico</label>
            <input type="email" id="email" required>
          </div>
        </div>

        <p id="registroFeedback" class="feedback" aria-live="polite"></p>

        <div class="form-actions">
          <button type="submit" class="btn-primary">Guardar registro</button>
          <a class="btn-secondary" href="../public/login.html">Volver al login</a>
        </div>
      </form>
    </section>
  </main>

  <script type="module" src="../js/registro.main.js"></script>
</body>
</html>
""",
    r"frontend/index.html": """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard | ViaLuna</title>
  <link rel="stylesheet" href="./css/app.css">
</head>
<body>
  <div class="page-shell">
    <header class="page-header">
      <div class="page-header__inner">
        <a class="brand" href="./index.html">
          <div class="brand__mark">VL</div>
          <div class="brand__text">
            <h1>Hospedaje ViaLuna</h1>
            <p>Dashboard operativo del sistema</p>
          </div>
        </a>

        <nav class="main-nav">
          <a class="active" href="./index.html">Dashboard</a>
          <a href="./pages/reservas.html">Reservas</a>
          <a href="./pages/registro.html">Registro</a>
        </nav>

        <div class="header-actions">
          <span class="user-chip" id="usuarioNombre">Usuario</span>
          <button type="button" class="btn-danger" id="logoutBtn">Cerrar sesion</button>
        </div>
      </div>
    </header>

    <main class="page-content">
      <section class="hero">
        <article class="hero-card">
          <span class="badge">Gestion centralizada</span>
          <h2>Administra clientes, habitaciones y reservas desde un solo flujo</h2>
          <p>
            El sistema quedo enfocado en los modulos clave del proyecto: autenticacion,
            registro de clientes, dashboard y CRUD completo de reservas conectado al backend.
          </p>
          <div class="hero-card__actions">
            <a class="btn-primary" href="./pages/reservas.html">Abrir modulo de reservas</a>
            <a class="btn-secondary" href="./pages/registro.html">Registrar cliente</a>
          </div>
        </article>

        <article class="panel">
          <div class="section-title">
            <div>
              <h2>Actividad reciente</h2>
              <p>Ultimas reservas registradas en la base de datos.</p>
            </div>
          </div>
          <div id="reservasRecientes" class="list-stack"></div>
        </article>
      </section>

      <section class="metrics-grid">
        <article class="metric-card">
          <span>Reservas totales</span>
          <strong id="resumenReservas">0</strong>
        </article>
        <article class="metric-card">
          <span>Clientes activos</span>
          <strong id="resumenClientes">0</strong>
        </article>
        <article class="metric-card">
          <span>Habitaciones registradas</span>
          <strong id="resumenHabitaciones">0</strong>
        </article>
        <article class="metric-card">
          <span>Reservas activas</span>
          <strong id="resumenActivas">0</strong>
        </article>
      </section>

      <section class="content-grid">
        <article class="panel">
          <div class="section-title">
            <div>
              <h2>Habitaciones disponibles</h2>
              <p>Selecciona una habitacion y ve directo al formulario de reserva.</p>
            </div>
          </div>
          <div id="habitacionesGrid" class="room-grid"></div>
        </article>

        <article class="panel">
          <div class="section-title">
            <div>
              <h2>Accesos rapidos</h2>
              <p>Funciones principales ya organizadas.</p>
            </div>
          </div>
          <div class="list-stack">
            <article class="list-card">
              <div>
                <h4>CRUD de reservas</h4>
                <p>Crea, actualiza y cancela reservas con paquetes y servicios.</p>
              </div>
              <a class="btn-primary" href="./pages/reservas.html">Gestionar</a>
            </article>
            <article class="list-card">
              <div>
                <h4>Registro de clientes</h4>
                <p>Guarda nuevos clientes en la base de datos y habilita su login.</p>
              </div>
              <a class="btn-secondary" href="./pages/registro.html">Registrar</a>
            </article>
          </div>
        </article>
      </section>
    </main>
  </div>

  <script type="module" src="./js/app.main.js"></script>
</body>
</html>
""",
    r"frontend/pages/reservas.html": """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reservas | ViaLuna</title>
  <link rel="stylesheet" href="../css/app.css">
</head>
<body>
  <div class="page-shell">
    <header class="page-header">
      <div class="page-header__inner">
        <a class="brand" href="../index.html">
          <div class="brand__mark">VL</div>
          <div class="brand__text">
            <h1>Modulo de Reservas</h1>
            <p>CRUD completo conectado a la base de datos</p>
          </div>
        </a>

        <nav class="main-nav">
          <a href="../index.html">Dashboard</a>
          <a class="active" href="./reservas.html">Reservas</a>
          <a href="./registro.html">Registro</a>
        </nav>

        <div class="header-actions">
          <span class="user-chip" id="userName">Usuario</span>
          <button type="button" class="btn-danger" id="logoutBtn">Cerrar sesion</button>
        </div>
      </div>
    </header>

    <main class="page-content">
      <section class="page-hero">
        <span class="badge">Reservas</span>
        <h2 id="formTitle">Nueva reserva</h2>
        <p>Crea, edita o cancela reservas. El subtotal no se muestra porque no existe como campo en la base de datos.</p>
      </section>

      <div class="reservation-layout">
        <section class="panel">
          <form id="reservaForm" class="reservation-form">
            <div class="form-grid">
              <div class="field-group">
                <label for="cliente">Cliente</label>
                <select id="cliente" required></select>
              </div>

              <div class="field-group">
                <label for="documento">Documento</label>
                <input type="text" id="documento" readonly>
              </div>

              <div class="field-group">
                <label for="clienteEmail">Correo</label>
                <input type="email" id="clienteEmail" readonly>
              </div>

              <div class="field-group">
                <label for="clienteTelefono">Telefono</label>
                <input type="text" id="clienteTelefono" readonly>
              </div>

              <div class="field-group">
                <label for="fechaInicio">Fecha de inicio</label>
                <input type="date" id="fechaInicio" required>
              </div>

              <div class="field-group">
                <label for="fechaFin">Fecha de fin</label>
                <input type="date" id="fechaFin" required>
              </div>

              <div class="field-group">
                <label for="metodoPago">Metodo de pago</label>
                <select id="metodoPago" required></select>
              </div>

              <div class="field-group">
                <label for="estadoReserva">Estado</label>
                <select id="estadoReserva" required></select>
              </div>
            </div>

            <div class="panel" style="padding: 18px;">
              <div class="section-title">
                <div>
                  <h3>Habitaciones</h3>
                  <p>Selecciona una habitacion disponible.</p>
                </div>
              </div>
              <div id="habitacionesGrid" class="selection-grid"></div>
            </div>

            <div class="panel" style="padding: 18px;">
              <div class="section-title">
                <div>
                  <h3>Paquetes</h3>
                  <p>Agrega paquetes opcionales a la reserva.</p>
                </div>
              </div>
              <div id="paquetesGrid" class="selection-grid"></div>
            </div>

            <div class="panel" style="padding: 18px;">
              <div class="section-title">
                <div>
                  <h3>Servicios</h3>
                  <p>Selecciona los servicios adicionales requeridos.</p>
                </div>
              </div>
              <div id="serviciosGrid" class="selection-grid"></div>
            </div>

            <div class="summary-card">
              <div>
                <span class="muted-text">Total calculado</span>
                <strong id="totalReserva">$0</strong>
              </div>
              <div class="form-actions">
                <button type="submit" class="btn-primary" id="submitBtn">Guardar reserva</button>
                <button type="button" class="btn-secondary" id="resetBtn">Limpiar formulario</button>
              </div>
            </div>

            <p id="reservaFeedback" class="feedback" aria-live="polite"></p>
          </form>
        </section>

        <aside class="panel">
          <div class="section-title">
            <div>
              <h2>Clientes activos</h2>
              <p>Seleccion rapido para diligenciar el formulario.</p>
            </div>
          </div>
          <div id="clientsTable"></div>
        </aside>
      </div>

      <section class="panel" style="margin-top: 24px;">
        <div class="section-title">
          <div>
            <h2>Reservas registradas</h2>
            <p>Listado actualizado desde la base de datos.</p>
          </div>
        </div>
        <div id="reservasTable"></div>
      </section>
    </main>
  </div>

  <script type="module" src="../js/reservas.full.js"></script>
</body>
</html>
""",
    r"frontend/js/auth.main.js": """import { clearSession, getSession, loginCliente, saveSession } from "./api.js";

const LOGIN_SUCCESS_URL = "../index.html";
const REGISTRO_URL = "../pages/registro.html";

clearSession();

const usuarioActual = getSession();
if (usuarioActual) {
  window.location.href = LOGIN_SUCCESS_URL;
}

const form = document.getElementById("loginForm");
const errorBox = document.getElementById("loginError");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorBox.textContent = "";

    const Email = document.getElementById("email").value.trim();
    const NroDocumento = document.getElementById("documento").value.trim();

    try {
      const data = await loginCliente({ Email, NroDocumento });
      saveSession(data.usuario);
      window.location.href = LOGIN_SUCCESS_URL;
    } catch (error) {
      console.error("Error en login:", error);
      errorBox.textContent = error.message;
    }
  });
}

window.irRegistro = function irRegistro() {
  window.location.href = REGISTRO_URL;
};
""",
    r"frontend/js/registro.main.js": """import { createCliente } from "./api.js";

const LOGIN_URL = "../public/login.html";
const form = document.getElementById("registroForm");
const feedback = document.getElementById("registroFeedback");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.textContent = "";
    feedback.className = "feedback";

    const data = {
      NroDocumento: document.getElementById("documento").value.trim(),
      Nombre: document.getElementById("nombre").value.trim(),
      Apellido: document.getElementById("apellido").value.trim(),
      Direccion: document.getElementById("direccion").value.trim(),
      Email: document.getElementById("email").value.trim(),
      Telefono: document.getElementById("telefono").value.trim(),
      Estado: 1,
      IDRol: 2
    };

    try {
      await createCliente(data);
      feedback.textContent = "Registro exitoso. Ya puedes iniciar sesion.";
      feedback.classList.add("success");
      form.reset();
      window.setTimeout(() => {
        window.location.href = LOGIN_URL;
      }, 1200);
    } catch (error) {
      console.error("Error en registro:", error);
      feedback.textContent = error.message;
      feedback.classList.add("error");
    }
  });
}
""",
    r"frontend/js/app.main.js": """import {
  clearSession,
  getClientes,
  getHabitaciones,
  getReservas,
  getSession
} from "./api.js";

const LOGIN_URL = "public/login.html";
const RESERVAS_URL = "pages/reservas.html";

const usuario = getSession();

if (!usuario) {
  window.location.href = LOGIN_URL;
}

const usuarioNombre = document.getElementById("usuarioNombre");
const resumenReservas = document.getElementById("resumenReservas");
const resumenClientes = document.getElementById("resumenClientes");
const resumenHabitaciones = document.getElementById("resumenHabitaciones");
const resumenActivas = document.getElementById("resumenActivas");
const habitacionesGrid = document.getElementById("habitacionesGrid");
const reservasRecientes = document.getElementById("reservasRecientes");
const logoutBtn = document.getElementById("logoutBtn");

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("es-CO");
}

function renderHabitaciones(habitaciones) {
  habitacionesGrid.innerHTML = habitaciones
    .filter((habitacion) => Number(habitacion.Estado) === 1)
    .map(
      (habitacion) => `
        <article class="room-card">
          <div class="room-card__top">
            <span class="badge badge-soft">Disponible</span>
            <strong>$${formatCurrency(habitacion.Costo)}</strong>
          </div>
          <h3>${habitacion.NombreHabitacion}</h3>
          <p>${habitacion.Descripcion}</p>
          <button type="button" data-room-id="${habitacion.IDHabitacion}" class="btn-primary">
            Crear reserva
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
            <p>${reserva.cliente?.nombreCompleto || "Cliente sin nombre"} · ${reserva.habitacion?.nombre || "Sin habitacion"}</p>
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

  try {
    const [clientes, habitaciones, reservas] = await Promise.all([
      getClientes(),
      getHabitaciones(),
      getReservas()
    ]);

    const clientesActivos = clientes.filter((cliente) => Number(cliente.Estado) === 1);
    const activas = reservas.filter((reserva) => reserva.estado?.id === 1).length;

    resumenReservas.textContent = String(reservas.length);
    resumenClientes.textContent = String(clientesActivos.length);
    resumenHabitaciones.textContent = String(habitaciones.length);
    resumenActivas.textContent = String(activas);

    renderHabitaciones(habitaciones);
    renderReservasRecientes(reservas);
  } catch (error) {
    console.error("Error cargando dashboard:", error);
    habitacionesGrid.innerHTML = '<p class="empty-state">No fue posible cargar el dashboard.</p>';
    reservasRecientes.innerHTML = "";
  }
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    clearSession();
    window.location.href = LOGIN_URL;
  });
}

init();
""",
    r"frontend/js/reservas.full.js": """import {
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
  getSession
} from "./api.js";

const LOGIN_URL = "../public/login.html";
const ESTADO_CANCELADA = 2;
const usuario = getSession();

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
  selectedRoomId: params.get("habitacion") || "",
  selectedPackageIds: new Set(),
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
  fechaInicio: document.getElementById("fechaInicio"),
  fechaFin: document.getElementById("fechaFin"),
  metodoPago: document.getElementById("metodoPago"),
  estadoReserva: document.getElementById("estadoReserva"),
  habitacionesGrid: document.getElementById("habitacionesGrid"),
  paquetesGrid: document.getElementById("paquetesGrid"),
  serviciosGrid: document.getElementById("serviciosGrid"),
  totalReserva: document.getElementById("totalReserva"),
  clientsTable: document.getElementById("clientsTable"),
  reservasTable: document.getElementById("reservasTable")
};

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("es-CO");
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
  return state.habitaciones.find(
    (habitacion) => String(habitacion.IDHabitacion) === String(state.selectedRoomId)
  );
}

function getSelectedPackages() {
  return state.paquetes.filter((paquete) => state.selectedPackageIds.has(paquete.IDPaquete));
}

function getSelectedServices() {
  return state.servicios.filter((servicio) => state.selectedServiceIds.has(servicio.IDServicio));
}

function calculateTotal() {
  const room = getSelectedRoom();
  const start = refs.fechaInicio.value;
  const end = refs.fechaFin.value;

  if (!room || !start || !end) {
    refs.totalReserva.textContent = "$0";
    return 0;
  }

  const nights = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));

  if (nights <= 0) {
    refs.totalReserva.textContent = "$0";
    return 0;
  }

  const roomTotal = nights * Number(room.Costo || 0);
  const packagesTotal = getSelectedPackages().reduce(
    (acc, paquete) => acc + Number(paquete.Precio || 0),
    0
  );
  const servicesTotal = getSelectedServices().reduce(
    (acc, servicio) => acc + Number(servicio.Costo || 0),
    0
  );
  const total = roomTotal + packagesTotal + servicesTotal;

  refs.totalReserva.textContent = `$${formatCurrency(total)}`;
  return total;
}

function updateClientSummary() {
  const cliente = getSelectedClient();

  refs.documentoInput.value = cliente?.NroDocumento || "";
  refs.clienteEmail.value = cliente?.Email || "";
  refs.clienteTelefono.value = cliente?.Telefono || "";
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
    refs.clientsTable.innerHTML = '<p class="empty-state">No hay clientes disponibles.</p>';
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
      const selected = String(habitacion.IDHabitacion) === String(state.selectedRoomId);

      return `
        <article class="selection-card ${selected ? "is-selected" : ""}">
          <div class="selection-card__header">
            <h3>${habitacion.NombreHabitacion}</h3>
            <strong>$${formatCurrency(habitacion.Costo)}</strong>
          </div>
          <p>${habitacion.Descripcion}</p>
          <button type="button" class="${selected ? "btn-secondary" : "btn-primary"}" data-room="${habitacion.IDHabitacion}">
            ${selected ? "Seleccionada" : "Seleccionar"}
          </button>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll("[data-room]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedRoomId = button.dataset.room;
      renderRooms();
      calculateTotal();
    });
  });
}

function renderPackages() {
  refs.paquetesGrid.innerHTML = state.paquetes
    .filter((paquete) => Number(paquete.Estado) === 1)
    .map((paquete) => {
      const selected = state.selectedPackageIds.has(paquete.IDPaquete);

      return `
        <article class="selection-card ${selected ? "is-selected" : ""}">
          <div class="selection-card__header">
            <h3>${paquete.NombrePaquete}</h3>
            <strong>$${formatCurrency(paquete.Precio)}</strong>
          </div>
          <p>${paquete.Descripcion}</p>
          <p class="muted-text">Servicio incluido: ${paquete.ServicioIncluidoNombre || "No definido"}</p>
          <p class="muted-text">${paquete.ServicioIncluidoDescripcion || "Sin descripcion adicional"}</p>
          <button type="button" class="${selected ? "btn-secondary" : "btn-primary"}" data-package="${paquete.IDPaquete}">
            ${selected ? "Quitar" : "Agregar"}
          </button>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll("[data-package]").forEach((button) => {
    button.addEventListener("click", () => {
      const packageId = Number(button.dataset.package);

      if (state.selectedPackageIds.has(packageId)) {
        state.selectedPackageIds.delete(packageId);
      } else {
        state.selectedPackageIds.add(packageId);
      }

      renderPackages();
      calculateTotal();
    });
  });
}

function renderServices() {
  refs.serviciosGrid.innerHTML = state.servicios
    .filter((servicio) => Number(servicio.Estado) === 1)
    .map((servicio) => {
      const selected = state.selectedServiceIds.has(servicio.IDServicio);

      return `
        <article class="selection-card ${selected ? "is-selected" : ""}">
          <div class="selection-card__header">
            <h3>${servicio.NombreServicio}</h3>
            <strong>$${formatCurrency(servicio.Costo)}</strong>
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
      calculateTotal();
    });
  });
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
  if (!state.reservas.length) {
    refs.reservasTable.innerHTML = '<p class="empty-state">Aun no hay reservas registradas.</p>';
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
          ${state.reservas
            .map((reserva) => {
              const cancelada = Number(reserva.estado?.id) === ESTADO_CANCELADA;

              return `
                <tr>
                  <td>#${reserva.id_reserva}</td>
                  <td>${reserva.cliente?.nombreCompleto || reserva.nr_documento}</td>
                  <td>${reserva.habitacion?.nombre || "Sin habitacion"}</td>
                  <td>${reserva.fecha_inicio} al ${reserva.fecha_fin}</td>
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
  state.selectedPackageIds = new Set();
  state.selectedServiceIds = new Set();
  state.selectedRoomId = params.get("habitacion") || "";

  refs.formTitle.textContent = "Nueva reserva";
  refs.submitBtn.textContent = "Guardar reserva";
  refs.clienteSelect.value = state.selectedClientId;
  refs.fechaInicio.value = "";
  refs.fechaFin.value = "";
  refs.metodoPago.value = "";
  refs.estadoReserva.value = "1";

  updateClientSummary();
  renderRooms();
  renderPackages();
  renderServices();
  calculateTotal();
}

function startEditing(reservationId) {
  const reserva = state.reservas.find((item) => item.id_reserva === reservationId);

  if (!reserva) {
    return;
  }

  state.editingReservationId = reservationId;
  state.selectedClientId = String(reserva.cliente?.nroDocumento || reserva.id_cliente);
  state.selectedRoomId = String(reserva.habitacion?.id || "");
  state.selectedPackageIds = new Set(reserva.paquetes.map((paquete) => paquete.id));
  state.selectedServiceIds = new Set(reserva.servicios.map((servicio) => servicio.id));

  refs.formTitle.textContent = `Editar reserva #${reserva.id_reserva}`;
  refs.submitBtn.textContent = "Actualizar reserva";
  refs.clienteSelect.value = state.selectedClientId;
  refs.fechaInicio.value = reserva.fecha_inicio;
  refs.fechaFin.value = reserva.fecha_fin;
  refs.metodoPago.value = String(reserva.metodoPago?.id || "");
  refs.estadoReserva.value = String(reserva.estado?.id || 1);

  updateClientSummary();
  renderRooms();
  renderPackages();
  renderServices();
  calculateTotal();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getPayload() {
  return {
    id_cliente: Number(state.selectedClientId),
    nr_documento: refs.documentoInput.value.trim(),
    fecha_inicio: refs.fechaInicio.value,
    fecha_fin: refs.fechaFin.value,
    id_estado_reserva: Number(refs.estadoReserva.value),
    id_metodo_pago: Number(refs.metodoPago.value),
    id_habitacion: Number(state.selectedRoomId),
    paquetes: [...state.selectedPackageIds],
    servicios: [...state.selectedServiceIds]
  };
}

async function refreshReservas() {
  state.reservas = await getReservas();
  renderReservasTable();
}

async function init() {
  refs.userName.textContent = `${usuario.Nombre || ""} ${usuario.Apellido || ""}`.trim();

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

    state.clientes = clientes.filter((cliente) => Number(cliente.Estado) === 1);
    state.habitaciones = habitaciones;
    state.paquetes = paquetes;
    state.servicios = servicios;
    state.metodosPago = metodosPago;
    state.estados = estados;
    state.reservas = reservas;

    if (!state.clientes.some((cliente) => String(cliente.NroDocumento) === state.selectedClientId)) {
      state.selectedClientId = state.clientes[0] ? String(state.clientes[0].NroDocumento) : "";
    }

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
    calculateTotal();
  } catch (error) {
    console.error("Error inicializando modulo de reservas:", error);
    setFeedback("No fue posible cargar la informacion del modulo de reservas", "error");
  }
}

refs.clienteSelect.addEventListener("change", () => {
  state.selectedClientId = refs.clienteSelect.value;
  updateClientSummary();
});

refs.fechaInicio.addEventListener("change", calculateTotal);
refs.fechaFin.addEventListener("change", calculateTotal);
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

    const total = calculateTotal();

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
""",
    r"frontend/js/api.js": """export const API_URL = "http://localhost:3000/api";
export const SESSION_KEY = "vialuna_usuario";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || data?.mensaje || "No fue posible completar la solicitud");
  }

  return data;
}

export function saveSession(usuario) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("usuario");
}

export function loginCliente(payload) {
  return request("/clientes/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getClientes() {
  return request("/clientes");
}

export function createCliente(payload) {
  return request("/clientes", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getHabitaciones() {
  return request("/habitacion");
}

export function getServicios() {
  return request("/servicios");
}

export function getPaquetes() {
  return request("/paquetes");
}

export function getMetodosPago() {
  return request("/metodopago");
}

export function getEstadosReserva() {
  return request("/estadosreserva");
}

export function getReservas() {
  return request("/reservas");
}

export function crearReserva(payload) {
  return request("/reservas", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function actualizarReserva(id, payload) {
  return request(`/reservas/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function cancelarReserva(id) {
  return request(`/reservas/${id}`, {
    method: "DELETE"
  });
}
""",
}


for relative_path, content in FILES.items():
  Path(relative_path).write_text(content, encoding="utf-8")
