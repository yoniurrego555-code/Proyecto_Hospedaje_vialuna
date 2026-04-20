import { clearSession, getSession, getUsuarios, isAdminSession } from "./api.js";

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

const refs = {
  userName: document.getElementById("userName"),
  logoutBtn: document.getElementById("logoutBtn"),
  usuariosTotales: document.getElementById("usuariosTotales"),
  usuariosActivos: document.getElementById("usuariosActivos"),
  rolesAsignados: document.getElementById("rolesAsignados"),
  usuariosTable: document.getElementById("usuariosTable")
};

function renderTable(usuarios) {
  if (!usuarios.length) {
    refs.usuariosTable.innerHTML = '<p class="empty-state">No hay usuarios registrados.</p>';
    return;
  }

  refs.usuariosTable.innerHTML = `
    <div class="table-shell">
      <table class="data-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Correo</th>
            <th>Telefono</th>
            <th>Documento</th>
            <th>Rol</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${usuarios.map((usuario) => {
            const activo = Number(usuario.Estado) === 1;

            return `
              <tr>
                <td>${[usuario.Nombre, usuario.Apellido].filter(Boolean).join(" ") || usuario.Username || "Sin nombre"}</td>
                <td>${usuario.Email || "Sin correo"}</td>
                <td>${usuario.Telefono || "Sin telefono"}</td>
                <td>${usuario.NumeroDocumento || "Sin documento"}</td>
                <td>${usuario.NombreRol || "Sin rol"}</td>
                <td><span class="badge ${activo ? "badge-soft" : "badge-danger"}">${activo ? "Activo" : "Inactivo"}</span></td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function init() {
  refs.userName.textContent = `${session.Nombre || ""} ${session.Apellido || ""}`.trim() || "Administrador";

  try {
    const usuarios = await getUsuarios();
    const activos = usuarios.filter((usuario) => Number(usuario.Estado) === 1);
    const roles = new Set(usuarios.map((usuario) => usuario.NombreRol).filter(Boolean));

    refs.usuariosTotales.textContent = String(usuarios.length);
    refs.usuariosActivos.textContent = String(activos.length);
    refs.rolesAsignados.textContent = String(roles.size);
    renderTable(usuarios);
  } catch (error) {
    console.error("Error cargando usuarios:", error);
    refs.usuariosTable.innerHTML = '<p class="empty-state">No fue posible cargar los usuarios.</p>';
  }
}

refs.logoutBtn.addEventListener("click", () => {
  clearSession();
  window.location.href = LOGIN_URL;
});

init();
