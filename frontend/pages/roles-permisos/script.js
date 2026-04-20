import { clearSession, getSession, isAdminSession } from "../../js/api.js";

const STORAGE_KEY = "vialuna_roles_panel_db";
const LOGIN_URL = "../../public/login.html";
const CLIENT_DASHBOARD_URL = "../cliente-dashboard.html";
const ADMIN_ACCESS_MESSAGE_KEY = "vialuna_admin_access_message";

const session = getSession();

if (!session) {
  window.location.href = LOGIN_URL;
}

if (!isAdminSession(session)) {
  window.sessionStorage.setItem(
    ADMIN_ACCESS_MESSAGE_KEY,
    "No tienes permisos para acceder al panel administrativo."
  );
  window.location.href = CLIENT_DASHBOARD_URL;
}

const PERMISSIONS_CATALOG = [
  {
    id: "crear_reserva",
    label: "Crear reserva",
    description: "Permite registrar nuevas reservas para clientes."
  },
  {
    id: "editar_reserva",
    label: "Editar reserva",
    description: "Permite modificar fechas, huespedes y estados."
  },
  {
    id: "eliminar_reserva",
    label: "Eliminar reserva",
    description: "Permite cancelar o retirar reservas registradas."
  },
  {
    id: "ver_usuarios",
    label: "Ver usuarios",
    description: "Permite consultar el listado de usuarios internos."
  },
  {
    id: "crear_usuario",
    label: "Crear usuario",
    description: "Permite registrar nuevos usuarios del sistema."
  },
  {
    id: "eliminar_usuario",
    label: "Eliminar usuario",
    description: "Permite eliminar usuarios internos."
  },
  {
    id: "ver_reportes",
    label: "Ver reportes",
    description: "Permite revisar reportes operativos del hospedaje."
  },
  {
    id: "gestionar_pagos",
    label: "Gestionar pagos",
    description: "Permite confirmar cobros y revisar transacciones."
  }
];

const defaultRoles = [
  {
    id: 1,
    name: "Administrador",
    description: "Control total del dashboard, reservas, usuarios y reportes.",
    permissions: PERMISSIONS_CATALOG.map((permission) => permission.id),
    inUse: true,
    assignedUsers: 3
  },
  {
    id: 2,
    name: "Recepcionista",
    description: "Gestiona reservas, check-in y consultas de huespedes.",
    permissions: ["crear_reserva", "editar_reserva", "ver_usuarios", "gestionar_pagos"],
    inUse: true,
    assignedUsers: 5
  },
  {
    id: 3,
    name: "Auditor",
    description: "Consulta movimientos, usuarios y reportes sin editar datos.",
    permissions: ["ver_usuarios", "ver_reportes"],
    inUse: false,
    assignedUsers: 0
  }
];

function sanitizeAdministrativeRoles(roles) {
  return roles.filter((role) => String(role?.name || "").trim().toLowerCase() !== "cliente");
}

const state = {
  roles: [],
  search: "",
  activeRoleId: null,
  roleToDelete: null
};

const elements = {
  userName: document.getElementById("userName"),
  logoutBtn: document.getElementById("logoutBtn"),
  statsCards: document.getElementById("statsCards"),
  searchRole: document.getElementById("searchRole"),
  createRoleBtn: document.getElementById("createRoleBtn"),
  rolesTableBody: document.getElementById("rolesTableBody"),
  toastContainer: document.getElementById("toastContainer"),
  roleModal: document.getElementById("roleModal"),
  roleModalTitle: document.getElementById("roleModalTitle"),
  roleForm: document.getElementById("roleForm"),
  roleId: document.getElementById("roleId"),
  roleName: document.getElementById("roleName"),
  roleDescription: document.getElementById("roleDescription"),
  permissionsModal: document.getElementById("permissionsModal"),
  permissionsModalTitle: document.getElementById("permissionsModalTitle"),
  permissionsForm: document.getElementById("permissionsForm"),
  permissionsChecklist: document.getElementById("permissionsChecklist"),
  viewModal: document.getElementById("viewModal"),
  viewModalContent: document.getElementById("viewModalContent"),
  confirmModal: document.getElementById("confirmModal"),
  confirmModalMessage: document.getElementById("confirmModalMessage"),
  confirmDeleteBtn: document.getElementById("confirmDeleteBtn")
};

function loadRoles() {
  const savedRoles = window.localStorage.getItem(STORAGE_KEY);

  if (!savedRoles) {
    state.roles = sanitizeAdministrativeRoles([...defaultRoles]);
    persistRoles();
    return;
  }

  try {
    const parsedRoles = JSON.parse(savedRoles);
    state.roles = sanitizeAdministrativeRoles(Array.isArray(parsedRoles) ? parsedRoles : [...defaultRoles]);
    persistRoles();
  } catch (error) {
    console.error("No fue posible leer los roles guardados:", error);
    state.roles = sanitizeAdministrativeRoles([...defaultRoles]);
    persistRoles();
  }
}

