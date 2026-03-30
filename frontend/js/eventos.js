import { getHabitacionById, crearReserva } from "./api.js";

// 🔹 Obtener ID de la URL
const params = new URLSearchParams(window.location.search);
const idHabitacion = params.get("id");

// 🔹 Variable global para costo
let costoHabitacion = 0;

// 🔹 Mostrar información de la habitación
if (idHabitacion) {
getHabitacionById(idHabitacion)
    .then(h => {
costoHabitacion = h.Costo;

document.getElementById("infoHabitacion").innerHTML = `
        <h3>${h.NombreHabitacion}</h3>
        <p>${h.Descripcion}</p>
        <p>$${h.Costo} por noche</p>
    `;
    })
    .catch(err => console.error(err));
}

// 🔥 FUNCIÓN PARA CALCULAR TOTAL
function calcularTotal() {
const inicioValue = document.getElementById("inicio").value;
const finValue = document.getElementById("fin").value;

if (!inicioValue || !finValue) return;

const inicio = new Date(inicioValue);
const fin = new Date(finValue);

if (fin > inicio) {
    const dias = (fin - inicio) / (1000 * 60 * 60 * 24);
    const total = dias * costoHabitacion;

    document.getElementById("total").innerText =
    `Total: $${total}`;
}
}

// 🔹 Eventos para calcular automáticamente
const inputInicio = document.getElementById("inicio");
const inputFin = document.getElementById("fin");

if (inputInicio && inputFin) {
inputInicio.addEventListener("change", calcularTotal);
inputFin.addEventListener("change", calcularTotal);
}

// 🔹 Formulario de reserva
const form = document.getElementById("formReserva");

if (form) {
form.addEventListener("submit", function(e) {
    e.preventDefault();

    const inicio = document.getElementById("inicio").value;
    const fin = document.getElementById("fin").value;

    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);
    const hoy = new Date();

    // 🔴 Validaciones
    if (fechaInicio < hoy) {
    alert("No puedes seleccionar una fecha pasada ❌");
    return;
    }

    if (fechaFin <= fechaInicio) {
    alert("La fecha final debe ser mayor a la inicial ❌");
    return;
    }

    const data = {
    id_cliente: 1,
    id_habitacion: idHabitacion,
    fecha_inicio: inicio,
    fecha_fin: fin,
    metodo_pago: document.getElementById("pago").value
    };

    crearReserva(data)
    .then(() => {
        alert("Reserva creada correctamente ✅");
        window.location.href = "../index.html";
    })
    .catch(err => console.error(err));
});
}