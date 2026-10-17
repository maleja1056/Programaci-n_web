// Sección principal de la portada (#inicio): título, descripción, botón al
// catálogo y la ilustración de productos hecha con CSS.
function HeroSection() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-content">
        <div className="eyebrow">
          <span className="eyebrow-icon">✳</span>
          CUIDAMOS DE TI
        </div>

        <h1>
          Tu salud merece
          <br />
          <span>lo mejor.</span>
        </h1>

        <p className="hero-description">
          Encuentra productos para tu bienestar y cuidado personal en un
          solo lugar. Una forma más sencilla de cuidar de ti y de los tuyos.
        </p>

        <a className="primary-button" href="#productos">
          Explorar productos <span aria-hidden="true">→</span>
        </a>

        <div className="hero-benefits">
          <div className="benefit">
            <span className="benefit-icon">✓</span>
            <span>Compra sencilla</span>
          </div>
          <div className="benefit">
            <span className="benefit-icon">♡</span>
            <span>Bienestar para todos</span>
          </div>
        </div>
      </div>

      {/* Ilustración decorativa: frasco y caja de producto */}
      <div className="hero-visual" aria-hidden="true">
        <div className="hero-orbit orbit-one" />
        <div className="hero-orbit orbit-two" />
        <div className="hero-leaf leaf-one" />
        <div className="hero-leaf leaf-two" />

        <div className="hero-product product-bottle">
          <div className="bottle-cap" />
          <div className="bottle-label">
            <span className="bottle-plus">+</span>
            <span>DAILY</span>
            <strong>CARE</strong>
            <small>BIENESTAR</small>
          </div>
        </div>

        <div className="hero-product product-box">
          <span className="box-plus">+</span>
          <span className="box-small">FARMAUIS</span>
          <strong>VITAL</strong>
          <span className="box-caption">CUIDADO DIARIO</span>
        </div>

        <div className="floating-note">
          <span className="floating-note-icon">✳</span>
          <span>
            <strong>Cuida de ti</strong>
            <small>Todos los días</small>
          </span>
        </div>

        <span className="decorative-plus plus-one">+</span>
        <span className="decorative-plus plus-two">+</span>
      </div>

      <div className="hero-bottom-label">
        BIENESTAR <span>·</span> CONFIANZA <span>·</span> CUIDADO
      </div>
    </section>
  );
}

export default HeroSection;
