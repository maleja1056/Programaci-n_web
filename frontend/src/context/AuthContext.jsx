import { useCallback, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth.js";
import { AuthContext } from "./auth-context.js";

// status: "checking" mientras se consulta /api/auth/me,
// "authenticated" con sesión válida en el servidor, "anonymous" sin ella.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("checking");
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    let active = true;

    authApi
      .getSession()
      .then((data) => {
        if (!active) return;
        setUser(data.user);
        setStatus("authenticated");
      })
      .catch((error) => {
        if (!active) return;
        setUser(null);
        setStatus("anonymous");
        // 401 es lo normal sin sesión; cualquier otro error se informa.
        if (error.status !== 401) setSessionError(error.message);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (usuario, password) => {
    const data = await authApi.login(usuario, password);
    setUser(data.user);
    setStatus("authenticated");
    setSessionError("");
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setStatus("anonymous");
  }, []);

  // Para cuando una petición privada responde 401 (sesión expirada).
  const handleUnauthorized = useCallback(() => {
    setUser(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated",
      sessionError,
      login,
      logout,
      handleUnauthorized,
    }),
    [user, status, sessionError, login, logout, handleUnauthorized]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
