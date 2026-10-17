// Contexto de autenticación y su hook. Está separado de AuthContext.jsx (que
// contiene el AuthProvider) para que cada archivo exporte una sola cosa.
import { createContext, useContext } from "react";

export const AuthContext = createContext(null);

// Devuelve { user, status, login, logout, ... } de la sesión actual. Solo
// funciona dentro de <AuthProvider>; fuera de él lanza un error claro.
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  }

  return context;
}
