import {
  getClientes,
  getHabitaciones,
  getPaquetes,
  getReservas,
  getServicios,
  getSession
} from "./api.js";
import { logout } from "./authGuard.js";

const routes = {
  dashboard: renderDashboard,
  reservas: () => cargarVistaExterna('reservas'),
  habitaciones: () => cargarVistaExterna('habitaciones'),
  paquetes: () => cargarVistaExterna('paquetes'),
  servicios: () => cargarVistaExterna('servicios'),
  clientes: () => cargarVistaExterna('usuarios'),
  'roles-permisos': () => cargarVistaExterna('roles-permisos'),
  roles: () => cargarVistaExterna('roles-permisos'),
  pagos: () => renderEmpty(refs.contenido, 'Módulo en desarrollo', 'El módulo de pagos está siendo desarrollado.')
};

let refs = {};

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("es-CO");
}

function getEstado(reserva) {
  return String(reserva?.EstadoNombre || reserva?.estado_nombre || reserva?.estado?.nombre || reserva?.Estado || "");
}

function setActiveNav(view) {
  document.querySelectorAll("[data-view]").forEach((item) => {
    item.classList.toggle("active", item.dataset.view === view);
  });
}

function renderEmpty(container, title, message) {
  container.innerHTML = `
    <section class="error-container">
      <article class="error-card">
        <h2>${title}</h2>
        <p>${message}</p>
        <button type="button" class="btn-primary" data-view="dashboard">Volver al dashboard</button>
      </article>
    </section>
  `;
}

export async function cargarVista(view = "dashboard") {
  const targetView = routes[view] ? view : "dashboard";

  if (!refs.contenido) {
    return;
  }

  setActiveNav(targetView);
  window.location.hash = targetView;
  refs.contenido.innerHTML = '<div class="loading-state">Cargando...</div>';

  try {
    await routes[targetView](refs.contenido);
  } catch (error) {
    console.error(`No fue posible cargar la vista ${targetView}:`, error);
    renderEmpty(refs.contenido, "No se pudo cargar la vista", error.message || "Intenta nuevamente.");
  }
}

