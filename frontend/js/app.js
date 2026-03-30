import { getHabitaciones } from "./api.js";

// 🔐 Verificar sesión
const usuario = localStorage.getItem('usuario');

if (!usuario) {
  // Redirigir al login (SIN / al inicio)
window.location.href = 'public/login.html';
}

// 🔹 Redirección a reserva
window.irAReserva = function(id) {
window.location.href = `pages/reserva.html?id=${id}`;
};

// 🔹 Listar habitaciones
getHabitaciones()
.then(habitaciones => {
    let html = "";

    habitaciones.forEach(h => {
    html += `
        <div class="card">
        <h3>🏨 ${h.NombreHabitacion}</h3>
        <p>${h.Descripcion}</p>
        <p><strong>$${h.Costo}</strong></p>
        <button onclick="irAReserva(${h.IDHabitacion})">
            Reservar
        </button>
        </div>
    `;
    });

    document.getElementById("habitaciones").innerHTML = html;
})
.catch(err => console.error(err));

// 🔓 Logout
const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('usuario');
    window.location.href = 'public/login.html';
});
}