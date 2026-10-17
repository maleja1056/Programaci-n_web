// Cabecera del sitio: marca, navegación pública y acciones de sesión.
// Sin sesión muestra el botón que abre el modal de login; con sesión muestra
// el menú desplegable de rutas privadas. Ocultar el menú no protege nada por
// sí solo: las rutas usan ProtectedRoute y, con backend, el servidor exige sesión.
import { useState } from "react";
import Collapse from "react-bootstrap/Collapse";
import Dropdown from "react-bootstrap/Dropdown";
import { FaBars, FaXmark } from "react-icons/fa6";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth-context.js";
import useActiveSection from "../../hooks/useActiveSection.js";
import LoginModal from "../auth/LoginModal.jsx";

// Secciones de la portada enlazadas desde la navegación principal
const navSections = [
  { id: "inicio", label: "Inicio" },
  { id: "categorias", label: "Categorías" },
  { id: "productos", label: "Productos" },
];
const sectionIds = navSections.map((section) => section.id);

// Rutas privadas que aparecen en el menú cuando hay sesión.
const privateRoutes = [
  { to: "/panel", label: "Panel" },
  { to: "/perfil", label: "Mi perfil" },
];

function SiteHeader() {
  const { user, status, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Enlace marcado según la sección visible (solo en la portada)
  const activeSection = useActiveSection(sectionIds, location.pathname === "/");
  const [showLogin, setShowLogin] = useState(false);
  // Menú de navegación desplegable en móvil (en escritorio siempre visible)
  const [menuOpen, setMenuOpen] = useState(false);
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

      {/* En móvil, Collapse muestra u oculta la navegación con animación */}
      <Collapse in={menuOpen}>
        <div id="main-nav-collapse" className="main-nav-collapse">
          <nav className="main-nav" aria-label="Navegación principal">
            {navSections.map((section) => {
              const isActive = activeSection === section.id;
              return (
                <a
                  key={section.id}
                  className={isActive ? "nav-link active" : "nav-link"}
                  href={`/#${section.id}`}
                  aria-current={isActive ? "location" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {section.label}
                </a>
              );
            })}
          </nav>
        </div>
      </Collapse>

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

        {/* Botón de menú (hamburguesa), solo visible en móvil */}
        <button
          type="button"
          className="nav-toggle"
          aria-controls="main-nav-collapse"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <FaXmark aria-hidden="true" /> : <FaBars aria-hidden="true" />}
        </button>

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