async function cargarVistaExterna(vista) {
  try {
    const response = await fetch(`../${vista}.html`);
    if (!response.ok) {
      throw new Error(`No se pudo cargar ${vista}.html: ${response.status}`);
    }
    
    let html = await response.text();
    
    // Corregir rutas relativas para que funcionen dentro del dashboard
    html = html.replace(/href="\.\.\/css\//g, 'href="../../css/');
    html = html.replace(/src="\.\.\/js\//g, 'src="../../js/');
    
    // Crear un contenedor temporal para procesar el HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Extraer solo el contenido del main
    const mainContent = tempDiv.querySelector('main.content');
    if (!mainContent) {
      throw new Error(`No se encontró el contenido principal en ${vista}.html`);
    }
    
    // Insertar el contenido en el dashboard
    refs.contenido.innerHTML = mainContent.innerHTML;
    
    // Ejecutar scripts de la vista cargada
    ejecutarScriptsDeVista(vista);
    
  } catch (error) {
    console.error(`Error cargando vista ${vista}:`, error);
    renderEmpty(refs.contenido, `Error al cargar ${vista}`, error.message);
  }
}

function ejecutarScriptsDeVista(vista) {
  // Mapeo de vistas a sus scripts correspondientes
  const scriptMap = {
    'habitaciones': '../../js/modules/habitaciones.js',
    'servicios': '../../js/modules/servicios.js', 
    'paquetes': '../../js/modules/paquetes.js',
    'usuarios': '../../js/usuarios.js',
    'reservas': '../../js/modules/reservas.js',
    'clientes': '../../js/modules/clientes.js',
    'roles-permisos': null // Script inline en el HTML
  };
  
  // Roles y permisos tiene el script inline, necesita ejecutar sus funciones globales
  if (vista === 'roles-permisos') {
    setTimeout(() => {
      if (window.inicializarRolesPermisosAPI) {
        window.inicializarRolesPermisosAPI();
      }
    }, 200);
    return;
  }
  
  const scriptPath = scriptMap[vista];
  if (scriptPath) {
    // Eliminar scripts previos de la misma vista para evitar duplicados
    const existingScript = document.querySelector(`script[data-vista="${vista}"]`);
    if (existingScript) {
      existingScript.remove();
    }
    
    // Crear y cargar el nuevo script
    const script = document.createElement('script');
    script.type = 'module';
    script.src = scriptPath;
    script.setAttribute('data-vista', vista);
    
    script.onload = () => {
      console.log(`Script de ${vista} cargado correctamente`);
    };
    
    script.onerror = (error) => {
      console.error(`Error cargando script de ${vista}:`, error);
    };
    
    document.body.appendChild(script);
  }
}

export async function renderDashboard(container) {
  container.innerHTML = `
    <header class="module-header">
      <div class="header-left">
        <h1>Dashboard</h1>
        <p>Panel de control administrativo</p>
      </div>
      <div class="header-right">
        <span id="currentDate" class="current-date"></span>
      </div>
    </header>

    <div class="metrics-grid">
      <article class="metric-card">
        <div class="metric-header">
          <div class="metric-title">Reservas</div>
          <div class="metric-icon blue">R</div>
        </div>
        <div class="metric-value" id="totalReservations">0</div>
        <div class="metric-change">Total registradas</div>
      </article>
      <article class="metric-card">
        <div class="metric-header">
          <div class="metric-title">Activas</div>
          <div class="metric-icon green">A</div>
        </div>
        <div class="metric-value" id="activeReservations">0</div>
        <div class="metric-change positive">Reservas en curso</div>
      </article>
      <article class="metric-card">
        <div class="metric-header">
          <div class="metric-title">Habitaciones</div>
          <div class="metric-icon amber">H</div>
        </div>
        <div class="metric-value" id="totalRooms">0</div>
        <div class="metric-change">Catalogo disponible</div>
      </article>
      <article class="metric-card">
        <div class="metric-header">
          <div class="metric-title">Ingresos</div>
          <div class="metric-icon purple">$</div>
        </div>
        <div class="metric-value" id="totalRevenue">$0</div>
        <div class="metric-change positive">Total reservado</div>
      </article>
    </div>

    <div class="quick-actions">
      <div class="section-header">
        <h3>Modulos</h3>
      </div>
      <div class="actions-grid">
        <button type="button" class="action-card" data-view="habitaciones">
          <div class="action-title">Habitaciones</div>
          <div class="action-description">CRUD de habitaciones</div>
        </button>
        <button type="button" class="action-card" data-view="servicios">
          <div class="action-title">Servicios</div>
          <div class="action-description">CRUD de servicios</div>
        </button>
        <button type="button" class="action-card" data-view="paquetes">
          <div class="action-title">Paquetes</div>
          <div class="action-description">CRUD de paquetes</div>
        </button>
        <button type="button" class="action-card" data-view="reservas">
          <div class="action-title">Reservas</div>
          <div class="action-description">Gestion de reservas</div>
        </button>
      </div>
    </div>

    <section class="recent-reservations">
      <div class="table-card">
        <div class="table-header">
          <h3 class="table-title">Reservas recientes</h3>
          <button type="button" class="btn-secondary" data-view="reservas">Ver todas</button>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Habitacion</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Estado</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody id="recentReservationsTable">
              <tr><td colspan="7" class="text-center">Cargando...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;

  const [clientes, habitaciones, paquetes, servicios, reservas] = await Promise.all([
    getClientes(),
    getHabitaciones(),
    getPaquetes(),
    getServicios(),
    getReservas()
  ]);

  const reservasList = Array.isArray(reservas) ? reservas : reservas?.data || [];
  const clientesList = Array.isArray(clientes) ? clientes : clientes?.data || [];
  const habitacionesList = Array.isArray(habitaciones) ? habitaciones : habitaciones?.data || [];
  const activeReservations = reservasList.filter((reserva) => {
    const estado = getEstado(reserva).toLowerCase();
    return !estado.includes("cancel") && !estado.includes("anul");
  });

  container.querySelector("#totalReservations").textContent = String(reservasList.length);
  container.querySelector("#activeReservations").textContent = String(activeReservations.length);
  container.querySelector("#totalRooms").textContent = String(habitacionesList.length);
  container.querySelector("#totalRevenue").textContent = `$${formatCurrency(reservasList.reduce((sum, item) => sum + Number(item.total || item.Total || 0), 0))}`;
  container.querySelector("#currentDate").textContent = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const table = container.querySelector("#recentReservationsTable");
  const recientes = reservasList.slice(0, 5);

  if (!recientes.length) {
    table.innerHTML = '<tr><td colspan="7" class="text-center">No hay reservas registradas</td></tr>';
    return;
  }

  table.innerHTML = recientes.map((reserva) => {
    const cliente = clientesList.find((item) => String(item.id_cliente || item.IDCliente || item.NroDocumento) === String(reserva.id_cliente || reserva.IDCliente || reserva.NroDocumento));
    const habitacion = habitacionesList.find((item) => String(item.id_habitacion || item.IDHabitacion) === String(reserva.id_habitacion || reserva.IDHabitacion));
    const clienteNombre = cliente ? `${cliente.Nombre || ""} ${cliente.Apellido || ""}`.trim() : reserva.nr_documento || "Sin cliente";
    const habitacionNombre = habitacion?.NombreHabitacion || habitacion?.nombre || reserva.habitacion?.nombre || "Sin habitacion";

    return `
      <tr>
        <td>#${reserva.id_reserva || reserva.IDReserva || reserva.id || "-"}</td>
        <td>${clienteNombre || "Sin cliente"}</td>
        <td>${habitacionNombre}</td>
        <td>${reserva.fecha_inicio || reserva.fecha_entrada || "-"}</td>
        <td>${reserva.fecha_fin || reserva.fecha_salida || "-"}</td>
        <td><span class="status-badge status-active">${getEstado(reserva) || "Sin estado"}</span></td>
        <td>$${formatCurrency(reserva.total || reserva.Total || 0)}</td>
      </tr>
    `;
  }).join("");
}

function setupSidebar() {
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-view]");
    if (!trigger) {
      return;
    }

    event.preventDefault();
    cargarVista(trigger.dataset.view);
  });

  window.addEventListener("hashchange", () => {
    const view = window.location.hash.slice(1) || "dashboard";
    if (routes[view]) {
      cargarVista(view);
    }
  });
}

export function initAdminDashboard() {
  const session = getSession();

  refs = {
    contenido: document.getElementById("contenido") || document.getElementById("app-content"),
    userName: document.getElementById("userName"),
    logoutBtn: document.getElementById("logoutBtn"),
    menuToggle: document.getElementById("menuToggle"),
    sidebar: document.getElementById("sidebar")
  };

  if (refs.userName) {
    refs.userName.textContent = session?.nombre || session?.Nombre || "Administrador";
  }

  if (refs.logoutBtn) {
    refs.logoutBtn.addEventListener("click", logout);
  }

  if (refs.menuToggle && refs.sidebar) {
    refs.menuToggle.addEventListener("click", () => {
      refs.sidebar.classList.toggle("collapsed");
      refs.contenido?.classList.toggle("expanded");
    });
  }

  window.cargarVista = cargarVista;
  setupSidebar();
  cargarVista(window.location.hash.slice(1) || "dashboard");
}

document.addEventListener("DOMContentLoaded", initAdminDashboard);