function persistRoles() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.roles));
}

function getNextRoleId() {
  return state.roles.reduce((maxId, role) => Math.max(maxId, role.id), 0) + 1;
}

function getFilteredRoles() {
  const query = state.search.trim().toLowerCase();

  if (!query) {
    return state.roles;
  }

  return state.roles.filter((role) => {
    return role.name.toLowerCase().includes(query) || role.description.toLowerCase().includes(query);
  });
}

function getPermissionLabels(permissionIds) {
  return permissionIds
    .map((permissionId) => PERMISSIONS_CATALOG.find((permission) => permission.id === permissionId)?.label)
    .filter(Boolean);
}

function renderStats() {
  const totalRoles = state.roles.length;
  const rolesInUse = state.roles.filter((role) => role.inUse).length;
  const totalPermissions = new Set(state.roles.flatMap((role) => role.permissions)).size;

  elements.statsCards.innerHTML = `
    <article class="stat-card">
      <span>Roles activos</span>
      <strong>${totalRoles}</strong>
    </article>
    <article class="stat-card">
      <span>Roles en uso</span>
      <strong>${rolesInUse}</strong>
    </article>
    <article class="stat-card">
      <span>Permisos asignados</span>
      <strong>${totalPermissions}</strong>
    </article>
  `;
}

