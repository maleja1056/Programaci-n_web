// Protege las rutas privadas. Según el estado de la sesión (auth-context.js)
// muestra un aviso de carga, redirige al login o deja ver el contenido.
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/auth-context.js";

function ProtectedRoute({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  // Mientras se consulta la sesión al servidor todavía no se decide nada
  if (status === "checking") {
    return (
      <div className="auth-loading" role="status">
        <span className="auth-spinner" aria-hidden="true" />
        Comprobando sesión...
      </div>
    );
  }

  // Sin sesión se va al login, guardando en "state.from" la ruta pedida
  if (status !== "authenticated") {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    );
  }

  // Con sesión iniciada se muestra la página privada
  return children;
}

export default ProtectedRoute;
