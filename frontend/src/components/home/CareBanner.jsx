// Banner final de la portada que invita a volver al catálogo.
function CareBanner() {
  return (
    <section className="care-banner">
      <div className="care-banner-icon">+</div>
      <div>
        <span className="section-kicker">FARMAUIS</span>
        <h2>Tu bienestar comienza con pequeños cuidados.</h2>
        <p>
          Explora nuestro catálogo y descubre opciones para tu rutina diaria.
        </p>
      </div>
      <a className="secondary-button" href="#productos">
        Ver catálogo <span aria-hidden="true">→</span>
      </a>
    </section>
  );
}

export default CareBanner;
