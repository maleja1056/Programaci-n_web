import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/auth-context.js";

function ProtectedRoute({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "checking") {
    return (
      <div className="auth-loading" role="status">
        <span className="auth-spinner" aria-hidden="true" />
        Comprobando sesión...
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    );
  }

  return children;
}

export default ProtectedRoute;
