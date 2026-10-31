// Contenido provisional de una pestaña del panel que todavía no se ha hecho.
// Para activar una pestaña se cambia su componente en PESTANAS
// (pages/PanelPage.jsx).
import { FaScrewdriverWrench } from "react-icons/fa6";

function PestanaPendiente({ tabla }) {
  return (
    <div className="empty-state">
      <FaScrewdriverWrench className="empty-state-icon" aria-hidden="true" />
      <h3>Sección en construcción</h3>
      <p>La administración de {tabla} estará disponible pronto.</p>
    </div>
  );
}

export default PestanaPendiente;
