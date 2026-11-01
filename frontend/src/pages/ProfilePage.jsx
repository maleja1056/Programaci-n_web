// Página privada /perfil: datos públicos del usuario con sesión iniciada y
// accesos a sus pedidos, al carrito y a sus archivos.
// Los datos vienen de la sesión del servidor (GET /api/auth/me) o, en el modo
// demostración, del usuario simulado de api/demo.js.
import { Link } from "react-router-dom";
import SiteFooter from "../components/layout/SiteFooter.jsx";
import SiteHeader from "../components/layout/SiteHeader.jsx";
import { useAuth } from "../context/auth-context.js";

// Texto que se muestra para cada rol guardado en la sesión
const roleLabels = {
  administrador: "Administrador",
  cliente: "Cliente",
};

function ProfilePage() {
  const { user } = useAuth();

  const fields = [
    { label: "Nombre", value: `${user.nombre} ${user.apellido}` },
    { label: "Usuario", value: user.usuario || "Sin usuario asignado" },
    { label: "Correo", value: user.correo },
    { label: "Rol", value: roleLabels[user.rol] || user.rol },
  ];

  return (
    <div className="app-shell">
      <SiteHeader />

      <main className="panel-page">
        <div className="panel-heading">
          <span className="section-kicker">ÁREA PRIVADA</span>
          <h1>Mi perfil</h1>
          <p>Datos de la cuenta con la que iniciaste sesión.</p>
        </div>

        <dl className="profile-card">
          {fields.map((field) => (
            <div className="profile-row" key={field.label}>
              <dt>{field.label}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
        </dl>

        <nav className="profile-links" aria-label="Accesos de tu cuenta">
          <Link className="crud-button" to="/mis-pedidos">Mis pedidos</Link>
          <Link className="crud-button" to="/carrito">Carrito</Link>
          <Link className="crud-button" to="/archivos">Archivos</Link>
        </nav>
      </main>

      <SiteFooter />
    </div>
  );
}

export default ProfilePage;
