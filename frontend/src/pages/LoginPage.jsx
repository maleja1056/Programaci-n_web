import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import SiteHeader from "../components/SiteHeader.jsx";
import { useAuth } from "../context/auth-context.js";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

const validate = (correo, password) => {
  const errors = {};

  if (!correo.trim()) {
    errors.correo = "Escribe tu correo electrónico.";
  } else if (!EMAIL_PATTERN.test(correo.trim())) {
    errors.correo = "Escribe un correo electrónico válido.";
  }

  if (!password) {
    errors.password = "Escribe tu contraseña.";
  }

  return errors;
};

function LoginPage() {
  const { status, login, sessionError } = useAuth();
  const location = useLocation();
  const from = location.state?.from;

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Con sesión válida (recién iniciada o ya existente) se sale del login.
  if (status === "authenticated") {
    return <Navigate to={from || "/panel"} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const errors = validate(correo, password);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);

    try {
      await login(correo.trim(), password);
    } catch (err) {
      setError(
        err.status === 401
          ? "Correo o contraseña incorrectos. Revisa tus datos e inténtalo de nuevo."
          : err.message
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <SiteHeader />

      <main className="auth-page">
        <section className="auth-card" aria-labelledby="login-title">
          <span className="auth-icon" aria-hidden="true">+</span>
          <span className="section-kicker">ACCESO FARMAUIS</span>
          <h1 id="login-title">Inicia sesión</h1>
          <p className="auth-subtitle">
            Ingresa con tu cuenta para acceder a tu panel.
          </p>

          {from && !error && (
            <p className="auth-notice" role="status">
              Debes iniciar sesión para acceder a esa página.
            </p>
          )}

          {sessionError && !error && (
            <p className="auth-alert" role="alert">
              {sessionError}
            </p>
          )}

          {error && (
            <p className="auth-alert" role="alert">
              {error}
            </p>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="login-correo">Correo electrónico</label>
              <input
                id="login-correo"
                type="email"
                autoComplete="username"
                placeholder="tu@correo.com"
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
                aria-invalid={Boolean(fieldErrors.correo)}
                aria-describedby={
                  fieldErrors.correo ? "login-correo-error" : undefined
                }
                disabled={submitting}
              />
              {fieldErrors.correo && (
                <span className="auth-field-error" id="login-correo-error">
                  {fieldErrors.correo}
                </span>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="login-password">Contraseña</label>
              <div className="auth-password">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password ? "login-password-error" : undefined
                  }
                  disabled={submitting}
                />
                <button
                  type="button"
                  className="auth-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-pressed={showPassword}
                  aria-controls="login-password"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {fieldErrors.password && (
                <span className="auth-field-error" id="login-password-error">
                  {fieldErrors.password}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="primary-button auth-submit"
              disabled={submitting || status === "checking"}
            >
              {submitting ? (
                <>
                  <span className="auth-spinner small" aria-hidden="true" />
                  Validando...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          <Link className="auth-back" to="/">
            ← Volver al catálogo
          </Link>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
