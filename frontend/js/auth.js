import { getSession, isClientSession, loginCliente, loginUsuario, requestPasswordRecovery, saveSession } from "./api.js";
import { redirectToDashboardByRole } from "./authGuard.js";

const REGISTRO_URL = "../pages/registro.html";

const usuarioActual = getSession();
if (usuarioActual) {
  redirectToDashboardByRole(usuarioActual);
}

const form = document.getElementById("loginForm");
const errorBox = document.getElementById("loginError");
const tipoAcceso = document.getElementById("tipoAcceso");
const fieldOneLabel = document.getElementById("fieldOneLabel");
const fieldTwoLabel = document.getElementById("fieldTwoLabel");
const fieldOneInput = document.getElementById("email");
const fieldTwoInput = document.getElementById("documento");
const loginHelp = document.getElementById("loginHelp");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const recoveryEmailInput = document.getElementById("recoveryEmail");
const forgotPasswordFeedback = document.getElementById("forgotPasswordFeedback");
const cancelRecoveryBtn = document.getElementById("cancelRecoveryBtn");

function setRecoveryMode(enabled) {
  if (!form || !forgotPasswordForm) {
    return;
  }

  form.hidden = enabled;
  forgotPasswordForm.hidden = !enabled;
}

function syncLoginMode() {
  const esAdmin = tipoAcceso?.value === "admin";

  if (esAdmin) {
    fieldOneLabel.textContent = "Usuario o correo";
    fieldTwoLabel.textContent = "Clave";
    fieldOneInput.type = "text";
    fieldOneInput.placeholder = "Ingresa tu usuario o correo";
    fieldTwoInput.type = "password";
    fieldTwoInput.placeholder = "Ingresa tu clave";
    loginHelp.textContent = "Como administrador puedes ingresar con tu usuario o correo y tu clave.";
    forgotPasswordBtn.hidden = false;
    return;
  }

  fieldOneLabel.textContent = "Correo electronico";
  fieldTwoLabel.textContent = "Numero de documento";
  fieldOneInput.type = "email";
  fieldOneInput.placeholder = "cliente@correo.com";
  fieldTwoInput.type = "text";
  fieldTwoInput.placeholder = "Ingresa tu documento";
  loginHelp.textContent = "Como cliente usa el correo y el documento con el que fue registrado el acceso.";
  forgotPasswordBtn.hidden = true;
  setRecoveryMode(false);
}

if (form) {
  syncLoginMode();

  if (tipoAcceso) {
    tipoAcceso.addEventListener("change", () => {
      errorBox.textContent = "";
      fieldOneInput.value = "";
      fieldTwoInput.value = "";
      syncLoginMode();
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorBox.textContent = "";

    const valorUno = fieldOneInput.value.trim();
    const valorDos = fieldTwoInput.value.trim();
    const esAdmin = tipoAcceso?.value === "admin";

    try {
      const data = esAdmin
        ? await loginUsuario({ Username: valorUno, Email: valorUno, Password: valorDos })
        : await loginCliente({ Email: valorUno, NroDocumento: valorDos });

      data.usuario.tipoAcceso = isClientSession(data.usuario) ? "cliente" : "admin";
      saveSession(data.usuario);
      redirectToDashboardByRole(data.usuario);
    } catch (error) {
      console.error("Error en login:", error);
      errorBox.textContent = error.message;
    }
  });
}

if (forgotPasswordBtn) {
  forgotPasswordBtn.addEventListener("click", () => {
    forgotPasswordFeedback.textContent = "";
    recoveryEmailInput.value = "";
    setRecoveryMode(true);
  });
}

if (cancelRecoveryBtn) {
  cancelRecoveryBtn.addEventListener("click", () => {
    setRecoveryMode(false);
  });
}

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    forgotPasswordFeedback.textContent = "";

    try {
      const response = await requestPasswordRecovery({
        email: recoveryEmailInput.value.trim()
      });
      forgotPasswordFeedback.className = "feedback success";
      forgotPasswordFeedback.textContent = response?.mensaje || "Revisa tu correo para continuar.";
    } catch (error) {
      console.error("Error solicitando recuperacion:", error);
      forgotPasswordFeedback.className = "feedback error";
      forgotPasswordFeedback.textContent = error.message;
    }
  });
}

window.irRegistro = function irRegistro() {
  window.location.href = REGISTRO_URL;
};

