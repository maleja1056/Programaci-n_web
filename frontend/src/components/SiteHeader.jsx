// Cabecera del sitio: marca, navegación pública y acciones de sesión.
// Sin sesión muestra el botón que abre el modal de login; con sesión muestra
// el menú desplegable de rutas privadas. Ocultar el menú no protege nada por
// sí solo: las rutas usan ProtectedRoute y el backend exige sesión.
import { useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context.js";
import LoginModal from "./LoginModal.jsx";

// Rutas privadas que aparecen en el menú cuando hay sesión.
const privateRoutes = [
  { to: "/panel", label: "Panel" },
  { to: "/perfil", label: "Mi perfil" },
];

function SiteHeader() {
  const { user, status, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const handleLogout = async () => {
    setLoggingOut(true);
    setLogoutError("");

    try {
      // Primero se navega al inicio: si se esperara al cambio de estado,
      // ProtectedRoute redirigiría a /login antes (React Router procesa la
      // navegación como una transición de menor prioridad).
      navigate("/", { replace: true });
      await logout();
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
          <Dropdown align="end">
            <Dropdown.Toggle
              className="header-action header-user"
              id="private-menu"
              disabled={loggingOut}
            >
              <span className="header-user-avatar" aria-hidden="true">
                {user.nombre.charAt(0).toUpperCase()}
              </span>
              {loggingOut ? "Saliendo..." : user.usuario || user.nombre}
            </Dropdown.Toggle>

            <Dropdown.Menu className="private-menu">
              <Dropdown.Header>Rutas privadas</Dropdown.Header>
              {privateRoutes.map((route) => (
                <Dropdown.Item key={route.to} as={NavLink} to={route.to}>
                  {route.label}
                </Dropdown.Item>
              ))}
              <Dropdown.Divider />
              <Dropdown.Item as="button" onClick={handleLogout}>
                Cerrar sesión
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        ) : status === "anonymous" ? (
          <button
            type="button"
            className="header-action header-login"
            onClick={() => setShowLogin(true)}
          >
            Iniciar sesión
          </button>
        ) : null}

        {logoutError && (
          <p className="header-error" role="alert">
            {logoutError}
          </p>
        )}
      </div>

      <LoginModal show={showLogin} onHide={() => setShowLogin(false)} />
    </header>
  );
}

export default SiteHeader;
