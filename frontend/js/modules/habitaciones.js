import { apiUrl, getConnectionErrorMessage } from "../core/api-config.js";

const BASE_URL = apiUrl("habitaciones");

function getTemplate() {
  return `
    <header class="module-header">
      <div class="header-left">
        <h1>Habitaciones</h1>
        <p>Gestiona habitaciones, disponibilidad y precios.</p>
      </div>
      <div class="header-right">
        <button class="btn-primary" id="btnNuevaHabitacion" type="button">Nueva habitacion</button>
        <button class="btn-secondary" id="btnRecargar" type="button">Recargar</button>
      </div>
    </header>

    <div class="metrics-grid">
      <article class="metric-card">
        <span class="metric-title">Total</span>
        <strong class="metric-value" id="totalHabitaciones">0</strong>
      </article>
      <article class="metric-card">
        <span class="metric-title">Disponibles</span>
        <strong class="metric-value" id="totalDisponibles">0</strong>
      </article>
      <article class="metric-card">
        <span class="metric-title">Reservadas</span>
        <strong class="metric-value" id="totalReservadas">0</strong>
      </article>
    </div>

    <section class="content-grid">
      <article class="table-card">
        <div class="table-header">
          <h3 class="table-title" id="formTitle">Registra una nueva habitacion</h3>
        </div>
        <div id="mensaje" class="message"></div>
        <form id="habitacionForm" class="client-form">
          <input type="hidden" id="habitacionId">
          <div class="form-grid">
            <div class="form-group">
              <label for="nombre">Nombre</label>
              <input type="text" id="nombre" name="nombre" required>
            </div>
            <div class="form-group">
              <label for="precio">Precio por noche</label>
              <input type="number" id="precio" name="precio" min="1" step="0.01" required>
            </div>
            <div class="form-group">
              <label for="capacidad">Capacidad</label>
              <input type="number" id="capacidad" name="capacidad" min="1" step="1" required>
            </div>
            <div class="form-group">
              <label for="estado">Estado</label>
              <select id="estado" name="estado" required>
                <option value="disponible">Disponible</option>
                <option value="reservada">Reservada</option>
                <option value="ocupada">Ocupada</option>
                <option value="mantenimiento">Mantenimiento</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label for="descripcion">Descripcion</label>
              <textarea id="descripcion" name="descripcion"></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-primary" type="submit" id="submitButton">Guardar habitacion</button>
            <button class="btn-secondary" type="button" id="btnCancelarEdicion">Cancelar</button>
          </div>
        </form>
      </article>

      <article class="table-card">
        <div class="table-header">
          <h3 class="table-title">Listado</h3>
          <div class="table-actions">
            <input class="search-input" type="search" id="buscador" placeholder="Buscar">
            <button class="btn-secondary" type="button" id="btnLimpiarBusqueda">Limpiar</button>
            <button class="btn-secondary" type="button" id="btnListar">Listar</button>
          </div>
        </div>
        <div id="habitacionesContainer" class="actions-grid">
          <div class="empty-state">Cargando habitaciones...</div>
        </div>
      </article>
    </section>
  `;
}

function pick(item, ...keys) {
  return keys.map((key) => item?.[key]).find((value) => value !== undefined && value !== null && value !== "");
}

function normalizeHabitacion(item) {
  return {
    id: pick(item, "id", "IDHabitacion", "id_habitacion"),
    nombre: pick(item, "nombre", "NombreHabitacion", "numero", "Numero") || "Habitacion",
    descripcion: pick(item, "descripcion", "Descripcion") || "",
    precio: Number(pick(item, "precio", "Costo", "Valor") || 0),
    capacidad: Number(pick(item, "capacidad", "CapacidadMaximaPersonas") || 1),
    estado: String(pick(item, "estado", "EstadoNombre", "Estado") || "disponible").toLowerCase()
  };
}

