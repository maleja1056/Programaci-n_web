// Carrusel de la portada (React-Bootstrap Carousel), debajo del hero
// (#como-pedir). Cuatro diapositivas: cómo pedir, un producto destacado del
// catálogo, vitaminas y un consejo de salud. Las fijas están en
// src/data/carrusel.js.
// - Transición de fundido (fade): cada diapositiva tiene su color de fondo,
//   así que el color cambia suavemente. Al activarse, el texto entra en
//   secuencia (home.css).
// - Avance automático cada 6 s con temporizador propio: la barra de la
//   diapositiva activa es una animación CSS y, al terminar (animationend),
//   pasa a la siguiente. Al pausar, la barra se detiene y al reanudar sigue
//   donde iba.
// - Pausa: clic o toque en una parte vacía de la diapositiva, el botón de
//   pausa (para teclado y lectores de pantalla, WCAG 2.2.2), el mouse encima
//   o el foco del teclado dentro. Con "reducir movimiento" no avanza solo.
// - Flechas solo con mouse (aparecen al pasar por encima); en celular se
//   cambia deslizando con el dedo (touch de React-Bootstrap).
import { useEffect, useMemo, useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import {
  FaArrowUpRightFromSquare,
  FaChevronLeft,
  FaChevronRight,
  FaPause,
  FaPlay,
  FaSun,
} from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
import { diapositivas, pasosPedido } from "../../data/carrusel.js";
import { formatPrice, formatStock } from "../../utils/format.js";
import BotonAgregar from "../carrito/BotonAgregar.jsx";
import ProductoIlustracion from "./ProductoIlustracion.jsx";

// Producto destacado del día: entre los disponibles, sin fórmula y que no
// sean vitaminas (esas ya tienen su diapositiva). Cambia cada día.
function elegirDestacado(productos) {
  const candidatos = productos.filter(
    (p) => !p.soldOut && !p.requiereFormula && !/vitamina/i.test(p.category)
  );
  if (!candidatos.length) return null;
  const dia = Math.floor(Date.now() / 86_400_000);
  return candidatos[dia % candidatos.length];
}

// true si el sistema pide reducir el movimiento (se actualiza si cambia)
function useReducirMovimiento() {
  const consulta = "(prefers-reduced-motion: reduce)";
  const [reducir, setReducir] = useState(() => window.matchMedia(consulta).matches);
  useEffect(() => {
    const media = window.matchMedia(consulta);
    const alCambiar = () => setReducir(media.matches);
    media.addEventListener("change", alCambiar);
    return () => media.removeEventListener("change", alCambiar);
  }, []);
  return reducir;
}

function TextoDiapositiva({ diapositiva, children }) {
  return (
    <div className="promo-texto">
      <span className="section-kicker">{diapositiva.etiqueta}</span>
      <h3>{diapositiva.titulo}</h3>
      <p>{diapositiva.texto}</p>
      {children}
    </div>
  );
}

function Diapositiva({ diapositiva }) {
  switch (diapositiva.tipo) {
    case "pasos":
      return (
        <>
          <TextoDiapositiva diapositiva={diapositiva}>
            <Link className="primary-button" to={diapositiva.enlace}>
              {diapositiva.boton}
            </Link>
          </TextoDiapositiva>
          <ol className="promo-visual promo-pasos">
            {pasosPedido.map(({ Icono, titulo, texto }, indice) => (
              <li key={titulo}>
                <span className="promo-paso-icono" aria-hidden="true">
                  <Icono />
                </span>
                <span>
                  <small>Paso {indice + 1}</small>
                  <strong>{titulo}</strong>
                  <span>{texto}</span>
                </span>
              </li>
            ))}
          </ol>
        </>
      );

    case "destacado": {
      const { producto } = diapositiva;
      return (
        <>
          <TextoDiapositiva diapositiva={diapositiva}>
            <p className="promo-precio">
              <strong>{formatPrice(producto.price)}</strong>
              <span>{formatStock(producto.stock)} disponibles</span>
            </p>
            <div className="promo-acciones">
              <BotonAgregar product={producto} className="promo-agregar" />
              <Link
                className="promo-enlace"
                to={`/?categoria=${encodeURIComponent(producto.category)}#productos`}
              >
                Ver {producto.category.toLowerCase()}
              </Link>
            </div>
          </TextoDiapositiva>
          <div className={`promo-visual promo-destacado art-${producto.color}`} aria-hidden="true">
            <ProductoIlustracion tipo={producto.ilustracion} />
          </div>
        </>
      );
    }

    case "consejo":
      return (
        <>
          <TextoDiapositiva diapositiva={diapositiva}>
            <a
              className="primary-button"
              href={diapositiva.enlaceExterno}
              target="_blank"
              rel="noreferrer"
            >
              {diapositiva.boton}
              <FaArrowUpRightFromSquare aria-hidden="true" />
              <span className="visually-hidden"> (se abre en una pestaña nueva)</span>
            </a>
            <small className="promo-fuente">Fuente: {diapositiva.fuente}.</small>
          </TextoDiapositiva>
          <div className="promo-visual promo-consejo" aria-hidden="true">
            <span className="promo-sol">
              <FaSun />
            </span>
            <span className="art-blue promo-consejo-caja">
              <ProductoIlustracion tipo="caja" />
            </span>
          </div>
        </>
      );

    default:
      return (
        <>
          <TextoDiapositiva diapositiva={diapositiva}>
            {/* Link: cambia la URL sin recargar la página */}
            <Link className="primary-button" to={diapositiva.enlace}>
              {diapositiva.boton}
            </Link>
          </TextoDiapositiva>
          <img className="promo-visual promo-imagen" src={diapositiva.imagen} alt="" />
        </>
      );
  }
}

function PromoCarousel({ productos = [] }) {
  const { hash, key } = useLocation();
  const reducirMovimiento = useReducirMovimiento();
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false); // pausa elegida por el usuario
  const [encima, setEncima] = useState(false); // mouse encima
  const [conFoco, setConFoco] = useState(false); // foco del teclado dentro

  // Diapositivas: la del producto destacado va en la segunda posición
  const lista = useMemo(() => {
    const producto = elegirDestacado(productos);
    if (!producto) return diapositivas;
    const destacado = {
      id: "destacado",
      tipo: "destacado",
      tono: "menta",
      etiqueta: "DESTACADO DE HOY",
      titulo: producto.name,
      texto: producto.description,
      producto,
    };
    return [diapositivas[0], destacado, ...diapositivas.slice(1)];
  }, [productos]);

  // El enlace "Cómo pedir" del hero muestra la primera diapositiva. Se
  // revisa en cada navegación nueva (cambia location.key), durante el render.
  const [navegacion, setNavegacion] = useState(key);
  if (navegacion !== key) {
    setNavegacion(key);
    if (hash === "#como-pedir") setIndice(0);
  }

  const corriendo = !pausado && !encima && !conFoco && !reducirMovimiento;
  const siguiente = () => setIndice((i) => (i + 1) % lista.length);

  // Clic o toque en una parte vacía: pausa o reanuda (no en botones ni enlaces)
  const alHacerClic = (evento) => {
    if (evento.target.closest("a, button")) return;
    setPausado((p) => !p);
  };

  return (
    <section
      className={`home-section promo-section${corriendo ? "" : " is-pausado"}`}
      id="como-pedir"
      aria-label="Novedades de FarmaUIS"
      onMouseEnter={() => setEncima(true)}
      onMouseLeave={() => setEncima(false)}
      onFocus={() => setConFoco(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setConFoco(false);
      }}
    >
      <Carousel
        className="promo-carousel"
        fade
        activeIndex={Math.min(indice, lista.length - 1)}
        onSelect={setIndice}
        interval={null}
        indicators={false}
        prevLabel="Diapositiva anterior"
        nextLabel="Diapositiva siguiente"
        prevIcon={<FaChevronLeft aria-hidden="true" />}
        nextIcon={<FaChevronRight aria-hidden="true" />}
        onClick={alHacerClic}
      >
        {lista.map((diapositiva) => (
          <Carousel.Item key={diapositiva.id} className={`promo-slide tono-${diapositiva.tono}`}>
            <Diapositiva diapositiva={diapositiva} />
          </Carousel.Item>
        ))}
      </Carousel>

      {/* Barras de progreso (una por diapositiva) y botón de pausa */}
      <div className="promo-controles">
        <div className="promo-barras">
          {lista.map((diapositiva, i) => (
            <button
              type="button"
              key={diapositiva.id}
              className={`promo-barra${i === indice ? " is-active" : ""}`}
              aria-label={`Ver: ${diapositiva.titulo}`}
              aria-current={i === indice}
              onClick={() => setIndice(i)}
            >
              {i === indice && (
                <span
                  key={indice}
                  className={`promo-barra-relleno${reducirMovimiento ? "" : " is-animada"}`}
                  onAnimationEnd={siguiente}
                />
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="promo-pausa"
          onClick={() => setPausado((p) => !p)}
          aria-label={pausado ? "Reanudar el carrusel" : "Pausar el carrusel"}
          aria-pressed={pausado}
          disabled={reducirMovimiento}
        >
          {pausado ? <FaPlay aria-hidden="true" /> : <FaPause aria-hidden="true" />}
        </button>
      </div>
    </section>
  );
}

export default PromoCarousel;
