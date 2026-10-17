// Carrusel de promociones y servicios (React-Bootstrap Carousel), debajo del
// hero. Las diapositivas se definen en src/data/carrusel.js.
import Carousel from "react-bootstrap/Carousel";
import { diapositivas } from "../../data/carrusel.js";

function PromoCarousel() {
  return (
    <section className="home-section promo-section" aria-label="Promociones y servicios">
      <Carousel
        className="promo-carousel"
        interval={6000}
        pause="hover"
        prevLabel="Diapositiva anterior"
        nextLabel="Diapositiva siguiente"
        indicatorLabels={diapositivas.map((d) => `Ver: ${d.titulo}`)}
      >
        {diapositivas.map((diapositiva) => (
          <Carousel.Item key={diapositiva.id}>
            {/* La imagen es decorativa: el texto va en el pie de la diapositiva */}
            <img className="promo-image" src={diapositiva.imagen} alt="" />
            <Carousel.Caption className="promo-caption">
              <span className="section-kicker">{diapositiva.etiqueta}</span>
              <h3>{diapositiva.titulo}</h3>
              <p>{diapositiva.texto}</p>
              <a className="primary-button" href={diapositiva.enlace}>
                {diapositiva.boton} <span aria-hidden="true">→</span>
              </a>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>
    </section>
  );
}

export default PromoCarousel;
