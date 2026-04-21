export const API_URL = "http://localhost:3000/api";
export const SESSION_KEY = "vialuna_usuario";

/* =========================
   REQUEST BASE
========================= */
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
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || data?.mensaje || "Error en la solicitud");
  }

  return data;
}

/* =========================
   SESIÓN
========================= */
export function saveSession(usuario) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/* =========================
   ROLES (CORREGIDO)
   - SIN FALLBACKS
   - SIN STRINGS
========================= */
export function isAdminSession(session = getSession()) {
  return Number(session?.IDRol) === 1;
}

export function isClientSession(session = getSession()) {
  return Number(session?.IDRol) === 2;
}

/* =========================
   VALIDACIÓN SIMPLE DE IDENTIDAD
   (SIN LÓGICA COMPLEJA)
========================= */
function normalize(value) {
  return String(value ?? "").trim();
}

export function reservationBelongsToSession(reserva, session = getSession()) {
  if (!reserva || !session) return false;

  return (
    normalize(reserva.id_cliente) === normalize(session.id_cliente)
  );
}

export function clienteBelongsToSession(cliente, session = getSession()) {
  if (!cliente || !session) return false;

  return (
    normalize(cliente.IDCliente) === normalize(session.id_cliente)
  );
}

/* =========================
   FILTROS BACKEND
========================= */
export function getReservationOwnershipFilters(session = getSession()) {
  if (!session) return {};

  return {
    id_cliente: session.id_cliente
  };
}

/* =========================
   LOGIN
========================= */
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

/* =========================
   PASSWORD
========================= */
export function requestPasswordRecovery(payload) {
  return request("/password-recovery/request", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

/* =========================
   CLIENTES
========================= */
export function getClientes() {
  return request("/clientes");
}

/* =========================
   HABITACIONES
========================= */
export function getHabitaciones() {
  return request("/habitacion");
}

/* =========================
   SERVICIOS
========================= */
export function getServicios() {
  return request("/servicios");
}

/* =========================
   PAQUETES
========================= */
export function getPaquetes() {
  return request("/paquetes");
}

/* =========================
   METODOS DE PAGO
========================= */
export function getMetodosPago() {
  return request("/metodopago");
}

/* =========================
   ESTADOS RESERVA
========================= */
export function getEstadosReserva() {
  return request("/estadosreserva");
}

/* =========================
   RESERVAS
========================= */
export function getReservas(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  return request(`/reservas${query ? `?${query}` : ""}`);
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

/* =========================
  ROLES Y PERMISOS
========================= */
export function getRoles() {
  return request("/roles");
}

export function getPermisos() {
  return request("/permisos");
}

export function getRolesPermisos() {
  return request("/rolespermisos");
}
