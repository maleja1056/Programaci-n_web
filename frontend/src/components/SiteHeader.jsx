import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context.js";

function SiteHeader() {
  const { user, status, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const handleLogout = async () => {
    setLoggingOut(true);
    setLogoutError("");

    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      setLogoutError(error.message);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="FarmaUIS, inicio">
        <span className="brand-mark">
          <span className="brand-cross">+</span>
        </span>
        <span className="brand-name">
          Farma<span>UIS</span>
          <small>Tu farmacia de confianza</small>
        </span>
      </Link>

      <nav className="main-nav" aria-label="Navegación principal">
        <a
          className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          href="/#inicio"
        >
          Inicio
        </a>
        <a className="nav-link" href="/#categorias">Categorías</a>
        <a className="nav-link" href="/#productos">Productos</a>
      </nav>

      <div className="header-actions">
        <a className="header-action header-explore" href="/#productos">
          <span aria-hidden="true">⌕</span>
          Explorar tienda
        </a>

        {status === "authenticated" ? (
          <>
            <Link
              className="header-action"
              to="/panel"
              title={`Sesión iniciada como ${user.correo}`}
            >
              Mi panel
            </Link>
            <button
              type="button"
              className="header-action header-logout"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? "Saliendo..." : "Cerrar sesión"}
            </button>
          </>
        ) : status === "anonymous" ? (
          <Link className="header-action header-login" to="/login">
            Iniciar sesión
          </Link>
        ) : null}

        {logoutError && (
          <p className="header-error" role="alert">
            {logoutError}
          </p>
        )}
      </div>
    </header>
  );
}

export default SiteHeader;
