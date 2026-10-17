// Llamadas del frontend a los endpoints de autenticación y del panel.
// Todas usan apiRequest (client.js), que envía la cookie de sesión y lanza
// un ApiError cuando el servidor responde con error.
import { apiRequest } from "./client.js";

// Inicia sesión con usuario y contraseña
export const login = (usuario, password) =>
  apiRequest("/api/auth/login", {
    method: "POST",
    body: { usuario, password },
  });

// Devuelve el usuario de la sesión actual (responde 401 si no hay sesión)
export const getSession = () => apiRequest("/api/auth/me");

// Cierra la sesión en el servidor
export const logout = () => apiRequest("/api/auth/logout", { method: "POST" });

// Resumen del panel privado
export const getPanelSummary = () => apiRequest("/api/panel/resumen");
