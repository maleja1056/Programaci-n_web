import { Link } from "react-router-dom";
import SiteHeader from "../components/SiteHeader.jsx";

function NotFoundPage() {
  return (
    <div className="app-shell">
      <SiteHeader />

      <main className="auth-page">
        <div className="empty-state not-found">
          <span className="empty-state-icon" aria-hidden="true">⌕</span>
          <h1>Página no encontrada</h1>
          <p>La página que buscas no existe o fue movida.</p>
          <Link className="primary-button" to="/">
            Volver al inicio <span aria-hidden="true">→</span>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default NotFoundPage;
