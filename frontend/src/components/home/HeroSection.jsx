// Sección principal de la portada (#inicio): dónde está la farmacia, qué
// ofrece y los botones al catálogo y a "Cómo pedir".
// A la derecha, una vitrina con productos del catálogo (los mismos dibujos de
// las tarjetas, ProductoIlustracion) y un ticket de pedido de ejemplo con
// precios reales. Es decorativa (aria-hidden): al cargar, los productos
// caen en la repisa uno a uno y al final aparece el ticket (app.css).
import { FaCheck, FaLocationDot, FaTruckFast } from "react-icons/fa6";
import { formatPrice } from "../../utils/format.js";
import ProductoIlustracion from "./ProductoIlustracion.jsx";

// Dos repisas de tres productos: dibujo y color de su categoría
const repisas = [
  [
    { tipo: "frasco", color: "blue" },
    { tipo: "vitaminas", color: "orange" },
    { tipo: "dosificador", color: "mint" },
  ],
  [
    { tipo: "blister", color: "blue" },
    { tipo: "tubo", color: "mint" },
    { tipo: "gasas", color: "green" },
  ],
];

// Pedido de ejemplo con precios del catálogo (database/datos.sql)
const pedidoEjemplo = [
  { nombre: "Acetaminofén 500 mg", cantidad: 2, precio: 8500 },
  { nombre: "Vitamina C", cantidad: 1, precio: 15000 },
  { nombre: "Gel antibacterial", cantidad: 1, precio: 7500 },
];
const totalEjemplo = pedidoEjemplo.reduce((suma, l) => suma + l.cantidad * l.precio, 0);

const datos = ["Precio y stock al día", "Aviso de fórmula médica", "Pago contra entrega"];

function HeroSection() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-content">
        <span className="hero-lugar">
          <FaLocationDot aria-hidden="true" />
          Bucaramanga y su área metropolitana
        </span>

        <h1>La farmacia del barrio, ahora a un clic.</h1>

        <p className="hero-description">
          Medicamentos, vitaminas y cuidado personal con el precio y las
          unidades disponibles a la vista. Armas tu carrito, confirmas y te lo
          llevamos a Bucaramanga, Floridablanca, Girón o Piedecuesta.
        </p>

        <div className="hero-acciones">
          <a className="primary-button" href="#productos">
            Ver el catálogo
          </a>
          <a className="hero-link" href="#como-pedir">
            Cómo pedir
          </a>
        </div>

        <ul className="hero-benefits">
          {datos.map((dato) => (
            <li className="benefit" key={dato}>
              <span className="benefit-icon" aria-hidden="true">
                <FaCheck />
              </span>
              {dato}
            </li>
          ))}
        </ul>
      </div>

      <div className="hero-visual" aria-hidden="true">
        <div className="vitrina">
          {repisas.map((repisa, fila) => (
            <div className="vitrina-repisa" key={fila}>
              {repisa.map((producto, columna) => (
                <span
                  key={producto.tipo}
                  className={`vitrina-producto art-${producto.color}`}
                  style={{ "--orden": fila * 3 + columna }}
                >
                  <ProductoIlustracion tipo={producto.tipo} />
                </span>
              ))}
            </div>
          ))}
        </div>

        <div className="hero-ticket">
          <span className="hero-ticket-titulo">Tu pedido</span>
          <ul>
            {pedidoEjemplo.map(({ nombre, cantidad, precio }) => (
              <li key={nombre}>
                <span>
                  {nombre} <small>×{cantidad}</small>
                </span>
                <span>{formatPrice(cantidad * precio)}</span>
              </li>
            ))}
          </ul>
          <p className="hero-ticket-total">
            <span>Total</span>
            <strong>{formatPrice(totalEjemplo)}</strong>
          </p>
          <span className="hero-ticket-nota">
            <FaTruckFast /> Pagas al recibir
          </span>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
