// Cabecera del sitio: marca, navegación pública y acciones de sesión.
// La navegación tiene submenús desplegables (Dropdown) para Categorías,
// Productos y Nosotros: cada opción abre la portada en la sección indicada y,
// en el catálogo, con el filtro ya aplicado (corrección de la Fase I: "faltó
// un dropdown para los submenús de Productos y Categorías").
// A la derecha está el carrito (para todos, con el número de unidades). Sin
// sesión muestra el botón que abre el modal de login; con sesión muestra el
// menú desplegable de rutas privadas. Ocultar el menú no protege nada por
// sí solo: las rutas usan ProtectedRoute y, con backend, el servidor exige sesión.
import { useEffect, useRef, useState } from "react";
import Collapse from "react-bootstrap/Collapse";
import Dropdown from "react-bootstrap/Dropdown";
import { FaBars, FaCartShopping, FaXmark } from "react-icons/fa6";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/img/logo.svg";
import { useAuth } from "../../context/auth-context.js";
import { useCart } from "../../context/cart-context.js";
import useActiveSection from "../../hooks/useActiveSection.js";
import { PRODUCT_VIEWS } from "../../hooks/useCatalog.js";
import useCategoryMenu from "../../hooks/useCategoryMenu.js";
import LoginModal from "../auth/LoginModal.jsx";

// Secciones de la portada que marcan como activo su enlace de la cabecera
const sectionIds = ["inicio", "productos", "nosotros", "bucaramanga", "preguntas"];

// Enlace a la portada con filtros del catálogo en la URL y salto a una sección
const homeLink = (sectionId, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return `/${query ? `?${query}` : ""}#${sectionId}`;
};

// Rutas privadas que aparecen en el menú desplegable (Dropdown) cuando hay
// sesión. "soloAdmin": solo se muestran al rol administrador.
const privateRoutes = [
  { to: "/panel", label: "Panel de administración", soloAdmin: true },
  { to: "/perfil", label: "Mi perfil" },
  { to: "/mis-pedidos", label: "Mis pedidos" },
  { to: "/archivos", label: "Archivos" },
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
  const { unidades } = useCart();
  // El contador "salta" cuando se agrega algo al carrito (no al cargar la
  // página). La key reinicia la animación en cada salto.
  const [saltos, setSaltos] = useState(0);
  const unidadesAntes = useRef(unidades);
  useEffect(() => {
    if (unidades > unidadesAntes.current) setSaltos((n) => n + 1);
    unidadesAntes.current = unidades;
  }, [unidades]);
  const categories = useCategoryMenu();
  const navigate = useNavigate();
  const location = useLocation();
  // Enlace marcado según la sección visible (solo en la portada)
  const activeSection = useActiveSection(sectionIds, location.pathname === "/");
  // En el catálogo se marca "Categorías" si hay una categoría elegida y
  // "Productos" si no
  const filtraCategoria = new URLSearchParams(location.search).has("categoria");
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
              active={activeSection === "productos" && filtraCategoria}
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
              <Dropdown.Item as={Link} to={homeLink("productos")} onClick={closeMenu}>
                Ver todo el catálogo
              </Dropdown.Item>
            </NavMenu>

            {/* Submenú Productos: tipos de producto (PRODUCT_VIEWS de useCatalog) */}
            <NavMenu
              id="menu-productos"
              label="Productos"
              active={activeSection === "productos" && !filtraCategoria}
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

            {/* Submenú Nosotros: equipo, Bucaramanga, preguntas y contacto */}
            <NavMenu
              id="menu-nosotros"
              label="Nosotros"
              active={["nosotros", "bucaramanga", "preguntas"].includes(activeSection)}
            >
              <Dropdown.Item as={Link} to={homeLink("nosotros")} onClick={closeMenu}>
                Quiénes somos
              </Dropdown.Item>
              <Dropdown.Item as={Link} to={homeLink("bucaramanga")} onClick={closeMenu}>
                Conoce Bucaramanga
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

        <NavLink
          className="header-action header-cart"
          to="/carrito"
          aria-label={`Carrito de compras, ${unidades} ${unidades === 1 ? "unidad" : "unidades"}`}
        >
          <FaCartShopping aria-hidden="true" />
          <span className="header-cart-text">Carrito</span>
          {unidades > 0 && (
            <span
              key={saltos}
              className={`header-cart-count${saltos ? " is-salto" : ""}`}
              aria-hidden="true"
            >
              {unidades > 99 ? "99+" : unidades}
            </span>
          )}
        </NavLink>

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
              {privateRoutes
                .filter((route) => !route.soloAdmin || user.rol === "administrador")
                .map((route) => (
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
