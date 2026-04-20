const LEGACY_ROLES_PERMISSIONS_URL = "../pages/roles-permisos/index.html";

if (typeof window !== "undefined" && window.location.pathname.endsWith("/seguridad.html")) {
  window.location.replace(LEGACY_ROLES_PERMISSIONS_URL);
}

export const legacySecurityModule = {
  deprecated: true,
  redirectTo: LEGACY_ROLES_PERMISSIONS_URL
};
