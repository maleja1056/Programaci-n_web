import { apiRequest } from "./client.js";

export const login = (usuario, password) =>
  apiRequest("/api/auth/login", {
    method: "POST",
    body: { usuario, password },
  });

export const getSession = () => apiRequest("/api/auth/me");

export const logout = () => apiRequest("/api/auth/logout", { method: "POST" });

export const getPanelSummary = () => apiRequest("/api/panel/resumen");
