export const API_URL = "http://localhost:3000/api";
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

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function getSessionRoleName(session = getSession()) {
  return String(session?.NombreRol || session?.rol || "").trim().toLowerCase();
}

export function isAdminSession(session = getSession()) {
  return getSessionRoleName(session).includes("administrador");
}

export function isClientSession(session = getSession()) {
  return getSessionRoleName(session).includes("cliente");
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

export function loginUsuario(payload) {
  return request("/usuarios/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function requestPasswordRecovery(payload) {
  return request("/password-recovery/request", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function resetPassword(payload) {
  return request("/password-recovery/reset", {
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

export function updateCliente(id, payload) {
  return request(`/clientes/${id}`, {
    method: "PUT",
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

export function getRoles() {
  return request("/roles");
}

export function createRol(payload) {
  return request("/roles", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateRol(id, payload) {
  return request(`/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteRol(id) {
  return request(`/roles/${id}`, {
    method: "DELETE"
  });
}

export function getPermisos() {
  return request("/permisos");
}

export function createPermiso(payload) {
  return request("/permisos", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updatePermiso(id, payload) {
  return request(`/permisos/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deletePermiso(id) {
  return request(`/permisos/${id}`, {
    method: "DELETE"
  });
}

export function getRolesPermisos() {
  return request("/rolespermisos");
}

export function seedRolesPermisos() {
  return request("/rolespermisos/seed-defaults", {
    method: "POST"
  });
}

export function createRolPermiso(payload) {
  return request("/rolespermisos", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateRolPermiso(id, payload) {
  return request(`/rolespermisos/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteRolPermiso(id) {
  return request(`/rolespermisos/${id}`, {
    method: "DELETE"
  });
}

export function getUsuarios() {
  return request("/usuarios");
}

export function createUsuario(payload) {
  return request("/usuarios", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateUsuario(id, payload) {
  return request(`/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteUsuario(id) {
  return request(`/usuarios/${id}`, {
    method: "DELETE"
  });
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
