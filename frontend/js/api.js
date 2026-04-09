const API_URL = "http://localhost:3000/api";

// 🔹 Obtener habitaciones
export function getHabitaciones() {
return fetch(`${API_URL}/habitacion`)
    .then(res => res.json());
}

// 🔹 Obtener habitación por ID
export function getHabitacionById(id) {
return fetch(`${API_URL}/habitacion/${id}`)
    .then(res => res.json());
}

// 🔹 Crear reserva
export function crearReserva(data) {
return fetch(`${API_URL}/reservas`, {
    method: "POST",
    headers: {
    "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
})
.then(res => res.json());
}