// Sección "¿Por qué FarmaUIS?": diseño a tres columnas. Las tarjetas aparecen
// con el efecto Fade de React-Bootstrap cuando la sección llega a la pantalla.
import Fade from "react-bootstrap/Fade";
import { FaShieldHeart, FaTruckFast, FaUserDoctor } from "react-icons/fa6";
import useInView from "../../hooks/useInView.js";

const beneficios = [
  {
    Icono: FaTruckFast,
    titulo: "Envíos rápidos",
    texto: "Recibe tus productos en casa, con seguimiento de tu pedido.",
  },
  {
    Icono: FaUserDoctor,
    titulo: "Asesoría profesional",
    texto: "Resolvemos tus dudas sobre medicamentos y su uso responsable.",
  },
  {
    Icono: FaShieldHeart,
    titulo: "Productos confiables",
    texto: "Medicamentos y productos de cuidado con registro sanitario.",
  },
];

function FeaturesSection() {
  const [ref, visible] = useInView();

  return (
    <section className="home-section features-section" ref={ref}>
      <div className="section-heading">
        <div>
          <span className="section-kicker">¿POR QUÉ FARMAUIS?</span>
          <h2>Cuidamos de ti en cada paso</h2>
          <p>Tres razones para elegirnos como tu farmacia de confianza.</p>
        </div>
      </div>

      <div className="features-grid">
        {beneficios.map(({ Icono, titulo, texto }) => (
          <Fade in={visible} key={titulo}>
            <article className="feature-card">
              <span className="feature-icon" aria-hidden="true">
                <Icono />
              </span>
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
