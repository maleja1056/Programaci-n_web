import { apiRequest } from "./client.js";

export const login = (correo, password) =>
  apiRequest("/api/auth/login", {
    method: "POST",
    body: { correo, password },
  });

export const getSession = () => apiRequest("/api/auth/me");

export const logout = () => apiRequest("/api/auth/logout", { method: "POST" });

export const getPanelSummary = () => apiRequest("/api/panel/resumen");
