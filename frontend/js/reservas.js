console.log("✅ JS cargado");

// 🔐 Usuario
const usuario = JSON.parse(localStorage.getItem('usuario'));

if (!usuario) {
  alert("No hay sesión");
  window.location.href = '../public/login.html';
}

// 📅 Fecha automática
const hoy = new Date().toISOString().split('T')[0];

const inputFecha = document.getElementById('fechaReserva');
if (inputFecha) {
  inputFecha.value = hoy;
}

// 📝 Formulario
const form = document.getElementById('reservaForm');

form.addEventListener('submit', function(e) {
  e.preventDefault();

  console.log("📩 Formulario enviado");

  const fechaInicio = document.getElementById('fechaInicio').value;
  const fechaFin = document.getElementById('fechaFin').value;

  if (fechaInicio > fechaFin) {
    alert("Fechas incorrectas ❌");
    return;
  }

  const data = {
  id_cliente: usuario.NroDocumento,
    Nr_documento: document.getElementById('documento').value,
    fecha_reserva: hoy,
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
    id_estado_reserva: 1,
    metodo_pago: document.getElementById('metodoPago').value
  };

  console.log("📦 Datos enviados:", data);

  // 🔥 FETCH CORRECTO
  fetch('http://localhost:3000/api/reservas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(res => {
    console.log("📡 STATUS:", res.status);
    return res.json();
  })
  .then(result => {
    console.log("✅ RESPUESTA:", result);
    alert("Reserva creada correctamente");
    window.location.href = '../index.html';
  })
  .catch(error => {
    console.error("❌ ERROR:", error);
    alert("Error al guardar");
  });

});