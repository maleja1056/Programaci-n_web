// Página privada /panel: saludo al usuario y resumen del catálogo (productos,
// categorías y productos sin stock). Solo se llega con sesión (ProtectedRoute).
import { useEffect, useState } from "react";
import SiteFooter from "../components/layout/SiteFooter.jsx";
import SiteHeader from "../components/layout/SiteHeader.jsx";
import { getPanelSummary } from "../api/auth.js";
import { useAuth } from "../context/auth-context.js";

// Texto que se muestra para cada rol guardado en la sesión
const roleLabels = {
  administrador: "Administrador",
  cliente: "Cliente",
};

function PanelPage() {
  const { user, handleUnauthorized } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pide el resumen al montar la página. "active" evita actualizar el estado
  // si el usuario sale de la página antes de que llegue la respuesta.
  useEffect(() => {
    let active = true;

    getPanelSummary()
      .then((data) => {
        if (active) setSummary(data.resumen);
      })
      .catch((err) => {
        if (!active) return;
        // La sesión expiró o se cerró: ProtectedRoute redirige al login.
        if (err.status === 401) handleUnauthorized();
        else setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [handleUnauthorized]);

  return (
    <div className="app-shell">
      <SiteHeader />

      <main className="panel-page">
        <div className="panel-heading">
          <span className="section-kicker">ÁREA PRIVADA</span>
          <h1>Hola, {user.nombre}</h1>
          <p>
            Sesión iniciada como <strong>{user.correo}</strong> ·{" "}
            {roleLabels[user.rol] || user.rol}
          </p>
        </div>

        {loading ? (
          <div className="auth-loading" role="status">
            <span className="auth-spinner" aria-hidden="true" />
            Cargando resumen...
          </div>
        ) : error ? (
          <div className="empty-state" role="alert">
            <h3>No se pudo cargar el resumen</h3>
            <p>{error}</p>
          </div>
        ) : (
          <div className="panel-grid">
            <article className="panel-stat">
              <span>Productos activos</span>
              <strong>{summary.productos}</strong>
            </article>
            <article className="panel-stat">
              <span>Categorías activas</span>
              <strong>{summary.categorias}</strong>
            </article>
            <article className="panel-stat">
              <span>Productos sin stock</span>
              <strong>{summary.productosSinStock}</strong>
            </article>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

export default PanelPage;
