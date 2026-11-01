// Sección "Cómo pedir" (#como-pedir): los tres pasos de una compra, en tres
// columnas numeradas. Las tarjetas aparecen con el efecto Fade de
// React-Bootstrap cuando la sección llega a la pantalla.
import Fade from "react-bootstrap/Fade";
import { FaCartPlus, FaClipboardCheck, FaTruckFast } from "react-icons/fa6";
import useInView from "../../hooks/useInView.js";

const pasos = [
  {
    Icono: FaCartPlus,
    titulo: "Arma tu carrito",
    texto:
      "Busca por nombre o categoría y agrega lo que necesitas. Para ver precios y unidades disponibles no hace falta cuenta.",
  },
  {
    Icono: FaClipboardCheck,
    titulo: "Confirma el pedido",
    texto:
      "Inicia sesión y escribe la dirección. Mientras esté pendiente puedes cambiarlo o cancelarlo desde Mis pedidos.",
  },
  {
    Icono: FaTruckFast,
    titulo: "Recíbelo en casa",
    texto:
      "Lo llevamos a tu dirección en el área metropolitana y pagas al recibir. Si lleva fórmula médica, tenla a la mano.",
  },
];

function FeaturesSection() {
  const [ref, visible] = useInView();

  return (
    <section className="home-section features-section" id="como-pedir" ref={ref}>
      <div className="section-heading">
        <div>
          <span className="section-kicker">CÓMO PEDIR</span>
          <h2>De la búsqueda a tu puerta en tres pasos</h2>
        </div>
      </div>

      <div className="features-grid">
        {pasos.map(({ Icono, titulo, texto }, indice) => (
          <Fade in={visible} key={titulo}>
            <article className="feature-card">
              <span className="feature-icon" aria-hidden="true">
                <Icono />
              </span>
              <span className="feature-paso">Paso {indice + 1}</span>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </article>
          </Fade>
        ))}
      </div>
    </section>
  );
}

export default FeaturesSection;
