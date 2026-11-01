// Franja verde superior de la portada: zona de entregas y horario de atención
// (el horario sale de data/sitio.js, el mismo del pie de página).
import { contacto } from "../../data/sitio.js";

function AnnouncementBar() {
  return (
    <div className="announcement">
      <span className="announcement-dot" aria-hidden="true" />
      Entregas en el área metropolitana de Bucaramanga
      <span className="announcement-divider">·</span>
      <span className="announcement-horario">{contacto.horario}</span>
      <span className="announcement-dot" aria-hidden="true" />
    </div>
  );
}

export default AnnouncementBar;
