// Contenido provisional de una pestaña del panel que todavía no se ha hecho.
// Cada integrante reemplaza su pestaña en PESTANAS (pages/PanelPage.jsx) por
// el componente real cuando lo termine.
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