function createHabitacionesModule(root = document) {
  const state = {
    habitaciones: [],
    filtro: "",
    editandoId: null
  };

  const elements = {
    form: root.querySelector("#habitacionForm"),
    formTitle: root.querySelector("#formTitle"),
    submitButton: root.querySelector("#submitButton"),
    mensaje: root.querySelector("#mensaje"),
    habitacionesContainer: root.querySelector("#habitacionesContainer"),
    buscador: root.querySelector("#buscador"),
    totalHabitaciones: root.querySelector("#totalHabitaciones"),
    totalDisponibles: root.querySelector("#totalDisponibles"),
    totalReservadas: root.querySelector("#totalReservadas"),
    btnCancelarEdicion: root.querySelector("#btnCancelarEdicion"),
    btnNuevaHabitacion: root.querySelector("#btnNuevaHabitacion"),
    btnRecargar: root.querySelector("#btnRecargar"),
    btnLimpiarBusqueda: root.querySelector("#btnLimpiarBusqueda"),
    btnListar: root.querySelector("#btnListar")
  };

  function mostrarMensaje(texto, tipo = "success") {
    elements.mensaje.textContent = texto;
    elements.mensaje.className = `message show ${tipo}`;
  }

  function limpiarMensaje() {
    elements.mensaje.textContent = "";
    elements.mensaje.className = "message";
  }

  async function request(url, options = {}) {
    let response;

    try {
      response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {})
        },
        ...options
      });
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(getConnectionErrorMessage("la API de habitaciones"));
      }
      throw error;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.ok === false) {
      throw new Error(data.mensaje || data.error || "No se pudo completar la operacion");
    }

    return data;
  }

  async function listarHabitaciones() {
    const data = await request(BASE_URL);
    const rows = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
    state.habitaciones = rows.map(normalizeHabitacion);
    renderHabitacionesLista();
    renderResumen();
  }

  function renderResumen() {
    elements.totalHabitaciones.textContent = String(state.habitaciones.length);
    elements.totalDisponibles.textContent = String(state.habitaciones.filter((item) => item.estado === "disponible" || item.estado === "1").length);
    elements.totalReservadas.textContent = String(state.habitaciones.filter((item) => item.estado === "reservada").length);
  }

  function obtenerFiltradas() {
    const termino = state.filtro.trim().toLowerCase();
    if (!termino) {
      return state.habitaciones;
    }

    return state.habitaciones.filter((item) => [item.nombre, item.descripcion, item.estado].join(" ").toLowerCase().includes(termino));
  }

  function renderHabitacionesLista() {
    const habitaciones = obtenerFiltradas();

    if (!habitaciones.length) {
      elements.habitacionesContainer.innerHTML = '<div class="empty-state">No hay habitaciones para mostrar.</div>';
      return;
    }

    elements.habitacionesContainer.innerHTML = habitaciones.map((habitacion) => `
      <article class="action-card">
        <div class="action-title">${habitacion.nombre}</div>
        <div class="action-description">${habitacion.descripcion || "Sin descripcion registrada."}</div>
        <div class="room-meta">
          <span><strong>Precio:</strong> $${habitacion.precio.toLocaleString("es-CO")}</span>
          <span><strong>Capacidad:</strong> ${habitacion.capacidad}</span>
          <span><strong>Estado:</strong> ${habitacion.estado}</span>
        </div>
        <div class="card-actions">
          <button class="btn-secondary" type="button" data-action="editar" data-id="${habitacion.id}">Editar</button>
          <button class="btn-secondary" type="button" data-action="reservar" data-id="${habitacion.id}">Reservar</button>
          <button class="btn-danger" type="button" data-action="eliminar" data-id="${habitacion.id}">Eliminar</button>
        </div>
      </article>
    `).join("");
  }

  function limpiarFormulario() {
    state.editandoId = null;
    elements.form.reset();
    root.querySelector("#habitacionId").value = "";
    root.querySelector("#estado").value = "disponible";
    elements.formTitle.textContent = "Registra una nueva habitacion";
    elements.submitButton.textContent = "Guardar habitacion";
  }

  function cargarFormulario(habitacion) {
    state.editandoId = habitacion.id;
    root.querySelector("#habitacionId").value = habitacion.id;
    root.querySelector("#nombre").value = habitacion.nombre || "";
    root.querySelector("#descripcion").value = habitacion.descripcion || "";
    root.querySelector("#precio").value = habitacion.precio || "";
    root.querySelector("#capacidad").value = habitacion.capacidad || 1;
    root.querySelector("#estado").value = habitacion.estado || "disponible";
    elements.formTitle.textContent = `Editando habitacion #${habitacion.id}`;
    elements.submitButton.textContent = "Actualizar habitacion";
  }

  function payloadDesdeFormulario() {
    const formData = new FormData(elements.form);
    return {
      nombre: String(formData.get("nombre") || "").trim(),
      descripcion: String(formData.get("descripcion") || "").trim(),
      precio: Number(formData.get("precio")),
      capacidad: Number(formData.get("capacidad")),
      estado: String(formData.get("estado") || "disponible").trim().toLowerCase()
    };
  }

  async function manejarSubmit(event) {
    event.preventDefault();
    limpiarMensaje();

    try {
      const payload = payloadDesdeFormulario();
      const url = state.editandoId ? `${BASE_URL}/${state.editandoId}` : BASE_URL;
      await request(url, {
        method: state.editandoId ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      mostrarMensaje(state.editandoId ? "Habitacion actualizada correctamente." : "Habitacion creada correctamente.");
      limpiarFormulario();
      await listarHabitaciones();
    } catch (error) {
      mostrarMensaje(error.message, "error");
    }
  }

  async function manejarClick(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    const id = Number(button.dataset.id);
    const action = button.dataset.action;
    const habitacion = state.habitaciones.find((item) => Number(item.id) === id);

    if (!habitacion) {
      mostrarMensaje("No se encontro la habitacion seleccionada.", "error");
      return;
    }

    try {
      if (action === "editar") {
        cargarFormulario(habitacion);
        return;
      }

      if (action === "eliminar") {
        if (!window.confirm(`Deseas eliminar la habitacion ${habitacion.nombre}?`)) {
          return;
        }
        await request(`${BASE_URL}/${id}`, { method: "DELETE" });
        mostrarMensaje("Habitacion eliminada correctamente.");
      }

      if (action === "reservar") {
        await request(`${BASE_URL}/reservar/${id}`, { method: "POST" });
        mostrarMensaje("Habitacion marcada como reservada.");
      }

      await listarHabitaciones();
    } catch (error) {
      mostrarMensaje(error.message, "error");
    }
  }

  function registrarEventos() {
    elements.form.addEventListener("submit", manejarSubmit);
    elements.habitacionesContainer.addEventListener("click", manejarClick);
    elements.buscador.addEventListener("input", (event) => {
      state.filtro = event.target.value;
      renderHabitacionesLista();
    });
    elements.btnCancelarEdicion.addEventListener("click", () => {
      limpiarFormulario();
      limpiarMensaje();
    });
    elements.btnNuevaHabitacion.addEventListener("click", () => {
      limpiarFormulario();
      limpiarMensaje();
    });
    elements.btnRecargar.addEventListener("click", listarHabitaciones);
    elements.btnListar.addEventListener("click", listarHabitaciones);
    elements.btnLimpiarBusqueda.addEventListener("click", () => {
      state.filtro = "";
      elements.buscador.value = "";
      renderHabitacionesLista();
    });
  }

  async function init() {
    registrarEventos();
    limpiarFormulario();
    try {
      await listarHabitaciones();
    } catch (error) {
      mostrarMensaje(error.message, "error");
      elements.habitacionesContainer.innerHTML = '<div class="empty-state">No fue posible cargar las habitaciones.</div>';
    }
  }

  return { init };
}

export function renderHabitaciones(container) {
  container.innerHTML = getTemplate();
  return createHabitacionesModule(container).init();
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("habitacionForm")) {
    createHabitacionesModule(document).init();
  }
});
