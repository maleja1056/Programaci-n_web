// Llamadas del frontend a los endpoints de autenticación y del panel.
// Con el backend (USAR_BACKEND) usan apiRequest (client.js), que envía la
// cookie de sesión y lanza un ApiError cuando el servidor responde con error.
// En el modo demostración las mismas funciones vienen de demo.js.
import { apiRequest } from "./client.js";
import { USAR_BACKEND } from "./config.js";
import * as demo from "./demo.js";

// Inicia sesión con usuario y contraseña
const loginBackend = (usuario, password) =>
  apiRequest("/api/auth/login", {
    method: "POST",
    body: { usuario, password },
  });

// Devuelve el usuario de la sesión actual (responde 401 si no hay sesión)
const getSessionBackend = () => apiRequest("/api/auth/me");

// Cierra la sesión en el servidor
const logoutBackend = () => apiRequest("/api/auth/logout", { method: "POST" });

// Resumen del panel privado
const getPanelSummaryBackend = () => apiRequest("/api/panel/resumen");

export const login = USAR_BACKEND ? loginBackend : demo.login;
export const getSession = USAR_BACKEND ? getSessionBackend : demo.getSession;
export const logout = USAR_BACKEND ? logoutBackend : demo.logout;
export const getPanelSummary = USAR_BACKEND
  ? getPanelSummaryBackend
  : demo.getPanelSummary;
