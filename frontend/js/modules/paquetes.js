import { apiUrl } from "../core/api-config.js";
import { createCrudModule } from "../core/crud-module.js";

function siguienteEstado(estadoActual) {
  if (estadoActual === "disponible") return "agotado";
  if (estadoActual === "agotado") return "inactivo";
  return "disponible";
}

function getTemplate() {
  return `
    <header class="module-header">
      <div class="header-left">
        <h1>Paquetes</h1>
        <p>Crea, consulta, edita y elimina paquetes comerciales.</p>
      </div>
      <div class="header-right">
        <button class="btn-primary" id="btnNuevoPaquete" type="button">Nuevo paquete</button>
        <button class="btn-secondary" id="btnRecargar" type="button">Recargar</button>
      </div>
    </header>

    <div class="metrics-grid">
      <article class="metric-card"><span class="metric-title">Total</span><strong class="metric-value" id="totalPaquetes">0</strong></article>
      <article class="metric-card"><span class="metric-title">Disponibles</span><strong class="metric-value" id="totalDisponibles">0</strong></article>
      <article class="metric-card"><span class="metric-title">Agotados</span><strong class="metric-value" id="totalAgotados">0</strong></article>
    </div>

    <section class="content-grid">
      <article class="table-card">
        <div class="table-header"><h3 class="table-title" id="formTitle">Registra un nuevo paquete</h3></div>
        <div id="mensaje" class="message"></div>
        <form id="paqueteForm" class="client-form">
          <input type="hidden" id="paqueteId">
          <div class="form-grid">
            <div class="form-group"><label for="nombre">Nombre</label><input type="text" id="nombre" name="nombre" required></div>
            <div class="form-group"><label for="precio">Precio</label><input type="number" id="precio" name="precio" min="0" step="0.01" required></div>
            <div class="form-group"><label for="estado">Estado</label><select id="estado" name="estado" required><option value="disponible">Disponible</option><option value="agotado">Agotado</option><option value="inactivo">Inactivo</option></select></div>
            <div class="form-group full-width"><label for="descripcion">Descripcion</label><textarea id="descripcion" name="descripcion"></textarea></div>
          </div>
          <div class="form-actions">
            <button class="btn-primary" type="submit" id="submitButton">Guardar paquete</button>
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
        <div id="contenedor" class="actions-grid"><div class="empty-state">Cargando paquetes...</div></div>
      </article>
    </section>
  `;
}

function getElements(root) {
  return {
    form: root.querySelector("#paqueteForm"),
    formTitle: root.querySelector("#formTitle"),
    submitButton: root.querySelector("#submitButton"),
    mensaje: root.querySelector("#mensaje"),
    contenedor: root.querySelector("#contenedor"),
    buscador: root.querySelector("#buscador"),
    btnCancelarEdicion: root.querySelector("#btnCancelarEdicion"),
    btnNuevo: root.querySelector("#btnNuevoPaquete"),
    btnRecargar: root.querySelector("#btnRecargar"),
    btnLimpiarBusqueda: root.querySelector("#btnLimpiarBusqueda"),
    btnListar: root.querySelector("#btnListar"),
    totalPaquetes: root.querySelector("#totalPaquetes"),
    totalDisponibles: root.querySelector("#totalDisponibles"),
    totalAgotados: root.querySelector("#totalAgotados")
  };
}

function createPaquetesCrud(root = document) {
  return createCrudModule({
    baseUrl: apiUrl("paquetes"),
    elements: getElements(root),
    formCreateTitle: "Registra un nuevo paquete",
    formEditTitle: (item) => `Editando paquete #${item.id}`,
    submitCreateText: "Guardar paquete",
    submitEditText: "Actualizar paquete",
    createMessage: "Paquete creado correctamente.",
    updateMessage: "Paquete actualizado correctamente.",
    deleteMessage: "Paquete eliminado correctamente.",
    reloadMessage: "Listado actualizado desde la base de datos.",
    emptyMessage: "No hay paquetes para mostrar.",
    loadErrorMessage: "No fue posible cargar los paquetes.",
    notFoundMessage: "No se encontro el paquete seleccionado.",
    deleteConfirm: (item) => `Deseas eliminar el paquete ${item.nombre}?`,
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
      root.querySelector("#paqueteId").value = item.id;
      root.querySelector("#nombre").value = item.nombre || "";
      root.querySelector("#descripcion").value = item.descripcion || "";
      root.querySelector("#precio").value = item.precio || "";
      root.querySelector("#estado").value = item.estado || "disponible";
    },
    onResetForm: () => {
      root.querySelector("#paqueteId").value = "";
      root.querySelector("#estado").value = "disponible";
    },
    renderResumen: (items, elements) => {
      elements.totalPaquetes.textContent = items.length;
      elements.totalDisponibles.textContent = items.filter((item) => item.estado === "disponible").length;
      elements.totalAgotados.textContent = items.filter((item) => item.estado === "agotado").length;
    },
    secondaryAction: {
      path: "estado",
      method: "PATCH",
      payload: (item) => ({ estado: siguienteEstado(item.estado) }),
      successMessage: (item) => `Estado actualizado a ${siguienteEstado(item.estado)}.`
    },
    renderCard: (item, { escapeHtml, formatMoney }) => `
      <article class="action-card">
        <div class="action-title">${escapeHtml(item.nombre)}</div>
        <div class="action-description">${escapeHtml(item.descripcion || "Sin descripcion registrada.")}</div>
        <div class="package-meta">
          <span><strong>Precio:</strong> ${formatMoney(item.precio)}</span>
          <span><strong>Estado:</strong> ${escapeHtml(item.estado)}</span>
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

export function renderPaquetes(container) {
  container.innerHTML = getTemplate();
  return createPaquetesCrud(container).init();
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("paqueteForm")) {
    createPaquetesCrud(document).init();
  }
});
