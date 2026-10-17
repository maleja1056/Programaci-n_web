// Pie de página del sitio, presente en todas las páginas: marca y redes
// sociales, navegación, datos de contacto y los integrantes del equipo (cada
// uno abre un modal con sus datos). Los datos están en src/data.
import { useState } from "react";
import {
  FaArrowUp,
  FaClock,
  FaEnvelope,
  FaLocationDot,
  FaPhone,
} from "react-icons/fa6";
import { Link } from "react-router-dom";
import logo from "../../assets/img/logo.svg";
import { equipo, iniciales } from "../../data/equipo.js";
import { contacto, redesSociales } from "../../data/sitio.js";
import TeamMemberModal from "./TeamMemberModal.jsx";

function SiteFooter() {
  // Integrante cuyo modal está abierto (null = modal cerrado)
  const [selectedMember, setSelectedMember] = useState(null);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="site-footer">
      <div className="footer-main">
        {/* Marca, descripción y redes sociales */}
        <div className="footer-about">
          <Link className="brand footer-brand" to="/" aria-label="FarmaUIS, inicio">
            <img className="brand-mark" src={logo} alt="" />
            <span className="brand-name">
              Farma<span>UIS</span>
              <small>Tu farmacia de confianza</small>
            </span>
          </Link>
          <p>
            Productos para tu salud, bienestar y cuidado personal en un solo
            lugar.
          </p>
          <ul className="footer-social" aria-label="Redes sociales">
            {redesSociales.map(({ nombre, url, Icono }) => (
              <li key={nombre}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${nombre} (se abre en una pestaña nueva)`}
                  title={nombre}
                >
                  <Icono aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Enlaces a las secciones de la portada */}
        <nav className="footer-column" aria-labelledby="footer-nav-title">
          <h2 className="footer-title" id="footer-nav-title">Navegación</h2>
          <ul className="footer-links">
            <li><a href="/#inicio">Inicio</a></li>
            <li><a href="/#categorias">Categorías</a></li>
            <li><a href="/#productos">Productos</a></li>
            <li><a href="/#nosotros">Nosotros</a></li>
            <li><a href="/#preguntas">Preguntas frecuentes</a></li>
          </ul>
        </nav>

        {/* Datos de contacto */}
        <div className="footer-column">
          <h2 className="footer-title">Contáctanos</h2>
          <ul className="footer-contact">
            <li>
              <FaLocationDot aria-hidden="true" />
              <span>{contacto.direccion}</span>
            </li>
            <li>
              <FaPhone aria-hidden="true" />
              <span>{contacto.telefono}</span>
            </li>
            <li>
              <FaEnvelope aria-hidden="true" />
              <span>{contacto.correo}</span>
            </li>
            <li>
              <FaClock aria-hidden="true" />
              <span>{contacto.horario}</span>
            </li>
          </ul>
        </div>

        {/* Integrantes del equipo: cada botón abre su modal */}
        <div className="footer-column">
          <h2 className="footer-title">Nuestro equipo</h2>
          <ul className="footer-team">
            {equipo.map((member) => (
              <li key={member.id}>
                <button
                  type="button"
                  className="team-member"
                  onClick={() => setSelectedMember(member)}
                >
                  {member.foto ? (
                    <img className="team-avatar" src={member.foto} alt="" />
                  ) : (
                    <span className="team-avatar" aria-hidden="true">
                      {iniciales(member.nombre)}
                    </span>
                  )}
                  <span className="team-member-text">
                    <strong>{member.nombre}</strong>
                    <small>{member.modulo}</small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 FarmaUIS · Proyecto académico</p>
        <button type="button" className="back-to-top" onClick={scrollToTop}>
          Volver arriba <FaArrowUp aria-hidden="true" />
        </button>
      </div>

      <TeamMemberModal
        member={selectedMember}
        onHide={() => setSelectedMember(null)}
      />
    </footer>
  );
}

export default SiteFooter;
