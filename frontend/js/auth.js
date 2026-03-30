console.log("🔐 auth.js cargado");

const form = document.getElementById("loginForm");

form.addEventListener("submit", function(e) {
  e.preventDefault();

  console.log("📩 Intentando login");

  const email = document.getElementById("email").value;

  fetch("http://localhost:3000/api/clientes")
    .then(res => res.json())
    .then(clientes => {

      console.log("👥 Clientes:", clientes);

      // 🔥 Buscar usuario por Email (según tu BD)
      const usuario = clientes.find(c => c.Email === email);

      if (!usuario) {
        alert("Usuario no encontrado ❌");
        return;
      }

      // 🔥 Guardar usuario REAL
      localStorage.setItem("usuario", JSON.stringify(usuario));

      console.log("💾 Usuario guardado:", usuario);

      alert("Login exitoso ✅");

      window.location.href = "../index.html";
    })
    .catch(err => {
      console.error("❌ Error:", err);
      alert("Error al conectar con el servidor");
    });
});

// 🔹 Ir a registro
window.irRegistro = function() {
  window.location.href = "../pages/registro.html";
};