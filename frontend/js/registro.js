import { createCliente, getSession, isClientSession } from "./api.js";

const LOGIN_URL = "../public/login.html";
const DASHBOARD_URL = "../index.html";
const form = document.getElementById("registroForm");
const feedback = document.getElementById("registroFeedback");
const session = getSession();

if (session && isClientSession(session)) {
  window.location.href = DASHBOARD_URL;
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.textContent = "";
    feedback.className = "feedback";

    const data = {
      NroDocumento: document.getElementById("documento").value.trim(),
      Nombre: document.getElementById("nombre").value.trim(),
      Apellido: document.getElementById("apellido").value.trim(),
      Direccion: document.getElementById("direccion").value.trim(),
      Email: document.getElementById("email").value.trim(),
      Telefono: document.getElementById("telefono").value.trim(),
      Estado: 1,
      IDRol: 2
    };

    try {
      await createCliente(data);
      feedback.textContent = "Registro exitoso. Ya puedes iniciar sesion.";
      feedback.classList.add("success");
      form.reset();
      window.setTimeout(() => {
        window.location.href = LOGIN_URL;
      }, 1200);
    } catch (error) {
      console.error("Error en registro:", error);
      feedback.textContent = error.message;
      feedback.classList.add("error");
    }
  });
}

