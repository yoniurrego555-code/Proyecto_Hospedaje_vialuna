import { resetPassword } from "./api.js";

const LOGIN_URL = "/frontend/public/login.html";
const form = document.getElementById("resetPasswordForm");
const feedback = document.getElementById("resetPasswordFeedback");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const token = new URLSearchParams(window.location.search).get("token") || "";

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.className = "feedback";
    feedback.textContent = "";

    const password = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!token) {
      feedback.className = "feedback error";
      feedback.textContent = "El enlace de recuperacion es invalido.";
      return;
    }

    if (password.length < 6) {
      feedback.className = "feedback error";
      feedback.textContent = "La nueva clave debe tener al menos 6 caracteres.";
      return;
    }

    if (password !== confirmPassword) {
      feedback.className = "feedback error";
      feedback.textContent = "Las contrasenas no coinciden.";
      return;
    }

    try {
      const response = await resetPassword({ token, password });
      feedback.className = "feedback success";
      feedback.textContent = response?.mensaje || "La clave fue actualizada correctamente.";

      window.setTimeout(() => {
        window.location.href = LOGIN_URL;
      }, 1800);
    } catch (error) {
      console.error("Error restableciendo clave:", error);
      feedback.className = "feedback error";
      feedback.textContent = error.message;
    }
  });
}

