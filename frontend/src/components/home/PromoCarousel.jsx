// Carrusel de la portada (React-Bootstrap Carousel), debajo del hero
// (#como-pedir). Cuatro diapositivas: cómo pedir, un producto destacado del
// catálogo, vitaminas (con los productos reales de esa categoría) y un
// consejo de salud. Los textos fijos están en src/data/carrusel.js.
// - Todas las diapositivas miden lo mismo (home.css las apila en una grilla)
//   y cambian con un fundido.
// - Avance automático cada 6 s con temporizador propio: la barra de la
//   diapositiva activa es una animación CSS y, al terminar (animationend),
//   pasa a la siguiente. Las flechas y las barras cambian de diapositiva sin
//   detener el avance.
// - Pausa (WCAG 2.2.2): clic o toque en una parte vacía, el botón de pausa o
//   el foco del teclado dentro (solo teclado: el clic del mouse no cuenta).
//   Al reanudar, la barra sigue donde iba. Con "reducir movimiento" no
//   avanza solo.
import { useEffect, useMemo, useRef, useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import {
  FaArrowUpRightFromSquare,
  FaChevronLeft,
  FaChevronRight,
  FaCircleCheck,
  FaLayerGroup,
  FaPause,
  FaPlay,
  FaPrescriptionBottleMedical,
  FaSun,
  FaTag,
} from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
import { diapositivas, pasosPedido } from "../../data/carrusel.js";
import { formatPrice, formatStock, plural } from "../../utils/format.js";
import BotonAgregar from "../carrito/BotonAgregar.jsx";
import ProductoIlustracion from "./ProductoIlustracion.jsx";

const enlaceCategoria = (categoria) => `/?categoria=${encodeURIComponent(categoria)}#productos`;

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

// Fila de datos cortos con ícono, al final del texto de cada diapositiva
function DatosDiapositiva({ datos }) {
  if (!datos?.length) return null;
  return (
    <ul className="promo-datos">
      {datos.map(({ Icono, texto }) => (
        <li key={texto}>
          <Icono aria-hidden="true" />
          {texto}
        </li>
      ))}
    </ul>
  );
}

function TextoDiapositiva({ diapositiva, datos = diapositiva.datos, children }) {
  return (
    <div className="promo-texto">
      <span className="section-kicker">{diapositiva.etiqueta}</span>
      <h3>{diapositiva.titulo}</h3>
      <p>{diapositiva.texto}</p>
      {children}
      <DatosDiapositiva datos={datos} />
    </div>
  );
}

// Tarjeta pequeña de producto (diapositiva de vitaminas)
function TarjetaProducto({ producto }) {
  return (
    <article className="promo-tarjeta">
      <span className={`promo-tarjeta-art art-${producto.color}`} aria-hidden="true">
        <ProductoIlustracion tipo={producto.ilustracion} />
      </span>
      <strong>{producto.name}</strong>
      <span className="promo-tarjeta-precio">{formatPrice(producto.price)}</span>
      <BotonAgregar product={producto} className="promo-tarjeta-boton" />
    </article>
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
      const { producto, otros } = diapositiva;
      const datos = [
        { Icono: FaTag, texto: producto.category },
        { Icono: FaCircleCheck, texto: "Venta libre, sin fórmula" },
      ];
      return (
        <>
          <TextoDiapositiva diapositiva={diapositiva} datos={datos}>
            <p className="promo-precio">
              <strong>{formatPrice(producto.price)}</strong>
              <span>{formatStock(producto.stock)} disponibles</span>
            </p>
            <div className="promo-acciones">
              <BotonAgregar product={producto} className="promo-agregar" />
              <Link className="promo-enlace" to={enlaceCategoria(producto.category)}>
                Ver {producto.category.toLowerCase()}
              </Link>
            </div>
          </TextoDiapositiva>
          <div className="promo-visual promo-destacado-visual">
            <div className={`promo-destacado art-${producto.color}`} aria-hidden="true">
              <ProductoIlustracion tipo={producto.ilustracion} />
            </div>
            {otros.length > 0 && (
              <div className="promo-otros">
                <span>También en {producto.category.toLowerCase()}</span>
                <ul>
                  {otros.map((otro) => (
                    <li key={otro.id}>
                      <span className={`promo-otro-art art-${otro.color}`} aria-hidden="true">
                        <ProductoIlustracion tipo={otro.ilustracion} />
                      </span>
                      <Link to={enlaceCategoria(otro.category)}>{otro.name}</Link>
                      <strong>{formatPrice(otro.price)}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
          <div className="promo-visual promo-consejo">
            <span className="promo-sol" aria-hidden="true">
              <FaSun />
            </span>
            <ul className="promo-consejos">
              {diapositiva.consejos.map(({ Icono, texto }) => (
                <li key={texto}>
                  <span className="promo-paso-icono" aria-hidden="true">
                    <Icono />
                  </span>
                  {texto}
                </li>
              ))}
            </ul>
          </div>
        </>
      );

    default: {
      // Vitaminas: los productos reales de la categoría; sin catálogo, la imagen
      const { productos = [] } = diapositiva;
      const datos = productos.length
        ? [
            { Icono: FaLayerGroup, texto: plural(productos.length, "producto", "productos") },
            {
              Icono: FaTag,
              texto: `Desde ${formatPrice(Math.min(...productos.map((p) => p.price)))}`,
            },
            ...(productos.some((p) => p.requiereFormula)
              ? []
              : [{ Icono: FaPrescriptionBottleMedical, texto: "Sin fórmula médica" }]),
          ]
        : undefined;
      return (
        <>
          <TextoDiapositiva diapositiva={diapositiva} datos={datos}>
            {/* Link: cambia la URL sin recargar la página */}
            <Link className="primary-button" to={diapositiva.enlace}>
              {diapositiva.boton}
            </Link>
          </TextoDiapositiva>
          {productos.length ? (
            <div className="promo-visual promo-tarjetas">
              {productos.slice(0, 3).map((producto) => (
                <TarjetaProducto key={producto.id} producto={producto} />
              ))}
            </div>
          ) : (
            <img className="promo-visual promo-imagen" src={diapositiva.imagen} alt="" />
          )}
        </>
      );
    }
  }
}

function PromoCarousel({ productos = [] }) {
  const { hash, key } = useLocation();
  const reducirMovimiento = useReducirMovimiento();
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false); // pausa elegida por el usuario
  const [conFoco, setConFoco] = useState(false); // foco del teclado dentro
  // true mientras dura el fundido: React-Bootstrap ignora los cambios en ese
  // momento, así que las barras tampoco cambian (siempre marcan lo que se ve)
  const cambiando = useRef(false);

  // Diapositivas: el destacado va en la segunda posición y la de vitaminas
  // recibe los productos de su categoría
  const lista = useMemo(() => {
    const fijas = diapositivas.map((d) =>
      d.categoria
        ? { ...d, productos: productos.filter((p) => p.category === d.categoria && !p.soldOut) }
        : d
    );
    const producto = elegirDestacado(productos);
    if (!producto) return fijas;
    const destacado = {
      id: "destacado",
      tipo: "destacado",
      tono: "menta",
      etiqueta: "DESTACADO DE HOY",
      titulo: producto.name,
      texto: producto.description,
      producto,
      otros: productos
        .filter((p) => p.category === producto.category && p.id !== producto.id && !p.soldOut)
        .slice(0, 2),
    };
    return [fijas[0], destacado, ...fijas.slice(1)];
  }, [productos]);

  // El enlace "Cómo pedir" del hero muestra la primera diapositiva. Se
  // revisa en cada navegación nueva (cambia location.key), durante el render.
  const [navegacion, setNavegacion] = useState(key);
  if (navegacion !== key) {
    setNavegacion(key);
    if (hash === "#como-pedir") setIndice(0);
  }

  const ir = (nuevo) => {
    if (!cambiando.current) setIndice(nuevo);
  };
  const siguiente = () => ir((indice + 1) % lista.length);
  const corriendo = !pausado && !conFoco && !reducirMovimiento;

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
      // Solo el foco del teclado pausa (con el mouse, :focus-visible no aplica)
      onFocus={(e) => {
        if (e.target.matches(":focus-visible")) setConFoco(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setConFoco(false);
      }}
    >
      <Carousel
        className="promo-carousel"
        fade
        activeIndex={Math.min(indice, lista.length - 1)}
        onSelect={ir}
        onSlide={() => {
          cambiando.current = true;
        }}
        onSlid={() => {
          cambiando.current = false;
        }}
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
              onClick={() => ir(i)}
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
