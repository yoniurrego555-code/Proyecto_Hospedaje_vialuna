import { apiUrl } from "../core/api-config.js";
import { createCrudModule } from "../core/crud-module.js";

function siguienteEstado(estadoActual) {
  if (estadoActual === "disponible") return "no_disponible";
  if (estadoActual === "no_disponible") return "inactivo";
  return "disponible";
}

function getTemplate() {
  return `
    <header class="module-header">
      <div class="header-left">
        <h1>Servicios</h1>
        <p>Crea, consulta, edita y elimina servicios adicionales.</p>
      </div>
      <div class="header-right">
        <button class="btn-primary" id="btnNuevoServicio" type="button">Nuevo servicio</button>
        <button class="btn-secondary" id="btnRecargar" type="button">Recargar</button>
      </div>
    </header>

    <div class="metrics-grid">
      <article class="metric-card"><span class="metric-title">Total</span><strong class="metric-value" id="totalServicios">0</strong></article>
      <article class="metric-card"><span class="metric-title">Disponibles</span><strong class="metric-value" id="totalDisponibles">0</strong></article>
      <article class="metric-card"><span class="metric-title">No disponibles</span><strong class="metric-value" id="totalNoDisponibles">0</strong></article>
    </div>

    <section class="content-grid">
      <article class="table-card">
        <div class="table-header"><h3 class="table-title" id="formTitle">Registra un nuevo servicio</h3></div>
        <div id="mensaje" class="message"></div>
        <form id="servicioForm" class="client-form">
          <input type="hidden" id="servicioId">
          <div class="form-grid">
            <div class="form-group"><label for="nombre">Nombre</label><input type="text" id="nombre" name="nombre" required></div>
            <div class="form-group"><label for="precio">Precio</label><input type="number" id="precio" name="precio" min="0" step="0.01" required></div>
            <div class="form-group"><label for="estado">Estado</label><select id="estado" name="estado" required><option value="disponible">Disponible</option><option value="no_disponible">No disponible</option><option value="inactivo">Inactivo</option></select></div>
            <div class="form-group full-width"><label for="descripcion">Descripcion</label><textarea id="descripcion" name="descripcion"></textarea></div>
          </div>
          <div class="form-actions">
            <button class="btn-primary" type="submit" id="submitButton">Guardar servicio</button>
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
        <div id="serviciosContainer" class="actions-grid"><div class="empty-state">Cargando servicios...</div></div>
      </article>
    </section>
  `;
}

function getElements(root) {
  return {
    form: root.querySelector("#servicioForm"),
    formTitle: root.querySelector("#formTitle"),
    submitButton: root.querySelector("#submitButton"),
    mensaje: root.querySelector("#mensaje"),
    contenedor: root.querySelector("#serviciosContainer"),
    buscador: root.querySelector("#buscador"),
    btnCancelarEdicion: root.querySelector("#btnCancelarEdicion"),
    btnNuevo: root.querySelector("#btnNuevoServicio"),
    btnRecargar: root.querySelector("#btnRecargar"),
    btnLimpiarBusqueda: root.querySelector("#btnLimpiarBusqueda"),
    btnListar: root.querySelector("#btnListar"),
    totalServicios: root.querySelector("#totalServicios"),
    totalDisponibles: root.querySelector("#totalDisponibles"),
    totalNoDisponibles: root.querySelector("#totalNoDisponibles")
  };
}

function createServiciosCrud(root = document) {
  return createCrudModule({
    baseUrl: apiUrl("servicios"),
    elements: getElements(root),
    formCreateTitle: "Registra un nuevo servicio",
    formEditTitle: (item) => `Editando servicio #${item.id}`,
    submitCreateText: "Guardar servicio",
    submitEditText: "Actualizar servicio",
    createMessage: "Servicio creado correctamente.",
    updateMessage: "Servicio actualizado correctamente.",
    deleteMessage: "Servicio eliminado correctamente.",
    reloadMessage: "Listado actualizado desde la base de datos.",
    emptyMessage: "No hay servicios para mostrar.",
    loadErrorMessage: "No fue posible cargar los servicios.",
    notFoundMessage: "No se encontro el servicio seleccionado.",
    deleteConfirm: (item) => `Deseas eliminar el servicio ${item.nombre}?`,
    searchText: (item) => [item.nombre, item.descripcion, item.estado].filter(Boolean).join(" "),
    getPayload: (form) => {
      const formData = new FormData(form);
      return {
        nombre: String(formData.get("nombre") || "").trim(),
        descripcion: String(formData.get("descripcion") || "").trim(),
        precio: Number(formData.get("precio")),
        estado: String(formData.get("estado") || "disponible").trim().toLowerCase()
      };
    },
    fillForm: (item) => {
      root.querySelector("#servicioId").value = item.id;
      root.querySelector("#nombre").value = item.nombre || "";
      root.querySelector("#descripcion").value = item.descripcion || "";
      root.querySelector("#precio").value = item.precio || "";
      root.querySelector("#estado").value = item.estado || "disponible";
    },
    onResetForm: () => {
      root.querySelector("#servicioId").value = "";
      root.querySelector("#estado").value = "disponible";
    },
    renderResumen: (items, elements) => {
      elements.totalServicios.textContent = items.length;
      elements.totalDisponibles.textContent = items.filter((item) => item.estado === "disponible").length;
      elements.totalNoDisponibles.textContent = items.filter((item) => item.estado === "no_disponible").length;
    },
    secondaryAction: {
      path: "estado",
      method: "PATCH",
      payload: (item) => ({ estado: siguienteEstado(item.estado) }),
      successMessage: (item) => `Estado actualizado a ${siguienteEstado(item.estado).replace("_", " ")}.`
    },
    renderCard: (item, { escapeHtml, formatMoney }) => `
      <article class="action-card">
        <div class="action-title">${escapeHtml(item.nombre)}</div>
        <div class="action-description">${escapeHtml(item.descripcion || "Sin descripcion registrada.")}</div>
        <div class="service-meta">
          <span><strong>Precio:</strong> ${formatMoney(item.precio)}</span>
          <span><strong>Estado:</strong> ${escapeHtml(String(item.estado || "").replace("_", " "))}</span>
        </div>
        <div class="card-actions">
          <button class="btn-secondary" type="button" data-action="editar" data-id="${item.id}">Editar</button>
          <button class="btn-secondary" type="button" data-action="secundaria" data-id="${item.id}">Cambiar estado</button>
          <button class="btn-danger" type="button" data-action="eliminar" data-id="${item.id}">Eliminar</button>
        </div>
      </article>
    `
  });
}

export function renderServicios(container) {
  container.innerHTML = getTemplate();
  return createServiciosCrud(container).init();
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("servicioForm")) {
    createServiciosCrud(document).init();
  }
});
