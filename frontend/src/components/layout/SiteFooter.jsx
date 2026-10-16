// Pie de página del sitio: marca, créditos del proyecto y enlace para volver
// arriba.
function SiteFooter() {
  return (
    <footer className="site-footer">
      <a className="brand footer-brand" href="#inicio">
        <span className="brand-mark">
          <span className="brand-cross">+</span>
        </span>
        <span className="brand-name">
          Farma<span>UIS</span>
          <small>Tu farmacia de confianza</small>
        </span>
      </a>
      <p>Proyecto académico · FarmaUIS</p>
      <a href="#inicio" className="back-to-top">Volver arriba ↑</a>
    </footer>
  );
}

export default SiteFooter;
