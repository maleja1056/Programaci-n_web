// Página pública /login. Es el destino de ProtectedRoute cuando alguien
// intenta abrir una ruta privada sin sesión; usa el mismo formulario que el
// modal de la cabecera.
import { Link, Navigate, useLocation } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm.jsx";
import SiteHeader from "../components/layout/SiteHeader.jsx";
import { useAuth } from "../context/auth-context.js";

function LoginPage() {
  const { status } = useAuth();
  const location = useLocation();
  const from = location.state?.from;

  // Con sesión válida (recién iniciada o ya existente) se sale del login.
  if (status === "authenticated") {
    return <Navigate to={from || "/panel"} replace />;
  }

  return (
    <div className="app-shell">
      <SiteHeader />

      <main className="auth-page">
        <section className="auth-card" aria-labelledby="login-title">
          <span className="auth-icon" aria-hidden="true">+</span>
          <span className="section-kicker">ACCESO FARMAUIS</span>
          <h1 id="login-title">Inicia sesión</h1>
          <p className="auth-subtitle">
            Ingresa con tu cuenta para acceder a las páginas privadas.
          </p>

          {from && (
            <p className="auth-notice" role="status">
              Debes iniciar sesión para acceder a esa página.
            </p>
          )}

          <LoginForm />

          <Link className="auth-back" to="/">
            ← Volver al catálogo
          </Link>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
