document.getElementById("registroForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const data = {
    NroDocumento: document.getElementById("documento").value,
    Nombre: document.getElementById("nombre").value,
    Apellido: document.getElementById("apellido").value,
    Direccion: document.getElementById("direccion").value,
    Email: document.getElementById("email").value,
    Telefono: document.getElementById("telefono").value,
    Estado: 1,
    IDRol: 2
  };

  fetch("http://localhost:3000/api/clientes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(() => {
    alert("Cliente registrado ✅");
    window.location.href = "../public/login.html";
  })
  .catch(err => console.error(err));
});