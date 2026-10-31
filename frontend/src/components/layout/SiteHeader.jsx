// Cabecera del sitio: marca, navegación pública y acciones de sesión.
// La navegación tiene submenús desplegables (Dropdown) para Categorías,
// Productos y Nosotros: cada opción abre la portada en la sección indicada y,
// en el catálogo, con el filtro ya aplicado (corrección de la Fase I: "faltó
// un dropdown para los submenús de Productos y Categorías").
// Sin sesión muestra el botón que abre el modal de login; con sesión muestra
// el menú desplegable de rutas privadas. Ocultar el menú no protege nada por
// sí solo: las rutas usan ProtectedRoute y, con backend, el servidor exige sesión.
import { useState } from "react";
import Collapse from "react-bootstrap/Collapse";
import Dropdown from "react-bootstrap/Dropdown";
import { FaBars, FaXmark } from "react-icons/fa6";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/img/logo.svg";
import { useAuth } from "../../context/auth-context.js";
import useActiveSection from "../../hooks/useActiveSection.js";
import { PRODUCT_VIEWS } from "../../hooks/useCatalog.js";
import useCategoryMenu from "../../hooks/useCategoryMenu.js";
import LoginModal from "../auth/LoginModal.jsx";

// Secciones de la portada que marcan como activo su enlace de la cabecera
const sectionIds = ["inicio", "categorias", "productos", "nosotros", "preguntas"];

// Enlace a la portada con filtros del catálogo en la URL y salto a una sección
const homeLink = (sectionId, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return `/${query ? `?${query}` : ""}#${sectionId}`;
};

// Rutas privadas que aparecen en el menú desplegable (Dropdown) cuando hay sesión
const privateRoutes = [
  { to: "/panel", label: "Panel" },
  { to: "/perfil", label: "Mi perfil" },
];

// Enlace de la barra con submenú desplegable. En escritorio el menú flota
// bajo el enlace; en móvil se abre dentro del panel del menú (header.css).
function NavMenu({ id, label, active, children }) {
  return (
    <Dropdown className="nav-menu">
      <Dropdown.Toggle
        as="button"
        type="button"
        id={id}
        className={active ? "nav-link nav-menu-toggle active" : "nav-link nav-menu-toggle"}
      >
        {label}
      </Dropdown.Toggle>
      <Dropdown.Menu className="nav-menu-list">{children}</Dropdown.Menu>
    </Dropdown>
  );
}

function SiteHeader() {
  const { user, status, logout } = useAuth();
  const categories = useCategoryMenu();
  const navigate = useNavigate();
  const location = useLocation();
  // Enlace marcado según la sección visible (solo en la portada)
  const activeSection = useActiveSection(sectionIds, location.pathname === "/");
  const [showLogin, setShowLogin] = useState(false);
  // Menú de navegación desplegable en móvil (en escritorio siempre visible)
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const closeMenu = () => setMenuOpen(false);

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
        {/* Logo: imagen en src/assets/img/logo.svg (el nombre del sitio va en el texto) */}
        <img className="brand-mark" src={logo} alt="" />
        <span className="brand-name">
          Farma<span>UIS</span>
          <small>Tu farmacia de confianza</small>
        </span>
      </Link>

      {/* En móvil, Collapse muestra u oculta la navegación con animación */}
      <Collapse in={menuOpen}>
        <div id="main-nav-collapse" className="main-nav-collapse">
          <nav className="main-nav" aria-label="Navegación principal">
            <Link
              className={activeSection === "inicio" ? "nav-link active" : "nav-link"}
              to={homeLink("inicio")}
              aria-current={activeSection === "inicio" ? "location" : undefined}
              onClick={closeMenu}
            >
              Inicio
            </Link>

            {/* Submenú Categorías: una opción por categoría (vienen de la BD) */}
            <NavMenu
              id="menu-categorias"
              label="Categorías"
              active={activeSection === "categorias"}
            >
              <Dropdown.Header>Comprar por categoría</Dropdown.Header>
              {categories.map((category) => (
                <Dropdown.Item
                  key={category.id}
                  as={Link}
                  to={homeLink("productos", { categoria: category.name })}
                  onClick={closeMenu}
                >
                  {category.name}
                  <span className="nav-menu-count">{category.count}</span>
                </Dropdown.Item>
              ))}
              <Dropdown.Divider />
              <Dropdown.Item as={Link} to={homeLink("categorias")} onClick={closeMenu}>
                Ver todas las categorías
              </Dropdown.Item>
            </NavMenu>

            {/* Submenú Productos: tipos de producto (PRODUCT_VIEWS de useCatalog) */}
            <NavMenu
              id="menu-productos"
              label="Productos"
              active={activeSection === "productos"}
            >
              <Dropdown.Header>Ver productos</Dropdown.Header>
              {Object.entries(PRODUCT_VIEWS).map(([key, view]) => (
                <Dropdown.Item
                  key={key}
                  as={Link}
                  to={homeLink("productos", key === "todos" ? {} : { ver: key })}
                  onClick={closeMenu}
                >
                  {view.label}
                </Dropdown.Item>
              ))}
            </NavMenu>

            {/* Submenú Nosotros: equipo y preguntas frecuentes */}
            <NavMenu
              id="menu-nosotros"
              label="Nosotros"
              active={activeSection === "nosotros" || activeSection === "preguntas"}
            >
              <Dropdown.Item as={Link} to={homeLink("nosotros")} onClick={closeMenu}>
                Quiénes somos
              </Dropdown.Item>
              <Dropdown.Item as={Link} to={homeLink("preguntas")} onClick={closeMenu}>
                Preguntas frecuentes
              </Dropdown.Item>
              <Dropdown.Item as={Link} to="/#contacto" onClick={closeMenu}>
                Contacto
              </Dropdown.Item>
            </NavMenu>
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
          // Mientras se comprueba la sesión ("checking") no se muestra ningún botón
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