function renderTable() {
  const filteredRoles = getFilteredRoles();

  if (!filteredRoles.length) {
    elements.rolesTableBody.innerHTML = `
      <tr>
        <td colspan="4">
          <div class="empty-state">No se encontraron roles con ese criterio de busqueda.</div>
        </td>
      </tr>
    `;
    return;
  }

  elements.rolesTableBody.innerHTML = filteredRoles
    .map((role) => {
      const statusLabel = role.inUse ? "En uso" : "Disponible";
      const permissionCount = getPermissionLabels(role.permissions).length;

      return `
        <tr>
          <td>
            <div class="role-name">
              <strong>${role.name}</strong>
              <span class="pill ${role.inUse ? "pill--active" : "pill--locked"}">${statusLabel}</span>
            </div>
          </td>
          <td>${role.description}</td>
          <td>${permissionCount} permiso(s)</td>
          <td>
            <div class="actions">
              <button type="button" class="btn btn--ghost btn--icon" data-action="view" data-id="${role.id}" title="Ver">👁️</button>
              <button type="button" class="btn btn--primary" data-action="edit" data-id="${role.id}">Editar</button>
              <button type="button" class="btn btn--danger" data-action="delete" data-id="${role.id}">Eliminar</button>
              <button type="button" class="btn btn--ghost" data-action="permissions" data-id="${role.id}">⚙️ Permisos</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderPermissionsChecklist(selectedPermissions = []) {
  elements.permissionsChecklist.innerHTML = PERMISSIONS_CATALOG.map((permission) => {
    const checked = selectedPermissions.includes(permission.id) ? "checked" : "";

    return `
      <label class="permission-item">
        <input type="checkbox" value="${permission.id}" ${checked}>
        <span>
          <strong>${permission.label}</strong>
          <p>${permission.description}</p>
        </span>
      </label>
    `;
  }).join("");
}

function openModal(modal) {
  modal.classList.remove("is-hidden");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(modal) {
  modal.classList.add("is-hidden");
  modal.setAttribute("aria-hidden", "true");
}

function closeAllModals() {
  closeModal(elements.roleModal);
  closeModal(elements.permissionsModal);
  closeModal(elements.viewModal);
  closeModal(elements.confirmModal);
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 3000);
}

function openCreateRoleModal() {
  elements.roleModalTitle.textContent = "Crear rol";
  elements.roleId.value = "";
  elements.roleName.value = "";
  elements.roleDescription.value = "";
  openModal(elements.roleModal);
}

function openEditRoleModal(roleId) {
  const role = state.roles.find((item) => item.id === roleId);

  if (!role) {
    return;
  }

  elements.roleModalTitle.textContent = "Editar rol";
  elements.roleId.value = String(role.id);
  elements.roleName.value = role.name;
  elements.roleDescription.value = role.description;
  openModal(elements.roleModal);
}

function openPermissionsModal(roleId) {
  const role = state.roles.find((item) => item.id === roleId);

  if (!role) {
    return;
  }

  state.activeRoleId = roleId;
  elements.permissionsModalTitle.textContent = `Permisos de ${role.name}`;
  renderPermissionsChecklist(role.permissions);
  openModal(elements.permissionsModal);
}

function openViewModal(roleId) {
  const role = state.roles.find((item) => item.id === roleId);

  if (!role) {
    return;
  }

  const permissionList = getPermissionLabels(role.permissions)
    .map((permission) => `<li>${permission}</li>`)
    .join("");

  elements.viewModalContent.innerHTML = `
    <div class="details-grid">
      <div class="detail-box">
        <h4>${role.name}</h4>
        <p>${role.description}</p>
      </div>
      <div class="detail-box">
        <h4>Estado del rol</h4>
        <p>${role.inUse ? "Rol en uso por usuarios activos." : "Rol disponible para nuevas asignaciones."}</p>
      </div>
      <div class="detail-box">
        <h4>Permisos asignados</h4>
        ${permissionList ? `<ul>${permissionList}</ul>` : "<p>Este rol aun no tiene permisos asignados.</p>"}
      </div>
    </div>
  `;

  openModal(elements.viewModal);
}

function openDeleteModal(roleId) {
  const role = state.roles.find((item) => item.id === roleId);

  if (!role) {
    return;
  }

  if (role.inUse) {
    showToast(`No puedes eliminar ${role.name} porque esta en uso.`, "error");
    return;
  }

  state.roleToDelete = roleId;
  elements.confirmModalMessage.textContent = `Vas a eliminar el rol "${role.name}". Esta accion no se puede deshacer.`;
  openModal(elements.confirmModal);
}

function saveRole(event) {
  event.preventDefault();

  const roleId = Number(elements.roleId.value);
  const name = elements.roleName.value.trim();
  const description = elements.roleDescription.value.trim();

  if (!name || !description) {
    showToast("Completa el nombre y la descripcion del rol.", "error");
    return;
  }

  const duplicatedRole = state.roles.find((role) => {
    return role.name.toLowerCase() === name.toLowerCase() && role.id !== roleId;
  });

  if (duplicatedRole) {
    showToast("Ya existe un rol con ese nombre.", "error");
    return;
  }

  if (roleId) {
    state.roles = state.roles.map((role) => {
      if (role.id !== roleId) {
        return role;
      }

      return {
        ...role,
        name,
        description
      };
    });

    showToast("Rol actualizado correctamente.", "success");
  } else {
    state.roles.unshift({
      id: getNextRoleId(),
      name,
      description,
      permissions: [],
      inUse: false,
      assignedUsers: 0
    });

    showToast("Rol creado correctamente.", "success");
  }

  persistRoles();
  renderUI();
  closeModal(elements.roleModal);
}

function savePermissions(event) {
  event.preventDefault();

  const selectedPermissions = Array.from(
    elements.permissionsChecklist.querySelectorAll('input[type="checkbox"]:checked')
  ).map((checkbox) => checkbox.value);

  state.roles = state.roles.map((role) => {
    if (role.id !== state.activeRoleId) {
      return role;
    }

    return {
      ...role,
      permissions: selectedPermissions
    };
  });

  persistRoles();
  renderUI();
  closeModal(elements.permissionsModal);
  showToast("Permisos guardados correctamente.", "success");
}

function confirmDeleteRole() {
  if (!state.roleToDelete) {
    return;
  }

  state.roles = state.roles.filter((role) => role.id !== state.roleToDelete);
  persistRoles();
  renderUI();
  closeModal(elements.confirmModal);
  state.roleToDelete = null;
  showToast("Rol eliminado correctamente.", "success");
}

function handleTableAction(event) {
  const target = event.target.closest("[data-action]");

  if (!target) {
    return;
  }

  const roleId = Number(target.dataset.id);
  const action = target.dataset.action;

  if (action === "view") {
    openViewModal(roleId);
  }

  if (action === "edit") {
    openEditRoleModal(roleId);
  }

  if (action === "delete") {
    openDeleteModal(roleId);
  }

  if (action === "permissions") {
    openPermissionsModal(roleId);
  }
}

function renderUI() {
  renderStats();
  renderTable();
}

function addEventListeners() {
  elements.createRoleBtn.addEventListener("click", openCreateRoleModal);
  elements.searchRole.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderTable();
  });
  elements.roleForm.addEventListener("submit", saveRole);
  elements.permissionsForm.addEventListener("submit", savePermissions);
  elements.rolesTableBody.addEventListener("click", handleTableAction);
  elements.confirmDeleteBtn.addEventListener("click", confirmDeleteRole);

  document.addEventListener("click", (event) => {
    const closeTrigger = event.target.closest("[data-close-modal]");

    if (closeTrigger) {
      closeModal(document.getElementById(closeTrigger.dataset.closeModal));
      return;
    }

    if (event.target.classList.contains("modal-overlay")) {
      closeModal(event.target);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllModals();
    }
  });
}

function init() {
  if (elements.userName) {
    elements.userName.textContent = `${session.Nombre || ""} ${session.Apellido || ""}`.trim() || "Administrador";
  }
  loadRoles();
  renderUI();
  addEventListeners();
}

if (elements.logoutBtn) {
  elements.logoutBtn.addEventListener("click", () => {
    clearSession();
    window.location.href = LOGIN_URL;
  });
}

init();
