// Franja verde superior con el mensaje de bienvenida de la portada.
function AnnouncementBar() {
  return (
    <div className="announcement">
      <span className="announcement-dot" aria-hidden="true" />
      Tu bienestar, nuestra prioridad
      <span className="announcement-divider">·</span>
      Descubre una forma más fácil de cuidarte
      <span className="announcement-dot" aria-hidden="true" />
    </div>
  );
}

export default AnnouncementBar;
