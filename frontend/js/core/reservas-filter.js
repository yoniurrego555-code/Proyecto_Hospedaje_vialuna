// FILTRADO DE RESERVAS POR USUARIO
// Este script filtra las reservas según el rol del usuario autenticado

// Función para obtener el usuario actual desde localStorage o sessionStorage
function getCurrentUser() {
  const user = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

// Función para verificar el rol del usuario
function getUserRole() {
  const user = getCurrentUser();
  return user ? user.role : null; // 'admin' o 'cliente'
}

// Función para filtrar reservas según el rol
function filterReservasByRole(allReservas) {
  const currentUser = getCurrentUser();
  const userRole = getUserRole();
  
  if (!currentUser || !userRole) {
    console.error('Usuario no autenticado');
    return [];
  }
  
  // Si es admin, ve todas las reservas
  if (userRole === 'admin') {
    return allReservas;
  }
  
  // Si es cliente, ve solo sus reservas
  if (userRole === 'cliente') {
    return allReservas.filter(reserva => reserva.usuarioId === currentUser.id);
  }
  
  return [];
}

// Función para renderizar reservas filtradas
function renderFilteredReservas(containerId, reservas) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const filteredReservas = filterReservasByRole(reservas);
  
  if (filteredReservas.length === 0) {
    const userRole = getUserRole();
    const emptyMessage = userRole === 'admin' 
      ? 'No hay reservas en el sistema'
      : 'No tienes reservas registradas';
    
    container.innerHTML = `<div class="empty">${emptyMessage}</div>`;
    return;
  }
  
  container.innerHTML = filteredReservas.map(reserva => `
    <div class="card">
      <div class="card-header">
        <h4>${reserva.habitacion || 'Sin habitación'}</h4>
        <span class="status-badge status-${reserva.estado}">${reserva.estado}</span>
      </div>
      <div class="card-content">
        <p><strong>ID:</strong> ${reserva.id}</p>
        <p><strong>Cliente:</strong> ${reserva.clienteNombre || 'N/A'}</p>
        <p><strong>Entrada:</strong> ${reserva.fechaEntrada}</p>
        <p><strong>Salida:</strong> ${reserva.fechaSalida}</p>
        <p><strong>Total:</strong> $${(reserva.total || 0).toLocaleString('es-CO')}</p>
      </div>
      <div class="card-actions">
        <button class="secondary" onclick="verDetalles('${reserva.id}')">Ver detalles</button>
        ${getUserRole() === 'admin' ? `
          <button class="primary" onclick="editarReserva('${reserva.id}')">Editar</button>
          <button class="ghost" onclick="eliminarReserva('${reserva.id}')">Eliminar</button>
        ` : `
          <button class="ghost" onclick="modificarReserva('${reserva.id}')">Solicitar cambio</button>
        `}
      </div>
    </div>
  `).join('');
}

// Función para inicializar el filtrado
function initReservasFilter() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.error('No hay usuario autenticado');
    return;
  }
  
  console.log('Usuario:', currentUser.email, 'Rol:', currentUser.role);
  
  // Ejemplo de datos de reservas (en producción vendrían de API)
  const reservasData = [
    {
      id: 'RES-001',
      usuarioId: 'user_001',
      clienteNombre: 'Juan Pérez',
      habitacion: 'Suite Luna 101',
      fechaEntrada: '2024-01-15',
      fechaSalida: '2024-01-18',
      estado: 'confirmada',
      total: 1200
    },
    {
      id: 'RES-002',
      usuarioId: 'user_002',
      clienteNombre: 'María García',
      habitacion: 'Habitación Doble 205',
      fechaEntrada: '2024-01-20',
      fechaSalida: '2024-01-22',
      estado: 'pendiente',
      total: 800
    },
    {
      id: 'RES-003',
      usuarioId: 'user_001',
      clienteNombre: 'Juan Pérez',
      habitacion: 'Habitación Individual 102',
      fechaEntrada: '2024-02-10',
      fechaSalida: '2024-02-12',
      estado: 'completada',
      total: 600
    }
  ];
  
  // Renderizar reservas según el rol
  renderFilteredReservas('reservasContainer', reservasData);
  renderFilteredReservas('reservasActivasContainer', reservasData);
  renderFilteredReservas('reservasHistorialContainer', reservasData);
  
  // Actualizar estadísticas
  updateReservasStats(reservasData);
}

// Función para actualizar estadísticas
function updateReservasStats(reservas) {
  const currentUser = getCurrentUser();
  const userRole = getUserRole();
  const filteredReservas = filterReservasByRole(reservas);
  
  const stats = {
    total: filteredReservas.length,
    activas: filteredReservas.filter(r => r.estado === 'confirmada' || r.estado === 'pendiente').length,
    completadas: filteredReservas.filter(r => r.estado === 'completada').length,
    canceladas: filteredReservas.filter(r => r.estado === 'cancelada').length
  };
  
  // Actualizar elementos del DOM
  const elements = {
    totalReservas: document.getElementById('totalReservas'),
    reservasActivas: document.getElementById('reservasActivas'),
    reservasCompletadas: document.getElementById('reservasCompletadas'),
    metricReservations: document.getElementById('metricReservations'),
    metricActive: document.getElementById('metricActive'),
    metricTotal: document.getElementById('metricTotal')
  };
  
  Object.keys(elements).forEach(key => {
    if (elements[key]) {
      const value = stats[key.replace('metric', '').toLowerCase()] || stats.total;
      elements[key].textContent = value;
    }
  });
}

// Funciones de acción (placeholder)
function verDetalles(reservaId) {
  console.log('Ver detalles de reserva:', reservaId);
  // Implementar modal o navegación a detalles
}

function editarReserva(reservaId) {
  console.log('Editar reserva:', reservaId);
  // Solo para admin
}

function eliminarReserva(reservaId) {
  console.log('Eliminar reserva:', reservaId);
  // Solo para admin
}

function modificarReserva(reservaId) {
  console.log('Solicitar modificación de reserva:', reservaId);
  // Para cliente
}

// Exportar funciones para uso global
window.reservasFilter = {
  init: initReservasFilter,
  render: renderFilteredReservas,
  getCurrentUser,
  getUserRole,
  filterByRole: filterReservasByRole
};

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initReservasFilter);
