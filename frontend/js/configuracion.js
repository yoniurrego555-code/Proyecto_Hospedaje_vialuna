import { clearSession, getSession, isAdminSession } from "./api.js";

const STORAGE_KEY = "vialuna_configuracion_sistema";
const LOGIN_URL = "../public/login.html";
const CLIENT_DASHBOARD_URL = "../pages/cliente-dashboard.html";
const ADMIN_ACCESS_MESSAGE_KEY = "vialuna_admin_access_message";

const session = getSession();

if (!session) {
  window.location.href = LOGIN_URL;
}

if (!isAdminSession(session)) {
  window.sessionStorage.setItem(
    ADMIN_ACCESS_MESSAGE_KEY,
    "No tienes permisos para acceder al panel administrativo."
  );
  window.location.href = CLIENT_DASHBOARD_URL;
}

const defaultConfig = {
  general: {
    nombreHospedaje: "Hospedaje ViaLuna",
    direccionHospedaje: "",
    telefonoHospedaje: "",
    correoHospedaje: ""
  },
  horarios: {
    horaEntrada: "15:00",
    horaSalida: "12:00"
  },
  precios: {
    moneda: "COP",
    impuesto: "19",
    precioBase: ""
  },
  sistema: {
    notificaciones: true,
    modoOscuro: false,
    reservasActivas: true
  }
};

const refs = {
  userName: document.getElementById("userName"),
  logoutBtn: document.getElementById("logoutBtn"),
  generalForm: document.getElementById("generalForm"),
  horariosForm: document.getElementById("horariosForm"),
  preciosForm: document.getElementById("preciosForm"),
  sistemaForm: document.getElementById("sistemaForm"),
  toastContainer: document.getElementById("toastContainer"),
  nombreHospedaje: document.getElementById("nombreHospedaje"),
  direccionHospedaje: document.getElementById("direccionHospedaje"),
  telefonoHospedaje: document.getElementById("telefonoHospedaje"),
  correoHospedaje: document.getElementById("correoHospedaje"),
  horaEntrada: document.getElementById("horaEntrada"),
  horaSalida: document.getElementById("horaSalida"),
  moneda: document.getElementById("moneda"),
  impuesto: document.getElementById("impuesto"),
  precioBase: document.getElementById("precioBase"),
  notificaciones: document.getElementById("notificaciones"),
  modoOscuro: document.getElementById("modoOscuro"),
  reservasActivas: document.getElementById("reservasActivas")
};

function loadConfig() {
  const savedConfig = window.localStorage.getItem(STORAGE_KEY);

  if (!savedConfig) {
    return {
      general: { ...defaultConfig.general },
      horarios: { ...defaultConfig.horarios },
      precios: { ...defaultConfig.precios },
      sistema: { ...defaultConfig.sistema }
    };
  }

  try {
    const parsedConfig = JSON.parse(savedConfig);

    return {
      general: { ...defaultConfig.general, ...parsedConfig.general },
      horarios: { ...defaultConfig.horarios, ...parsedConfig.horarios },
      precios: { ...defaultConfig.precios, ...parsedConfig.precios },
      sistema: { ...defaultConfig.sistema, ...parsedConfig.sistema }
    };
  } catch (error) {
    console.error("No fue posible leer la configuracion guardada:", error);
    return {
      general: { ...defaultConfig.general },
      horarios: { ...defaultConfig.horarios },
      precios: { ...defaultConfig.precios },
      sistema: { ...defaultConfig.sistema }
    };
  }
}

function saveConfig(config) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function getCurrentConfig() {
  return {
    general: {
      nombreHospedaje: refs.nombreHospedaje.value.trim(),
      direccionHospedaje: refs.direccionHospedaje.value.trim(),
      telefonoHospedaje: refs.telefonoHospedaje.value.trim(),
      correoHospedaje: refs.correoHospedaje.value.trim()
    },
    horarios: {
      horaEntrada: refs.horaEntrada.value,
      horaSalida: refs.horaSalida.value
    },
    precios: {
      moneda: refs.moneda.value,
      impuesto: refs.impuesto.value,
      precioBase: refs.precioBase.value
    },
    sistema: {
      notificaciones: refs.notificaciones.checked,
      modoOscuro: refs.modoOscuro.checked,
      reservasActivas: refs.reservasActivas.checked
    }
  };
}

function populateForms(config) {
  refs.nombreHospedaje.value = config.general.nombreHospedaje;
  refs.direccionHospedaje.value = config.general.direccionHospedaje;
  refs.telefonoHospedaje.value = config.general.telefonoHospedaje;
  refs.correoHospedaje.value = config.general.correoHospedaje;

  refs.horaEntrada.value = config.horarios.horaEntrada;
  refs.horaSalida.value = config.horarios.horaSalida;

  refs.moneda.value = config.precios.moneda;
  refs.impuesto.value = config.precios.impuesto;
  refs.precioBase.value = config.precios.precioBase;

  refs.notificaciones.checked = config.sistema.notificaciones;
  refs.modoOscuro.checked = config.sistema.modoOscuro;
  refs.reservasActivas.checked = config.sistema.reservasActivas;

  applyDarkMode(config.sistema.modoOscuro);
}

function applyDarkMode(enabled) {
  document.body.classList.toggle("config-dark", Boolean(enabled));
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast toast--success";
  toast.textContent = message;
  refs.toastContainer.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 2800);
}

function handleSectionSave(event, sectionName) {
  event.preventDefault();

  const currentConfig = loadConfig();
  const freshConfig = getCurrentConfig();

  currentConfig[sectionName] = freshConfig[sectionName];
  saveConfig(currentConfig);

  if (sectionName === "sistema") {
    applyDarkMode(currentConfig.sistema.modoOscuro);
  }

  showToast("Configuracion guardada correctamente");
}

function addEventListeners() {
  refs.generalForm.addEventListener("submit", (event) => handleSectionSave(event, "general"));
  refs.horariosForm.addEventListener("submit", (event) => handleSectionSave(event, "horarios"));
  refs.preciosForm.addEventListener("submit", (event) => handleSectionSave(event, "precios"));
  refs.sistemaForm.addEventListener("submit", (event) => handleSectionSave(event, "sistema"));

  refs.modoOscuro.addEventListener("change", () => {
    applyDarkMode(refs.modoOscuro.checked);
  });
}

function init() {
  if (refs.userName) {
    refs.userName.textContent = `${session.Nombre || ""} ${session.Apellido || ""}`.trim() || "Administrador";
  }

  const config = loadConfig();
  populateForms(config);
  addEventListeners();
}

if (refs.logoutBtn) {
  refs.logoutBtn.addEventListener("click", () => {
    clearSession();
    window.location.href = LOGIN_URL;
  });
}

init();
